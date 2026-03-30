import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

function StatMetric({ label, value, color = "text-foreground", icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-1">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground text-center">{label}</div>
    </div>
  );
}

function ProgressBar({ value, max, color = "bg-primary" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{value}</span>
    </div>
  );
}

function PassRateBar({ passRate }) {
  const pct = Math.round(passRate);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-3 bg-destructive/20 rounded-full overflow-hidden relative">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function Analytics() {
  const { user } = useOutletContext();
  const [sortBy, setSortBy] = useState("pass_rate");

  const { data: calls = [] } = useQuery({
    queryKey: ["calls-analytics"],
    queryFn: () => base44.entities.Call.list("-created_date", 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users-analytics"],
    queryFn: () => base44.entities.User.list(),
  });

  const completed = calls.filter((c) => c.status === "completed");
  const avgScore = completed.length
    ? (completed.reduce((a, c) => a + (c.score || 0), 0) / completed.length).toFixed(2)
    : "0.00";

  const allObjections = calls.flatMap((c) => c.objections_detected || []);
  const flaggedCalls = completed.filter((c) => c.score != null && c.score < 50);

  // Flagged criteria — objection categories + call stages
  const objectionCategories = ["PRICE", "TRUST", "THINK_ABOUT_IT", "SPOUSE", "NOT_INTERESTED", "COMPETITOR"];
  const flaggedCriteria = objectionCategories.map((cat) => ({
    name: cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: allObjections.filter((o) => o.category === cat).length,
    calls: calls.filter((c) => c.objections_detected?.some((o) => o.category === cat)).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const maxFlagged = Math.max(...flaggedCriteria.map((c) => c.count), 1);

  // Agent performance
  const agents = users.filter((u) => u.role === "agent");
  const agentPerf = agents.map((agent) => {
    const agentCalls = completed.filter((c) => c.agent_email === agent.email);
    const passing = agentCalls.filter((c) => c.score != null && c.score >= 50);
    const failing = agentCalls.filter((c) => c.score != null && c.score < 50);
    const passRate = agentCalls.length > 0 ? (passing.length / agentCalls.length) * 100 : 0;
    const avgScoreAgent = agentCalls.length
      ? agentCalls.reduce((a, c) => a + (c.score || 0), 0) / agentCalls.length
      : 0;
    return {
      name: agent.full_name || agent.email,
      passRate,
      avgScore: avgScoreAgent.toFixed(2),
      passingCalls: passing.length,
      failingCalls: failing.length,
      totalCalls: agentCalls.length,
    };
  });

  const sortedAgents = [...agentPerf].sort((a, b) => {
    if (sortBy === "pass_rate") return b.passRate - a.passRate;
    if (sortBy === "avg_score") return b.avgScore - a.avgScore;
    if (sortBy === "calls") return b.totalCalls - a.totalCalls;
    return 0;
  });

  // Flagged agents — agents with most objections
  const flaggedAgents = agents.map((agent) => ({
    name: agent.full_name || agent.email,
    count: allObjections.filter((_, __, arr) => {
      const agentCalls = calls.filter((c) => c.agent_email === agent.email);
      return agentCalls.some((c) => c.objections_detected?.length > 0);
    }).length,
    callCount: calls.filter((c) => c.agent_email === agent.email && (c.objections_detected?.length || 0) > 0).length,
  })).filter((a) => a.callCount > 0).sort((a, b) => b.callCount - a.callCount);

  const maxAgentFlag = Math.max(...flaggedAgents.map((a) => a.callCount), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QA Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance quality analysis across your organization</p>
        </div>
      </div>

      {/* Overview */}
      <h2 className="text-base font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Left — key metrics */}
        <Card className="divide-y divide-border">
          <StatMetric
            label="Evaluated Calls"
            value={completed.length}
            color="text-primary"
          />
          <StatMetric
            label="Average Score"
            value={`${avgScore}%`}
            color="text-amber-600"
          />
          <StatMetric
            label="Flagged Calls"
            value={flaggedCalls.length}
            color="text-destructive"
          />
        </Card>

        {/* Center — Flagged Criteria */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Flagged Criteria</h3>
          {flaggedCriteria.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No flagged criteria yet</p>
          ) : (
            <div className="space-y-3">
              {flaggedCriteria.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate max-w-[160px]">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.calls} Calls</span>
                  </div>
                  <ProgressBar value={c.count} max={maxFlagged} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right — Flagged Agents */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Flagged Agents</h3>
          {flaggedAgents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No flagged agents yet</p>
          ) : (
            <div className="space-y-3">
              {flaggedAgents.map((a) => (
                <div key={a.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground">{a.callCount} Calls</span>
                  </div>
                  <ProgressBar value={a.callCount} max={maxAgentFlag} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Agent Performance Table */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Agent Performance</h2>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pass_rate">Pass Rate</SelectItem>
            <SelectItem value="avg_score">Avg Score</SelectItem>
            <SelectItem value="calls">Call Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Agent</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pass Rate Indicator</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Avg Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Passing Calls</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Failing Calls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedAgents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No agent performance data yet
                </td>
              </tr>
            )}
            {sortedAgents.map((agent) => (
              <tr key={agent.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-sm">{agent.name}</td>
                <td className="px-4 py-3 w-48">
                  <PassRateBar passRate={agent.passRate} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  <span className={agent.passRate >= 50 ? "text-emerald-600" : "text-destructive"}>
                    {Math.round(agent.passRate)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{agent.avgScore}%</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-emerald-600 font-medium">{agent.passingCalls}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-destructive font-medium">{agent.failingCalls}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAgents.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">1 – {sortedAgents.length} of {sortedAgents.length}</span>
          </div>
        )}
      </Card>

      {/* Scorecard Performance */}
      <h2 className="text-base font-semibold mb-3">Scorecard Performance</h2>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Calls</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {["opening", "discovery", "presentation", "objection_handling", "closing", "follow_up"].map((stage) => {
              const stageCalls = completed.filter((c) => c.call_stage === stage);
              const stageAvg = stageCalls.length
                ? stageCalls.reduce((a, c) => a + (c.score || 0), 0) / stageCalls.length
                : 0;
              const stagePassing = stageCalls.filter((c) => c.score != null && c.score >= 50);
              const passRate = stageCalls.length > 0 ? (stagePassing.length / stageCalls.length) * 100 : 0;
              return (
                <tr key={stage} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium capitalize">{stage.replace("_", " / ")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{stageCalls.length}</td>
                  <td className="px-4 py-3">
                    <span className={passRate >= 50 ? "text-emerald-600 font-semibold" : "text-destructive font-semibold"}>
                      {Math.round(passRate)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{stageAvg.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}