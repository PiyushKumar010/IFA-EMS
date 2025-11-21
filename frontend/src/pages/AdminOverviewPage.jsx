import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderOpen,
  FileText,
  MessageCircle,
  Calendar,
  BarChart3,
  LogOut,
  Inbox,
  Activity,
  AlertCircle,
  CheckCircle,
  Code,
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
      console.error("Error fetching stats:", error);
      // Set default empty stats
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
    } catch (e) {
      /* ignore */
    }
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

  const quickActions = [
    {
      name: "Team Management",
      description: "Manage employees and approvals",
      icon: Users,
      color: "bg-blue-500",
      path: "/admin/employees",
      count: stats?.employees?.total || 0,
      badge: stats?.employees?.pending > 0 ? stats.employees.pending : null
    },
    {
      name: "Projects",
      description: "View and manage all projects",
      icon: FolderOpen,
      color: "bg-indigo-500",
      path: "/admin/projects",
      count: stats?.projects?.active || 0
    },
    {
      name: "Daily Forms",
      description: "Monitor employee submissions",
      icon: FileText,
      color: "bg-emerald-500",
      path: "/admin/daily-forms",
      count: stats?.dailyForms?.todaySubmissions || 0
    },
    {
      name: "Messages",
      description: "Communication hub",
      icon: MessageCircle,
      color: "bg-purple-500",
      path: "/admin/messages",
      count: 0
    },
    {
      name: "Meetings",
      description: "Schedule and manage meetings",
      icon: Calendar,
      color: "bg-rose-500",
      path: "/admin/meetings",
      count: stats?.meetings?.thisWeek || 0
    },
    {
      name: "Analytics",
      description: "Performance insights",
      icon: BarChart3,
      color: "bg-cyan-500",
      path: "/admin/leaderboard",
      count: 0
    },
    {
      name: "Hackathon",
      description: "Manage hackathon events",
      icon: Code,
      color: "bg-violet-500",
      path: "/admin/hackathon",
      count: 0
    },
    {
      name: "Reports",
      description: "Task tracking reports",
      icon: Activity,
      color: "bg-orange-500",
      path: "/admin/reports",
      count: 0
    },
    {
      name: "Pending Requests",
      description: "Review employee approvals",
      icon: Inbox,
      color: "bg-amber-500",
      path: "/admin/requests",
      count: stats?.employees?.pending || 0,
      badge: stats?.employees?.pending > 0 ? stats.employees.pending : null
    }
  ];

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Overview</h1>
            <p className="mt-2 text-slate-300">
              Welcome back! Here's what's happening with your team.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.employees?.approved || 0}</div>
                <div className="text-sm text-slate-300">Active Employees</div>
                {stats?.employees?.pending > 0 && (
                  <div className="mt-1 text-xs text-amber-300">
                    {stats.employees.pending} pending approval
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20">
                <FolderOpen className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.projects?.active || 0}</div>
                <div className="text-sm text-slate-300">Active Projects</div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats?.projects?.total || 0} total projects
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <FileText className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.dailyForms?.todaySubmissions || 0}</div>
                <div className="text-sm text-slate-300">Forms Today</div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats?.dailyForms?.weeklySubmissions || 0} this week
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/20">
                <Calendar className="h-6 w-6 text-rose-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.meetings?.thisWeek || 0}</div>
                <div className="text-sm text-slate-300">Meetings This Week</div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats?.meetings?.total || 0} total scheduled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className="glass-card group p-6 text-left transition-all hover:scale-105 hover:border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}/20`}>
                        <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                      </div>
                      {action.badge && (
                        <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-white">{action.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{action.description}</p>
                    {action.count !== undefined && action.count > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        {action.count} items
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6">
          <h2 className="mb-6 text-xl font-bold">System Status</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="font-medium text-emerald-200">System Online</div>
                <div className="text-sm text-emerald-300">All services operational</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <Activity className="h-5 w-5 text-blue-300" />
              <div>
                <div className="font-medium text-blue-200">Active Users</div>
                <div className="text-sm text-blue-300">{stats?.employees?.approved || 0} employees online</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 rounded-lg p-4 ${
              stats?.employees?.pending > 0 
                ? 'bg-amber-500/10 border border-amber-500/20' 
                : 'bg-slate-500/10 border border-slate-500/20'
            }`}>
              {stats?.employees?.pending > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-300" />
                  <div>
                    <div className="font-medium text-amber-200">Pending Actions</div>
                    <div className="text-sm text-amber-300">{stats.employees.pending} approvals needed</div>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-slate-300" />
                  <div>
                    <div className="font-medium text-slate-200">No Pending Actions</div>
                    <div className="text-sm text-slate-300">All caught up!</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}