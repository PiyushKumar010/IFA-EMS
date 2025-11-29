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
  const [dailyForms, setDailyForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCustomFormModal, setShowCustomFormModal] = useState(false);
  const [newCustomTask, setNewCustomTask] = useState("");
  const [saving, setSaving] = useState(false);
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

      // Fetch daily forms
      const formsRes = await fetch(`/api/daily-forms/employee/${id}`, {
        credentials: "include",
      });
      if (formsRes.ok) {
        const formsData = await formsRes.json();
        setDailyForms(formsData.forms || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = (taskIndex, checked) => {
    setSelectedForm((prev) => {
      const updated = { ...prev };
      updated.tasks[taskIndex].adminChecked = checked;
      updated.tasks[taskIndex].isCompleted =
        updated.tasks[taskIndex].employeeChecked && checked;
      return updated;
    });
  };

  const handleCustomTaskChange = (taskIndex, checked) => {
    setSelectedForm((prev) => {
      const updated = { ...prev };
      updated.customTasks[taskIndex].adminChecked = checked;
      updated.customTasks[taskIndex].isCompleted =
        updated.customTasks[taskIndex].employeeChecked && checked;
      return updated;
    });
  };

  const handleSaveForm = async () => {
    if (!selectedForm) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/daily-forms/${selectedForm._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tasks: selectedForm.tasks,
          customTasks: selectedForm.customTasks,
          hoursAttended: selectedForm.hoursAttended,
          screensharing: selectedForm.screensharing,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedForm(data.form);
        await fetchData();
        alert("Form updated successfully! Score and bonus have been recalculated.");
      } else {
        alert("Failed to update form");
      }
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleViewForm = async (formId) => {
    try {
      const res = await fetch(`/api/daily-forms/${formId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedForm(data.form);
        setShowFormModal(true);
      }
    } catch (err) {
      console.error("Error fetching form:", err);
    }
  };

  const handleCreateCustomForm = async () => {
    if (!newCustomTask.trim()) {
      alert("Please enter a task");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/daily-forms/custom/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customTasks: [
            {
              taskText: newCustomTask,
              employeeChecked: false,
              adminChecked: false,
            },
          ],
        }),
      });

      if (res.ok) {
        setNewCustomTask("");
        setShowCustomFormModal(false);
        await fetchData();
        alert("Custom task added successfully!");
      } else {
        alert("Failed to create custom task");
      }
    } catch (err) {
      console.error("Error creating custom form:", err);
      alert("Failed to create custom task");
    } finally {
      setSaving(false);
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

  // Group tasks by category
  const getTasksByCategory = (tasks) => {
    const grouped = {};
    tasks.forEach((task) => {
      const category = task.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(task);
    });
    return grouped;
  };

  const isFormConfirmed = (form) => {
    if (!form) return false;
    if (form.adminConfirmed === true) return true;
    if (form.adminConfirmed === false) return false;
    // For historical data created before confirmation workflow
    return Boolean(form.score || form.dailyBonus || form.scoreCalculatedAt);
  };

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
                onClick={() => setShowCustomFormModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Custom Task
              </button>
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
                    <th className="text-left p-3 font-semibold text-slate-300">Daily Project Update</th>
                  </tr>
                </thead>
                <tbody>
                  {progressReports
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((report) => (
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
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {report.project?.projectName || "Unknown Project"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {report.project?.clientName || ""}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 max-w-md">
                          <p className="line-clamp-2">{report.text}</p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Daily Forms Section */}
        <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-300" />
              <h2 className="text-xl font-semibold text-white">Daily Forms</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {dailyForms.length}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {dailyForms.length === 0 ? (
              <p className="text-center text-slate-400">No forms submitted yet</p>
            ) : (
              dailyForms.map((form) => {
                const completedTasks =
                  (form.tasks || []).filter((t) => t.isCompleted).length +
                  (form.customTasks || []).filter((t) => t.isCompleted).length;
                const totalTasks =
                  (form.tasks?.length || 0) + (form.customTasks?.length || 0);
                const confirmed = isFormConfirmed(form);
                return (
                  <div
                    key={form._id}
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    onClick={() => handleViewForm(form._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-white">
                            {new Date(form.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {confirmed ? (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                              Confirmed
                            </span>
                          ) : form.submitted ? (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
                              Pending admin review
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-200">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-slate-300">
                          <span>
                            {completedTasks} / {totalTasks} tasks completed
                          </span>
                          <span>•</span>
                          <span>{form.hoursAttended} hours</span>
                          {form.screensharing && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-300">Screensharing</span>
                            </>
                          )}
                          {(confirmed || form.score || form.dailyBonus) && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-300">
                                <TrendingUp className="h-3 w-3" />
                                Score: {form.score || 0}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-emerald-300">
                                <span>₹</span>
                                {form.dailyBonus || 0}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(confirmed || form.score || form.dailyBonus) && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-emerald-300">
                              <span>₹</span>
                              <span className="font-semibold">{form.dailyBonus || 0}</span>
                            </div>
                            <div className="text-xs text-slate-400">Score: {form.score || 0}</div>
                          </div>
                        )}
                        <Edit className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form Edit Modal */}
        {showFormModal && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
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
