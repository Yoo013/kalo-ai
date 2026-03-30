import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ThumbsUp, ThumbsDown, Copy, Pencil, Sparkles } from "lucide-react";

const NOTE_FIELDS = [
  { key: "sentiment", label: "Sentiment" },
  { key: "outcome", label: "Outcome" },
  { key: "objections_summary", label: "Objections" },
  { key: "reason", label: "Reason" },
  { key: "next_steps", label: "Next Steps" },
  { key: "rapport", label: "Rapport" },
  { key: "summary", label: "Summary" },
];

function sentimentColor(val) {
  if (!val) return "text-muted-foreground";
  const v = val.toLowerCase();
  if (v.includes("positive")) return "text-emerald-600";
  if (v.includes("negative")) return "text-destructive";
  return "text-amber-600";
}

export default function CallNotesSidebar({ call, onClose }) {
  const [notes, setNotes] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!call) return;
    // Pre-fill from call data
    setNotes({
      sentiment: call.lead_info?.sentiment || "",
      outcome: call.summary ? call.summary.split(".")[0] + "." : "",
      objections_summary: call.objections_detected?.map((o) => o.category).join(", ") || "None noted.",
      reason: call.lead_info?.reason || "",
      next_steps: call.lead_info?.next_steps || "",
      rapport: call.lead_info?.rapport || "",
      summary: call.summary || "",
    });
  }, [call]);

  const generateNotes = async () => {
    if (!call) return;
    setIsGenerating(true);
    try {
      const transcript = call.transcript?.map((t) => `${t.speaker}: ${t.text}`).join("\n") || "";
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this sales call and generate structured call notes:

Call Agent: ${call.agent_name}
Lead: ${call.lead_name}
Duration: ${call.duration_seconds ? Math.floor(call.duration_seconds / 60) + " minutes" : "unknown"}
Stage: ${call.call_stage || "unknown"}
Objections detected: ${call.objections_detected?.map((o) => o.category).join(", ") || "none"}

Transcript:
${transcript || "No transcript available"}

Generate structured notes with these exact fields.`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string", description: "Overall sentiment: Positive, Neutral, or Negative" },
            outcome: { type: "string", description: "What was the outcome of the call?" },
            objections_summary: { type: "string", description: "Objections raised and how they were handled" },
            reason: { type: "string", description: "Why did the customer call / what is their primary pain point?" },
            next_steps: { type: "string", description: "Agreed next steps with the customer" },
            rapport: { type: "string", description: "Quality of rapport built on this call" },
            summary: { type: "string", description: "Brief overall call summary" },
          },
        },
      });
      setNotes(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    const text = NOTE_FIELDS.map((f) => `${f.label}: ${notes[f.key] || "—"}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEdit = (key, val) => {
    setEditingField(key);
    setEditValue(val || "");
  };

  const saveEdit = () => {
    setNotes((prev) => ({ ...prev, [editingField]: editValue }));
    setEditingField(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold">Call Notes</span>
        <div className="flex items-center gap-2">
          <button
            onClick={generateNotes}
            disabled={isGenerating}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Generate
          </button>
          <button onClick={copyAll} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors">
            <Copy className="w-3 h-3" />
            {copied ? "Copied!" : "Copy All"}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-medium">✕</button>
          )}
        </div>
      </div>

      {/* Call ID */}
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <span className="text-[10px] text-muted-foreground">Call ID</span>
        <p className="text-xs font-mono font-semibold">{call?.id?.slice(0, 12)?.toUpperCase()}</p>
      </div>

      {/* Note fields */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {NOTE_FIELDS.map((field) => (
          <div key={field.key} className="px-4 py-3 group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(field.key, notes[field.key])} className="hover:text-primary transition-colors">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <ThumbsUp className="w-3 h-3 text-muted-foreground hover:text-emerald-600 cursor-pointer transition-colors" />
                <ThumbsDown className="w-3 h-3 text-muted-foreground hover:text-destructive cursor-pointer transition-colors" />
                <Copy
                  className="w-3 h-3 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => navigator.clipboard.writeText(notes[field.key] || "")}
                />
              </div>
            </div>

            {editingField === field.key ? (
              <div className="space-y-1.5">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-xs px-2" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setEditingField(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${
                field.key === "sentiment" ? sentimentColor(notes[field.key]) : "text-foreground"
              }`}>
                {isGenerating ? (
                  <span className="text-muted-foreground animate-pulse">Generating...</span>
                ) : (
                  notes[field.key] || <span className="text-muted-foreground italic">Not available</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">AI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}