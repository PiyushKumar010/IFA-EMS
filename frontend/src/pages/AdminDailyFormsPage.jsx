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
import LoadingSpinner from "../components/ui/LoadingSpinner";

const TAG_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6"
];

// Quick Send Modal Component
function QuickSendModal({ templates, employees, onClose, onSend }) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-[32px] px-8 py-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Quick Send Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">Select Template</label>
          <select
            className="input-field w-full"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="" disabled>Select a template...</option>
            {templates.map((tpl) => (
              <option key={tpl._id} value={tpl._id}>{tpl.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">Select Employees</label>
          <div className="max-h-48 overflow-y-auto border rounded bg-white/5 p-2">
            {employees.map((emp) => (
              <label key={emp._id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={() => toggleEmployee(emp._id)}
                />
                <span>{emp.name || emp.email}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            className="btn-primary flex-1"
            disabled={!selectedTemplate || selectedEmployees.length === 0}
            onClick={() => onSend(selectedTemplate, selectedEmployees)}
          >
            Send Template
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDailyFormsPage() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dailyForms, setDailyForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showQuickSendModal, setShowQuickSendModal] = useState(false);
    const [showEditTimeModal, setShowEditTimeModal] = useState(false);
    const [showAddTagModal, setShowAddTagModal] = useState(false);
    const [showDefaultTemplateModal, setShowDefaultTemplateModal] = useState(false);
    const [showTemplateSelectionModal, setShowTemplateSelectionModal] = useState(false);
    const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        description: "",
        roleType: "general",
        tasks: [],
        customTasks: [],
        isDefault: false
    });
    const [newTag, setNewTag] = useState({ name: "", color: TAG_COLORS[0] });
    const [editingNotes, setEditingNotes] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [defaultTemplate, setDefaultTemplate] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Delete template handler
    const handleDeleteTemplate = async (templateId) => {
        try {
            const res = await fetch(`/api/default-form-templates/${templateId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setAvailableTemplates(prev => prev.filter(t => t._id !== templateId));
                alert('Template deleted successfully');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete template');
            }
        } catch (err) {
            alert('Network error while deleting template');
        }
    };

    // Delete daily form handler
    const handleDeleteForm = async (formId) => {
        try {
            const res = await fetch(`/api/daily-forms/${formId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                setDailyForms(prev => prev.filter(f => f._id !== formId));
                setSelectedForm(null);
                alert('Daily form deleted successfully');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete form');
            }
        } catch (err) {
            console.error('Delete form error:', err);
            alert('Network error while deleting form');
        }
    };

    useEffect(() => {
        fetchEmployees();
         // fetchDefaultTemplate(); // Commented out to prevent fetching default template on mount
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

    // const fetchDefaultTemplate = async () => {
    //     // This function is no longer needed as we are not fetching the default template
    // };

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

    const fetchAvailableTemplates = async () => {
        try {
            const res = await fetch("/api/default-form-templates", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setAvailableTemplates(data || []);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const createTemplate = async (templateData = null) => {
        try {
            const dataToSend = templateData || newTemplate;
            console.log("Creating template with data:", dataToSend);
            
            const res = await fetch("/api/default-form-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(dataToSend)
            });
            
            if (res.ok) {
                const createdTemplate = await res.json();
                console.log("Template created successfully:", createdTemplate);
                await fetchAvailableTemplates();
                setShowCreateTemplateModal(false);
                setNewTemplate({
                    name: "",
                    description: "",
                    roleType: "general",
                    tasks: [],
                    customTasks: [],
                    isDefault: false
                });
                alert("Template created successfully!");
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to create template");
            }
        } catch (error) {
            console.error("Error creating template:", error);
            alert("Failed to create template");
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

    const handleTaskToggle = async (taskIndex, field) => {
        if (!selectedForm) return;

        try {
            // Create updated form data
            const updatedForm = { ...selectedForm };
            if (field === 'adminChecked') {
                updatedForm.tasks[taskIndex].adminChecked = !updatedForm.tasks[taskIndex].adminChecked;
            }

            // Update the form on the backend
            const res = await fetch(`/api/daily-forms/${selectedForm._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    tasks: updatedForm.tasks,
                    customTasks: updatedForm.customTasks,
                    hoursAttended: updatedForm.hoursAttended,
                    screensharing: updatedForm.screensharing
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                // Refresh the form list to show updated status
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
            } else {
                alert("Failed to update task");
            }
        } catch (error) {
            console.error("Task toggle error:", error);
            alert("Failed to update task");
        }
    };

    const handleCustomTaskToggle = async (taskIndex, field) => {
        if (!selectedForm) return;

        try {
            // Create updated form data
            const updatedForm = { ...selectedForm };
            if (field === 'adminChecked') {
                updatedForm.customTasks[taskIndex].adminChecked = !updatedForm.customTasks[taskIndex].adminChecked;
            }

            // Update the form on the backend
            const res = await fetch(`/api/daily-forms/${selectedForm._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    tasks: updatedForm.tasks,
                    customTasks: updatedForm.customTasks,
                    hoursAttended: updatedForm.hoursAttended,
                    screensharing: updatedForm.screensharing
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedForm(data.form);
                // Refresh the form list to show updated status
                if (selectedEmployee) {
                    fetchEmployeeForms(selectedEmployee._id);
                }
            } else {
                alert("Failed to update custom task");
            }
        } catch (error) {
            console.error("Custom task toggle error:", error);
            alert("Failed to update custom task");
        }
    };

    const handleFormFieldUpdate = async (field, value) => {
        if (!selectedForm?._id) return;
        
        try {
            const updatedForm = {
                ...selectedForm,
                [field]: value
            };

            const res = await fetch(`/api/daily-forms/${selectedForm._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedForm)
            });

            if (!res.ok) {
                throw new Error("Failed to update form field");
            }

            const result = await res.json();
            
            // Update the selected form
            setSelectedForm(result);
            
            // Update the forms list
            const updatedForms = forms.map(form => 
                form._id === selectedForm._id ? result : form
            );
            setForms(updatedForms);

        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            alert(`Failed to update ${field}`);
        }
    };

    const showTemplateSelection = async (employeeId) => {
        setSelectedEmployee(employees.find(emp => emp._id === employeeId));
        await fetchAvailableTemplates();
        setShowTemplateSelectionModal(true);
    };

    const handleCreateForm = async (employeeId, formData, templateId = null) => {
        try {
          setError("");
          let requestData = {
            employeeId,
            templateId,
            ...formData
          };

          // If a template is selected, include its tasks and customTasks in the request
          if (templateId && selectedTemplate) {
            requestData.tasks = selectedTemplate.tasks || [];
            requestData.customTasks = selectedTemplate.customTasks || [];
          }

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
            setShowTemplateSelectionModal(false);
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
            <div className="admin-viewport text-white">
                {/* Compact Header */}
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
                            <h1 className="text-xl font-bold">Daily Forms</h1>
                            <p className="text-xs text-slate-400">Manage employee daily updates</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                await fetchAvailableTemplates();
                                setShowQuickSendModal(true);
                            }}
                            className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
                        >
                            <Zap className="h-3 w-3" />
                            Quick Send
                        </button>
                        <button
                            onClick={() => setShowCreateTemplateModal(true)}
                            className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"
                        >
                            <Settings className="h-3 w-3" />
                            Templates
                        </button>
                    </div>
                </header>

                {/* Horizontal Scroll Content */}
                <div className="admin-content-area">
                    <div className="horizontal-scroll-container">
                        {/* Employee List */}
                        <div className="compact-section w-64 flex-shrink-0">
                            <div className="compact-card h-full flex flex-col">
                                <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                                    <User className="h-4 w-4" />
                                    Employees
                                </h2>
                                <div className="space-y-1 overflow-y-auto flex-1">
                                    {employees.map((employee) => (
                                        <button
                                            key={employee._id}
                                            onClick={() => handleEmployeeSelect(employee)}
                                            className={`w-full rounded-lg border p-2 text-left transition-all text-xs ${
                                                selectedEmployee?._id === employee._id
                                                    ? "border-indigo-500 bg-indigo-500/20"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            <div className="font-medium truncate">{employee.name || employee.email}</div>
                                            <div className="text-xs text-slate-400 truncate">{employee.email}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Forms List */}
                        <div className="compact-section w-80 flex-shrink-0">
                            {selectedEmployee ? (
                                <div className="compact-card h-full flex flex-col">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h2 className="flex items-center gap-1 text-sm font-semibold">
                                            <FileText className="h-4 w-4" />
                                            Daily Forms
                                        </h2>
                                        <button
                                            onClick={() => showTemplateSelection(selectedEmployee._id)}
                                            className="btn-primary flex items-center gap-1 px-2 py-1 text-xs"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Create
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="py-4 text-center text-xs text-slate-400"><LoadingSpinner /></div>
                                    ) : dailyForms.length === 0 ? (
                                        <div className="py-4 text-center text-xs text-slate-400">
                                            No forms found
                                        </div>
                                    ) : (
                                        <div className="space-y-1 overflow-y-auto flex-1">
                                            {dailyForms.map((form) => (
                                                <button
                                                    key={form._id}
                                                    onClick={() => handleFormSelect(form)}
                                                    className={`w-full rounded-lg border p-2 text-left transition-all text-xs ${
                                                        selectedForm?._id === form._id
                                                            ? "border-emerald-500 bg-emerald-500/20"
                                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="font-medium">{formatDate(form.date)}</div>
                                                        <div className="flex items-center gap-1">
                                                            {form.submitted && (
                                                                <span className="text-xs text-emerald-400">✓</span>
                                                            )}
                                                            {form.adminConfirmed && (
                                                                <Check className="h-3 w-3 text-emerald-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {formatTime(form.entryTime)} - {formatTime(form.exitTime)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {calculateWorkingHours(form.entryTime, form.exitTime)}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="compact-card h-full flex flex-col items-center justify-center text-center">
                                    <User className="h-8 w-8 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-400">Select employee</p>
                                </div>
                            )}
                        </div>

                        {/* Form Details */}
                        <div className="compact-section flex-1 min-w-[600px]">
                            {selectedForm ? (
                                <div className="compact-card h-full overflow-y-auto space-y-3">
                                    {/* Form Header */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h2 className="text-sm font-semibold">Form Details</h2>
                                                <p className="text-xs text-slate-400">{formatDate(selectedForm.date)}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleAutoSelect(selectedForm._id)}
                                                    className="btn-primary flex items-center gap-1 px-2 py-1 text-xs"
                                                >
                                                    <Zap className="h-3 w-3" />
                                                    Auto
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this form?')) {
                                                            handleDeleteForm(selectedForm._id);
                                                        }
                                                    }}
                                                    className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 text-xs"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Time Tracking */}
                                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                            <div className="bg-white/5 rounded p-1.5">
                                                <div className="text-xs text-slate-400 mb-0.5">Entry</div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-blue-400" />
                                                    <span className="text-xs">{formatTime(selectedForm.entryTime)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded p-1.5">
                                                <div className="text-xs text-slate-400 mb-0.5">Exit</div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-rose-400" />
                                                    <span className="text-xs">{formatTime(selectedForm.exitTime)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded p-1.5">
                                                <div className="text-xs text-slate-400 mb-0.5">Total</div>
                                                <div className="flex items-center gap-1">
                                                    <Timer className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-xs font-medium">{calculateWorkingHours(selectedForm.entryTime, selectedForm.exitTime)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowEditTimeModal(true)}
                                            className="btn-ghost flex items-center gap-1 px-2 py-1 text-xs w-full"
                                        >
                                            <Edit3 className="h-3 w-3" />
                                            Edit Time
                                        </button>
                                    </div>

                                    {/* Admin Editable Fields */}
                                    <div className="border-t border-white/10 pt-2">
                                        <h3 className="text-xs font-semibold mb-2">Admin Fields</h3>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Hours Attended</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    step="0.5"
                                                    value={selectedForm.hoursAttended || 0}
                                                    onChange={(e) => handleFormFieldUpdate('hoursAttended', parseFloat(e.target.value) || 0)}
                                                    className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Screensharing</label>
                                                <div 
                                                    className="flex items-center gap-1 cursor-pointer hover:bg-white/10 rounded p-1 transition-colors"
                                                    onClick={() => handleFormFieldUpdate('screensharing', !selectedForm.screensharing)}
                                                >
                                                    {selectedForm.screensharing ? (
                                                        <CheckSquare className="h-3 w-3 text-emerald-400" />
                                                    ) : (
                                                        <Square className="h-3 w-3 text-slate-400" />
                                                    )}
                                                    <span className="text-xs">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks */}
                                    <div className="border-t border-white/10 pt-2">
                                        <h3 className="mb-1.5 text-xs font-semibold">Standard Tasks</h3>
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {selectedForm.tasks?.map((task, index) => (
                                                <div key={task.taskId || index} className="flex items-center gap-2 rounded-lg bg-white/5 p-1.5 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        {task.employeeChecked ? (
                                                            <CheckSquare className="h-3 w-3 text-blue-400" />
                                                        ) : (
                                                            <Square className="h-3 w-3 text-slate-400" />
                                                        )}
                                                        <span className="text-xs text-blue-300">E</span>
                                                    </div>
                                                    <div 
                                                        className="flex items-center gap-1 cursor-pointer hover:bg-white/10 rounded p-0.5 transition-colors"
                                                        onClick={() => handleTaskToggle(index, 'adminChecked')}
                                                    >
                                                        {task.adminChecked ? (
                                                            <CheckSquare className="h-3 w-3 text-emerald-400" />
                                                        ) : (
                                                            <Square className="h-3 w-3 text-slate-400" />
                                                        )}
                                                        <span className="text-xs text-emerald-300">A</span>
                                                    </div>
                                                    <div className="flex-1 text-xs">
                                                        <span className={task.isCompleted ? "text-emerald-300" : "text-slate-300"}>
                                                            {task.taskText}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Tasks */}
                                    {selectedForm.customTasks && selectedForm.customTasks.length > 0 && (
                                        <div className="border-t border-white/10 pt-2">
                                            <h3 className="mb-1.5 text-xs font-semibold">Custom Tasks</h3>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {selectedForm.customTasks.map((task, index) => (
                                                    <div key={index} className="flex items-center gap-2 rounded-lg bg-white/5 p-1.5 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            {task.employeeChecked ? (
                                                                <CheckSquare className="h-3 w-3 text-blue-400" />
                                                            ) : (
                                                                <Square className="h-3 w-3 text-slate-400" />
                                                            )}
                                                            <span className="text-xs text-blue-300">E</span>
                                                        </div>
                                                        <div 
                                                            className="flex items-center gap-1 cursor-pointer hover:bg-white/10 rounded p-0.5 transition-colors"
                                                            onClick={() => handleCustomTaskToggle(index, 'adminChecked')}
                                                        >
                                                            {task.adminChecked ? (
                                                                <CheckSquare className="h-3 w-3 text-emerald-400" />
                                                            ) : (
                                                                <Square className="h-3 w-3 text-slate-400" />
                                                            )}
                                                            <span className="text-xs text-emerald-300">A</span>
                                                        </div>
                                                        <div className="flex-1 text-xs">
                                                            <span className={task.isCompleted ? "text-emerald-300" : "text-slate-300"}>
                                                                {task.taskText}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Form Approval */}
                                    <div className="border-t border-white/10 pt-2">
                                        <h3 className="text-xs font-semibold mb-1.5">Form Approval</h3>
                                        
                                        {/* Approval Status */}
                                        <div className={`mb-2 rounded-lg border p-2 text-xs ${
                                            selectedForm.adminConfirmed 
                                                ? "border-emerald-500/50 bg-emerald-500/10" 
                                                : "border-amber-500/50 bg-amber-500/10"
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {selectedForm.adminConfirmed ? (
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                                                            <Clock className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className={`font-medium text-xs ${
                                                            selectedForm.adminConfirmed ? "text-emerald-200" : "text-amber-200"
                                                        }`}>
                                                            {selectedForm.adminConfirmed ? "Approved" : "Pending"}
                                                        </p>
                                                        {selectedForm.adminConfirmedAt && (
                                                            <p className="text-xs text-slate-400">
                                                                {new Date(selectedForm.adminConfirmedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-300">Bonus</p>
                                                    <p className={`text-sm font-bold ${
                                                        selectedForm.adminConfirmed ? "text-emerald-400" : "text-amber-400"
                                                    }`}>
                                                        ₹{selectedForm.dailyBonus || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 text-xs">
                                            {!selectedForm.adminConfirmed ? (
                                                <button
                                                    onClick={() => handleApproveForm(selectedForm._id, true)}
                                                    className="btn-primary flex items-center gap-1 px-2 py-1 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <Check className="h-3 w-3" />
                                                    Approve
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApproveForm(selectedForm._id, false)}
                                                    className="btn-ghost flex items-center gap-1 px-2 py-1 text-xs flex-1 text-red-400"
                                                >
                                                    <X className="h-3 w-3" />
                                                    Revoke
                                                </button>
                                            )}
                                            
                                            <div className="text-xs text-slate-400">
                                                Score: <span className="font-medium text-white">{selectedForm.score || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="compact-card h-full flex flex-col items-center justify-center text-center">
                                    <Calendar className="h-8 w-8 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-400">Select a form</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showQuickSendModal && (
                    <QuickSendModal
                        templates={availableTemplates}
                        employees={employees}
                        onClose={() => setShowQuickSendModal(false)}
                        onSend={async (templateId, employeeIds) => {
                            try {
                                const res = await fetch("/api/daily-forms/admin/quick-send", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ templateId, employeeIds })
                                });
                                if (res.ok) {
                                    const result = await res.json();
                                    alert(`Template sent successfully! Created ${result.created} forms.`);
                                    setShowQuickSendModal(false);
                                } else {
                                    const err = await res.json();
                                    alert(err.error || "Failed to send template");
                                }
                            } catch (e) {
                                console.error("Quick send error:", e);
                                alert("Network error");
                            }
                        }}
                    />
                )}

                {showCreateForm && (
                    <CreateFormModal
                      employee={selectedEmployee}
                      // Removed defaultTemplate prop as it's no longer fetched
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

                {/* Removed the modal for default template as it's no longer needed */}
                {showTemplateSelectionModal && (
                    <TemplateSelectionModal
                        employee={selectedEmployee}
                        templates={availableTemplates}
                        onClose={() => setShowTemplateSelectionModal(false)}
                        onSubmit={handleCreateForm}
                        onCreateTemplate={() => {
                            setShowTemplateSelectionModal(false);
                            setShowCreateTemplateModal(true);
                        }}
                        onDeleteTemplate={handleDeleteTemplate}
                    />
                )}

                {showCreateTemplateModal && (
                    <CreateTemplateModal
                        template={newTemplate}
                        onClose={() => setShowCreateTemplateModal(false)}
                        onSubmit={createTemplate}
                        onChange={setNewTemplate}
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

// Template Selection Modal
const TemplateSelectionModal = ({ employee, templates, onClose, onSubmit, onCreateTemplate, onDeleteTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entryTime: "",
    exitTime: "",
    adminNotes: ""
  });

  const handleSubmit = () => {
    if (selectedTemplate) {
      onSubmit(employee._id, formData, selectedTemplate._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Select Form Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 mb-2">Creating form for: <span className="text-white font-medium">{employee?.name}</span></p>
          
          {/* Form Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Entry Time</label>
              <input
                type="time"
                value={formData.entryTime}
                onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Available Templates</h3>
            <button
              onClick={onCreateTemplate}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Create New Template
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                  selectedTemplate?._id === template._id
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{template.name}</h4>
                  <p className="text-sm text-slate-400 truncate">{template.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      {template.roleType}
                    </span>
                    {template.isDefault && (
                      <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {template.tasks?.length || 0} tasks, {template.customTasks?.length || 0} custom
                  </div>
                </div>
                {/* Delete button only for admin-created (not default) templates */}
                {!template.isDefault && onDeleteTemplate && (
                  <button
                    className="ml-4 text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this template?')) {
                        onDeleteTemplate(template._id);
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedTemplate}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Form with Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Template Modal
const CreateTemplateModal = ({ template, onClose, onSubmit, onChange }) => {
  const [tasks, setTasks] = useState(template.tasks || []);
  const [customTasks, setCustomTasks] = useState(template.customTasks || []);
  const [newTask, setNewTask] = useState("");
  const [newCustomTask, setNewCustomTask] = useState("");

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        taskId: `task-${Date.now()}`,
        taskText: newTask.trim(),
        isCompleted: false,
        employeeChecked: false,
        adminChecked: false
      };
      setTasks(prev => [...prev, task]);
      setNewTask("");
    }
  };

  const addCustomTask = () => {
    if (newCustomTask.trim()) {
      const task = {
        taskText: newCustomTask.trim(),
        isCompleted: false,
        employeeChecked: false,
        adminChecked: false
      };
      setCustomTasks(prev => [...prev, task]);
      setNewCustomTask("");
    }
  };

  const removeTask = (index) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const removeCustomTask = (index) => {
    setCustomTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const updatedTemplate = {
      ...template,
      tasks,
      customTasks
    };
    console.log("Submitting template with tasks:", updatedTemplate);
    onSubmit(updatedTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Template Name</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => onChange({ ...template, name: e.target.value })}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                placeholder="Enter template name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={template.description}
                onChange={(e) => onChange({ ...template, description: e.target.value })}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                placeholder="Template description"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Role Type</label>
              <select
                value={template.roleType}
                onChange={(e) => onChange({ ...template, roleType: e.target.value })}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={template.isDefault}
                  onChange={(e) => onChange({ ...template, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Set as default template for this role</span>
              </label>
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Standard Tasks</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  placeholder="Add new task"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <button onClick={addTask} className="btn-primary">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm">{task.taskText}</span>
                    <button onClick={() => removeTask(index)} className="text-red-400 hover:text-red-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Custom Tasks</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCustomTask}
                  onChange={(e) => setNewCustomTask(e.target.value)}
                  className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  placeholder="Add custom task"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                />
                <button onClick={addCustomTask} className="btn-primary">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm">{task.taskText}</span>
                    <button onClick={() => removeCustomTask(index)} className="text-red-400 hover:text-red-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDailyFormsPage;