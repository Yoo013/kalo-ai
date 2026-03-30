import React from "react";
import { Lightbulb, AlertTriangle, Target, TrendingUp, Zap } from "lucide-react";

const stageColors = {
  opening: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  discovery: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  presentation: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  objection_handling: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  closing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  follow_up: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function AICoachPanel({ suggestions, objections, callStage, closingProbability, toneData }) {
  const latestSuggestion = suggestions[suggestions.length - 1];
  const latestObjection = objections[objections.length - 1];
  const prob = Math.round(closingProbability || 0);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">

      {/* Call Stage */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Call Stage</p>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${stageColors[callStage] || stageColors.opening}`}>
          <Zap className="w-3 h-3" />
          {(callStage || "opening").replace("_", " ")}
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Closing Probability</p>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="6" fill="none" />
              <circle
                cx="28" cy="28" r="22"
                stroke={prob >= 70 ? "#10b981" : prob >= 40 ? "#f59e0b" : "#ef4444"}
                strokeWidth="6" fill="none"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - prob / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{prob}%</span>
          </div>
          <div className="flex-1 space-y-2">
            {toneData?.agent_tone && <ScoreBar label="Confidence" value={toneData.confidence_score || 70} color="bg-violet-500" />}
            <ScoreBar label="Engagement" value={Math.min(100, 40 + objections.length * 10 + suggestions.length * 5)} color="bg-sky-500" />
            <ScoreBar label="Progress" value={Math.min(100, { opening: 10, discovery: 30, presentation: 50, objection_handling: 65, closing: 85, follow_up: 95 }[callStage] || 10)} color="bg-emerald-500" />
          </div>
        </div>
      </div>

{/* Latest Objection */}
{latestObjection && (
  <div className="bg-amber-500/5 rounded-xl border border-amber-500/20 p-3">
    <div className="flex items-center gap-1.5 mb-2">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Objection Detected</p>
    </div>
    <p className="text-xs font-semibold text-white mb-2">{latestObjection.category?.replace("_", " ")}</p>
    
    {/* Customer said */}
    <div className="mb-2">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Customer said</p>
      <p className="text-xs text-slate-300 leading-relaxed italic">"{latestObjection.text}"</p>
    </div>

    {/* Rebuttal */}
    <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/30">
      <p className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold mb-1">💬 Rebuttal</p>
      <p className="text-xs text-white leading-relaxed">"{latestObjection.suggested_response}"</p>
    </div>
  </div>
)}

      {/* Latest Suggestion */}
      {latestSuggestion && (
        <div className="bg-violet-500/5 rounded-xl border border-violet-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">AI Suggestion</p>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{latestSuggestion.text}</p>
        </div>
      )}

      {/* Tone */}
      {toneData?.agent_tone && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Agent Tone</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium capitalize">{toneData.agent_tone}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              toneData.energy_level === "high" ? "bg-emerald-500/20 text-emerald-400" :
              toneData.energy_level === "low" ? "bg-red-500/20 text-red-400" :
              "bg-amber-500/20 text-amber-400"
            }`}>
              {toneData.energy_level || "medium"} energy
            </span>
          </div>
        </div>
      )}

      {/* All suggestions history */}
      {suggestions.length > 1 && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Coaching History</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...suggestions].reverse().slice(1).map((s, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-400">
                <Target className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}