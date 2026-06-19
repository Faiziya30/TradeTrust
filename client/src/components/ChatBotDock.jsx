import { useEffect, useState, useRef } from "react";
import { useChatBot } from "../hooks/useChatBot";

export default function ChatBotDock({ customerId }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, connected, error } = useChatBot(customerId);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  };

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-score-copilot", openHandler);
    return () => window.removeEventListener("open-score-copilot", openHandler);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-enter {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* CHAT WINDOW */}
      {open && (
        <div className="w-[340px] h-[500px] mb-4 rounded-[1.5rem] overflow-hidden glass-panel flex flex-col animate-enter pointer-events-auto ring-1 ring-black/5">
          {/* HEADER */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                   <span className="text-lg">✨</span>
               </div>
               <div>
                 <p className="font-bold text-sm tracking-tight">Score Copilot</p>
                 <p className="text-[10px] text-indigo-200 font-medium">AI Financial Assistant</p>
               </div>
            </div>
            
            <button 
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
                <span className="text-base leading-none">&times;</span>
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-slate-50 to-white">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-2xl">👋</div>
                <p className="text-sm font-medium text-slate-800 mb-2">Welcome to Score Copilot</p>
                <p className="text-xs text-slate-500 max-w-[200px]">
                  Ask about your credit score, spending habits, or how to improve your trust rating.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => {
               const isUser = msg.from === "user";
               return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-indigo-100/50"
                      }`}
                    >
                      {msg.text || msg.message}
                    </div>
                  </div>
               )
            })}
            
            {!connected && (
               <div className="flex justify-center">
                   <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full animate-pulse">Connecting...</span>
               </div>
            )}
            
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl text-center font-medium">
                    {error}
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
             <p className="text-[9px] text-center text-slate-300 mt-1.5 font-medium">
                AI can make mistakes. Check important info.
            </p>
          </form>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 active:scale-95 z-50 ${
            open ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
        }`}
      >
        {open ? (
            <span className="text-xl font-bold">&times;</span>
        ) : (
            <span className="text-2xl">✨</span>
        )}
      </button>
    </div>
  );
}
