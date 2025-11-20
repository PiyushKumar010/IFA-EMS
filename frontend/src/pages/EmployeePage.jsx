import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  FolderOpen,
  UserCircle2,
  LogOut,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  LayoutGrid,
  Trophy,
  Video,
  RefreshCw,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsMeta, setStatsMeta] = useState(null);
  const [statsRange, setStatsRange] = useState("30");
  const [statsLoading, setStatsLoading] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    // Fetch user profile
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        // Redirect to profile completion if not completed and status is approved
        if (
          data &&
          Array.isArray(data.roles) &&
          data.roles.includes("employee") &&
          data.status === "approved" &&
          !data.profileCompleted
        ) {
          navigate("/employee/complete-profile");
        }
      });

    // Fetch projects
    fetch("/api/projects", { credentials: "include" }).then(async (res) => {
      const data = await res.json();
      setProjects(data.projects || []);
    });
  }, [navigate]);

  const fetchStats = React.useCallback(
    async (rangeValue = statsRange) => {
      const params = new URLSearchParams();
      if (rangeValue === "all") {
        params.set("range", "all");
      } else {
        params.set("days", rangeValue);
      }

      setStatsLoading(true);
      try {
        const res = await fetch(`/api/daily-forms/my-stats?${params.toString()}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || null);
          setStatsMeta(data.meta || null);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setStatsLoading(false);
      }
    },
    [statsRange],
  );

  useEffect(() => {
    fetchStats(statsRange);
    const intervalId = setInterval(() => {
      fetchStats(statsRange);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [fetchStats, statsRange]);

  // Create tasks from projects
  const tasks = projects.map((project, idx) => ({
    id: project._id,
    title: project.projectName,
    project: project.clientName,
    priority: project.priority || "medium",
    status: project.status === "Completed" ? "completed" : "in-progress",
    dueDate: project.endDate || new Date().toISOString(),
  }));

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const activeCount = tasks.filter((t) => t.status !== "completed").length;

  const bonusRangeLabel =
    statsMeta?.type === "all" || statsRange === "all"
      ? "All time"
      : `Last ${statsMeta?.days || Number(statsRange) || 30} days`;
  const statsLastUpdated = statsMeta?.lastUpdated
    ? new Date(statsMeta.lastUpdated).toLocaleTimeString()
    : null;

  return (
    <PageBackground variant="emerald">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Top Bar */}
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                Employee workspace
              </p>
              <h1 className="mt-2 text-4xl font-bold">
                Good morning, {user?.name || "Team Member"}!
              </h1>
              <p className="text-sm text-slate-300">
                You have {activeCount} active tasks. Let's get them done!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <UserCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium text-white">
                  {user.name || user.email}
                </span>
              </div>
            )}
            <button
              className="btn-ghost relative rounded-lg p-2"
              onClick={() => navigate("/employee/messages")}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost relative rounded-lg p-2"
              onClick={() => navigate("/employee/daily-form")}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/employee/leaderboard")}
              title="Leaderboard"
            >
              <Trophy className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/employee/meetings")}
              title="Meetings"
            >
              <Video className="h-5 w-5" />
            </button>
            <button className="btn-ghost rounded-lg p-2" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Welcome Section */}
            <div className="glass-panel p-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-white">{activeCount}</div>
                  <div className="text-sm text-slate-300">Active Tasks</div>
                </div>
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-white">{completedCount}</div>
                  <div className="text-sm text-slate-300">Completed</div>
                </div>
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-sm text-slate-300">Projects</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-4 backdrop-blur border border-emerald-500/30">
                  <div className="flex items-center gap-1 text-2xl font-bold text-white">
                    <span className="text-xl">₹</span>
                    {stats ? stats.totalBonus.toLocaleString("en-IN") : "0"}
                  </div>
                  <div className="text-sm text-slate-300">
                    Total Bonus ({bonusRangeLabel})
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="rounded-[32px] border border-white/10 bg-white/5">
              <div className="border-b border-white/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                      Task management
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">My Tasks</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost rounded-lg px-3 py-1 text-sm"
                      onClick={() => {
                        // Filter logic can be added here if needed
                      }}
                    >
                      All
                    </button>
                    <button
                      className="btn-ghost rounded-lg px-3 py-1 text-sm"
                      onClick={() => {
                        // Filter logic can be added here if needed
                      }}
                    >
                      Active
                    </button>
                    <button
                      className="btn-ghost rounded-lg px-3 py-1 text-sm"
                      onClick={() => {
                        // Filter logic can be added here if needed
                      }}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {tasks.length === 0 && (
                  <div className="p-10 text-center text-slate-300">
                    No tasks assigned yet. Check back later.
                  </div>
                )}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer p-6 transition-colors hover:bg-white/5"
                    onClick={() => navigate(`/employee/project/${task.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 ${
                          task.status === "completed"
                            ? "border-emerald-400 bg-emerald-500"
                            : "border-white/30 hover:border-emerald-400"
                        }`}
                      >
                        {task.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`mb-1 font-semibold ${
                            task.status === "completed"
                              ? "text-slate-400 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-4 w-4" />
                            {task.project}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              task.priority === "high" || task.priority === "High"
                                ? "bg-red-500/20 text-red-300"
                                : task.priority === "medium" || task.priority === "Normal"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-slate-500/20 text-slate-300"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <button className="rounded-lg p-2 hover:bg-white/10">
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bonus Stats */}
            {stats && (
              <div className="glass-card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.6em] text-slate-300">Performance</p>
                    <h3 className="text-xl font-bold text-white">Bonus & Score</h3>
                    {statsLastUpdated && (
                      <p className="text-xs text-slate-400">
                        Updated {statsLastUpdated}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={statsRange}
                      onChange={(e) => setStatsRange(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white outline-none"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last 365 days</option>
                      <option value="all">All time</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => fetchStats(statsRange)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
                      title="Refresh stats"
                      disabled={statsLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${statsLoading ? "animate-spin text-emerald-300" : "text-slate-200"}`}
                      />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Total Bonus</span>
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <span>₹</span>
                      {stats.totalBonus.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Total Score</span>
                    <span className="font-semibold text-white">{stats.totalScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Average Score</span>
                    <span className="font-semibold text-white">{stats.averageScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Days Worked</span>
                    <span className="font-semibold text-white">{stats.daysWorked}</span>
                  </div>
                  {stats.pendingApproval > 0 ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                      {stats.pendingApproval} daily form{stats.pendingApproval > 1 ? "s" : ""} are awaiting admin confirmation. Bonus is credited only after approval.
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      All bonuses shown here have been approved by the admin team.
                    </p>
                  )}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => navigate("/employee/leaderboard")}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <p className="mb-2 text-xs uppercase tracking-[0.6em] text-slate-300">This Week</p>
              <h3 className="mb-4 text-xl font-bold text-white">Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Tasks Completed</span>
                  <span className="font-semibold text-white">
                    {completedCount} / {tasks.length}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{
                      width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-300">Projects Active</span>
                  <span className="font-semibold text-white">{projects.length}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageBackground>
  );
}