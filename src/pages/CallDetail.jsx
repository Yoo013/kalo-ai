import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Brain, AlertTriangle, MessageSquare, Star, Send, StickyNote } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import CallNotesSidebar from "../components/calldetail/CallNotesSidebar";

export default function CallDetail() {
  const { user } = useOutletContext();
  const callId = window.location.pathname.split("/").pop();
  const queryClient = useQueryClient();
  const [showNotes, setShowNotes] = useState(false);

  const { data: call, isLoading } = useQuery({
    queryKey: ["call", callId],
    queryFn: async () => {
      const calls = await base44.entities.Call.filter({ id: callId });
      return calls[0];
    },
    enabled: !!callId,
  });

  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Call.update(callId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["call", callId] }),
  });

  const submitFeedback = () => {
    updateMutation.mutate({
      coaching_feedback: feedback,
      score: score ? parseInt(score) : call?.score,
    });
    setFeedback("");
    setScore("");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!call) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Call not found</div>;
  }

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  return (
    <div>
      <div className="mb-6">
        <Link to="/calls" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to calls
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">{call.lead_name || "Unknown Lead"}</h1>
          <Badge className={call.status === "live" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
            {call.status}
          </Badge>
          {call.score != null && (
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" /> {call.score}%
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-2"
            onClick={() => setShowNotes((v) => !v)}
          >
            <StickyNote className="w-3.5 h-3.5" />
            Call Notes
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Agent: {call.agent_name} · {call.created_date ? format(new Date(call.created_date), "MMM d, yyyy h:mm a") : ""}
          {call.duration_seconds ? ` · ${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : ""}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${showNotes ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {/* Transcript */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Transcript</h3>
          </div>
          <ScrollArea className="h-[500px] p-4">
            <div className="space-y-3">
              {(!call.transcript || call.transcript.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">No transcript available</p>
              )}
              {call.transcript?.map((entry, i) => (
                <div key={i} className={`flex gap-3 ${entry.speaker === "Agent" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    entry.speaker === "Agent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {entry.speaker === "Agent" ? "A" : "C"}
                  </div>
                  <div className={`max-w-[80%] ${entry.speaker === "Agent" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                      entry.speaker === "Agent"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {entry.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right sidebar */}
        <div className={`space-y-4 ${showNotes ? "lg:col-span-1" : ""}`}>
          {/* Summary */}
          {call.summary && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">AI Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{call.summary}</p>
            </Card>
          )}

          {/* Objections */}
          {call.objections_detected?.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold">Objections ({call.objections_detected.length})</h3>
              </div>
              <div className="space-y-2">
                {call.objections_detected.map((obj, i) => (
                  <div key={i} className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Badge className="bg-amber-100 text-amber-700 text-[10px] mb-1">{obj.category}</Badge>
                    <p className="text-xs text-muted-foreground">&ldquo;{obj.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Coaching Feedback */}
          {call.coaching_feedback && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Coaching Feedback</h3>
              <p className="text-sm text-muted-foreground">{call.coaching_feedback}</p>
            </Card>
          )}

          {/* Manager/Admin feedback form */}
          {isManagerOrAdmin && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Leave Feedback</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={call.score?.toString() || "Score"}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Feedback</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write coaching feedback..."
                    className="text-sm mt-1 h-24"
                  />
                </div>
                <Button size="sm" onClick={submitFeedback} className="w-full gap-2">
                  <Send className="w-3.5 h-3.5" /> Submit Feedback
                </Button>
              </div>
            </Card>
          )}

          {/* Notes */}
          {call.notes && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Call Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{call.notes}</p>
            </Card>
          )}
        </div>

        {/* AI Call Notes Sidebar */}
        {showNotes && (
          <Card className="overflow-hidden flex flex-col h-fit max-h-[800px]">
            <CallNotesSidebar call={call} onClose={() => setShowNotes(false)} />
          </Card>
        )}
      </div>
    </div>
  );
}