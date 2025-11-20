import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Award, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [days, setDays] = useState(30);
  const [viewMode, setViewMode] = useState("auto");
  const [leaderboardMeta, setLeaderboardMeta] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDate, days, viewMode]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setLeaderboardMeta(null);
    try {
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append("date", selectedDate);
      } else {
        params.append("days", days.toString());
      }
      params.append("view", viewMode);

      const res = await fetch(`/api/daily-forms/leaderboard?${params.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
         setLeaderboardMeta({
           source: data.summary?.dataSource || "none",
           formsEvaluated: data.summary?.formsEvaluated || 0,
           approvalsUsed: data.summary?.approvalsUsed || 0,
           pendingUsed: data.summary?.pendingUsed || 0,
           dateRange: data.dateRange || null,
         });
      } else {
        console.error("Failed to fetch leaderboard");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-400">#{index + 1}</span>;
  };

  const getRankColor = (index) => {
    if (index === 0) return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
    if (index === 1) return "from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (index === 2) return "from-amber-500/20 to-amber-600/20 border-amber-500/50";
    return "from-white/5 to-white/5 border-white/10";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sourceLabelMap = {
    approved: "Admin-approved data",
    submitted: "Submitted preview",
    historical: "Historical fallback",
    none: "No data",
  };

  const formattedRange = () => {
    if (!leaderboardMeta?.dateRange?.start || !leaderboardMeta?.dateRange?.end) {
      return "—";
    }
    const start = new Date(leaderboardMeta.dateRange.start);
    const end = new Date(leaderboardMeta.dateRange.end);
    return `${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;
  };

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                Employee Leaderboard
              </p>
              <h1 className="mt-2 text-4xl font-bold">Performance Rankings</h1>
              <p className="mt-1 text-sm text-slate-300">
                Top performers based on daily task completion and bonuses
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDays(0);
                  }}
                  className="bg-transparent text-sm text-white outline-none"
                />
              </div>
              {!selectedDate && (
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              )}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="auto">Auto source</option>
                <option value="approved">Approved only</option>
                <option value="submitted">Submitted preview</option>
              </select>
            </div>
          </div>
        </header>

        {leaderboardMeta?.source === "submitted" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              Rankings are based on submitted forms that still await admin approval. Scores may change once approvals are completed.
            </div>
          </div>
        )}

        {leaderboardMeta?.source === "historical" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              Showing historical data because no submissions were found in the selected period. Update the filters to see the latest activity.
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-slate-300">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center text-slate-300">
              <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No approved bonus data for the selected period yet.</p>
              <p className="mt-2 text-sm text-slate-400">
                Leaderboard updates once admins confirm employee daily forms.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.employee?._id || `${entry.employee?.email}-${index}`}
                className={`rounded-[32px] border bg-gradient-to-r p-6 transition-all hover:scale-[1.02] ${getRankColor(
                  index
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {entry.employee.name || entry.employee.email}
                      </h3>
                      <p className="text-sm text-slate-300">{entry.employee.email}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {entry.daysWorked} days worked
                        </span>
                        <span>Avg Score: {entry.averageScore}</span>
                        {entry.hasProvisionalData && (
                          <span className="rounded-full border border-amber-300/50 px-3 py-0.5 text-amber-200">
                            Pending approval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 text-sm text-slate-300">Total Bonus</div>
                    <div className="flex items-center gap-2 text-3xl font-bold text-white">
                      <span className="text-2xl">₹</span>
                      {entry.totalBonus.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Total Score: {entry.totalScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {leaderboardMeta && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Forms Evaluated</p>
              <p className="mt-2 text-3xl font-semibold text-white">{leaderboardMeta.formsEvaluated}</p>
              <p className="mt-2 text-xs text-slate-400">
                Approved: {leaderboardMeta.approvalsUsed} · Pending: {leaderboardMeta.pendingUsed}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Data Source</p>
              <p className="mt-2 text-lg font-semibold text-white">{sourceLabelMap[leaderboardMeta.source] || "Auto"}</p>
              <p className="mt-2 text-xs text-slate-400">
                Mode: {viewMode === "auto" ? "Auto-detect" : viewMode}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Date Range</p>
              <p className="mt-2 text-lg font-semibold text-white">{formattedRange()}</p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">How Scoring Works</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Each completed task (approved by admin) = 1 point</p>
            <p>• Screensharing bonus = +5 points</p>
            <p>• Hours attended bonus: 8+ hours = +10, 6+ = +7, 4+ = +4, 2+ = +2</p>
            <p>• Daily bonus = ₹10 per point (maximum ₹500 per day)</p>
            <p>• Leaderboard updates automatically when admin approves daily forms</p>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

