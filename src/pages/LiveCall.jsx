import React, { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import DeepgramTranscript from "@/components/livecall/DeepgramTranscript";
import AICoachPanel from "@/components/livecall/AICoachPanel";
import LeadInfoPanel from "@/components/livecall/LeadInfoPanel";
import CallNotesPanel from "@/components/livecall/CallNotesPanel";
import ObjectionAlert from "@/components/livecall/ObjectionAlert";

export default function LiveCall() {
  const { user } = useOutletContext();
  const [isOnCall, setIsOnCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [objections, setObjections] = useState([]);
  const [callStage, setCallStage] = useState("opening");
  const [closingProbability, setClosingProbability] = useState(0);
  const [toneData, setToneData] = useState(null);
  const [leadInfo, setLeadInfo] = useState({});
  const [notes, setNotes] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const transcriptRef = useRef(null);
  const fullTranscriptRef = useRef([]);
  const isOnCallRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function requestMicPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("❌ Mic permission denied:", err);
      }
    }
    requestMicPermission();
  }, []);

  useEffect(() => {
    if (!isOnCall) return;
    const ws = new WebSocket("ws://localhost:3002");

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "coaching") {
          if (data.suggestion) {
            setSuggestions(prev => [...prev, {
              type: "suggestion",
              text: data.suggestion,
              timestamp: data.timestamp,
            }]);
          }
          if (data.objection?.detected) {
            setObjections(prev => [...prev, {
              category: data.objection.category,
              text: data.objection.response,
              suggested_response: data.objection.response,
              timestamp: data.timestamp,
            }]);
          }
          if (data.stage) setCallStage(data.stage);
          if (data.close_signal) setClosingProbability(prev => Math.min(prev + 20, 95));
        }
      } catch {}
    };

    return () => ws.close();
  }, [isOnCall]);

  // Stop call on unmount (logout / navigate away)
  useEffect(() => {
    return () => {
      if (isOnCallRef.current) {
        clearInterval(timerRef.current);
        setIsOnCall(false);
        isOnCallRef.current = false;
      }
    };
  }, []);

  const createCallMutation = useMutation({
    mutationFn: (data) => base44.entities.Call.create(data),
    onSuccess: (data) => setCurrentCall(data),
  });

  const updateCallMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Call.update(id, data),
  });

  const handleTranscriptEntry = useCallback(async (entry) => {
    fullTranscriptRef.current = [...fullTranscriptRef.current, entry];

    const shouldAnalyze = entry.speaker === "Customer" ||
      fullTranscriptRef.current.filter(e => e.speaker !== "Customer").length % 3 === 0;

    if (!shouldAnalyze) return;

    try {
      const res = await base44.functions.invoke("analyzeCallSegment", {
        text: entry.text,
        speaker: entry.speaker,
        fullTranscript: fullTranscriptRef.current.slice(-12),
      });

      const result = res.data;
      if (!result) return;

      if (result.suggestion) {
        setSuggestions(prev => [...prev, {
          type: "suggestion",
          text: result.suggestion,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (result.objection?.detected) {
        setObjections(prev => [...prev, {
          category: result.objection.category,
          text: entry.text,
          suggested_response: result.objection.suggested_response,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (result.extracted_info) {
        setLeadInfo(prev => ({ ...prev, ...result.extracted_info }));
      }

      if (result.stage) setCallStage(result.stage);
      if (result.closing_probability != null) setClosingProbability(result.closing_probability);
      if (result.tone) setToneData(result.tone);
    } catch {}
  }, []);

  const startCall = async () => {
    setSuggestions([]);
    setObjections([]);
    setCallDuration(0);
    setCallStage("opening");
    setClosingProbability(0);
    setToneData(null);
    fullTranscriptRef.current = [];
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    isOnCallRef.current = true;
    setIsOnCall(true);
  };

  const endCall = async () => {
    setIsOnCall(false);
    isOnCallRef.current = false;
    clearInterval(timerRef.current);
    const transcript = fullTranscriptRef.current;

    if (currentCall && transcript.length > 0) {
      const summaryResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this sales call:\n${transcript.map(t => `${t.speaker}: ${t.text}`).join("\n")}\n\nProvide a summary, score (0-100), and key takeaways.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            score: { type: "number" },
            key_takeaways: { type: "array", items: { type: "string" } }
          }
        }
      });

      await updateCallMutation.mutateAsync({
        id: currentCall.id,
        data: {
          status: "completed",
          duration_seconds: callDuration,
          transcript,
          ai_suggestions: suggestions,
          objections_detected: objections,
          notes,
          summary: summaryResult.summary,
          score: summaryResult.score,
          call_stage: callStage,
        }
      });

      queryClient.invalidateQueries({ queryKey: ["calls"] });
      queryClient.invalidateQueries({ queryKey: ["my-calls"] });
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 lg:left-64 bg-slate-950 flex flex-col">
      <div className="shrink-0 bg-slate-900 border-b border-slate-700/50 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isOnCall ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-red-400">LIVE</span>
              </div>
              <span className="text-2xl font-mono font-bold tabular-nums text-white">{formatTime(callDuration)}</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize border ${
                callStage === "closing" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                callStage === "objection_handling" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                "bg-slate-700 text-slate-300 border-slate-600"
              }`}>
                {callStage.replace("_", " ")}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400">Ready — configure lead info below, then start your call</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOnCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className={`gap-2 border ${isMuted ? "border-red-500/40 text-red-400" : "border-slate-600 text-slate-300"}`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? "Muted" : "Live Mic"}
            </Button>
          )}
          {isOnCall ? (
            <Button
              onClick={endCall}
              className="gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
              size="sm"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </Button>
          ) : (
            <Button
              onClick={startCall}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
              size="sm"
            >
              <Phone className="w-4 h-4" />
              Start Call
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <DeepgramTranscript
              ref={transcriptRef}
              isLive={isOnCall}
              onTranscriptEntry={handleTranscriptEntry}
              agentName={user?.full_name || "Agent"}
            />
          </div>
          <div className="shrink-0">
            <CallNotesPanel notes={notes} setNotes={setNotes} />
          </div>
        </div>

        <div className="w-72 shrink-0 border-l border-slate-700/50 p-4 overflow-y-auto bg-slate-950">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">AI Coach</p>
          <AICoachPanel
            suggestions={suggestions}
            objections={objections}
            callStage={callStage}
            closingProbability={closingProbability}
            toneData={toneData}
          />
        </div>

        <div className="w-64 shrink-0 border-l border-slate-700/50 p-4 overflow-y-auto bg-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Lead Info</p>
          <LeadInfoPanel leadInfo={leadInfo} setLeadInfo={setLeadInfo} />
        </div>
      </div>

      {objections.length > 0 && isOnCall && (
        <ObjectionAlert objection={objections[objections.length - 1]} />
      )}
    </div>
  );
}