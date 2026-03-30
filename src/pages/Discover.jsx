import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

const SUGGESTED_QUESTIONS = {
  Recent: [
    "Why are customers calling?",
    "What are the top 2 objections the team is hearing?",
    "What are the top 2 objections?",
    "What objections do customers have that prevent them from moving forward with a sale or similar commitment?",
    "What are the most common misunderstandings customers have about the company, product, or service?",
  ],
  Sales: [
    "Which agents are closing at the highest rate?",
    "What are the most effective objection handling techniques used?",
    "What call stage has the highest drop-off rate?",
    "What phrases correlate with successful closes?",
  ],
  Coaching: [
    "Which agents need the most coaching on price objections?",
    "What is the average score across the team this week?",
    "Who has improved the most in the last 30 days?",
    "What are the most common coaching feedback themes?",
  ],
};

export default function Discover() {
  const { user } = useOutletContext();
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("Recent");
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);

  const { data: calls = [] } = useQuery({
    queryKey: ["calls-discover"],
    queryFn: () => base44.entities.Call.list("-created_date", 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users-discover"],
    queryFn: () => base44.entities.User.list(),
  });

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;

    setQuestion(query);
    setIsLoading(true);
    setAnswer(null);
    setShowSuggested(false);

    try {
      const contextData = {
        totalCalls: calls.length,
        completedCalls: calls.filter((c) => c.status === "completed").length,
        agents: users.filter((u) => u.role === "agent").map((u) => u.full_name || u.email),
        recentCallSummaries: calls.slice(0, 20).map((c) => ({
          agent: c.agent_name,
          lead: c.lead_name,
          stage: c.call_stage,
          score: c.score,
          objections: c.objections_detected?.map((o) => o.category) || [],
          summary: c.summary,
          duration: c.duration_seconds,
        })),
        allObjections: calls.flatMap((c) => c.objections_detected || []).map((o) => o.category),
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sales intelligence analyst for a debt relief sales team. 
        
Here is data about recent calls:
${JSON.stringify(contextData, null, 2)}

Answer this question in a helpful, specific way:
"${query}"

Be concise but insightful. Use the actual data. Format your answer with clear sections if needed.
If there's not enough data, say so honestly but give what insights you can.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
        },
      });

      setAnswer(result);
    } catch (e) {
      setAnswer({ answer: "Failed to get an answer. Please try again.", key_findings: [], recommendations: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground">AI-powered insights from your customer conversations</p>
        </div>
      </div>

      <Card className="p-5 mb-6">
        <p className="text-sm font-medium mb-3">What would you like to know about your customer conversations?</p>
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Curious about patterns in your calls? Ask anything or try a suggested question..."
            className="resize-none text-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <Button
            onClick={() => handleAsk()}
            disabled={isLoading || !question.trim()}
            className="self-end gap-2 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Answer
          </Button>
        </div>
      </Card>

      {/* Answer */}
      {isLoading && (
        <Card className="p-6 mb-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analyzing your call data...</span>
        </Card>
      )}

      {answer && !isLoading && (
        <Card className="p-5 mb-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Answer</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-4">{answer.answer}</p>

          {answer.key_findings?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Key Findings</p>
              <ul className="space-y-1.5">
                {answer.key_findings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recommendations</p>
              <ul className="space-y-1.5">
                {answer.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-xs"
            onClick={() => { setAnswer(null); setShowSuggested(true); setQuestion(""); }}
          >
            Ask another question
          </Button>
        </Card>
      )}

      {/* Suggested questions */}
      {showSuggested && (
        <div>
          <button
            className="flex items-center gap-2 text-sm font-medium mb-4"
            onClick={() => setShowSuggested((v) => !v)}
          >
            <ChevronDown className="w-4 h-4" />
            Suggested Questions
          </button>

          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.keys(SUGGESTED_QUESTIONS).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUGGESTED_QUESTIONS[activeTab].map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors text-sm text-foreground leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}