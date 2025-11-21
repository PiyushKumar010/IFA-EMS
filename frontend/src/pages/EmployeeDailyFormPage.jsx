import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Save, Calendar, FolderOpen, LogIn, LogOut, Timer, Tag, History } from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);
  const [formHistory, setFormHistory] = useState([]);
  const [selectedHistoryForm, setSelectedHistoryForm] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const createTodaysForm = async () => {
    try {
      const res = await fetch("/api/daily-forms/create-today", {
        method: "POST",
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Create today's form response:", data);
        
        // Refresh the form data
        fetchTodaysForm();
      } else {
        console.error("Failed to create today's form:", res.status);
      }
    } catch (err) {
      console.error("Error creating today's form:", err);
    }
  };

  const saveFormData = async () => {
    if (!form?._id || alreadySubmitted || midnightRestricted || isUpdating) return;
    
    try {
      setIsUpdating(true);
      const res = await fetch("/api/daily-forms/save", {
        method: "PUT",
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
        console.log("Form auto-saved successfully");
        // Don't update form state to prevent checkbox flickering
        // setForm(data.form);
      } else {
        console.error("Failed to auto-save form:", res.status);
      }
    } catch (err) {
      console.error("Error saving form:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update current time every minute and check editability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Always calculate time remaining until end of TODAY
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const remaining = endOfToday - now;
      
      if (remaining <= 0) {
        // If it's past midnight, check if we need to refresh
        setCanEdit(false);
        setMidnightRestricted(true);
        setTimeRemaining({ expired: true, message: "Today's editing period has expired" });
      } else {
        // Calculate hours and minutes remaining in current day
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        // Only update if we haven't already marked it as restricted
        if (!midnightRestricted && form?.date) {
          const formDate = new Date(form.date);
          formDate.setHours(0, 0, 0, 0);
          
          // If form is from today, it's editable
          if (formDate.getTime() === today.getTime()) {
            setCanEdit(true);
            setMidnightRestricted(false);
            setTimeRemaining({
              expired: false,
              hours,
              minutes,
              message: `${hours}h ${minutes}m remaining to edit today's form`
            });
          } else if (formDate.getTime() < today.getTime()) {
            // Form is from a previous day
            setCanEdit(false);
            setMidnightRestricted(true);
            setTimeRemaining({ expired: true, message: "Can only edit today's form" });
          }
        }
      }
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [form, midnightRestricted]);

  // Auto-save form data when it changes
  useEffect(() => {
    if (form && !loading && !alreadySubmitted && !midnightRestricted) {
      const timeoutId = setTimeout(() => {
        saveFormData();
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [form?.tasks, form?.customTasks, form?.hoursAttended, form?.screensharing]);

  useEffect(() => {
    // Check if form can be submitted
    fetch("/api/daily-forms/can-submit", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCanSubmit(data.canSubmit);
        setAlreadySubmitted(!data.canSubmit);
      });

    // Fetch today's form
    fetchTodaysForm();

    // Fetch assigned projects
    fetch("/api/projects", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAssignedProjects(data.projects || []);
      })
      .catch((err) => console.error("Error fetching projects:", err));
    
    // Fetch form history
    fetchFormHistory();
  }, []);

  const fetchTodaysForm = () => {
    fetch("/api/daily-forms/today", { credentials: "include" })
      .then((res) => {
        console.log("Today's form response status:", res.status);
        if (!res.ok) {
          console.error("Today's form fetch failed:", res.status, res.statusText);
          if (res.status === 403) {
            setAuthError("Authentication failed. Please logout and login again as Employee.");
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Today's form data:", data);
        console.log("Form tasks:", data.form?.tasks);
        console.log("Number of tasks:", data.form?.tasks?.length);
        setForm(data.form);
        setAuthError(null); // Clear any auth errors
        
        // Set initial states from server response
        const formCanEdit = data.canEdit ?? true;
        const timeInfo = data.timeRemaining;
        const isToday = data.isToday ?? true;
        
        setCanEdit(formCanEdit);
        setTimeRemaining(timeInfo);
        
        // Use the backend's isToday flag to determine restrictions
        if (!isToday) {
          console.log("Form is not from today, setting midnight restriction");
          setMidnightRestricted(true);
          setCanEdit(false);
        } else {
          console.log("Form is from today, clearing midnight restriction");
          setMidnightRestricted(false);
        }
        
        if (data.form?.submitted) {
          setAlreadySubmitted(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching form:", err);
        if (err.message.includes("403")) {
          setAuthError("Authentication failed. Please logout and login again as Employee.");
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchFormHistory = () => {
    fetch("/api/daily-forms/history?limit=10", { credentials: "include" })
      .then((res) => {
        console.log("Form history response status:", res.status);
        if (!res.ok) {
          console.error("Form history fetch failed:", res.status, res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Form history data:", data);
        setFormHistory(data.forms || []);
      })
      .catch((err) => {
        console.error("Error fetching form history:", err);
        setFormHistory([]);
      });
  };

  const fetchHistoryForm = async (formId) => {
    try {
      const res = await fetch(`/api/daily-forms/view/${formId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSelectedHistoryForm(data.form);
      }
    } catch (err) {
      console.error("Error fetching history form:", err);
    }
  };

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
    if (!form?._id || midnightRestricted) return;
    
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
    if (!form?._id || midnightRestricted) return;
    
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
    if (alreadySubmitted || !canSubmit) {
      alert("Form already submitted for today. You can only submit once per day.");
      return;
    }
    
    if (midnightRestricted) {
      alert("Cannot edit previous day's form. You can only edit today's form.");
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
    if (alreadySubmitted) {
      alert("Form already submitted for today.");
      return;
    }
    
    if (midnightRestricted) {
      alert("Cannot edit previous day's form. You can only edit today's form.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/daily-forms/save", {
        method: "PUT",
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
        setForm(data.form); // Update form with any server-side changes
        alert("Draft saved successfully!");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save draft");
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Failed to save draft");
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
    const category = task.category || "General";
    if (!tasksByCategory[category]) {
      tasksByCategory[category] = [];
    }
    tasksByCategory[category].push(task);
  });

  console.log("Tasks by category:", tasksByCategory);
  console.log("Form tasks:", form.tasks);

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-ghost flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? "Hide History" : "View History"}
              </button>
              <button
                onClick={logout}
                className="btn-ghost flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              {alreadySubmitted && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-4 py-2">
                  <CheckCircle className="h-5 w-5 text-emerald-300" />
                  <span className="text-sm font-medium text-emerald-300">
                    Already Submitted
                  </span>
                </div>
              )}
            </div>
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

        {/* Authentication Error */}
        {authError && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-200">Authentication Error</p>
                <p className="text-sm text-red-300">{authError}</p>
                <p className="mt-1 text-xs text-red-300">
                  This usually happens when your login session has expired or roles have changed.
                </p>
              </div>
              <button
                onClick={logout}
                className="btn-primary bg-red-500 hover:bg-red-600"
              >
                Logout & Re-login
              </button>
            </div>
          </div>
        )}

        {!alreadySubmitted && midnightRestricted && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-200">
                  <strong>Previous Day Form:</strong> You can only edit today's form. Previous day forms are locked.
                </p>
                <p className="mt-2 text-xs text-red-100">
                  Please fill out a new form for today. Contact your admin if you need to modify previous submissions.
                </p>
              </div>
              <button
                onClick={createTodaysForm}
                className="btn-primary bg-blue-500 hover:bg-blue-600"
              >
                Create Today's Form
              </button>
            </div>
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

        {/* Form History Section */}
        {showHistory && (
          <div className="mb-8 glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <History className="h-5 w-5 text-purple-400" />
              Form History
            </h2>
            
            {formHistory.length > 0 ? (
              <div className="space-y-3">
                {formHistory.map((historyForm) => (
                  <button
                    key={historyForm._id}
                    onClick={() => fetchHistoryForm(historyForm._id)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {new Date(historyForm.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Score: {historyForm.score || 0} • Bonus: ₹{historyForm.dailyBonus || 0}
                        </div>
                      </div>
                      <div className="text-sm text-emerald-400">
                        {historyForm.adminConfirmed ? "Confirmed" : "Pending"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No previous forms found.</p>
            )}

            {/* History Form Modal */}
            {selectedHistoryForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
                <div className="glass-panel w-full max-w-2xl rounded-[32px] px-8 py-8 max-h-[90vh] overflow-y-auto">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      Form from {new Date(selectedHistoryForm.date).toLocaleDateString()}
                    </h2>
                    <button 
                      onClick={() => setSelectedHistoryForm(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Show tasks by category */}
                    {(() => {
                      const tasksByCategory = {};
                      selectedHistoryForm.tasks?.forEach((task) => {
                        const category = task.category || "Other";
                        if (!tasksByCategory[category]) {
                          tasksByCategory[category] = [];
                        }
                        tasksByCategory[category].push(task);
                      });
                      
                      return Object.entries(tasksByCategory).map(([category, tasks]) => (
                        <div key={category} className="bg-white/5 p-4 rounded-lg">
                          <h3 className="font-medium mb-3">{category}</h3>
                          <div className="space-y-2">
                            {tasks.map((task, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm">
                                <div className={`w-4 h-4 rounded border ${
                                  task.employeeChecked 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "border-white/30"
                                }`}>
                                  {task.employeeChecked && (
                                    <CheckCircle className="w-3 h-3 text-white m-0.5" />
                                  )}
                                </div>
                                <span className={task.employeeChecked ? "text-emerald-300" : "text-slate-400"}>
                                  {task.taskText}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                    
                    {/* Show custom tasks */}
                    {selectedHistoryForm.customTasks?.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Custom Tasks</h3>
                        <div className="space-y-2">
                          {selectedHistoryForm.customTasks.map((task, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <div className={`w-4 h-4 rounded border ${
                                task.employeeChecked 
                                  ? "bg-emerald-500 border-emerald-500" 
                                  : "border-white/30"
                              }`}>
                                {task.employeeChecked && (
                                  <CheckCircle className="w-3 h-3 text-white m-0.5" />
                                )}
                              </div>
                              <span className={task.employeeChecked ? "text-emerald-300" : "text-slate-400"}>
                                {task.taskText}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show summary and time tracking */}
                    <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Hours Attended: <span className="font-medium">{selectedHistoryForm.hoursAttended || 0}</span></div>
                        <div>Screensharing: <span className="font-medium">{selectedHistoryForm.screensharing ? "Yes" : "No"}</span></div>
                        <div>Score: <span className="font-medium">{selectedHistoryForm.score || 0}</span></div>
                        <div>Bonus: <span className="font-medium">₹{selectedHistoryForm.dailyBonus || 0}</span></div>
                      </div>
                      
                      {(selectedHistoryForm.entryTime || selectedHistoryForm.exitTime) && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="font-medium mb-2">Time Tracking</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {selectedHistoryForm.entryTime && (
                              <div className="flex items-center gap-2">
                                <LogIn className="w-4 h-4 text-green-400" />
                                <span>Entry: {new Date(selectedHistoryForm.entryTime).toLocaleTimeString()}</span>
                              </div>
                            )}
                            {selectedHistoryForm.exitTime && (
                              <div className="flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-red-400" />
                                <span>Exit: {new Date(selectedHistoryForm.exitTime).toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedHistoryForm(null)}
                    className="btn-primary w-full mt-6"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
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
                disabled={alreadySubmitted || form.entryTime || midnightRestricted}
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
                disabled={alreadySubmitted || form.exitTime || !form.entryTime || midnightRestricted}
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
          {Object.keys(tasksByCategory).length === 0 ? (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-slate-400">No tasks assigned for today</p>
            </div>
          ) : (
          Object.entries(tasksByCategory).map(([category, tasks]) => (
            <div
              key={category}
              className="rounded-[32px] border border-white/10 bg-white/5 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-white">
                {category} ({tasks.length} tasks)
              </h2>
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const globalIndex = form.tasks.findIndex(
                    (t) => t.taskId === task.taskId || t._id === task._id
                  );
                  return (
                    <label
                      key={task.taskId || task._id || idx}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        task.employeeChecked
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      } ${alreadySubmitted || midnightRestricted ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.employeeChecked}
                        onChange={(e) =>
                          handleTaskChange(globalIndex >= 0 ? globalIndex : idx, e.target.checked)
                        }
                        disabled={alreadySubmitted || midnightRestricted}
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
          )}

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
                    } ${alreadySubmitted || midnightRestricted ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.employeeChecked}
                      onChange={(e) =>
                        handleCustomTaskChange(idx, e.target.checked)
                      }
                      disabled={alreadySubmitted || midnightRestricted}
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
                  disabled={alreadySubmitted || midnightRestricted}
                  className="input-field w-full"
                  placeholder="Enter hours"
                />
              </div>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  form.screensharing
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                } ${alreadySubmitted || midnightRestricted ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.screensharing}
                  onChange={(e) => handleScreensharingChange(e.target.checked)}
                  disabled={alreadySubmitted || midnightRestricted}
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
                disabled={saving || midnightRestricted}
                className="btn-ghost flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || midnightRestricted}
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

