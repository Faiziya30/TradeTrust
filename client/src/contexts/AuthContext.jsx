// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [customerId, setCustomerId] = useState(() =>
    localStorage.getItem("customerId")
  );
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    token
      ? localStorage.setItem("token", token)
      : localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    user
      ? localStorage.setItem("user", JSON.stringify(user))
      : localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    customerId
      ? localStorage.setItem("customerId", customerId)
      : localStorage.removeItem("customerId");
  }, [customerId]);

  function logout() {
    setToken(null);
    setUser(null);
    setCustomerId(null);
  }

  const value = {
    token,
    user,
    customerId,

    isAuthenticated: !!token,
    isCustomer: user?.role === "customer",
    isMerchant: user?.role === "merchant",

    authReady,

    setToken,
    setUser,
    setCustomerId,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
