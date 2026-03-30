import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function TranscriptPanel({ transcript, isLive }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Live Transcript</h3>
        {isLive && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-medium">Recording</span>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {transcript.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              {isLive ? "Waiting for conversation..." : "Start a call to see the transcript"}
            </div>
          )}
          {transcript.map((entry, i) => (
            <div
              key={i}
              className={`flex gap-3 ${entry.speaker === "Agent" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                entry.speaker === "Agent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
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
                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                  {entry.timestamp ? format(new Date(entry.timestamp), "h:mm:ss a") : ""}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}