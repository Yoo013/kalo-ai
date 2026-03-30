import React from "react";
import { Play, Square, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const difficultyColors = {
  easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  hard: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function ScenarioPanel({
  scenarios,
  selectedScenario,
  setSelectedScenario,
  difficulty,
  setDifficulty,
  sessionActive,
  onStart,
  onEnd,
  sessionDuration,
}) {
  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Scenario</p>
        <div className="relative">
          <select
            className="w-full appearance-none bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 pr-10"
            value={selectedScenario?.id || ""}
            onChange={(e) => {
              const s = scenarios.find((sc) => sc.id === e.target.value);
              setSelectedScenario(s || null);
            }}
            disabled={sessionActive}
          >
            <option value="">Select scenario...</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {selectedScenario?.description && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedScenario.description}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Difficulty</p>
        <div className="flex gap-2">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => !sessionActive && setDifficulty(d)}
              className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                difficulty === d ? difficultyColors[d] : "text-slate-500 border-slate-700 bg-slate-800 hover:border-slate-600"
              } ${sessionActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {sessionActive && (
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-white mb-1">{formatDuration(sessionDuration)}</div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Session Time</p>
        </div>
      )}

      <div className="space-y-2">
        {!sessionActive ? (
          <Button
            onClick={onStart}
            disabled={!selectedScenario}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-900/40 transition-all"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Roleplay
          </Button>
        ) : (
          <Button
            onClick={onEnd}
            variant="outline"
            className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold py-3 rounded-xl"
          >
            <Square className="w-4 h-4 mr-2" />
            End Session
          </Button>
        )}
      </div>
    </div>
  );
}