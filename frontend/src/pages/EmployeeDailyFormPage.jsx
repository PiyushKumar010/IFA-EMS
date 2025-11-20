import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Save, Calendar, FolderOpen, LogIn, LogOut, Timer, Tag } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function EmployeeDailyFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canEdit, setCanEdit] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [midnightRestricted, setMidnightRestricted] = useState(false);

  // Update current time every minute and check editability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Update time remaining if we have the info
      if (timeRemaining && !timeRemaining.expired) {
        const now = new Date();
        const formDate = new Date(form?.date);
        const midnight = new Date(formDate);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        
        const remaining = midnight - now;
        if (remaining <= 0) {
          setCanEdit(false);
          setMidnightRestricted(true);
          setTimeRemaining({ expired: true, message: "Editing period has expired" });
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining({
            expired: false,
            hours,
            minutes,
            message: `${hours}h ${minutes}m remaining to edit today's form`
          });
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [timeRemaining, form]);

  useEffect(() => {
    // Check if form can be submitted
    fetch("/api/daily-forms/can-submit", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCanSubmit(data.canSubmit);
        setAlreadySubmitted(!data.canSubmit);
      });

    // Fetch today's form
    fetch("/api/daily-forms/today", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setForm(data.form);
        setCanEdit(data.canEdit ?? true);
        setTimeRemaining(data.timeRemaining);
        setMidnightRestricted(!data.canEdit && !data.form?.submitted);
        if (data.form?.submitted) {
          setAlreadySubmitted(true);
        }
      })
      .catch((err) => console.error("Error fetching form:", err))
      .finally(() => setLoading(false));

    // Fetch assigned projects
    fetch("/api/projects", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAssignedProjects(data.projects || []);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  const handleTaskChange = (taskIndex, checked) => {
    if (alreadySubmitted || !canEdit || midnightRestricted) return; // Prevent changes if restricted

    setForm((prev) => {
      const updated = { ...prev };
      updated.tasks[taskIndex].employeeChecked = checked;
      return updated;
    });
  };

  const handleCustomTaskChange = (taskIndex, checked) => {
    if (alreadySubmitted || !canEdit || midnightRestricted) return;

    setForm((prev) => {
      const updated = { ...prev };
      updated.customTasks[taskIndex].employeeChecked = checked;
      return updated;
    });
  };

  const handleHoursChange = (e) => {
    if (alreadySubmitted || !canEdit || midnightRestricted) return;
    setForm((prev) => ({
      ...prev,
      hoursAttended: parseFloat(e.target.value) || 0,
    }));
  };

  const handleScreensharingChange = (checked) => {
    if (alreadySubmitted || !canEdit || midnightRestricted) return;
    setForm((prev) => ({
      ...prev,
      screensharing: checked,
    }));
  };

  const handleEntryTime = async () => {
    if (!form?._id || !canEdit || midnightRestricted) return;
    
    try {
      const res = await fetch(`/api/daily-forms/time-tracking/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          entryTime: new Date().toISOString() 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        setCanEdit(data.canEdit ?? true);
        setTimeRemaining(data.timeRemaining);
        alert("Entry time recorded!");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to record entry time");
      }
    } catch (error) {
      console.error("Error recording entry time:", error);
      alert("Network error occurred");
    }
  };

  const handleExitTime = async () => {
    if (!form?._id || !canEdit || midnightRestricted) return;
    
    try {
      const res = await fetch(`/api/daily-forms/time-tracking/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          exitTime: new Date().toISOString() 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        setCanEdit(data.canEdit ?? true);
        setTimeRemaining(data.timeRemaining);
        alert("Exit time recorded!");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to record exit time");
      }
    } catch (error) {
      console.error("Error recording exit time:", error);
      alert("Network error occurred");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not recorded";
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateWorkingHours = () => {
    if (!form?.entryTime || !form?.exitTime) return "N/A";
    const diff = new Date(form.exitTime) - new Date(form.entryTime);
    const hours = Math.max(0, diff / (1000 * 60 * 60));
    return `${hours.toFixed(1)}h`;
  };

  const handleSubmit = async () => {
    if (alreadySubmitted || !canSubmit || !canEdit || midnightRestricted) {
      if (midnightRestricted) {
        alert("Form editing period has expired. You can only edit forms until midnight of the same day.");
      } else {
        alert("Form already submitted for today. You can only submit once per day.");
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/daily-forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tasks: form.tasks,
          customTasks: form.customTasks,
          hoursAttended: form.hoursAttended,
          screensharing: form.screensharing,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        setCanEdit(data.canEdit ?? false);
        setTimeRemaining(data.timeRemaining);
        setAlreadySubmitted(true);
        setCanSubmit(false);
        alert("Form submitted successfully!");
        navigate("/employee");
      } else {
        const error = await res.json();
        alert(error.message || error.error || "Failed to submit form");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit form");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (alreadySubmitted || !canEdit || midnightRestricted) {
      if (midnightRestricted) {
        alert("Form editing period has expired. You can only edit forms until midnight of the same day.");
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/daily-forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tasks: form.tasks,
          customTasks: form.customTasks,
          hoursAttended: form.hoursAttended,
          screensharing: form.screensharing,
        }),
      });

      if (res.ok) {
        alert("Form saved successfully!");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save form");
      }
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageBackground variant="emerald">
        <div className="flex min-h-screen items-center justify-center text-white">
          Loading...
        </div>
      </PageBackground>
    );
  }

  if (!form) {
    return (
      <PageBackground variant="emerald">
        <div className="flex min-h-screen items-center justify-center text-white">
          Error loading form
        </div>
      </PageBackground>
    );
  }

  // Group tasks by category
  const tasksByCategory = {};
  form.tasks.forEach((task) => {
    const category = task.category || "Other";
    if (!tasksByCategory[category]) {
      tasksByCategory[category] = [];
    }
    tasksByCategory[category].push(task);
  });

  return (
    <PageBackground variant="emerald">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/employee")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                Daily Form
              </p>
              <h1 className="mt-2 text-4xl font-bold">Daily Task Checklist</h1>
              <p className="mt-1 text-sm text-slate-300">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {alreadySubmitted && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-4 py-2">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium text-emerald-300">
                  Already Submitted
                </span>
              </div>
            )}
          </div>
        </header>

        {alreadySubmitted && (
          <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/20 p-4">
            <p className="text-sm text-amber-200">
              You have already submitted this form for today. You can only submit once per day.
            </p>
            <p className="mt-2 text-xs text-amber-100">
              Your score and bonus will be calculated once an admin reviews and confirms your checklist.
            </p>
          </div>
        )}

        {!alreadySubmitted && midnightRestricted && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
            <p className="text-sm text-red-200">
              <strong>Editing Period Expired:</strong> Forms can only be edited until midnight of the same day.
            </p>
            <p className="mt-2 text-xs text-red-100">
              This form is now read-only. Contact your admin if you need to make changes.
            </p>
          </div>
        )}

        {!alreadySubmitted && !midnightRestricted && timeRemaining && !timeRemaining.expired && (
          <div className="mb-6 rounded-lg border border-blue-500/50 bg-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">
                  <strong>Time Remaining:</strong> {timeRemaining.message}
                </p>
                <p className="mt-1 text-xs text-blue-100">
                  Form becomes read-only after midnight today.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">
                  {timeRemaining.hours.toString().padStart(2, '0')}:{timeRemaining.minutes.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Time Tracking Section */}
        <div className="mb-8 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Timer className="h-5 w-5 text-blue-400" />
              Time Tracking
            </h2>
            <div className="text-sm text-slate-300">
              Current Time: {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Entry Time */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <LogIn className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="text-sm text-slate-400 mb-1">Entry Time</div>
              <div className="text-lg font-semibold mb-3">
                {formatTime(form.entryTime)}
              </div>
              <button
                onClick={handleEntryTime}
                disabled={alreadySubmitted || form.entryTime || !canEdit || midnightRestricted}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.entryTime ? "Recorded" : "Record Entry"}
              </button>
            </div>

            {/* Working Hours */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-sm text-slate-400 mb-1">Working Hours</div>
              <div className="text-lg font-semibold mb-3">
                {calculateWorkingHours()}
              </div>
              <div className="text-xs text-slate-500">
                Auto-calculated from entry/exit
              </div>
            </div>

            {/* Exit Time */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <LogOut className="h-6 w-6 text-rose-400" />
              </div>
              <div className="text-sm text-slate-400 mb-1">Exit Time</div>
              <div className="text-lg font-semibold mb-3">
                {formatTime(form.exitTime)}
              </div>
              <button
                onClick={handleExitTime}
                disabled={alreadySubmitted || form.exitTime || !form.entryTime || !canEdit || midnightRestricted}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.exitTime ? "Recorded" : "Record Exit"}
              </button>
            </div>
          </div>

          {!form.entryTime && (
            <div className="mt-4 text-center text-sm text-slate-400">
              Record your entry time when you start work today
            </div>
          )}
        </div>

        {/* Assigned Projects Info */}
        {assignedProjects.length > 0 && (
          <div className="mb-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-emerald-300" />
              <h2 className="text-lg font-semibold text-white">Your Assigned Projects</h2>
            </div>
            <div className="space-y-3">
              {assignedProjects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{project.projectName}</h3>
                      <p className="text-sm text-slate-300">{project.clientName}</p>
                    </div>
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="h-4 w-4" />
                        <div className="text-right">
                          {project.startDate && (
                            <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                          )}
                          {project.endDate && (
                            <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Tasks by Category */}
          {Object.entries(tasksByCategory).map(([category, tasks]) => (
            <div
              key={category}
              className="rounded-[32px] border border-white/10 bg-white/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-white">
                {category}
              </h2>
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const globalIndex = form.tasks.findIndex(
                    (t) => t.taskId === task.taskId
                  );
                  return (
                    <label
                      key={task.taskId}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        task.employeeChecked
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      } ${alreadySubmitted || !canEdit || midnightRestricted ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.employeeChecked}
                        onChange={(e) =>
                          handleTaskChange(globalIndex, e.target.checked)
                        }
                        disabled={alreadySubmitted || !canEdit || midnightRestricted}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent"
                      />
                      <span className="flex-1 text-sm text-white">
                        {task.taskText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom Tasks */}
          {form.customTasks && form.customTasks.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Custom Tasks
              </h2>
              <div className="space-y-3">
                {form.customTasks.map((task, idx) => (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      task.employeeChecked
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    } ${alreadySubmitted ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.employeeChecked}
                      onChange={(e) =>
                        handleCustomTaskChange(idx, e.target.checked)
                      }
                      disabled={alreadySubmitted}
                      className="mt-1 h-5 w-5 cursor-pointer rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent"
                    />
                    <span className="flex-1 text-sm text-white">
                      {task.taskText}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  No. of hours attended today
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={form.hoursAttended}
                  onChange={handleHoursChange}
                  disabled={alreadySubmitted}
                  className="input-field w-full"
                  placeholder="Enter hours"
                />
              </div>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  form.screensharing
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                } ${alreadySubmitted ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.screensharing}
                  onChange={(e) => handleScreensharingChange(e.target.checked)}
                  disabled={alreadySubmitted}
                  className="h-5 w-5 cursor-pointer rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent"
                />
                <span className="text-sm text-white">
                  Were you screensharing and working at all times?
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          {!alreadySubmitted && (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !canEdit || midnightRestricted}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !canEdit || midnightRestricted}
                className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}

