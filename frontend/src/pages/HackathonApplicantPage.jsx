import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Code,
  Target,
  Award,
  UserCheck,
  ExternalLink,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function HackathonApplicantPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchActiveHackathons();
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

  const fetchActiveHackathons = async () => {
    try {
      const res = await fetch("/api/hackathon/active", { credentials: "include" });
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

  const registerForHackathon = async (hackathonId) => {
    const teamName = prompt("Enter your team name (optional):");
    
    try {
      const res = await fetch(`/api/hackathon/${hackathonId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teamName: teamName || "" })
      });

      if (res.ok) {
        alert("Successfully registered for hackathon!");
        fetchActiveHackathons(); // Refresh to show updated registration
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering for hackathon:", error);
      alert("Error registering for hackathon");
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

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);
    const regDeadline = new Date(hackathon.registrationDeadline);

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

  const isUserRegistered = (hackathon) => {
    return hackathon.registeredUsers?.some(
      reg => reg.user._id === profile?._id || reg.user === profile?._id
    );
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

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Hackathon Dashboard</h1>
              <p className="mt-2 text-slate-300">
                Welcome, {profile?.name || "Participant"}! Discover and join exciting hackathons.
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

        {hackathons.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No Active Hackathons</h3>
            <p className="text-slate-400">
              There are no active hackathons at the moment. Check back later for new opportunities!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {hackathons.map((hackathon) => {
              const statusInfo = getHackathonStatus(hackathon);
              const StatusIcon = statusInfo.icon;
              const isRegistered = isUserRegistered(hackathon);
              const canRegister = new Date() < new Date(hackathon.registrationDeadline) && !isRegistered;
              
              return (
                <div key={hackathon._id} className="glass-card p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold">{hackathon.title}</h2>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusInfo.status}
                        </div>
                        {isRegistered && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400">
                            <UserCheck className="h-4 w-4" />
                            Registered
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 text-lg mb-4">{hackathon.description}</p>
                      
                      {hackathon.theme && (
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="h-5 w-5 text-orange-400" />
                          <span className="font-medium">Theme: {hackathon.theme}</span>
                        </div>
                      )}
                    </div>

                    {canRegister && (
                      <button
                        onClick={() => registerForHackathon(hackathon._id)}
                        className="btn-primary ml-4"
                      >
                        Register Now
                      </button>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <div className="text-sm text-slate-300">
                        <div>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(hackathon.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(hackathon.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        <span className="font-medium">Registration</span>
                      </div>
                      <div className="text-sm text-slate-300">
                        <div>Until {new Date(hackathon.registrationDeadline).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(hackathon.registrationDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-green-400" />
                        <span className="font-medium">Location</span>
                      </div>
                      <div className="text-sm text-slate-300">{hackathon.location}</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        <span className="font-medium">Participants</span>
                      </div>
                      <div className="text-sm text-slate-300">
                        {hackathon.registeredUsers?.length || 0} / {hackathon.maxParticipants}
                      </div>
                    </div>
                  </div>

                  {/* Prizes */}
                  {hackathon.prizes && hackathon.prizes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-400" />
                        Prizes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {hackathon.prizes.map((prize, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="font-semibold text-yellow-400">{prize.position}</div>
                            <div className="text-lg font-bold">{prize.amount}</div>
                            {prize.description && (
                              <div className="text-xs text-slate-400">{prize.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {hackathon.requirements && hackathon.requirements.length > 0 && hackathon.requirements.some(req => req.trim()) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-1">
                        {hackathon.requirements.filter(req => req.trim()).map((requirement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contact Information */}
                  {hackathon.contactInfo && (hackathon.contactInfo.email || hackathon.contactInfo.phone || hackathon.contactInfo.website) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {hackathon.contactInfo.email && (
                          <a 
                            href={`mailto:${hackathon.contactInfo.email}`}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                          >
                            <Mail className="h-4 w-4" />
                            {hackathon.contactInfo.email}
                          </a>
                        )}
                        {hackathon.contactInfo.phone && (
                          <a 
                            href={`tel:${hackathon.contactInfo.phone}`}
                            className="flex items-center gap-2 text-green-400 hover:text-green-300"
                          >
                            <Phone className="h-4 w-4" />
                            {hackathon.contactInfo.phone}
                          </a>
                        )}
                        {hackathon.contactInfo.website && (
                          <a 
                            href={hackathon.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageBackground>
  );
}