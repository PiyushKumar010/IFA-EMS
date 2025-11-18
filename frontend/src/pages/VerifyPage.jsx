import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "566747438493-3k78i9n08q85ucmeq33tlof9kq53n1fb.apps.googleusercontent.com"; 

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "unknown";

  // Backend call: validate Google token and role
  async function handleLoginSuccess(credentialResponse) {
    const googleToken = credentialResponse.credential || credentialResponse.tokenId;
    const resp = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ googleToken, role })
    });
    const data = await resp.json();

    // The correction:
    if (data.success) {
      navigate("/" + role);
    } else if (data.pending) {
      navigate("/employee/approval");
    } else {
      alert("Access denied.");
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)"
      }}>
        <div style={{
          maxWidth: "450px",
          width: "100%",
          background: "rgba(255,255,255,0.97)",
          borderRadius: "24px",
          boxShadow: "0 8px 50px #a9b8ff10, 0 2px 24px #387efb19",
          padding: "48px 36px",
          textAlign: "center",
          position: "relative"
        }}>
          <button
            style={{
              position: "absolute",
              left: 36,
              top: 28,
              background: "none",
              border: "none",
              color: "#387efb",
              fontWeight: 600,
              fontSize: "0.99rem",
              cursor: "pointer"
            }}
            onClick={() => navigate(-1)}
          >
            ← Back to Role Selection
          </button>
          <div style={{ margin: "38px 0 23px 0" }}>
            <span style={{ fontSize: "3rem" }}>🔒</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: "2rem", color: "#8447fb" }}>Sign In with Google</div>
          <div style={{ marginBottom: "24px", marginTop: "8px", color: "#444", fontWeight: 500, fontSize: "1.11rem" }}>
            Sign in as <span style={{ fontWeight: 700 }}>{role.charAt(0).toUpperCase() + role.slice(1)}</span> to continue
          </div>
          {role === "admin" && (
            <div style={{
              background: "#ece4ff",
              color: "#642ff2",
              borderRadius: "10px",
              marginBottom: "27px",
              padding: "8px 17px",
              textAlign: "left",
              fontWeight: 500
            }}>
              <div><span style={{ fontWeight: 700 }}>Admin Access:</span> Only authorized admin email addresses can access the admin dashboard.</div>
            </div>
          )}
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => alert("Google sign-in failed")}
            width="360px"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
