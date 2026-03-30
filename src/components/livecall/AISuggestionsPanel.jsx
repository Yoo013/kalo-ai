import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, Lightbulb } from "lucide-react";
import { format } from "date-fns";

export default function AISuggestionsPanel({ suggestions, objections }) {
  const items = [
    ...suggestions.map((s) => ({ ...s, kind: "suggestion" })),
    ...objections.map((o) => ({ ...o, kind: "objection", text: o.suggested_response })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">AI Coach</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">{items.length} tips</Badge>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              AI suggestions will appear here during a call
            </div>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-sm ${
                item.kind === "objection"
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                  : "bg-accent border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {item.kind === "objection" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.kind === "objection" ? `Objection: ${item.category}` : "Suggestion"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{item.text}</p>
              {item.timestamp && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(item.timestamp), "h:mm:ss a")}
                </p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}