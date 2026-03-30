import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Phone, Users, Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import StatCard from "../shared/StatCard";
import PageHeader from "../shared/PageHeader";
import RecentCallsList from "./RecentCallsList";
import ObjectionBreakdown from "./ObjectionBreakdown";

export default function AdminDashboard({ user }) {
  const { data: calls = [] } = useQuery({
    queryKey: ["calls"],
    queryFn: () => base44.entities.Call.list("-created_date", 50),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const liveCalls = calls.filter((c) => c.status === "live");
  const completedCalls = calls.filter((c) => c.status === "completed");
  const avgScore = completedCalls.length
    ? Math.round(completedCalls.reduce((a, c) => a + (c.score || 0), 0) / completedCalls.length)
    : 0;
  const totalObjections = calls.reduce((a, c) => a + (c.objections_detected?.length || 0), 0);
  const agents = users.filter((u) => u.role === "agent");

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"}`}
        description="Here's what's happening across your organization today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Live Calls" value={liveCalls.length} icon={Phone} subtitle="Active right now" />
        <StatCard title="Total Agents" value={agents.length} icon={Users} subtitle={`${agents.filter(a => a.status === "on_call").length} on call`} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} trend="+5% this week" trendUp />
        <StatCard title="Objections" value={totalObjections} icon={AlertTriangle} subtitle="Detected today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentCallsList calls={calls.slice(0, 8)} />
        </div>
        <div>
          <ObjectionBreakdown calls={calls} />
        </div>
      </div>
    </div>
  );
}