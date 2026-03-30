import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Phone, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  completed: "bg-muted text-muted-foreground border-border",
  missed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function RecentCallsList({ calls }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent Calls</h3>
        <Link to="/calls" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {calls.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No calls yet</div>
        )}
        {calls.map((call) => (
          <Link
            key={call.id}
            to={`/calls/${call.id}`}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              call.status === "live" ? "bg-emerald-500/10" : "bg-muted"
            }`}>
              <Phone className={`w-4 h-4 ${call.status === "live" ? "text-emerald-600" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{call.lead_name || "Unknown Lead"}</p>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[call.status]}`}>
                  {call.status === "live" && "● "}{call.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {call.agent_name} · {call.created_date ? format(new Date(call.created_date), "MMM d, h:mm a") : "—"}
              </p>
            </div>
            {call.score != null && (
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${call.score >= 70 ? "text-emerald-600" : call.score >= 40 ? "text-amber-600" : "text-destructive"}`}>
                  {call.score}%
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}