import React, { useEffect, useRef } from "react";
import { Send, Mic, Bot } from "lucide-react";

export default function ChatPanel({
  messages,
  inputValue,
  setInputValue,
  onSend,
  isLoading,
  sessionActive,
  sessionEnded,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-slate-400 text-sm">Select a scenario and click <span className="text-violet-400 font-semibold">Start Roleplay</span> to begin.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mr-2 shrink-0 mt-1">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-900/30"
                  : "bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mr-2 shrink-0">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className={`flex gap-2 items-end transition-opacity ${!sessionActive || sessionEnded ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-violet-500/50 transition-colors">
            <textarea
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none max-h-32"
              placeholder="Type your response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minHeight: "24px" }}
            />
            <button className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onSend}
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-violet-900/40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}