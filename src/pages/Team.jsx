import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Plus, Mail, Phone as PhoneIcon, Search } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";
import { useToast } from "@/components/ui/use-toast";

export default function Team() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const isAdmin = user?.role === "admin";
  const filteredUsers = users.filter(
    (u) =>
      (!search ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())) &&
      (isAdmin || u.role === "agent")
  );

  const handleInvite = async () => {
    if (!inviteEmail) return;
    await base44.users.inviteUser(inviteEmail, inviteRole === "admin" ? "admin" : "user");
    toast({ title: "Invitation sent", description: `Invited ${inviteEmail} as ${inviteRole}` });
    setInviteEmail("");
    setOpen(false);
  };

  const statusColor = {
    active: "bg-emerald-500/10 text-emerald-600",
    inactive: "bg-muted text-muted-foreground",
    on_call: "bg-primary/10 text-primary",
  };

  return (
    <div>
      <PageHeader title="Team" description={isAdmin ? "Manage your team members" : "Your agents"}>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} className="w-full">Send Invitation</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredUsers.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Invite your first team member to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((member) => (
            <Card key={member.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {member.full_name?.[0] || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold truncate">{member.full_name || "Unknown"}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{member.role}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-[10px] ${statusColor[member.status || "active"]}`}>
                      {member.status || "active"}
                    </Badge>
                    {member.total_calls > 0 && (
                      <span className="text-[10px] text-muted-foreground">{member.total_calls} calls</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}