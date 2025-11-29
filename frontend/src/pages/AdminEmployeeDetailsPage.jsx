import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserCircle2,
  FolderOpen,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Edit,
  Save,
  Plus,
  X,
  TrendingUp,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminEmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch employee info
      const empRes = await fetch("/api/users/employees", {
        credentials: "include",
      });
      const empData = await empRes.json();
      const foundEmployee = empData.employees?.find((e) => e._id === id);
      setEmployee(foundEmployee);

      // Fetch employee projects
      const projRes = await fetch(`/api/projects/employee/${id}`, {
        credentials: "include",
      });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }

      // Fetch employee progress reports
      const progressRes = await fetch(`/api/progress/employee/${id}`, {
        credentials: "include",
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgressReports(progressData.progress || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          Loading...
        </div>
      </PageBackground>
    );
  }

  if (!employee) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          Employee not found
        </div>
      </PageBackground>
    );
  }



  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/admin/employees")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
                <UserCircle2 className="h-8 w-8 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {employee.name || "Unnamed Employee"}
                </h1>
                <p className="text-slate-300">{employee.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => navigate("/admin/messages")}
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>
        </header>

        {/* Projects & Daily Updates Table */}
        <div className="mb-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-300" />
            <h2 className="text-xl font-semibold text-white">Projects & Daily Updates</h2>
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              {progressReports.length} updates
            </span>
          </div>
          
          {progressReports.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No project updates yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 font-semibold text-slate-300">Date</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Project Name</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Client Name</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Role</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Status</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Priority</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Daily Project Update</th>
                  </tr>
                </thead>
                <tbody>
                  {progressReports
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((report) => {
                      const project = report.project;
                      const isAssignee = project?.assignees?.some(a => a._id === id || a === id);
                      const isLeadAssignee = project?.leadAssignee?._id === id || project?.leadAssignee === id;
                      
                      let role = "";
                      if (isLeadAssignee && isAssignee) {
                        role = "Lead & Team Member";
                      } else if (isLeadAssignee) {
                        role = "Lead Assignee";
                      } else if (isAssignee) {
                        role = "Team Member";
                      } else {
                        role = "Contributor";
                      }
                      
                      return (
                        <tr 
                          key={report._id} 
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3 text-slate-300 whitespace-nowrap">
                            {new Date(report.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-white">
                              {project?.projectName || "Unknown Project"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            {project?.clientName || "-"}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLeadAssignee 
                                ? "bg-purple-500/20 text-purple-300" 
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project?.status === "Active"
                                ? "bg-blue-500/20 text-blue-300"
                                : project?.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}>
                              {project?.status || "New"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project?.priority === "High" || project?.priority === "high"
                                ? "bg-red-500/20 text-red-300"
                                : project?.priority === "Medium" || project?.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                            }`}>
                              {project?.priority || "Normal"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-md">
                            <p className="line-clamp-2">{report.text}</p>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}
            <div className="glass-panel relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] px-8 py-8">
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setSelectedForm(null);
                }}
                className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Daily Form
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    {new Date(selectedForm.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                </div>

                {/* Tasks by Category */}
                {Object.entries(getTasksByCategory(selectedForm.tasks)).map(
                  ([category, tasks]) => (
                    <div
                      key={category}
                      className="rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <h3 className="mb-3 text-lg font-semibold text-white">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {tasks.map((task, idx) => {
                          const globalIndex = selectedForm.tasks.findIndex(
                            (t) => t.taskId === task.taskId
                          );
                          const isCompleted =
                            task.employeeChecked && task.adminChecked;
                          return (
                            <div
                              key={task.taskId}
                              className={`flex items-center gap-3 rounded-lg border p-3 ${
                                isCompleted
                                  ? "border-emerald-500/50 bg-emerald-500/10"
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Emp:</span>
                                <input
                                  type="checkbox"
                                  checked={task.employeeChecked}
                                  disabled
                                  className="h-4 w-4 rounded border-white/30 bg-white/5 text-emerald-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Admin:</span>
                                <input
                                  type="checkbox"
                                  checked={task.adminChecked}
                                  onChange={(e) =>
                                    handleTaskChange(globalIndex, e.target.checked)
                                  }
                                  className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/5 text-indigo-500"
                                />
                              </div>
                              <span className="flex-1 text-sm text-white">
                                {task.taskText}
                              </span>
                              {isCompleted && (
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* Custom Tasks */}
                {selectedForm.customTasks && selectedForm.customTasks.length > 0 && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 text-lg font-semibold text-white">
                      Custom Tasks
                    </h3>
                    <div className="space-y-2">
                      {selectedForm.customTasks.map((task, idx) => {
                        const isCompleted =
                          task.employeeChecked && task.adminChecked;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                              isCompleted
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : "border-white/10 bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Emp:</span>
                              <input
                                type="checkbox"
                                checked={task.employeeChecked}
                                disabled
                                className="h-4 w-4 rounded border-white/30 bg-white/5 text-emerald-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Admin:</span>
                              <input
                                type="checkbox"
                                checked={task.adminChecked}
                                onChange={(e) =>
                                  handleCustomTaskChange(idx, e.target.checked)
                                }
                                className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/5 text-indigo-500"
                              />
                            </div>
                            <span className="flex-1 text-sm text-white">
                              {task.taskText}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Additional Information
                  </h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>Hours Attended: {selectedForm.hoursAttended}</p>
                    <p>
                      Screensharing:{" "}
                      {selectedForm.screensharing ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* Score and Bonus */}
                {isFormConfirmed(selectedForm) || selectedForm.score || selectedForm.dailyBonus ? (
                  <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-600/10 p-4">
                    <h3 className="mb-3 text-lg font-semibold text-white">
                      Performance Score & Bonus
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-300 mb-1">Score</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-emerald-300" />
                          <span className="text-2xl font-bold text-white">
                            {selectedForm.score || 0}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 mb-1">Daily Bonus</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-emerald-300">₹</span>
                          <span className="text-2xl font-bold text-white">
                            {selectedForm.dailyBonus || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      Score and bonus are calculated only after you confirm the employee's checklist. Edit the tasks above and save the form to refresh the score.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                    Once you review the checklist and save, the system will calculate the score and daily bonus for this form.
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    onClick={handleSaveForm}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Task Modal */}
        {showCustomFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
            <div className="glass-panel relative w-full max-w-md rounded-[32px] px-8 py-8">
              <button
                onClick={() => {
                  setShowCustomFormModal(false);
                  setNewCustomTask("");
                }}
                className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Custom Task
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    Add Custom Task
                  </h2>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={newCustomTask}
                    onChange={(e) => setNewCustomTask(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter task description"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    className="btn-ghost flex-1"
                    onClick={() => {
                      setShowCustomFormModal(false);
                      setNewCustomTask("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    onClick={handleCreateCustomForm}
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4" />
                    {saving ? "Adding..." : "Add Task"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}
