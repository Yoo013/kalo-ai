import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout({ user }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      {/* Mobile nav */}
      <div className="lg:hidden">
        <MobileNav user={user} />
      </div>
      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}