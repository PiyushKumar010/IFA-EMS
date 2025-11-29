import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminMeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    meetingLink: "",
    description: "",
    meetingType: "other",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    meetingFor: "employees",
    invitedEmployees: [],
    invitedClients: [],
  });
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  const [selectAllClients, setSelectAllClients] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectAllEmployees && employees.length > 0) {
      setFormData((prev) => ({
        ...prev,
        invitedEmployees: employees.map((emp) => emp._id),
      }));
    } else if (!selectAllEmployees) {
      setFormData((prev) => ({
        ...prev,
        invitedEmployees: [],
      }));
    }
  }, [selectAllEmployees, employees]);

  useEffect(() => {
    if (selectAllClients && clients.length > 0) {
      setFormData((prev) => ({
        ...prev,
        invitedClients: clients.map((client) => client._id),
      }));
    } else if (!selectAllClients) {
      setFormData((prev) => ({
        ...prev,
        invitedClients: [],
      }));
    }
  }, [selectAllClients, clients]);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/users/employees", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees?.filter((e) => e.status === "approved") || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/users/clients", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData((prev) => {
      const isSelected = prev.invitedEmployees.includes(employeeId);
      if (isSelected) {
        setSelectAllEmployees(false);
        return {
          ...prev,
          invitedEmployees: prev.invitedEmployees.filter((id) => id !== employeeId),
        };
      } else {
        return {
          ...prev,
          invitedEmployees: [...prev.invitedEmployees, employeeId],
        };
      }
    });
  };

  const handleClientToggle = (clientId) => {
    setFormData((prev) => {
      const isSelected = prev.invitedClients.includes(clientId);
      if (isSelected) {
        setSelectAllClients(false);
        return {
          ...prev,
          invitedClients: prev.invitedClients.filter((id) => id !== clientId),
        };
      } else {
        return {
          ...prev,
          invitedClients: [...prev.invitedClients, clientId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          subject: "",
          meetingLink: "",
          description: "",
          meetingType: "other",
          scheduledDate: "",
          scheduledTime: "",
          duration: 60,
          meetingFor: "employees",
          invitedEmployees: [],
          invitedClients: [],
        });
        setSelectAllEmployees(false);
        setSelectAllClients(false);
        fetchMeetings();
        alert("Meeting created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create meeting");
      }
    } catch (err) {
      console.error("Error creating meeting:", err);
      alert("Failed to create meeting");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchMeetings();
        alert("Meeting deleted successfully!");
      } else {
        alert("Failed to delete meeting");
      }
    } catch (err) {
      console.error("Error deleting meeting:", err);
      alert("Failed to delete meeting");
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case "zoom":
        return "🔷";
      case "google_meet":
        return "🟢";
      case "teams":
        return "🔵";
      default:
        return "📹";
    }
  };

  const getStatusBadge = (status, scheduledDate, scheduledTime) => {
    const now = new Date();
    const meetingDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (status === "cancelled") {
      return (
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">
          Cancelled
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs text-slate-300">
          Completed
        </span>
      );
    }
    if (meetingDateTime < now) {
      return (
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
          Past
        </span>
      );
    }
    return (
      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
        Scheduled
      </span>
    );
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
              <h1 className="text-xl font-bold">Meetings</h1>
              <p className="text-xs text-slate-400">Create and manage meetings</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            <Plus className="h-3 w-3" />
            Create
          </button>
        </header>

        <div className="admin-content-area">
          <div className="h-full overflow-y-auto">
            <div className="space-y-2">
              {meetings.length === 0 ? (
                <div className="compact-card p-8 text-center">
                  <Video className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-xs text-slate-400">No meetings yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary mt-2 px-3 py-1 text-xs"
                  >
                    Create First Meeting
                  </button>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="compact-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-base">
                            {getMeetingTypeIcon(meeting.meetingType)}
                          </span>
                          <h3 className="text-sm font-bold text-white truncate">{meeting.subject}</h3>
                          {getStatusBadge(
                            meeting.status,
                            meeting.scheduledDate,
                            meeting.scheduledTime
                          )}
                        </div>
                        {meeting.description && (
                          <p className="mb-2 text-xs text-slate-400 line-clamp-2">{meeting.description}</p>
                        )}
                        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.scheduledTime} ({meeting.duration}m)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meeting.meetingFor === "employees"
                              ? "Employees"
                              : meeting.meetingFor === "clients"
                              ? "Clients"
                          : "Both"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Join Meeting
                      </a>
                    </div>
                    {(meeting.invitedEmployees?.length > 0 ||
                      meeting.invitedClients?.length > 0) && (
                      <div className="text-xs text-slate-400">
                        {meeting.invitedEmployees?.length > 0 && (
                          <span>
                            {meeting.invitedEmployees.length} employee
                            {meeting.invitedEmployees.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {meeting.invitedEmployees?.length > 0 &&
                          meeting.invitedClients?.length > 0 && <span> • </span>}
                        {meeting.invitedClients?.length > 0 && (
                          <span>
                            {meeting.invitedClients.length} client
                            {meeting.invitedClients.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Meeting Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
            <div className="glass-panel relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] px-8 py-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    subject: "",
                    meetingLink: "",
                    description: "",
                    meetingType: "other",
                    scheduledDate: "",
                    scheduledTime: "",
                    duration: 60,
                    meetingFor: "employees",
                    invitedEmployees: [],
                    invitedClients: [],
                  });
                  setSelectAllEmployees(false);
                  setSelectAllClients(false);
                }}
                className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
                    Create Meeting
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">New Meeting</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Meeting Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field w-full"
                      placeholder="Enter meeting subject"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Meeting Link * (Zoom, Google Meet, Teams, etc.)
                    </label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      required
                      className="input-field w-full"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Meeting Type
                      </label>
                      <select
                        name="meetingType"
                        value={formData.meetingType}
                        onChange={handleChange}
                        className="input-field w-full"
                      >
                        <option value="zoom">Zoom</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Meeting For
                      </label>
                      <select
                        name="meetingFor"
                        value={formData.meetingFor}
                        onChange={handleChange}
                        className="input-field w-full"
                      >
                        <option value="employees">Employees</option>
                        <option value="clients">Clients</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="input-field w-full resize-none"
                      placeholder="Meeting description or agenda..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Scheduled Date *
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        required
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Scheduled Time *
                      </label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        required
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="15"
                        step="15"
                        className="input-field w-full"
                      />
                    </div>
                  </div>

                  {/* Employee Selection */}
                  {(formData.meetingFor === "employees" ||
                    formData.meetingFor === "both") && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">
                          Select Employees
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={selectAllEmployees}
                            onChange={(e) => setSelectAllEmployees(e.target.checked)}
                            className="h-4 w-4 rounded"
                          />
                          Select All
                        </label>
                      </div>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {employees.map((emp) => (
                          <label
                            key={emp._id}
                            className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={formData.invitedEmployees.includes(emp._id)}
                              onChange={() => handleEmployeeToggle(emp._id)}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              {emp.name || emp.email}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Selection */}
                  {(formData.meetingFor === "clients" ||
                    formData.meetingFor === "both") && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">
                          Select Clients
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={selectAllClients}
                            onChange={(e) => setSelectAllClients(e.target.checked)}
                            className="h-4 w-4 rounded"
                          />
                          Select All
                        </label>
                      </div>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {clients.map((client) => (
                          <label
                            key={client._id}
                            className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={formData.invitedClients.includes(client._id)}
                              onChange={() => handleClientToggle(client._id)}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm text-slate-300">
                              {client.name || client.email}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({
                          subject: "",
                          meetingLink: "",
                          description: "",
                          meetingType: "other",
                          scheduledDate: "",
                          scheduledTime: "",
                          duration: 60,
                          meetingFor: "employees",
                          invitedEmployees: [],
                          invitedClients: [],
                        });
                        setSelectAllEmployees(false);
                        setSelectAllClients(false);
                      }}
                      className="btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex-1"
                    >
                      {saving ? "Creating..." : "Create Meeting"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}

