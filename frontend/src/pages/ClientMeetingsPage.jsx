import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function ClientMeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

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
      <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">
        Upcoming
      </span>
    );
  };

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, "_blank", "noopener,noreferrer");
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
    <PageBackground variant="cyan">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/client")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
              Meetings
            </p>
            <h1 className="mt-2 text-4xl font-bold">Your Meetings</h1>
            <p className="mt-1 text-sm text-slate-300">
              View and join your scheduled meetings
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-slate-300">No meetings scheduled for you</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="rounded-[32px] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-2xl">
                        {getMeetingTypeIcon(meeting.meetingType)}
                      </span>
                      <h3 className="text-xl font-bold text-white">{meeting.subject}</h3>
                      {getStatusBadge(
                        meeting.status,
                        meeting.scheduledDate,
                        meeting.scheduledTime
                      )}
                    </div>
                    {meeting.description && (
                      <p className="mb-3 text-slate-300">{meeting.description}</p>
                    )}
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {meeting.scheduledTime} ({meeting.duration} min)
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinMeeting(meeting.meetingLink)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Join Meeting
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageBackground>
  );
}

