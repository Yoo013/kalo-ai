import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Mic, MicOff, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Demo transcript entries to simulate when Deepgram isn't configured
const DEMO_FLOW = [
  { speaker: "Customer", text: "Hi, I saw your ad online about debt relief. Can you help me?", delay: 2500 },
  { speaker: "Agent", text: "Absolutely! I'd love to help. Can you share a bit about your situation?", delay: 6000 },
  { speaker: "Customer", text: "I have about $45,000 in credit card debt. The minimum payments are killing me.", delay: 10000 },
  { speaker: "Agent", text: "I understand — that's a lot of pressure. What's your current monthly income?", delay: 14000 },
  { speaker: "Customer", text: "Around $4,500 a month, but I'm barely staying afloat.", delay: 18000 },
  { speaker: "Customer", text: "I'm not sure I can afford your fees right now to be honest.", delay: 23000 },
  { speaker: "Agent", text: "That's actually the most common concern we hear — our program is designed so the savings far outweigh any fees.", delay: 27000 },
  { speaker: "Customer", text: "I need to talk to my wife first before making any decisions.", delay: 32000 },
  { speaker: "Agent", text: "Of course — that's completely understandable. Can I schedule a quick call with both of you?", delay: 37000 },
  { speaker: "Customer", text: "Maybe. But I still think the price is too high.", delay: 42000 },
];

const DeepgramTranscript = forwardRef(({ isLive, onTranscriptEntry, agentName }, ref) => {
  const [entries, setEntries] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const bottomRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRef = useRef(null);
  const demoTimers = useRef([]);

  useImperativeHandle(ref, () => ({
    getEntries: () => entries,
    reset: () => setEntries([]),
  }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    if (!isLive) {
      stopAll();
      return;
    }
    initTranscription();
    return () => stopAll();
  }, [isLive]);

  const addEntry = (entry) => {
    const e = { ...entry, timestamp: new Date().toISOString() };
    setEntries(prev => [...prev, e]);
    onTranscriptEntry?.(e);
  };

  const stopAll = () => {
    wsRef.current?.close();
    mediaRef.current?.getTracks().forEach(t => t.stop());
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setIsListening(false);
  };

const initTranscription = async () => {
  try {
    const ws = new WebSocket("ws://localhost:3002");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsListening(true);
      setDemoMode(false);
      console.log("[DeepgramTranscript] Connected to Electron WS");
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "transcript" && data.is_final) {
          addEntry({ speaker: data.speaker, text: data.text });
        }
      } catch {}
    };

    ws.onerror = () => {
      console.warn("[DeepgramTranscript] WS error");
      setIsListening(false);
    };

    ws.onclose = () => {
      setIsListening(false);
    };

  } catch {
    setIsListening(false);
  }
};

  const runDemo = () => {
    DEMO_FLOW.forEach(({ speaker, text, delay }) => {
      const t = setTimeout(() => addEntry({ speaker, text }), delay);
      demoTimers.current.push(t);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/60">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-white">Live Transcript</span>
          {demoMode && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">DEMO</span>}
        </div>
        {isListening ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">Recording</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MicOff className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500">Idle</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Mic className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">Transcript will appear here once the call starts.</p>
          </div>
        )}
        {entries.map((e, i) => (
          <div key={i} className={`flex gap-2 ${e.speaker !== "Customer" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              e.speaker === "Customer" ? "bg-slate-700 text-slate-300" : "bg-violet-600 text-white"
            }`}>
              {e.speaker[0]}
            </div>
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              e.speaker === "Customer"
                ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                : "bg-violet-700/80 text-white rounded-tr-sm"
            }`}>
              <p className="text-[10px] font-semibold mb-0.5 opacity-60">{e.speaker}</p>
              {e.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
});

DeepgramTranscript.displayName = "DeepgramTranscript";
export default DeepgramTranscript;