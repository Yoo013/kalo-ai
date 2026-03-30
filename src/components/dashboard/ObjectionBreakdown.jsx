import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = ["PRICE", "TRUST", "THINK_ABOUT_IT", "SPOUSE", "NOT_INTERESTED", "COMPETITOR"];
const categoryLabels = {
  PRICE: "Price",
  TRUST: "Trust",
  THINK_ABOUT_IT: "Think About It",
  SPOUSE: "Spouse",
  NOT_INTERESTED: "Not Interested",
  COMPETITOR: "Competitor",
};

export default function ObjectionBreakdown({ calls }) {
  const objections = calls.flatMap((c) => c.objections_detected || []);
  const total = objections.length || 1;

  const counts = CATEGORIES.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    count: objections.filter((o) => o.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-5">Objection Breakdown</h3>
      <div className="space-y-4">
        {counts.map((item) => (
          <div key={item.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              <span className="text-xs font-semibold">{item.count}</span>
            </div>
            <Progress value={(item.count / total) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
      {objections.length === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-4">No objections detected yet</p>
      )}
    </Card>
  );
}