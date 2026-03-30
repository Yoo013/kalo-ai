import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, LayoutDashboard, Phone, Users, BarChart3, Settings, Brain, MessageSquare, FileText, Drama, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const allLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager", "agent"] },
  { to: "/admin", icon: ShieldCheck, label: "Admin Panel", roles: ["admin"] },
  { to: "/live-call", icon: Phone, label: "Live Call", roles: ["agent"] },
  { to: "/team", icon: Users, label: "Team", roles: ["admin", "manager"] },
  { to: "/calls", icon: Phone, label: "Calls", roles: ["admin", "manager", "agent"] },
  { to: "/scripts", icon: FileText, label: "Scripts", roles: ["admin", "agent"] },
  { to: "/objections", icon: MessageSquare, label: "Objections", roles: ["admin", "agent"] },
  { to: "/prompts", icon: Brain, label: "AI Prompts", roles: ["admin"] },
  { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "manager"] },
  { to: "/discover", icon: Sparkles, label: "Discover", roles: ["admin", "manager"] },
  { to: "/roleplay", icon: Drama, label: "Roleplay Trainer", roles: ["admin", "manager", "agent"] },
  { to: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
];

export default function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const role = user?.role || "agent";
  const links = allLinks.filter(l => l.roles.includes(role));

  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm">Kalo AI</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Kalo AI</span>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}