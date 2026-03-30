import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AgentPerformanceTable({ agents, calls }) {
  const agentStats = agents.map((agent) => {
    const agentCalls = calls.filter((c) => c.agent_email === agent.email);
    const completed = agentCalls.filter((c) => c.status === "completed");
    const avgScore = completed.length
      ? Math.round(completed.reduce((a, c) => a + (c.score || 0), 0) / completed.length)
      : 0;
    return { ...agent, callCount: agentCalls.length, avgScore };
  });

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-sm">Agent Performance</h3>
      </div>
      <div className="divide-y divide-border">
        {agentStats.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No agents found</div>
        )}
        {agentStats.map((agent) => (
          <div key={agent.id} className="flex items-center gap-4 p-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {agent.full_name?.[0] || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{agent.full_name || agent.email}</p>
              <p className="text-xs text-muted-foreground">{agent.callCount} calls</p>
            </div>
            <Badge variant={agent.avgScore >= 70 ? "default" : "secondary"} className="text-xs">
              {agent.avgScore}%
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}