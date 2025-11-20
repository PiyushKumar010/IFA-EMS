import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Plus,
  X,
  Edit3,
  Save,
  Trash2,
  Zap,
  User,
  FileText,
  Timer,
  Tag,
  Check,
  Settings,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

const TAG_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6"
];

function AdminDailyFormsPage() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dailyForms, setDailyForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditTimeModal, setShowEditTimeModal] = useState(false);
    const [showAddTagModal, setShowAddTagModal] = useState(false);
    const [showDefaultTemplateModal, setShowDefaultTemplateModal] = useState(false);
    const [newTag, setNewTag] = useState({ name: "", color: TAG_COLORS[0] });
    const [editingNotes, setEditingNotes] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [defaultTemplate, setDefaultTemplate] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
        fetchDefaultTemplate();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/users/employees", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchDefaultTemplate = async () => {
        try {
            const res = await fetch("/api/daily-forms/admin/default-template", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setDefaultTemplate(data.template);
            }
        } catch (error) {
            console.error("Error fetching default template:", error);
        }
    };

    const fetchEmployeeForms = async (employeeId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/daily-forms/employee/${employeeId}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setDailyForms(data.forms || []);
            }
        } catch (error) {
            console.error("Error fetching forms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setSelectedForm(null);
        fetchEmployeeForms(employee._id);
    };

    const handleFormSelect = (form) => {
        setSelectedForm(form);
        setAdminNotes(form.adminNotes || "");
        setEditingNotes(false);
    };

    const handleAutoSelect = async (formId) => {
        try {
            const res = await fetch(`/api/daily-forms/admin/auto-select/${formId}`, {
                method: "POST",
                credentials: "include"
            });
            
            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                // Refresh the form list
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                alert("Auto-selected all employee checked items!");
            } else {
                const error = await res.json();
                alert(error.error || "Failed to auto-select");
            }
        } catch (error) {
            console.error("Auto-select error:", error);
            alert("Failed to auto-select items");
        }
    };

    const handleTimeUpdate = async (formId, entryTime, exitTime) => {
        try {
            const res = await fetch(`/api/daily-forms/time-tracking/${formId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ entryTime, exitTime })
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                setShowEditTimeModal(false);
                alert("Time tracking updated!");
            }
        } catch (error) {
            console.error("Time update error:", error);
        }
    };

    const handleAddCustomTag = async (formId) => {
        if (!newTag.name.trim()) return;

        try {
            const res = await fetch(`/api/daily-forms/custom-tag/${formId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newTag)
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                setShowAddTagModal(false);
                setNewTag({ name: "", color: TAG_COLORS[0] });
                alert("Custom tag added!");
            }
        } catch (error) {
            console.error("Add tag error:", error);
        }
    };

    const handleDeleteTag = async (formId, tagId) => {
        if (!confirm("Are you sure you want to delete this tag?")) return;

        try {
            const res = await fetch(`/api/daily-forms/custom-tag/${formId}/${tagId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                alert("Tag deleted!");
            }
        } catch (error) {
            console.error("Delete tag error:", error);
        }
    };

    const handleApproveForm = async (formId, approve) => {
        try {
            const res = await fetch(`/api/daily-forms/approve/${formId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ approve })
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                alert(approve ? "Form approved successfully!" : "Form approval revoked!");
            } else {
                const error = await res.json();
                alert(error.message || "Failed to update approval status");
            }
        } catch (error) {
            console.error("Approve form error:", error);
            alert("Failed to update approval status");
        }
    };

    const handleCreateForm = async (employeeId, formData) => {
        try {
            setError("");
            const requestData = {
                employeeId,
                ...formData
            };
            
            console.log("Creating form with data:", requestData);
            
            const res = await fetch("/api/daily-forms/admin/create-for-employee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(requestData)
            });

            const responseData = await res.json();
            
            if (res.ok) {
                setShowCreateForm(false);
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
                alert("Daily form created for employee!");
            } else {
                console.error("Server error:", responseData);
                setError(responseData.error || "Failed to create form");
                alert(responseData.error || "Failed to create form");
            }
        } catch (error) {
            console.error("Create form error:", error);
            setError("Network error occurred");
            alert("Network error occurred");
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const calculateWorkingHours = (entryTime, exitTime) => {
        if (!entryTime || !exitTime) return "N/A";
        const diff = new Date(exitTime) - new Date(entryTime);
        const hours = Math.max(0, diff / (1000 * 60 * 60));
        return `${hours.toFixed(1)}h`;
    };

    return (
        <PageBackground variant="violet">
            <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6">
                    <div>
                        <button
                            onClick={() => navigate("/admin")}
                            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Overview
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold">Daily Forms Management</h1>
                                <p className="mt-2 text-slate-300">
                                    Manage employee daily update sheets with auto-selection and time tracking
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDefaultTemplateModal(true)}
                                className="btn-ghost flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Default Template
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Employee List */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <User className="h-5 w-5" />
                                Employees
                            </h2>
                            <div className="space-y-2">
                                {employees.map((employee) => (
                                    <button
                                        key={employee._id}
                                        onClick={() => handleEmployeeSelect(employee)}
                                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                                            selectedEmployee?._id === employee._id
                                                ? "border-indigo-500 bg-indigo-500/20"
                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="font-medium">{employee.name || employee.email}</div>
                                        <div className="text-sm text-slate-400">{employee.email}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Forms List */}
                    <div className="lg:col-span-4">
                        {selectedEmployee ? (
                            <div className="glass-card p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                                        <FileText className="h-5 w-5" />
                                        Daily Forms
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="btn-primary flex items-center gap-2 px-3 py-1 text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Form
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="py-8 text-center text-slate-400">Loading forms...</div>
                                ) : dailyForms.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400">
                                        No daily forms found for this employee.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {dailyForms.map((form) => (
                                            <button
                                                key={form._id}
                                                onClick={() => handleFormSelect(form)}
                                                className={`w-full rounded-lg border p-3 text-left transition-all ${
                                                    selectedForm?._id === form._id
                                                        ? "border-emerald-500 bg-emerald-500/20"
                                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">{formatDate(form.date)}</div>
                                                    <div className="flex items-center gap-2">
                                                        {form.submitted && (
                                                            <span className="text-xs text-emerald-400">Submitted</span>
                                                        )}
                                                        {form.adminConfirmed && (
                                                            <Check className="h-4 w-4 text-emerald-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-1 text-sm text-slate-400">
                                                    Entry: {formatTime(form.entryTime)} • Exit: {formatTime(form.exitTime)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Hours: {calculateWorkingHours(form.entryTime, form.exitTime)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-card p-8 text-center">
                                <User className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-4 text-slate-400">Select an employee to view their daily forms</p>
                            </div>
                        )}
                    </div>

                    {/* Form Details */}
                    <div className="lg:col-span-5">
                        {selectedForm ? (
                            <div className="space-y-6">
                                {/* Form Header */}
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold">Daily Form Details</h2>
                                            <p className="text-slate-400">{formatDate(selectedForm.date)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAutoSelect(selectedForm._id)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Auto-Select All
                                        </button>
                                    </div>

                                    {/* Time Tracking */}
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-slate-400">Entry Time</div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-400" />
                                                <span>{formatTime(selectedForm.entryTime)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Exit Time</div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-rose-400" />
                                                <span>{formatTime(selectedForm.exitTime)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-sm text-slate-400">Total Working Hours</div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-emerald-400" />
                                            <span className="font-medium">{calculateWorkingHours(selectedForm.entryTime, selectedForm.exitTime)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowEditTimeModal(true)}
                                        className="mt-4 btn-ghost flex items-center gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit Time
                                    </button>
                                </div>

                                {/* Tasks */}
                                <div className="glass-card p-6">
                                    <h3 className="mb-4 text-lg font-semibold">Standard Tasks</h3>
                                    <div className="space-y-2">
                                        {selectedForm.tasks?.map((task, index) => (
                                            <div key={task.taskId || index} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                                                <div className="flex items-center gap-2">
                                                    {task.employeeChecked ? (
                                                        <CheckSquare className="h-4 w-4 text-blue-400" />
                                                    ) : (
                                                        <Square className="h-4 w-4 text-slate-400" />
                                                    )}
                                                    <span className="text-xs text-blue-300">Emp</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {task.adminChecked ? (
                                                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <Square className="h-4 w-4 text-slate-400" />
                                                    )}
                                                    <span className="text-xs text-emerald-300">Admin</span>
                                                </div>
                                                <div className="flex-1">
                                                    <span className={task.isCompleted ? "text-emerald-300" : "text-slate-300"}>
                                                        {task.taskText}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Approval */}
                                <div className="glass-card p-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-4">Form Approval</h3>
                                        
                                        {/* Approval Status */}
                                        <div className={`mb-4 rounded-lg border p-4 ${
                                            selectedForm.adminConfirmed 
                                                ? "border-emerald-500/50 bg-emerald-500/10" 
                                                : "border-amber-500/50 bg-amber-500/10"
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {selectedForm.adminConfirmed ? (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                                                            <Check className="h-4 w-4 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                                                            <Clock className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className={`font-medium ${
                                                            selectedForm.adminConfirmed ? "text-emerald-200" : "text-amber-200"
                                                        }`}>
                                                            {selectedForm.adminConfirmed ? "Approved" : "Pending Approval"}
                                                        </p>
                                                        {selectedForm.adminConfirmedAt && (
                                                            <p className={`text-xs ${
                                                                selectedForm.adminConfirmed ? "text-emerald-300" : "text-amber-300"
                                                            }`}>
                                                                {selectedForm.adminConfirmed ? "Approved" : "Updated"} on {new Date(selectedForm.adminConfirmedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Bonus Information */}
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-300">Daily Bonus</p>
                                                    <p className={`text-lg font-bold ${
                                                        selectedForm.adminConfirmed ? "text-emerald-400" : "text-amber-400"
                                                    }`}>
                                                        ₹{selectedForm.dailyBonus || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            {!selectedForm.adminConfirmed ? (
                                                <button
                                                    onClick={() => handleApproveForm(selectedForm._id, true)}
                                                    className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Approve & Release Bonus
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApproveForm(selectedForm._id, false)}
                                                    className="btn-ghost flex items-center gap-2 text-red-400 hover:text-red-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Revoke Approval
                                                </button>
                                            )}
                                            
                                            <div className="text-sm text-slate-400">
                                                Score: <span className="font-medium text-white">{selectedForm.score || 0}</span> points
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-8 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-4 text-slate-400">Select a daily form to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {showCreateForm && (
                    <CreateFormModal
                        employee={selectedEmployee}
                        defaultTemplate={defaultTemplate}
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateForm}
                        error={error}
                    />
                )}

                {showEditTimeModal && selectedForm && (
                    <EditTimeModal
                        form={selectedForm}
                        onClose={() => setShowEditTimeModal(false)}
                        onSubmit={handleTimeUpdate}
                    />
                )}

                {showAddTagModal && (
                    <AddTagModal
                        newTag={newTag}
                        setNewTag={setNewTag}
                        tagColors={TAG_COLORS}
                        onClose={() => setShowAddTagModal(false)}
                        onSubmit={() => handleAddCustomTag(selectedForm._id)}
                    />
                )}

                {showDefaultTemplateModal && (
                    <DefaultTemplateModal
                        template={defaultTemplate}
                        onClose={() => setShowDefaultTemplateModal(false)}
                        onUpdate={fetchDefaultTemplate}
                    />
                )}
            </div>
        </PageBackground>
    );
}

// Modal Components
const CreateFormModal = ({ employee, defaultTemplate, onClose, onSubmit, error }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entryTime: "",
    exitTime: "",
    adminNotes: "",
    customTasks: [],
    customTags: []
  });
  const [newCustomTask, setNewCustomTask] = useState("");
  const [newCustomTag, setNewCustomTag] = useState({ name: "", color: TAG_COLORS[0] });

  const addCustomTask = () => {
    if (newCustomTask.trim()) {
      setFormData(prev => ({
        ...prev,
        customTasks: [...prev.customTasks, { taskText: newCustomTask.trim() }]
      }));
      setNewCustomTask("");
    }
  };

  const removeCustomTask = (index) => {
    setFormData(prev => ({
      ...prev,
      customTasks: prev.customTasks.filter((_, i) => i !== index)
    }));
  };

  const addCustomTag = () => {
    if (newCustomTag.name.trim()) {
      setFormData(prev => ({
        ...prev,
        customTags: [...prev.customTags, { ...newCustomTag }]
      }));
      setNewCustomTag({ name: "", color: TAG_COLORS[0] });
    }
  };

  const removeCustomTag = (index) => {
    setFormData(prev => ({
      ...prev,
      customTags: prev.customTags.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-[32px] px-8 py-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Daily Form</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Employee</label>
            <div className="input-field bg-white/5 text-slate-400">
              {employee?.name || employee?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Entry Time</label>
              <input
                type="time"
                value={formData.entryTime}
                onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Exit Time</label>
              <input
                type="time"
                value={formData.exitTime}
                onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Custom Tasks Section */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Custom Tasks (Optional)</label>
            <div className="space-y-2">
              {formData.customTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded">
                  <span className="flex-1">{task.taskText}</span>
                  <button 
                    onClick={() => removeCustomTask(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomTask}
                  onChange={(e) => setNewCustomTask(e.target.value)}
                  placeholder="Add custom task..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                />
                <button 
                  onClick={addCustomTask}
                  className="btn-ghost px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Tags Section */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Custom Tags (Optional)</label>
            <div className="space-y-2">
              {formData.customTags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded">
                  <div 
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  <button 
                    onClick={() => removeCustomTag(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomTag.name}
                  onChange={(e) => setNewCustomTag(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Add custom tag..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                />
                <select
                  value={newCustomTag.color}
                  onChange={(e) => setNewCustomTag(prev => ({ ...prev, color: e.target.value }))}
                  className="input-field w-20"
                >
                  {TAG_COLORS.map((color) => (
                    <option key={color} value={color} style={{ backgroundColor: color }}>
                      ●
                    </option>
                  ))}
                </select>
                <button 
                  onClick={addCustomTag}
                  className="btn-ghost px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Admin Notes</label>
            <textarea
              value={formData.adminNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              className="input-field w-full h-20 resize-none"
              placeholder="Optional admin notes..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button 
            onClick={() => onSubmit(employee._id, formData)}
            className="btn-primary flex-1"
          >
            Create Form
          </button>
        </div>
      </div>
    </div>
  );
};

// Default Template Modal
const DefaultTemplateModal = ({ template, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-[32px] px-8 py-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Default Form Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {template ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Standard Tasks ({template.standardTasks?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {template.standardTasks?.map((task, index) => (
                  <div key={index} className="bg-white/5 p-3 rounded border border-white/10">
                    <div className="font-medium text-sm">{task.taskText}</div>
                    <div className="text-xs text-slate-400 mt-1">{task.category}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold mb-2">Template Settings</h3>
              <div className="bg-white/5 p-4 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Entry Time Required: <span className="text-emerald-400">✓ Yes</span></div>
                  <div>Exit Time Required: <span className="text-emerald-400">✓ Yes</span></div>
                  <div>Custom Tasks: <span className="text-emerald-400">✓ Allowed</span></div>
                  <div>Custom Tags: <span className="text-emerald-400">✓ Allowed</span></div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="font-medium text-blue-200 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>• When you create a form for an employee, they get all standard tasks</li>
                <li>• If no custom form is created, employees get the default template automatically</li>
                <li>• You can add custom tasks and tags when creating forms</li>
                <li>• Employees can see and complete tasks assigned by admin</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400">Loading template...</div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const EditTimeModal = ({ form, onClose, onSubmit }) => {
  const [entryTime, setEntryTime] = useState(
    form.entryTime ? new Date(form.entryTime).toTimeString().slice(0, 5) : ""
  );
  const [exitTime, setExitTime] = useState(
    form.exitTime ? new Date(form.exitTime).toTimeString().slice(0, 5) : ""
  );

  const handleSubmit = () => {
    const today = new Date(form.date).toISOString().split('T')[0];
    const entryDateTime = entryTime ? new Date(`${today}T${entryTime}`).toISOString() : null;
    const exitDateTime = exitTime ? new Date(`${today}T${exitTime}`).toISOString() : null;
    
    onSubmit(form._id, entryDateTime, exitDateTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[32px] px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Time Tracking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Entry Time</label>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Exit Time</label>
            <input
              type="time"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            Update Time
          </button>
        </div>
      </div>
    </div>
  );
};

const AddTagModal = ({ newTag, setNewTag, tagColors, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[32px] px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Custom Tag</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Tag Name</label>
            <input
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter tag name..."
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {tagColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTag(prev => ({ ...prev, color }))}
                  className={`h-8 w-8 rounded-full border-2 ${
                    newTag.color === color ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button 
            onClick={onSubmit}
            disabled={!newTag.name.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Add Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDailyFormsPage;