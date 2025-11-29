
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderOpen,
  FileText,
  Calendar,
  LogOut,
  Inbox,
  Code,
  MessageCircle,
  Trophy,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      setStats({
        employees: { total: 0, approved: 0, pending: 0 },
        projects: { total: 0, active: 0, completed: 0 },
        dailyForms: { todaySubmissions: 0, weeklySubmissions: 0 },
        meetings: { total: 0, thisWeek: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    navigate("/");
  };

  if (loading) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl font-bold text-white">Loading Overview...</div>
          </div>
        </div>
      </PageBackground>
    );
  }

  // Only include options that exist in our project
  const columns = [
    {
      label: "Employee Name",
      key: "name",
      width: "w-1/5",
    },
    {
      label: "Role",
      key: "role",
      width: "w-1/6",
    },
    {
      label: "Projects",
      key: "projects",
      width: "w-1/6",
    },
    {
      label: "Forms Today",
      key: "formsToday",
      width: "w-1/6",
    },
    {
      label: "Meetings",
      key: "meetings",
      width: "w-1/6",
    },
    {
      label: "Status",
      key: "status",
      width: "w-1/6",
    },
  ];

  // Dummy data for table (replace with real API data if available)
  const employees = [
    {
      id: 1,
      name: "Alex Wong",
      role: "Software Engineer",
      projects: 3,
      formsToday: 1,
      meetings: 2,
      status: "Active",
    },
    {
      id: 2,
      name: "Samantha Simmons",
      role: "Software Engineer",
      projects: 2,
      formsToday: 1,
      meetings: 1,
      status: "Active",
    },
    {
      id: 3,
      name: "Brian Perez",
      role: "Software Engineer",
      projects: 1,
      formsToday: 0,
      meetings: 0,
      status: "Inactive",
    },
  ];

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Run Admin Overview</h1>
            <p className="mt-1 text-slate-300 text-sm">Quick summary of employees, projects, forms, and meetings.</p>
          </div>
          <button
            onClick={logout}
            className="mt-4 md:mt-0 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-xl bg-blue-500/20 p-4 flex flex-col items-center">
            <Users className="h-6 w-6 text-blue-300 mb-2" />
            <div className="text-2xl font-bold">{stats?.employees?.approved || 0}</div>
            <div className="text-xs text-slate-200">Active Employees</div>
          </div>
          <div className="rounded-xl bg-indigo-500/20 p-4 flex flex-col items-center">
            <FolderOpen className="h-6 w-6 text-indigo-300 mb-2" />
            <div className="text-2xl font-bold">{stats?.projects?.active || 0}</div>
            <div className="text-xs text-slate-200">Active Projects</div>
          </div>
          <div className="rounded-xl bg-emerald-500/20 p-4 flex flex-col items-center">
            <FileText className="h-6 w-6 text-emerald-300 mb-2" />
            <div className="text-2xl font-bold">{stats?.dailyForms?.todaySubmissions || 0}</div>
            <div className="text-xs text-slate-200">Forms Today</div>
          </div>
          <div className="rounded-xl bg-rose-500/20 p-4 flex flex-col items-center">
            <Calendar className="h-6 w-6 text-rose-300 mb-2" />
            <div className="text-2xl font-bold">{stats?.meetings?.thisWeek || 0}</div>
            <div className="text-xs text-slate-200">Meetings This Week</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-0 overflow-x-auto">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/admin/employees")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Users className="h-4 w-4" /> Employees
              </button>
              <button
                onClick={() => navigate("/admin/projects")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <FolderOpen className="h-4 w-4" /> Projects
              </button>
              <button
                onClick={() => navigate("/admin/daily-forms")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <FileText className="h-4 w-4" /> Daily Forms
              </button>
              <button
                onClick={() => navigate("/admin/meetings")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Calendar className="h-4 w-4" /> Meetings
              </button>
              <button
                onClick={() => navigate("/admin/leaderboard")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Trophy className="h-4 w-4" /> Leaderboard
              </button>
              <button
                onClick={() => navigate("/admin/hackathon")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Code className="h-4 w-4" /> Hackathon
              </button>
              <button
                onClick={() => navigate("/admin/messages")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" /> Messages
              </button>
              <button
                onClick={() => navigate("/admin/requests")}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Inbox className="h-4 w-4" /> Requests
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left mt-2">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((col) => (
                    <th key={col.key} className={`p-3 text-xs text-slate-300 font-semibold ${col.width}`}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/10">
                    <td className="p-3 font-medium text-white">{emp.name}</td>
                    <td className="p-3 text-slate-200">{emp.role}</td>
                    <td className="p-3 text-slate-200">{emp.projects}</td>
                    <td className="p-3 text-slate-200">{emp.formsToday}</td>
                    <td className="p-3 text-slate-200">{emp.meetings}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${emp.status === "Active" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}