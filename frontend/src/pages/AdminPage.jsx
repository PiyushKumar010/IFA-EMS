import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  BarChart3,
  FolderOpen,
  LogOut,
  MessageCircle,
  Inbox,
  Trophy,
  Video,
  ArrowLeft,
  FileText,
  ClipboardCheck,
  Code,
} from "lucide-react";
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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    description: "",
  });
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const projs = data.projects || [];
    setProjects(projs);
    setFilteredProjects(projs);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let filtered = [...projects];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => {
        if (filterStatus === "pending") return p.status === "New" || !p.status;
        if (filterStatus === "active") return p.status === "Active";
        if (filterStatus === "completed") return p.status === "Completed";
        return true;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.projectName?.toLowerCase().includes(query) ||
          p.clientName?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, filterStatus, searchQuery]);

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

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
    },
    {
      label: "Team Members",
      value: new Set(
        projects.flatMap((p) =>
          (p.assignees || []).map((a) => a._id || a)
        )
      ).size,
    },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
    },
    {
      label: "In Progress",
      value: projects.filter((p) => p.status === "Active").length,
    },
  ];

  return (
    <PageBackground variant="violet">
      <div className="admin-viewport text-white">
        <header className="admin-header-compact flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold">Projects</h1>
              <p className="text-xs text-slate-400">Manage and track all your projects</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="rounded border border-white/10 bg-black/20 px-2 py-1 pl-7 text-xs focus:border-emerald-400 focus:outline-none w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="btn-ghost flex items-center gap-1 px-2 py-1 text-xs"
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : 'all')}
            >
              <Filter className="h-3 w-3" />
              {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </button>
            <button
              className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
              onClick={() => setShowCreateModal(true)}
            >
              + New Project
            </button>
          </div>
        </header>

        <div className="admin-content-area" style={{position: 'relative'}}>
          {filteredProjects.length > 0 ? (
            <div className="compact-card" style={{height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%'}}>
              <div style={{padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0}}>
                <h2 className="text-sm font-bold text-white">
                  Projects ({filteredProjects.length}) - {stats[2].value} Completed, {stats[3].value} Active
                </h2>
              </div>
              
              <div style={{flex: 1, overflowX: 'scroll', overflowY: 'scroll', position: 'relative', maxWidth: '100%'}}>
                <table className="text-xs text-white" style={{borderCollapse: 'collapse', width: '100%'}}>
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-1 bg-slate-800/80 sticky left-0 z-10" style={{width: '90px'}}>Project</th>
                        <th className="text-left p-1" style={{width: '70px'}}>Client</th>
                        <th className="text-left p-1" style={{width: '110px'}}>Email</th>
                        <th className="text-left p-1" style={{width: '120px'}}>Desc</th>
                        <th className="text-left p-1" style={{width: '55px'}}>Status</th>
                        <th className="text-left p-1" style={{width: '55px'}}>Type</th>
                        <th className="text-left p-1" style={{width: '50px'}}>Prior</th>
                        <th className="text-left p-1" style={{width: '60px'}}>PType</th>
                        <th className="text-left p-1" style={{width: '85px'}}>Team</th>
                        <th className="text-left p-1" style={{width: '70px'}}>Lead</th>
                        <th className="text-left p-1" style={{width: '55px'}}>VA</th>
                        <th className="text-left p-1" style={{width: '70px'}}>Freelan</th>
                        <th className="text-left p-1" style={{width: '70px'}}>Update</th>
                        <th className="text-left p-1" style={{width: '70px'}}>Coders</th>
                        <th className="text-left p-1" style={{width: '65px'}}>Leader</th>
                        <th className="text-left p-1" style={{width: '65px'}}>Start</th>
                        <th className="text-left p-1" style={{width: '65px'}}>End</th>
                        <th className="text-left p-1" style={{width: '40px'}}>Est</th>
                        <th className="text-left p-1" style={{width: '40px'}}>Hrs</th>
                        <th className="text-left p-1" style={{width: '35px'}}>%</th>
                        <th className="text-left p-1" style={{width: '45px'}}>Git</th>
                        <th className="text-left p-1" style={{width: '45px'}}>Loom</th>
                        <th className="text-left p-1" style={{width: '45px'}}>WA</th>
                        <th className="text-left p-1" style={{width: '55px'}}>Date</th>
                        <th className="text-left p-1 sticky right-0 bg-slate-800/80 z-10" style={{width: '80px'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project._id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-1 font-medium bg-slate-800/50 sticky left-0 z-10">
                            <div className="truncate text-xs" title={project.projectName}>
                              {project.projectName || 'Untitled'}
                            </div>
                          </td>
                          <td className="p-1"><div className="truncate text-xs" title={project.clientName}>{project.clientName || '-'}</div></td>
                          <td className="p-1">
                            <div className="truncate text-xs" title={project.clientEmail}>
                              {project.clientEmail || '-'}
                            </div>
                          </td>
                          <td className="p-1">
                            <div className="truncate text-xs" title={project.description}>
                              {project.description || '-'}
                            </div>
                          </td>
                          <td className="p-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              project.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {project.status || 'New'}
                            </span>
                          </td>
                          <td className="p-1">{project.clientType || '-'}</td>
                          <td className="p-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              project.priority === 'High' || project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              project.priority === 'Medium' || project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              project.priority === 'Low' || project.priority === 'low' ? 'bg-green-500/20 text-green-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {project.priority || 'Normal'}
                            </span>
                          </td>
                          <td className="p-1">{project.projectType || '-'}</td>
                          <td className="p-1">
                            <div className="max-w-[150px] truncate" title={project.assignees?.map(a => a.name || a.email).join(', ')}>
                              {project.assignees?.length > 0 ? project.assignees.map(a => a.name || a.email).join(', ') : '-'}
                            </div>
                          </td>
                          <td className="p-1 text-xs">
                            <div className="truncate">{project.leadAssignee?.name || project.leadAssignee?.email || '-'}</div>
                          </td>
                          <td className="p-1 text-xs"><div className="truncate">{project.vaIncharge || '-'}</div></td>
                          <td className="p-1 text-xs"><div className="truncate">{project.freelancer || '-'}</div></td>
                          <td className="p-1 text-xs"><div className="truncate">{project.updateIncharge || '-'}</div></td>
                          <td className="p-1 text-xs">
                            <div className="max-w-[120px] truncate" title={project.codersRecommendation}>
                              {project.codersRecommendation || '-'}
                            </div>
                          </td>
                          <td className="p-1 text-xs"><div className="truncate">{project.leadership || '-'}</div></td>
                          <td className="p-1 text-xs">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '-'}
                          </td>
                          <td className="p-1 text-xs">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '-'}
                          </td>
                          <td className="p-1 text-xs text-center">{project.estimatedHoursRequired || 0}</td>
                          <td className="p-1 text-xs text-center">{project.estimatedHoursTaken || 0}</td>
                          <td className="p-1 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              project.completionPercentage >= 100 ? 'bg-emerald-500/20 text-emerald-400' :
                              project.completionPercentage >= 50 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {project.completionPercentage || 0}%
                            </span>
                          </td>
                          <td className="p-1 text-xs text-center">
                            {project.githubLinks ? (
                              <a href={project.githubLinks} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">•</a>
                            ) : '-'}
                          </td>
                          <td className="p-1 text-xs text-center">
                            {project.loomLink ? (
                              <a href={project.loomLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">•</a>
                            ) : '-'}
                          </td>
                          <td className="p-1 text-xs text-center">
                            {project.whatsappGroupLink ? (
                              <a href={project.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">•</a>
                            ) : '-'}
                          </td>
                          <td className="p-1 text-xs">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '-'}
                          </td>
                          <td className="p-1 sticky right-0 bg-slate-800/50 z-10">
                            <div className="flex items-center gap-0.5">
                              <button
                                className="btn-ghost px-1.5 py-0.5 text-xs"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDetailsModal(true);
                                }}
                              >
                                View
                              </button>
                              <button
                                className="btn-ghost px-1.5 py-0.5 text-xs"
                                onClick={() => navigate(`/admin/project/${project._id}`)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          ) : (
            <div className="compact-card p-6 text-center">
              <FolderOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-slate-300 mb-1">
                {projects.length === 0 ? 'No Projects Yet' : 'No Matches'}
              </h3>
              <p className="text-xs text-slate-400">
                {projects.length === 0 ? 'Create your first project to get started.' : 'No projects match your filters.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <Modal
          onClose={() => {
            if (!creating) setShowCreateModal(false);
          }}
        >
          <h2 className="text-2xl font-semibold text-white">New Project</h2>
          <p className="text-sm text-slate-300">
            Capture the same details clients provide when requesting work.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (creating) return;
              setCreating(true);
              const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newProjectData),
              });
              setCreating(false);
              if (!res.ok) {
                alert("Failed to create project");
                return;
              }
              setNewProjectData({
                projectName: "",
                clientName: "",
                clientEmail: "",
                description: "",
              });
              setShowCreateModal(false);
              fetchProjects();
            }}
          >
            <input
              name="projectName"
              placeholder="Project name"
              value={newProjectData.projectName}
              onChange={(e) =>
                setNewProjectData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              required
              className="input-field"
            />
            <input
              name="clientName"
              placeholder="Client name"
              value={newProjectData.clientName}
              onChange={(e) =>
                setNewProjectData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              required
              className="input-field"
            />
            <input
              name="clientEmail"
              type="email"
              placeholder="Client email"
              value={newProjectData.clientEmail}
              onChange={(e) =>
                setNewProjectData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              required
              className="input-field"
            />
            <textarea
              name="description"
              placeholder="Project description"
              value={newProjectData.description}
              onChange={(e) =>
                setNewProjectData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              required
              className="input-field h-36 resize-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-primary w-full justify-center"
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          </form>
        </Modal>
      )}


      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
          <div className="glass-panel relative w-full max-w-3xl rounded-[32px] px-8 py-8">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedProject(null);
              }}
              className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Close
            </button>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-300">Project Details</p>
                <h2 className="mt-2 text-3xl font-bold text-white">{selectedProject.projectName}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-300">Client Name</p>
                  <p className="mt-1 text-white">{selectedProject.clientName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Client Email</p>
                  <p className="mt-1 text-white">{selectedProject.clientEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Status</p>
                  <p className="mt-1 text-white">{selectedProject.status || "New"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Priority</p>
                  <p className="mt-1 text-white">{selectedProject.priority || "Normal"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Start Date</p>
                  <p className="mt-1 text-white">
                    {selectedProject.startDate
                      ? new Date(selectedProject.startDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">End Date</p>
                  <p className="mt-1 text-white">
                    {selectedProject.endDate
                      ? new Date(selectedProject.endDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Estimated Hours</p>
                  <p className="mt-1 text-white">
                    {selectedProject.estimatedHoursRequired || 0}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Hours Logged</p>
                  <p className="mt-1 text-white">
                    {selectedProject.estimatedHoursTaken || 0}h
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300">Description</p>
                <p className="mt-2 text-white">{selectedProject.description || "No description"}</p>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">Assigned Employees</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.assignees && selectedProject.assignees.length > 0 ? (
                    selectedProject.assignees.map((assignee, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
                      >
                        {assignee.name || assignee.email}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No employees assigned</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="btn-primary flex-1"
                  onClick={() => {
                    setShowDetailsModal(false);
                    navigate(`/admin/project/${selectedProject._id}`);
                  }}
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageBackground>
  );
}