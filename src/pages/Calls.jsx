import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, SlidersHorizontal, X, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";

const statusColors = {
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  completed: "bg-muted text-muted-foreground border-border",
  missed: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Calls() {
  const { user } = useOutletContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");

  const isAgent = user?.role === "agent";

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["calls", isAgent ? user.email : "all"],
    queryFn: () =>
      isAgent
        ? base44.entities.Call.filter({ agent_email: user.email }, "-created_date", 100)
        : base44.entities.Call.list("-created_date", 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users-calls"],
    queryFn: () => base44.entities.User.list(),
    enabled: !isAgent,
  });

  const agents = users.filter((u) => u.role === "agent" || u.role === "manager");

  const filtered = calls.filter((c) => {
    const matchSearch =
      !search ||
      c.lead_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.agent_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchAgent = agentFilter === "all" || c.agent_email === agentFilter;
    return matchSearch && matchStatus && matchAgent;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setAgentFilter("all");
  };

  const hasFilters = search || statusFilter !== "all" || agentFilter !== "all";

  return (
    <div>
      <PageHeader
        title="Call Explorer"
        description={isAgent ? "Your call history" : "All calls across your team"}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-3.5 h-3.5" /> Download Data
        </Button>
      </PageHeader>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm w-52"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-sm w-36 gap-1">
            <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>

        {!isAgent && (
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="h-8 text-sm w-44 gap-1">
              <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.email} value={a.email}>{a.full_name || a.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-muted-foreground">
            <X className="w-3 h-3" /> Clear Filters
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} calls</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Call ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Date / Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wide">Duration</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading calls...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <p className="text-sm font-medium text-foreground mb-1">No calls match the search criteria</p>
                    <p className="text-xs text-muted-foreground mb-3">Try increasing the date range or modifying your current filters.</p>
                    {hasFilters && (
                      <Button size="sm" onClick={clearFilters}>Clear All Filters</Button>
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((call) => (
                <tr key={call.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <Link
                      to={`/calls/${call.id}`}
                      className="text-primary hover:underline font-mono text-xs"
                    >
                      {call.id?.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-sm">{call.agent_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{call.lead_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border capitalize ${statusColors[call.status]}`}>
                      {call.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {call.call_stage ? (
                      <span className="text-xs text-muted-foreground capitalize">{call.call_stage.replace("_", " ")}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {call.score != null ? (
                      <span className={`text-sm font-semibold ${
                        call.score >= 70 ? "text-emerald-600" :
                        call.score >= 40 ? "text-amber-600" :
                        "text-destructive"
                      }`}>
                        {call.score}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {call.created_date ? format(new Date(call.created_date), "MMM d, yyyy h:mm a") : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/calls/${call.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {calls.length} calls
            </span>
          </div>
        )}
      </div>
    </div>
  );
}