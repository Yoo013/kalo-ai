import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Phone,
  Users,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Brain,
  LogOut,
  Zap,
  Drama,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const adminLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin", icon: ShieldCheck, label: "Admin Panel" },
  { to: "/team", icon: Users, label: "Team" },
  { to: "/calls", icon: Phone, label: "Calls" },
  { to: "/scripts", icon: FileText, label: "Scripts" },
  { to: "/objections", icon: MessageSquare, label: "Objections" },
  { to: "/prompts", icon: Brain, label: "AI Prompts" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/discover", icon: Sparkles, label: "Discover" },
  { to: "/roleplay", icon: Drama, label: "Roleplay Trainer" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const managerLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/calls", icon: Phone, label: "Calls" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/team", icon: Users, label: "Agents" },
  { to: "/roleplay", icon: Drama, label: "Roleplay Trainer" },
];


const agentLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/live-call", icon: Phone, label: "Live Call" },
  { to: "/calls", icon: BarChart3, label: "My Calls" },
  { to: "/scripts", icon: FileText, label: "Scripts" },
  { to: "/objections", icon: MessageSquare, label: "Objections" },
  { to: "/roleplay", icon: Drama, label: "Roleplay Trainer" },
];


export default function Sidebar({ user }) {
  const location = useLocation();
  const role = user?.role || "agent";

  const links = role === "admin" ? adminLinks : role === "manager" ? managerLinks : agentLinks;

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Kalo AI</h1>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {user?.full_name?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5 rounded-md hover:bg-destructive/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}