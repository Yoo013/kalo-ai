import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useOutletContext } from "react-router-dom";
import { Users, Shield, UserCheck, UserCog, Mail, Search, ChevronDown, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";

const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access — manage team, settings, all data", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  { value: "manager", label: "Manager", desc: "View team calls, analytics, coaching", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  { value: "agent", label: "Agent", desc: "Live call, scripts, objections, roleplay", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
];

function RoleBadge({ role }) {
  const r = ROLES.find(r => r.value === role) || ROLES[2];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${r.color}`}>
      {role === "admin" ? <Shield className="w-3 h-3" /> : role === "manager" ? <UserCheck className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
      {r.label}
    </span>
  );
}

function RoleDropdown({ userId, currentRole, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors"
      >
        <RoleBadge role={currentRole} />
        <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-xl shadow-xl w-64 py-1 overflow-hidden">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => { onChange(userId, r.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3 ${currentRole === r.value ? "bg-muted/50" : ""}`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${r.color}`}>
                {currentRole === r.value && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { user: currentUser } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setTimeout(() => setInviteSuccess(""), 4000);
    } catch {}
    setInviting(false);
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    admin: users.filter(u => u.role === "admin").length,
    manager: users.filter(u => u.role === "manager").length,
    agent: users.filter(u => u.role === "agent").length,
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Shield className="w-5 h-5 mr-2" /> Admin access required.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Admin Panel" description="Manage team members, roles, and access control." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {ROLES.map(r => (
          <div key={r.value} className={`rounded-xl border p-4 ${r.color}`}>
            <p className="text-2xl font-black">{stats[r.value]}</p>
            <p className="text-sm font-medium mt-1">{r.label}s</p>
            <p className="text-xs opacity-70 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User list */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{filtered.length} members</span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{u.full_name?.[0] || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  {u.id === currentUser?.id ? (
                    <span className="text-xs text-muted-foreground italic">You</span>
                  ) : (
                    <RoleDropdown userId={u.id} currentRole={u.role || "agent"} onChange={handleRoleChange} />
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No team members found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Invite Team Member</h3>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <Input
                type="email"
                placeholder="agent@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Role</p>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <label key={r.value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${inviteRole === r.value ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={inviteRole === r.value}
                        onChange={() => setInviteRole(r.value)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={inviting} className="w-full gap-2">
                <Mail className="w-4 h-4" />
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
              {inviteSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {inviteSuccess}
                </div>
              )}
            </form>
          </div>

          {/* Role guide */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Agent Access Includes</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Live Call with AI coaching",
                "Real-time Deepgram transcription",
                "Objection alerts & closing tips",
                "Scripts & Objection library",
                "AI Roleplay Trainer",
                "Personal call history",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}