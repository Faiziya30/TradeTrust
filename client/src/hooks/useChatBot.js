import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { useAuth } from "../contexts/AuthContext";

export function useChatBot(customerId) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
      setError(err?.message || "Unable to connect to chat");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("chat:reply", (payload) => {
      setMessages((prev) => [...prev, { ...payload, from: "bot" }]);
    });

    socket.on("chat:error", (payload) => {
      const message = payload?.message || "Chat service unavailable.";
      setMessages((prev) => [
        ...prev,
        { from: "system", text: message, ts: Date.now() },
      ]);
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    setMessages([]);
    bootstrappedRef.current = false;
  }, [customerId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected || !customerId || bootstrappedRef.current) return;
    // auto send a snapshot request so the user sees context immediately
    bootstrappedRef.current = true;
    socket.emit("chat:message", {
      prompt: "Give me a quick snapshot of my score and what changed recently.",
      customerId,
    });
  }, [connected, customerId]);

  const sendMessage = (text) => {
    if (!text?.trim()) return;
    if (!token) {
      setError("Please login to chat with the score assistant.");
      return;
    }
    if (!customerId) {
      setError("No customer profile selected.");
      return;
    }
    const socket = socketRef.current;
    if (!socket || !connected) {
      setError("Connecting to chat, please wait…");
      return;
    }

    const userMessage = { from: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    socket.emit("chat:message", { prompt: text, customerId });
  };

  return {
    messages,
    sendMessage,
    connected,
    error,
  };
}

