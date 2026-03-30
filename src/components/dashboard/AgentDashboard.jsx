import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Phone, TrendingUp, Clock, MessageSquare, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "../shared/StatCard";
import PageHeader from "../shared/PageHeader";
import RecentCallsList from "./RecentCallsList";

export default function AgentDashboard({ user }) {
  const { data: calls = [] } = useQuery({
    queryKey: ["my-calls"],
    queryFn: () => base44.entities.Call.filter({ agent_email: user?.email }, "-created_date", 20),
  });

  const completedCalls = calls.filter((c) => c.status === "completed");
  const avgScore = completedCalls.length
    ? Math.round(completedCalls.reduce((a, c) => a + (c.score || 0), 0) / completedCalls.length)
    : 0;
  const totalMinutes = Math.round(completedCalls.reduce((a, c) => a + (c.duration_seconds || 0), 0) / 60);

  return (
    <div>
      <PageHeader title={`Hey, ${user?.full_name?.split(" ")[0] || "Agent"}`} description="Ready to crush some calls today?">
        <Link to="/live-call">
          <Button className="gap-2 shadow-md">
            <Headphones className="w-4 h-4" />
            Start Live Call
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="My Calls" value={calls.length} icon={Phone} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} trend="+3% vs last week" trendUp />
        <StatCard title="Talk Time" value={`${totalMinutes}m`} icon={Clock} />
        <StatCard title="Objections Handled" value={calls.reduce((a, c) => a + (c.objections_detected?.length || 0), 0)} icon={MessageSquare} />
      </div>

      <RecentCallsList calls={calls.slice(0, 6)} />
    </div>
  );
}