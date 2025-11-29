import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Briefcase, Calendar, Save, X } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function EmployeeProfileCompletionPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    dateOfBirth: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    designation: "",
    department: "",
    joiningDate: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        // Pre-fill form with existing data if available
        if (data) {
          setFormData({
            phoneNumber: data.phoneNumber || "",
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : "",
            streetAddress: data.streetAddress || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            designation: data.designation || "",
            department: data.department || "",
            joiningDate: data.joiningDate
              ? new Date(data.joiningDate).toISOString().split("T")[0]
              : "",
            skills: data.skills || [],
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !formData.phoneNumber ||
      !formData.dateOfBirth ||
      !formData.streetAddress ||
      !formData.city ||
      !formData.state ||
      !formData.pincode ||
      !formData.designation ||
      !formData.department ||
      !formData.joiningDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Profile completed successfully!");
        navigate("/employee");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          <LoadingSpinner />
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground variant="emerald">
      <div className="mx-auto min-h-screen w-full max-w-3xl px-6 pb-20 pt-10 text-white">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
            Complete Your Profile
          </p>
          <h1 className="mt-2 text-4xl font-bold">Welcome to the Team!</h1>
          <p className="mt-1 text-sm text-slate-300">
            Please complete your profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <User className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="input-field w-full cursor-not-allowed opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <MapPin className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-white">Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Street Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{6}"
                    className="input-field w-full"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Briefcase className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Professional Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="e.g., Software Developer"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="e.g., IT"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Joining Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="Enter a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn-primary px-4 py-2"
                  >
                    Add
                  </button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-sm text-emerald-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-emerald-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </PageBackground>
  );
}

