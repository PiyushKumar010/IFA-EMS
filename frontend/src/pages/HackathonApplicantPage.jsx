import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Users,
  FileText,
  Clock,
  Send,
  LogOut,
  CheckCircle,
  AlertCircle,
  Code,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function HackathonApplicantPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchApplication();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchApplication = async () => {
    try {
      const res = await fetch("/api/hackathon/application", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      // Set default application state
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  if (loading) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          <div className="text-center">
            <div className="mb-4 text-2xl font-bold">Loading Dashboard...</div>
          </div>
        </div>
      </PageBackground>
    );
  }

  const applicationStatus = application?.status || "not-started";
  const hackathonInfo = {
    name: "IFA Hackathon",
    date: "December 15-17, 2025",
    location: "Virtual & Physical Hub",
    prizes: ["₹50,000 First Prize", "₹25,000 Second Prize", "₹10,000 Third Prize"],
    theme: "AI for Social Good"
  };

  const statusInfo = {
    "not-started": { 
      text: "Not Applied", 
      color: "text-gray-400", 
      bg: "bg-gray-500/20", 
      icon: AlertCircle 
    },
    "submitted": { 
      text: "Application Submitted", 
      color: "text-blue-400", 
      bg: "bg-blue-500/20", 
      icon: Clock 
    },
    "under-review": { 
      text: "Under Review", 
      color: "text-yellow-400", 
      bg: "bg-yellow-500/20", 
      icon: FileText 
    },
    "accepted": { 
      text: "Accepted", 
      color: "text-green-400", 
      bg: "bg-green-500/20", 
      icon: CheckCircle 
    },
    "rejected": { 
      text: "Not Selected", 
      color: "text-red-400", 
      bg: "bg-red-500/20", 
      icon: AlertCircle 
    }
  };

  const currentStatus = statusInfo[applicationStatus];

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Hackathon Dashboard</h1>
              <p className="mt-2 text-slate-300">
                Welcome, {profile?.name || "Applicant"}! Track your hackathon journey here.
              </p>
            </div>
            <button
              onClick={logout}
              className="btn-ghost flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Application Status Card */}
        <div className="mb-8 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Application Status</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.bg}`}>
              <currentStatus.icon className={`h-4 w-4 ${currentStatus.color}`} />
              <span className={`text-sm font-medium ${currentStatus.color}`}>
                {currentStatus.text}
              </span>
            </div>
          </div>

          {applicationStatus === "not-started" && (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Innovate?</h3>
              <p className="text-slate-300 mb-6">
                Start your hackathon application and join the next generation of innovators.
              </p>
              <button
                onClick={() => navigate("/hackathon/apply")}
                className="btn-primary"
              >
                Start Application
              </button>
            </div>
          )}

          {applicationStatus === "submitted" && (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <p className="text-slate-300">
                Your application has been submitted successfully. We'll review it and get back to you soon!
              </p>
            </div>
          )}

          {applicationStatus === "under-review" && (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-slate-300">
                Our team is currently reviewing your application. You'll receive an update within 48 hours.
              </p>
            </div>
          )}

          {applicationStatus === "accepted" && (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-300 mb-4">
                🎉 Congratulations! You've been selected for the hackathon. 
              </p>
              <button className="btn-primary">
                View Event Details
              </button>
            </div>
          )}

          {applicationStatus === "rejected" && (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-slate-300">
                Thank you for your interest. While you weren't selected this time, we encourage you to apply for future events.
              </p>
            </div>
          )}
        </div>

        {/* Hackathon Info */}
        <div className="mb-8 glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-400" />
            {hackathonInfo.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div className="text-sm text-slate-300">{hackathonInfo.date}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-400" />
                <div>
                  <div className="font-medium">Format</div>
                  <div className="text-sm text-slate-300">{hackathonInfo.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-slate-300">{hackathonInfo.theme}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-yellow-400" />
                <div className="font-medium">Prize Pool</div>
              </div>
              <div className="space-y-2">
                {hackathonInfo.prizes.map((prize, idx) => (
                  <div key={idx} className="text-sm text-slate-300 bg-white/5 rounded px-3 py-2">
                    🏆 {prize}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <Lightbulb className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Resources</h3>
            <p className="text-sm text-slate-300 mb-4">
              Access hackathon resources, guidelines, and FAQs
            </p>
            <button className="btn-ghost w-full">View Resources</button>
          </div>

          <div className="glass-card p-6 text-center">
            <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Community</h3>
            <p className="text-sm text-slate-300 mb-4">
              Connect with other participants and mentors
            </p>
            <button className="btn-ghost w-full">Join Community</button>
          </div>

          <div className="glass-card p-6 text-center">
            <Send className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-slate-300 mb-4">
              Need help? Contact our support team
            </p>
            <button className="btn-ghost w-full">Get Support</button>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}