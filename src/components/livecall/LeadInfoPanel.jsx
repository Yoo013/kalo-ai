import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function LeadInfoPanel({ leadInfo, setLeadInfo }) {
  const update = (key, value) => setLeadInfo((prev) => ({ ...prev, [key]: value }));

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Lead Information</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Name</Label>
          <Input
            value={leadInfo.name || ""}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Lead name"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Phone</Label>
          <Input
            value={leadInfo.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Phone"
            className="h-8 text-xs mt-1"
          />
        </div>
        {leadInfo.debt_amount && (
          <div>
            <Label className="text-[11px] text-muted-foreground">Debt Amount</Label>
            <p className="text-sm font-semibold mt-1 text-primary">{leadInfo.debt_amount}</p>
          </div>
        )}
        {leadInfo.income && (
          <div>
            <Label className="text-[11px] text-muted-foreground">Income</Label>
            <p className="text-sm font-semibold mt-1">{leadInfo.income}</p>
          </div>
        )}
        {leadInfo.key_detail && (
          <div className="col-span-2">
            <Label className="text-[11px] text-muted-foreground">Key Detail</Label>
            <p className="text-sm mt-1">{leadInfo.key_detail}</p>
          </div>
        )}
      </div>
    </Card>
  );
}