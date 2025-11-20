import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, LogOut, Globe, Activity, FileText, Clock, MessageCircle, LayoutGrid, Calendar, Video } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
      <div className="glass-panel relative w-full max-w-xl rounded-[32px] px-8 py-8">
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

function ProjectDetailsModal({ project, onClose, progressReports, setProgressReports }) {
  useEffect(() => {
    if (project?._id) {
      fetch(`/api/progress/${project._id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setProgressReports(data?.progress || []))
        .catch((err) => {
          console.error("Error fetching progress:", err);
          setProgressReports([]);
        });
    }
  }, [project?._id, setProgressReports]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel relative w-full max-w-4xl rounded-[32px] px-8 py-8 my-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Close
        </button>
        
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Project</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              {project.projectName}
            </h2>
            <p className="mt-4 text-base text-slate-200">
              {project.description}
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                Client: {project.clientName} • {project.clientEmail}
              </div>
              {(project.startDate || project.endDate) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-300" />
                    <span>
                      {project.startDate
                        ? `Start: ${new Date(project.startDate).toLocaleDateString()}`
                        : "Start: Not set"}
                      {project.startDate && project.endDate ? " • " : ""}
                      {project.endDate
                        ? `End: ${new Date(project.endDate).toLocaleDateString()}`
                        : project.startDate ? " • End: Not set" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-300" />
              <h3 className="text-xl font-semibold text-white">Project Progress</h3>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Completion</span>
              <span className="text-2xl font-bold text-cyan-300">
                {project.completionPercentage || 0}%
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-white/10">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${project.completionPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Daily Updates */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-300" />
                <h3 className="text-xl font-semibold text-white">Daily Updates</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {progressReports.length} updates
              </span>
            </div>
            <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
              {progressReports.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  No updates available yet. Check back later for progress reports.
                </p>
              ) : (
                progressReports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {report.employee?.name || "Team Member"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{report.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [progressReports, setProgressReports] = useState([]);
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const resp = await fetch("/api/projects", {
        credentials: "include",
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          alert("Unauthorized! Please login again.");
          navigate("/");
        }
        return;
      }
      const data = await resp.json();
      if (Array.isArray(data.projects)) setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert("End date cannot be earlier than start date.");
        return;
      }
    }

    const payload = {
      ...formData,
    };
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;

    const resp = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (resp.ok) {
      setShowForm(false);
      setFormData({
        projectName: "",
        clientName: "",
        clientEmail: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      fetchProjects();
    } else if (resp.status === 401) {
      alert("Unauthorized! Please login again.");
      navigate("/");
    } else {
      alert("Failed to create project");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  const timeline = projects.slice(0, 6);

  return (
    <PageBackground variant="cyan">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                Client dashboard
              </p>
              <h1 className="mt-2 text-4xl font-bold">Engagement logbook</h1>
              <p className="text-sm text-slate-300">
                Monitor delivery, capture new briefs, and check milestone status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/client/messages")}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              className="btn-ghost rounded-lg p-2"
              onClick={() => navigate("/client/meetings")}
              title="Meetings"
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              className="btn-primary rounded-lg p-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
              onClick={() => setShowForm(true)}
            >
              <PlusCircle className="h-5 w-5" />
            </button>
            <button className="btn-ghost rounded-lg p-2" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="mt-10 space-y-10">
          <div className="rounded-[32px] border border-white/10 bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                  Portfolio pulse
                </p>
                <h2 className="text-2xl font-semibold">Live roadmap</h2>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
                {projects.length} visible
              </span>
            </div>
            <div className="grid gap-0">
              {timeline.length ? (
                timeline.map((project) => (
                  <button
                    key={project._id}
                    className="border-t border-white/5 px-6 py-6 text-left transition hover:bg-white/5"
                    onClick={() => setViewProject(project)}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                          {project.clientName}
                        </p>
                        <h3 className="text-xl font-semibold">{project.projectName}</h3>
                        <p className="text-sm text-slate-200">{project.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-4 py-2">
                          <Globe className="h-4 w-4 text-cyan-200" />
                          {project.status || "Draft"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                          {project.startDate
                            ? new Date(project.startDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-slate-300">
                  No projects yet. Submit a new brief to get started.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.6em] text-slate-300">
              <Activity className="h-5 w-5" />
              Request tracker
            </div>
            <p className="mt-3 text-sm text-slate-200">
              Use this canvas to submit context for upcoming work. We’ll notify you once
              an admin activates the brief.
            </p>
            <button className="btn-ghost mt-4" onClick={() => setShowForm(true)}>
              Draft new brief
            </button>
          </div>
        </section>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 className="text-2xl font-semibold text-white">New Project</h2>
          <p className="text-sm text-slate-300">
            Share the essential context to spin up a squad.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              name="projectName"
              placeholder="Project name"
              value={formData.projectName}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              name="clientName"
              placeholder="Your name"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              name="clientEmail"
              type="email"
              placeholder="Your email"
              value={formData.clientEmail}
              onChange={handleChange}
              required
              className="input-field"
            />
            <textarea
              name="description"
              placeholder="Project description"
              value={formData.description}
              onChange={handleChange}
              required
              className="input-field h-36 resize-none"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.4em] text-slate-400">
                  Start date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.4em] text-slate-400">
                  End date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field"
                  min={formData.startDate || undefined}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary w-full justify-center bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
            >
              Save project
            </button>
          </form>
        </Modal>
      )}

      {viewProject && (
        <ProjectDetailsModal
          project={viewProject}
          onClose={() => {
            setViewProject(null);
            setProgressReports([]);
          }}
          progressReports={progressReports}
          setProgressReports={setProgressReports}
        />
      )}
    </PageBackground>
  );
}
