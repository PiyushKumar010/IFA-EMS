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
  Star,
  Monitor,
  Target,
  Zap,
  BookOpen,
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

        {/* Enhanced Key Metrics Grid */}
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
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Rejected</span>
                <span className="text-red-300">{stats?.employees?.rejected || 0}</span>
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
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">New</span>
                <span className="text-amber-300">{stats?.projects?.new || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transition-shadow hover:border-white/20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <FileText className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Daily Forms</span>
                <div className="text-2xl font-bold">{stats?.dailyForms?.todaySubmissions || 0}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">This Week</span>
                <span className="text-blue-300">{stats?.dailyForms?.weeklySubmissions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Avg Score</span>
                <span className="text-emerald-300">
                  {stats?.dailyForms?.productivity?.averageScore ? 
                    Math.round(stats.dailyForms.productivity.averageScore * 10) / 10 : 0}
                </span>
              </div>
            </div>
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">This Week</span>
                <span className="text-purple-300">
                  {stats?.dailyForms?.productivity?.totalHoursAttended || 0}h
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Meetings</span>
                <span className="text-rose-300">{stats?.meetings?.thisWeek || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="glass-card p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                Weekly Productivity
              </p>
              <h3 className="mt-2 text-xl font-semibold">Team Performance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm text-slate-300">Confirmed Forms</span>
                </div>
                <span className="text-emerald-300">
                  {stats?.dailyForms?.productivity?.confirmedForms || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-blue-300" />
                  <span className="text-sm text-slate-300">Screen Sharing</span>
                </div>
                <span className="text-blue-300">
                  {stats?.dailyForms?.productivity?.screensharingForms || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-300" />
                  <span className="text-sm text-slate-300">Total Submissions</span>
                </div>
                <span className="text-purple-300">
                  {stats?.dailyForms?.productivity?.totalFormsSubmitted || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Performance Leaders
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Top Performers This Week</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/leaderboard")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {recentData?.topPerformers?.length > 0 ? (
                recentData.topPerformers.map((performer, idx) => (
                  <div key={performer._id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-sm font-bold text-white">
                        {idx + 1}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                        <Star className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {performer.name || performer.email}
                        </p>
                        <p className="text-sm text-slate-300">
                          {performer.department || 'No Department'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-300">
                          {performer.averageScore} avg
                        </div>
                        <div className="text-xs text-slate-400">
                          {performer.totalHours}h • {performer.formsSubmitted} forms
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No performance data available this week
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Recent Employees */}
          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Team Activity
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Recent Logins</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/employees")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
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
                          {employee.profileCompleted && (
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                          )}
                        </div>
                        {employee.department && (
                          <div className="text-xs text-slate-400">
                            {employee.department} • {employee.designation || 'No designation'}
                          </div>
                        )}
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
            <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
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
                        {project.completionPercentage !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Progress</span>
                              <span>{project.completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${project.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {project.leadAssignee && (
                          <div className="mt-1 text-xs text-slate-400">
                            Lead: {project.leadAssignee.name || project.leadAssignee.email}
                          </div>
                        )}
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

          {/* Daily Updates */}
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Employee Updates
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Recent Daily Forms</h3>
                </div>
                <button
                  onClick={() => navigate("/admin/employees")}
                  className="btn-ghost rounded-lg px-3 py-1 text-sm"
                >
                  View Forms
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
              {recentData?.dailyForms?.length > 0 ? (
                recentData.dailyForms.map((form) => (
                  <div key={form._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                        <FileText className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">
                            {form.employee?.name || form.employee?.email || "Unknown Employee"}
                          </p>
                          {form.adminConfirmed && (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          )}
                          {form.screensharing && (
                            <Monitor className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-300">
                          {form.employee?.department || 'No Department'} • {form.employee?.designation || 'No Role'}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Hours:</span>
                            <span className="text-white">{form.hoursAttended || 0}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Score:</span>
                            <span className={`${form.score >= 8 ? 'text-emerald-300' : form.score >= 6 ? 'text-amber-300' : 'text-red-300'}`}>
                              {form.score || 0}/10
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                          <span>Tasks: {(form.tasks?.length || 0) + (form.customTasks?.length || 0)}</span>
                          <span>Completed: {
                            (form.tasks?.filter(t => t.isCompleted)?.length || 0) + 
                            (form.customTasks?.filter(t => t.isCompleted)?.length || 0)
                          }</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          {new Date(form.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {form.submittedAt ? new Date(form.submittedAt).toLocaleTimeString() : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No daily forms submitted recently
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
            <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
              {recentData?.messages?.length > 0 ? (
                recentData.messages.map((message) => (
                  <div key={message._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                        <MessageCircle className="h-5 w-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">
                            {message.subject}
                          </p>
                          {!message.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">
                          From: {message.sender?.name || message.sender?.email || "Unknown"}
                          {message.sender?.roles?.includes('admin') && (
                            <span className="ml-1 text-xs bg-purple-500/20 text-purple-300 px-1 rounded">Admin</span>
                          )}
                        </p>
                        {message.recipient && (
                          <p className="text-xs text-slate-400">
                            To: {message.recipient.name || message.recipient.email}
                          </p>
                        )}
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
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

          {/* System Health */}
          <div className="glass-card p-6">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                System Overview
              </p>
              <h3 className="mt-2 text-xl font-semibold">Health Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-200">Employee Engagement</p>
                    <p className="text-xs text-emerald-300">
                      {stats?.dailyForms?.todaySubmissions || 0} forms today
                    </p>
                  </div>
                </div>
                <div className="text-emerald-300 font-bold">
                  {stats?.employees?.approved ? 
                    Math.round((stats.dailyForms?.todaySubmissions || 0) / stats.employees.approved * 100) : 0}%
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                    <Activity className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-200">Project Activity</p>
                    <p className="text-xs text-blue-300">
                      {stats?.projects?.active || 0} active projects
                    </p>
                  </div>
                </div>
                <div className="text-blue-300 font-bold">
                  {stats?.projects?.total ? 
                    Math.round((stats.projects?.active || 0) / stats.projects.total * 100) : 0}%
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-200">Pending Approvals</p>
                    <p className="text-xs text-amber-300">
                      Requires attention
                    </p>
                  </div>
                </div>
                <div className="text-amber-300 font-bold">
                  {stats?.employees?.pending || 0}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats?.meetings?.total || 0}</div>
                    <div className="text-slate-400">Total Meetings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats?.meetings?.thisWeek || 0}</div>
                    <div className="text-slate-400">This Week</div>
                  </div>
                </div>
              </div>
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