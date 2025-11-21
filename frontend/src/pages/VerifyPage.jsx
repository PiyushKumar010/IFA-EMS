import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Shield, LockKeyhole, Sparkles } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "566747438493-3k78i9n08q85ucmeq33tlof9kq53n1fb.apps.googleusercontent.com";

const roleCopy = {
  admin: {
    title: "Admin Command",
    subtitle:
      "Granular control over approvals, progress edits, and direct comms.",
    badge: "Requires Allow List",
    variant: "violet",
  },
  employee: {
    title: "Employee Workspace",
    subtitle: "Submit updates, review projects, and message leadership.",
    badge: "Auto onboarding",
    variant: "emerald",
  },
  client: {
    title: "Client Cockpit",
    subtitle: "Snapshot of milestones and delivery notes built for clarity.",
    badge: "Invite only",
    variant: "cyan",
  },
};

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "unknown";
  const employeeType = location.state?.employeeType || "employee";
  const copy = roleCopy[role] || roleCopy.employee;

  async function handleLoginSuccess(credentialResponse) {
    try {
      const googleToken =
        credentialResponse.credential || credentialResponse.tokenId;
      const resp = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ googleToken, role, employeeType }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
        alert(errorData.error || "Authentication failed");
        return;
      }

      const data = await resp.json();

      if (data.success) {
        // Handle different employee types
        if (employeeType === "hackathon-applicant") {
          navigate("/hackathon");
        } else {
          navigate("/" + role);
        }
      } else if (data.pending) {
        navigate("/employee/approval");
      } else {
        alert(data.message || "Access denied.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PageBackground variant={copy.variant}>
        <div className="flex min-h-screen items-center justify-center px-6 py-20">
          <div className="glass-panel w-full max-w-5xl px-6 py-10 md:px-12">
            <button
              onClick={() => navigate(-1)}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to role selection
            </button>
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-200">
                  {copy.badge}
                </span>
                <h1 className="text-4xl font-bold text-white">{copy.title}</h1>
                <p className="text-lg text-slate-300">{copy.subtitle}</p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Shield className="h-10 w-10 text-indigo-300" />
                    <div>
                      <p className="text-base font-semibold text-white">
                        Secure by design
                      </p>
                      <p>Single sign-on with domain enforced controls.</p>
                    </div>
                  </div>
                  {role === "admin" && (
                    <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-100">
                      Only emails whitelisted by central leadership can unlock
                      the admin cockpit.
                    </p>
                  )}
                </div>
              </div>
              <div className="surface-section space-y-6 rounded-[28px]">
                <div className="flex items-center gap-3 text-slate-200">
                  <LockKeyhole className="h-10 w-10 text-cyan-300" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                      Step 1
                    </p>
                    <p className="text-lg font-semibold">
                      Sign in with Google
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <p>
                    Use your verified organizational account to continue as{" "}
                    <span className="font-semibold text-white">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                    .
                  </p>
                </div>
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => alert("Google sign-in failed")}
                  width="100%"
                />
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Zero password storage
                  </div>
                  <p className="mt-1">
                    Authentication is delegated to Google for frictionless
                    onboarding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBackground>
    </GoogleOAuthProvider>
  );
}
