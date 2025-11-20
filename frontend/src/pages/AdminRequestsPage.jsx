import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Check, X, ArrowLeft } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/requests/pending-users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.requests)) {
          setRequests(data.requests);
        } else {
          setRequests([]);
        }
      })
      .catch(() => setRequests([]));
  }, []);

  const handleAction = async (id, action) => {
    try {
      const endpoint =
        action === "approved"
          ? `/api/requests/approve/${id}`
          : `/api/requests/reject/${id}`;
      const res = await fetch(endpoint, { method: "PUT", credentials: "include" });
      if (!res.ok) throw new Error("Failed to update status");
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: action } : req)),
      );
    } catch (error) {
      alert("Failed to update request status. Please try again.");
    }
  };

  const requestsList = Array.isArray(requests) ? requests : [];
  const pending = requestsList.filter((req) => req.status === "pending").length;
  const approved = requestsList.filter((req) => req.status === "approved").length;
  const rejected = requestsList.filter((req) => req.status === "rejected").length;

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-20 pt-10 text-white">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </button>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
              Access pipeline
            </p>
            <h1 className="mt-2 text-4xl font-bold">Request matrix</h1>
            <p className="text-sm text-slate-300">
              Vet pending registrations and unlock dashboards instantly.
            </p>
          </div>
          <div className="flex gap-4 text-sm text-slate-200">
            <StatPill label="Pending" value={pending} tone="text-amber-200" />
            <StatPill label="Approved" value={approved} tone="text-emerald-200" />
            <StatPill label="Rejected" value={rejected} tone="text-rose-200" />
          </div>
        </header>

        <section className="mt-12 space-y-8">
          <div className="rounded-[32px] border border-white/10 bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-400">
                  Pending approvals
                </p>
                <h2 className="text-3xl font-semibold">People waiting</h2>
              </div>
              <span className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-200">
                {requestsList.length} requests
              </span>
            </div>

            <div className="divide-y divide-white/10">
              {requestsList.length === 0 && (
                <div className="px-6 py-10 text-center text-slate-200">
                  All caught up. There are no pending employee requests right now.
                </div>
              )}
              {requestsList.map((req) => (
                <article
                  key={req._id}
                  className={`px-6 py-6 transition hover:bg-white/5 ${
                    req.status !== "pending" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl font-semibold">
                          {(req.name || req.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{req.name || "Unnamed"}</p>
                          <p className="text-sm text-slate-300">{req.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200">
                        {req.comment || "No justification provided"}
                      </div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                        Requested {req.createdAt ? new Date(req.createdAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 lg:min-w-[240px]">
                      {req.status === "pending" ? (
                        <>
                          <button
                            className="btn-primary justify-center bg-gradient-to-r from-emerald-500 to-emerald-400"
                            onClick={() => handleAction(req._id, "approved")}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </button>
                          <button
                            className="btn-ghost justify-center border-rose-400/40 text-rose-100"
                            onClick={() => handleAction(req._id, "rejected")}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <div
                          className={`rounded-2xl border px-4 py-2 text-center text-sm font-semibold ${
                            req.status === "approved"
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                              : "border-rose-400/30 bg-rose-400/10 text-rose-100"
                          }`}
                        >
                          {req.status === "approved" ? "Approved" : "Rejected"}
                        </div>
                      )}
                    </div>
                  </div>
                  <UserPlus className="mt-6 h-5 w-5 text-slate-500" />
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageBackground>
  );
}

function StatPill({ label, value, tone }) {
  return (
    <span
      className={`rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] ${tone}`}
    >
      {label}: {value}
    </span>
  );
}
