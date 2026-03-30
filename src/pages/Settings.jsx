import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Users, CreditCard, Building } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(user?.company_name || "");
  const [maxSeats, setMaxSeats] = useState("10");

  const { data: users = [] } = useQuery({
    queryKey: ["users-settings"],
    queryFn: () => base44.entities.User.list(),
  });

  const agentCount = users.filter((u) => u.role === "agent").length;

  const handleSave = async () => {
    await base44.auth.updateMe({ company_name: companyName });
    toast({ title: "Settings saved" });
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your organization settings" />

      <div className="max-w-2xl space-y-6">
        {/* Company */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Company</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 max-w-sm" placeholder="Your company name" />
            </div>
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>

        {/* Billing / Seats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Billing & Seats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Agent Seats Used</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{agentCount}</span>
                  <span className="text-sm text-muted-foreground">/ {maxSeats}</span>
                </div>
              </div>
              <Badge variant={agentCount >= parseInt(maxSeats) ? "destructive" : "secondary"}>
                {agentCount >= parseInt(maxSeats) ? "At limit" : "Active"}
              </Badge>
            </div>
            <div>
              <Label>Max Seats</Label>
              <Input type="number" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} className="mt-1 max-w-[120px]" />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Stripe Integration</p>
              <p className="text-xs text-muted-foreground mt-1">Billing integration placeholder — connect Stripe to enable automatic seat-based billing.</p>
              <Button variant="outline" size="sm" className="mt-3" disabled>Connect Stripe (Coming Soon)</Button>
            </div>
          </div>
        </Card>

        {/* Team Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Team Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xl font-bold">{users.filter((u) => u.role === "manager").length}</p>
              <p className="text-xs text-muted-foreground">Managers</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xl font-bold">{agentCount}</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}