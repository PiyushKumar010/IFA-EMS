import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User, Mail, Phone, FileText, Code, Users, Save } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function HackathonApplicationPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    degree: "",
    graduationYear: "",
    experience: "",
    skills: "",
    projectIdea: "",
    teamStatus: "solo",
    teamMembers: "",
    previousHackathons: "",
    motivation: "",
    githubProfile: "",
    portfolioUrl: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          fullName: data.user?.name || "",
          email: data.user?.email || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/hackathon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Application submitted successfully!");
        navigate("/hackathon");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    try {
      const res = await fetch("/api/hackathon/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
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

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/hackathon")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-bold">Hackathon Application</h1>
            <p className="mt-2 text-slate-300">
              Join the IFA Hackathon - AI for Social Good
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 opacity-60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  University/Organization *
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Academic Background
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Degree/Field of Study *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  required
                  min="2020"
                  max="2030"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-400" />
              Technical Skills & Experience
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Programming Skills *
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="List your programming languages, frameworks, and technologies"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Relevant Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your relevant projects, internships, or work experience"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="githubProfile"
                    value={formData.githubProfile}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project & Team */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              Project & Team Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Idea *
                </label>
                <textarea
                  name="projectIdea"
                  value={formData.projectIdea}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your project idea related to 'AI for Social Good'"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Team Status *
                </label>
                <select
                  name="teamStatus"
                  value={formData.teamStatus}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="solo">Solo participant</option>
                  <option value="team">I have a team</option>
                  <option value="looking">Looking for teammates</option>
                </select>
              </div>
              
              {formData.teamStatus === "team" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team Members
                  </label>
                  <textarea
                    name="teamMembers"
                    value={formData.teamMembers}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="List your team members with their names and roles"
                    className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Previous Hackathons
                </label>
                <textarea
                  name="previousHackathons"
                  value={formData.previousHackathons}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="List any hackathons you've participated in previously"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Why do you want to participate? *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about your motivation and what you hope to achieve"
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={saveDraft}
              className="btn-ghost flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageBackground>
  );
}