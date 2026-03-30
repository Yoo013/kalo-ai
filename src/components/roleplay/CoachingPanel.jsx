import React from "react";
import { Lightbulb, Star, CheckCircle2, AlertCircle } from "lucide-react";

const liveTips = [
  { icon: "💬", text: "Build rapport early — use their name." },
  { icon: "❓", text: "Ask open-ended questions to uncover pain." },
  { icon: "🛡️", text: "When they object, acknowledge first." },
  { icon: "🎯", text: "Mirror their language and tone." },
  { icon: "⏱️", text: "Don't rush — let silence work for you." },
];

function ScoreRing({ value, label, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} stroke="#1e293b" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="text-lg font-bold text-white -mt-12 mb-6">{value}</span>
      <p className="text-xs text-slate-400 text-center leading-tight">{label}</p>
    </div>
  );
}

export default function CoachingPanel({ sessionActive, sessionEnded, evaluation, isEvaluating }) {
  if (isEvaluating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Evaluating session...</p>
      </div>
    );
  }

  if (sessionEnded && evaluation) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Session Results</p>

        {/* Big score */}
        <div className="text-center mb-6">
          <div className="text-7xl font-black text-white leading-none">{evaluation.score}</div>
          <p className="text-slate-400 text-sm mt-1">Overall Score</p>
          <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-1000"
              style={{ width: `${evaluation.score}%` }}
            />
          </div>
        </div>

        {/* Breakdown rings */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <ScoreRing value={evaluation.rapport} label="Rapport" color="#a78bfa" />
          <ScoreRing value={evaluation.objectionHandling} label="Objections" color="#34d399" />
          <ScoreRing value={evaluation.closing} label="Closing" color="#f59e0b" />
        </div>

        {/* Feedback */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Coaching Notes</p>
          <div className="space-y-2">
            {(evaluation.feedback || []).map((f, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-300 bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Live Coaching</p>

      {!sessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
            <Lightbulb className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-slate-500 text-xs">Coaching tips will appear here during your session.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {liveTips.map((tip, i) => (
            <div
              key={i}
              className="flex gap-3 items-start bg-slate-800/60 rounded-xl px-3 py-3 border border-slate-700/50"
              style={{ animation: `fadeIn 0.4s ease ${i * 0.1}s both` }}
            >
              <span className="text-base">{tip.icon}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.text}</p>
            </div>
          ))}
          <div className="mt-4 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3 h-3 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">Pro Tip</span>
            </div>
            <p className="text-xs text-slate-400">End session when you've tried to close at least once.</p>
          </div>
        </div>
      )}
    </div>
  );
}