import React from "react";
import { useOutletContext } from "react-router-dom";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import ManagerDashboard from "../components/dashboard/ManagerDashboard";
import AgentDashboard from "../components/dashboard/AgentDashboard";

export default function Dashboard() {
  const { user } = useOutletContext();
  const role = user?.role || "agent";

  if (role === "admin") return <AdminDashboard user={user} />;
  if (role === "manager") return <ManagerDashboard user={user} />;
  return <AgentDashboard user={user} />;
}