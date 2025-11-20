import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LogOut,
  FilePlus2,
  NotebookPen,
  Calendar,
  Loader2,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
      <div className="glass-panel relative w-full max-w-2xl rounded-[32px] px-8 py-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}

export default function EmployeeProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeRole, setEmployeeRole] = useState(null);

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
    // Fetch current user to determine role
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
      });

    fetch("/api/projects", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const proj = (data.projects || []).find((x) => x._id === id);
        if (proj) {
          setProject(proj);
          setCompletionPercentage(proj.completionPercentage || 0);
        }
      });

    fetch(`/api/progress/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setProgressHistory([]);
          return null;
        }
        return res.json();
      })
      .then((data) => data && setProgressHistory(data?.progress || []));
  }, [id]);

  // Determine employee role when both user and project are loaded
  useEffect(() => {
    if (currentUser && currentUser._id && project) {
      const userId = currentUser._id;
      if (project.leadAssignee && (
        (typeof project.leadAssignee === 'object' && project.leadAssignee._id === userId) ||
        project.leadAssignee.toString() === userId ||
        project.leadAssignee === userId
      )) {
        setEmployeeRole("Lead Assignee");
      } else if (project.assignees && project.assignees.some(assignee => {
        if (typeof assignee === 'object') {
          return assignee._id === userId || assignee.toString() === userId;
        }
        return assignee === userId || assignee.toString() === userId;
      })) {
        setEmployeeRole("Assignee");
      } else {
        setEmployeeRole(null);
      }
    }
  }, [currentUser, project]);

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const resp = await fetch(`/api/progress/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        text: reportText,
        completionPercentage: completionPercentage 
      }),
    });
    setSubmitting(false);

    if (resp.ok) {
      setReportText("");
      setShowReport(false);
      // Refresh project to get updated completion percentage
      fetch("/api/projects", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          const proj = (data.projects || []).find((x) => x._id === id);
          if (proj) {
            setProject(proj);
            setCompletionPercentage(proj.completionPercentage || 0);
          }
        });
      fetch(`/api/progress/${id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setProgressHistory(data?.progress || []));
    } else {
      const errMsg = await resp.json();
      console.error("Submit failed:", resp.status, errMsg);
    }
  };

  if (!project) {
    return (
      <PageBackground variant="emerald">
        <div className="flex min-h-screen items-center justify-center text-white">
          Loading project...
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground variant="emerald">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 pb-20 pt-10 text-white">
        <header className="glass-panel flex flex-col gap-6 rounded-[32px] px-7 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-emerald-200/80">
              Project progress
            </p>
            <h1 className="mt-2 text-3xl font-bold">{project.projectName}</h1>
            <p className="text-sm text-slate-200">{project.clientName}</p>
            {employeeRole && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {employeeRole}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
              onClick={() => setShowReport(true)}
            >
              <FilePlus2 className="mr-2 h-4 w-4" />
              Add report
            </button>
            <button className="btn-ghost" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-8 text-slate-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 px-4 py-2">
              <NotebookPen className="h-4 w-4" />
              {project.status}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
              <Calendar className="h-4 w-4" />
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : "No start"}{" "}
              →{" "}
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString()
                : "No end"}
            </span>
          </div>
          <p className="mt-4 text-base text-slate-100">{project.description}</p>
          
          {/* Completion Percentage Display */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Project Completion</span>
              <span className="text-lg font-bold text-emerald-300">
                {project.completionPercentage || 0}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${project.completionPercentage || 0}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-400">
                Activity
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Progress History
              </h2>
            </div>
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
              {progressHistory.length} updates
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {!progressHistory.length && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-6 py-8 text-center text-slate-200">
                No reports yet. Add your first update today.
              </div>
            )}
            {progressHistory.map((progress) => (
              <div
                key={progress._id}
                className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/5 px-6 py-5 text-slate-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-base font-semibold text-white">
                    {progress.employee?.name || "You"}
                  </div>
                  <div className="text-sm text-slate-300">
                    {new Date(progress.date).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-200">{progress.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showReport && (
        <Modal onClose={() => setShowReport(false)}>
          <h2 className="text-2xl font-semibold text-white">Add today's work</h2>
          <p className="mt-1 text-sm text-slate-300">
            Share highlights, blockers, or new learning.
          </p>
          <form onSubmit={submitReport} className="mt-6 space-y-6">
            {/* Completion Percentage Slider */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  Work Completion Percentage
                </label>
                <span className="text-lg font-bold text-emerald-300">
                  {completionPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-500"
                style={{
                  background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${completionPercentage}%, rgba(255, 255, 255, 0.1) ${completionPercentage}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <textarea
              rows={6}
              value={reportText}
              required
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe today's progress..."
              className="input-field resize-none bg-white/10"
            />
            <button
              type="submit"
              className="btn-primary w-full justify-center bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save progress"
              )}
            </button>
          </form>
        </Modal>
      )}
    </PageBackground>
  );
}
