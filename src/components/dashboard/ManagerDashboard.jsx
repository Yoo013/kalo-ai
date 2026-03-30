import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Phone, Users, TrendingUp, AlertTriangle } from "lucide-react";
import StatCard from "../shared/StatCard";
import PageHeader from "../shared/PageHeader";
import RecentCallsList from "./RecentCallsList";
import AgentPerformanceTable from "./AgentPerformanceTable";

export default function ManagerDashboard({ user }) {
  const { data: calls = [] } = useQuery({
    queryKey: ["calls"],
    queryFn: () => base44.entities.Call.list("-created_date", 50),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => base44.entities.User.filter({ role: "agent" }),
  });

  const completedCalls = calls.filter((c) => c.status === "completed");
  const avgScore = completedCalls.length
    ? Math.round(completedCalls.reduce((a, c) => a + (c.score || 0), 0) / completedCalls.length)
    : 0;

  return (
    <div>
      <PageHeader
        title={`Manager Dashboard`}
        description="Monitor your team's performance and coaching opportunities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Agents" value={agents.length} icon={Users} />
        <StatCard title="Calls Today" value={calls.length} icon={Phone} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} />
        <StatCard title="Objections" value={calls.reduce((a, c) => a + (c.objections_detected?.length || 0), 0)} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCallsList calls={calls.slice(0, 6)} />
        <AgentPerformanceTable agents={agents} calls={calls} />
      </div>
    </div>
  );
}