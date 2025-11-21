import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminHackathonPage() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await fetch("/api/hackathon/admin/all", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHackathons(data.hackathons || []);
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHackathon = async (id) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) return;

    try {
      const res = await fetch(`/api/hackathon/admin/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        alert("Hackathon deleted successfully!");
        fetchHackathons();
      } else {
        alert("Failed to delete hackathon");
      }
    } catch (error) {
      console.error("Error deleting hackathon:", error);
      alert("Error deleting hackathon");
    }
  };

  const getStatusInfo = (hackathon) => {
    const now = new Date();
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);
    const regDeadline = new Date(hackathon.registrationDeadline);

    if (!hackathon.isPublished) {
      return { status: "Draft", color: "text-gray-400", bg: "bg-gray-500/20", icon: AlertCircle };
    }
    if (now < regDeadline) {
      return { status: "Registration Open", color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle };
    }
    if (now >= regDeadline && now < start) {
      return { status: "Registration Closed", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock };
    }
    if (now >= start && now <= end) {
      return { status: "Ongoing", color: "text-blue-400", bg: "bg-blue-500/20", icon: Clock };
    }
    return { status: "Completed", color: "text-purple-400", bg: "bg-purple-500/20", icon: CheckCircle };
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
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Hackathon Management</h1>
              <p className="mt-2 text-slate-300">
                Create and manage hackathons for your organization
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Hackathon
            </button>
          </div>
        </header>

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No Hackathons Yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first hackathon to get started!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Hackathon
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {hackathons.map((hackathon) => {
              const statusInfo = getStatusInfo(hackathon);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={hackathon._id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{hackathon.title}</h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.status}
                        </div>
                      </div>
                      <p className="text-slate-300 mb-3">{hackathon.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-400" />
                          <span>{hackathon.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-400" />
                          <span>{hackathon.registeredUsers?.length || 0}/{hackathon.maxParticipants}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                          <span>{hackathon.prizes?.length || 0} prizes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/admin/hackathon/${hackathon._id}`)}
                        className="btn-ghost p-2"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingHackathon(hackathon);
                          setShowCreateModal(true);
                        }}
                        className="btn-ghost p-2"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteHackathon(hackathon._id)}
                        className="btn-ghost p-2 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {hackathon.theme && (
                    <div className="text-sm text-slate-400">
                      <strong>Theme:</strong> {hackathon.theme}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateHackathonModal
            hackathon={editingHackathon}
            onClose={() => {
              setShowCreateModal(false);
              setEditingHackathon(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingHackathon(null);
              fetchHackathons();
            }}
          />
        )}
      </div>
    </PageBackground>
  );
}

const CreateHackathonModal = ({ hackathon, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    theme: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    location: "Virtual",
    maxParticipants: 100,
    prizes: [{ position: "1st", amount: "₹50,000", description: "First Prize" }],
    requirements: [""],
    contactInfo: { email: "", phone: "", website: "" }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hackathon) {
      setFormData({
        title: hackathon.title || "",
        description: hackathon.description || "",
        theme: hackathon.theme || "",
        startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : "",
        endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : "",
        registrationDeadline: hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toISOString().slice(0, 16) : "",
        location: hackathon.location || "Virtual",
        maxParticipants: hackathon.maxParticipants || 100,
        prizes: hackathon.prizes || [{ position: "1st", amount: "₹50,000", description: "First Prize" }],
        requirements: hackathon.requirements || [""],
        contactInfo: hackathon.contactInfo || { email: "", phone: "", website: "" }
      });
    }
  }, [hackathon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = hackathon 
        ? `/api/hackathon/admin/${hackathon._id}` 
        : "/api/hackathon/admin/create";
      
      const method = hackathon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(`Hackathon ${hackathon ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(errorData.error || `Failed to ${hackathon ? 'update' : 'create'} hackathon`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error ${hackathon ? 'updating' : 'creating'} hackathon`);
    } finally {
      setSubmitting(false);
    }
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: "", amount: "", description: "" }]
    }));
  };

  const updatePrize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const removePrize = (index) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const updateRequirement = (index, value) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl mx-6 my-8 p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {hackathon ? "Edit Hackathon" : "Create New Hackathon"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                placeholder="IFA Hackathon 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Theme
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                placeholder="AI for Social Good"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              placeholder="Describe the hackathon..."
            />
          </div>

          {/* Dates and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                required
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                placeholder="Virtual / Physical Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 100 }))}
                min="1"
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Prizes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Prizes
              </label>
              <button type="button" onClick={addPrize} className="btn-ghost text-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {formData.prizes.map((prize, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-end">
                  <input
                    type="text"
                    value={prize.position}
                    onChange={(e) => updatePrize(index, "position", e.target.value)}
                    placeholder="1st"
                    className="rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={prize.amount}
                    onChange={(e) => updatePrize(index, "amount", e.target.value)}
                    placeholder="₹50,000"
                    className="rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => updatePrize(index, "description", e.target.value)}
                      placeholder="Description"
                      className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                    />
                    {formData.prizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrize(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Requirements
              </label>
              <button type="button" onClick={addRequirement} className="btn-ghost text-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Requirement..."
                    className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Contact Information
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, email: e.target.value } 
                }))}
                placeholder="contact@company.com"
                className="rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, phone: e.target.value } 
                }))}
                placeholder="+91 XXXXX XXXXX"
                className="rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="url"
                value={formData.contactInfo.website}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, website: e.target.value } 
                }))}
                placeholder="https://company.com"
                className="rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? `${hackathon ? 'Updating...' : 'Creating...'}`
                : `${hackathon ? 'Update' : 'Create'} Hackathon`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};