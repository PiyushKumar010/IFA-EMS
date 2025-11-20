import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderOpen,
  Clock,
  CheckCircle,
  FileText,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Calendar,
  UserCheck,
  UserPlus,
  Activity,
  BarChart3,
  Eye,
  LogOut,
  Trophy,
  Video,
  Inbox,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminOverviewPage() {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch overview data");
      const data = await res.json();
      setOverviewData(data);
    } catch (error) {
      console.error("Error fetching overview data:", error);
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
        <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-slate-300">Loading overview...</p>
            </div>
          </div>
        </div>
      </PageBackground>
    );
  }

  const { stats, recentData } = overviewData || {};

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Top Navigation */}
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-bold">Overview</h1>
            <p className="text-sm text-slate-300">
              Complete overview of your organization's performance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/employees")}
              title="Employees"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/leaderboard")}
              title="Leaderboard"
            >
              <Trophy className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/meetings")}
              title="Meetings"
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/messages")}
              title="Messages"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/requests")}
              title="Requests"
            >
              <Inbox className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/admin/projects")}
              title="Projects"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
            <button className="btn-ghost rounded-lg p-2" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6 transition-shadow hover:border-white/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total</span>
                <div className="text-2xl font-bold">{stats?.employees?.total || 0}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Approved</span>
                <span className="text-emerald-300">{stats?.employees?.approved || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Pending</span>
                <span className="text-amber-300">{stats?.employees?.pending || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transition-shadow hover:border-white/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20">
                <FolderOpen className="h-6 w-6 text-indigo-300" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Projects</span>
                <div className="text-2xl font-bold">{stats?.projects?.total || 0}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Active</span>
                <span className="text-blue-300">{stats?.projects?.active || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Completed</span>
                <span className="text-emerald-300">{stats?.projects?.completed || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transition-shadow hover:border-white/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <FileText className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Today's Forms</span>
                <div className="text-2xl font-bold">{stats?.dailyForms?.todaySubmissions || 0}</div>
              </div>
            </div>
            <div className="text-sm text-slate-300">Daily form submissions</div>
          </div>

          <div className="glass-card p-6 transition-shadow hover:border-white/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <Clock className="h-6 w-6 text-purple-300" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Hours Logged</span>
                <div className="text-2xl font-bold">{stats?.totalHoursLogged || 0}h</div>
              </div>
            </div>
            <div className="text-sm text-slate-300">Across all projects</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Employees */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Team Activity
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Recent Employee Logins</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/employees")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {recentData?.employees?.length > 0 ? (
                recentData.employees.map((employee) => (
                  <div key={employee._id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                        <UserCheck className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {employee.name || employee.email}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              employee.status === "approved"
                                ? "bg-emerald-400"
                                : employee.status === "pending"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="capitalize">{employee.status}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {employee.lastLogin
                          ? new Date(employee.lastLogin).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No employees found
                </div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Project Updates
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Latest Projects</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/projects")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {recentData?.projects?.length > 0 ? (
                recentData.projects.map((project) => (
                  <div key={project._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                        <FolderOpen className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {project.projectName}
                        </p>
                        <p className="text-sm text-slate-300 truncate">
                          {project.clientName}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              project.status === "Active"
                                ? "bg-blue-500/20 text-blue-300"
                                : project.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}
                          >
                            {project.status}
                          </span>
                          <span className="text-slate-400">
                            {project.assignees?.length || 0} members
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No projects found
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Communications
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Recent Messages</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/messages")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {recentData?.messages?.length > 0 ? (
                recentData.messages.map((message) => (
                  <div key={message._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                        <MessageCircle className="h-5 w-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {message.subject}
                        </p>
                        <p className="text-sm text-slate-300">
                          From: {message.sender?.name || message.sender?.email || "Unknown"}
                        </p>
                        <div className="text-xs text-slate-400">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No recent messages
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
              Quick Actions
            </p>
            <h3 className="mt-2 text-xl font-semibold">Administrative Tools</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <button
              onClick={() => navigate("/admin/requests")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30">
                <Inbox className="h-6 w-6 text-amber-300" />
              </div>
              <span className="text-sm font-medium text-white">Requests</span>
              {stats?.employees?.pending > 0 && (
                <div className="mt-1 text-xs text-amber-300">
                  {stats.employees.pending} pending
                </div>
              )}
            </button>

            <button
              onClick={() => navigate("/admin/employees")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
              <span className="text-sm font-medium text-white">Employees</span>
              <div className="mt-1 text-xs text-slate-300">
                {stats?.employees?.approved || 0} active
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/projects")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30">
                <FolderOpen className="h-6 w-6 text-indigo-300" />
              </div>
              <span className="text-sm font-medium text-white">Projects</span>
              <div className="mt-1 text-xs text-slate-300">
                {stats?.projects?.active || 0} active
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/messages")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30">
                <MessageCircle className="h-6 w-6 text-purple-300" />
              </div>
              <span className="text-sm font-medium text-white">Messages</span>
            </button>

            <button
              onClick={() => navigate("/admin/leaderboard")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30">
                <Trophy className="h-6 w-6 text-emerald-300" />
              </div>
              <span className="text-sm font-medium text-white">Leaderboard</span>
            </button>

            <button
              onClick={() => navigate("/admin/meetings")}
              className="glass-card group p-4 text-center transition-all hover:scale-105"
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30">
                <Video className="h-6 w-6 text-rose-300" />
              </div>
              <span className="text-sm font-medium text-white">Meetings</span>
            </button>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}