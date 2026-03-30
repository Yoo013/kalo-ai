import React from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function CallNotesPanel({ notes, setNotes }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Call Notes</h3>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type notes during the call..."
        className="text-sm resize-none h-20"
      />
    </Card>
  );
}