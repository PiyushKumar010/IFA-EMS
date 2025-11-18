import React, { useState, useEffect } from "react";

const EMS_BG = "linear-gradient(120deg,#ede7fe 0%, #f6f7fa 57%, #e8e9ff 100%)";
const CARD = "rgba(255,255,255,0.98)";
const CARD_SHADOW = "0 7px 32px #886ef210, 0 2px 8px #d2d3f621";
const BORDER = "#e4e1f8";
const COLORS = {
  accent: "#7659e7",
  accent2: "#26a9e0",
  success: "#12b48b",
  reject: "#e26c5c",
  faded: "#8577bc",
  pending: "#dbad4c",
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("/api/requests/pending-users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.requests)) {
          setRequests(data.requests);
        } else {
          setRequests([]);
          console.warn("No requests or invalid format from backend API");
        }
      })
      .catch((err) => {
        console.error("Fetching requests failed", err);
        setRequests([]);
      });
  }, []);

  const handleAction = async (id, action) => {
    try {
      const endpoint =
        action === "approved"
          ? `/api/requests/approve/${id}`
          : `/api/requests/reject/${id}`;
      const method = "PUT";

      const res = await fetch(endpoint, { method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to update status");

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: action } : req
        )
      );
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request status. Please try again.");
    }
  };

  const requestsList = Array.isArray(requests) ? requests : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: EMS_BG,
        padding: 0,
        margin: 0,
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          height: 75,
          background: "#fff",
          borderBottom: `1.5px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          padding: "0 55px",
          fontSize: "2.17rem",
          fontWeight: 900,
          color: COLORS.accent,
          boxShadow: "0 2px 13px #e3e3fa21",
        }}
      >
        New Employee Requests
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: "54px auto",
          padding: "0 22px",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.45rem",
            color: COLORS.accent2,
            marginBottom: "2.3rem",
            letterSpacing: "-0.5px",
          }}
        >
          Pending Approvals
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 34,
          }}
        >
          {requestsList.length === 0 && (
            <div
              style={{
                fontSize: "1.34rem",
                color: COLORS.faded,
                fontWeight: 700,
                padding: 48,
                background: "#f6f9fdcc",
                borderRadius: 18,
                textAlign: "center",
              }}
            >
              No new employee requests at the moment.
              <br />
              🎉 All current employees are active!
            </div>
          )}

          {requestsList.map((req) => (
            <div
              key={req._id}
              style={{
                background: CARD,
                borderRadius: 19,
                boxShadow: CARD_SHADOW,
                padding: "36px 28px 30px",
                border: `1.5px solid ${BORDER}`,
                position: "relative",
                minHeight: 190,
                transition: "box-shadow .11s",
                opacity: req.status === "pending" ? 1 : 0.7,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", marginBottom: 14 }}
              >
                <img
                  src={req.picture || ""}
                  alt={req.name || "User"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/54?text=User";
                  }}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    marginRight: 16,
                    border: `2.5px solid ${COLORS.accent}`,
                    boxShadow: "0 2px 9px #9789e840",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.27rem",
                      color: COLORS.accent2,
                    }}
                  >
                    {req.name || "Unnamed User"}
                  </div>
                  <div
                    style={{ fontSize: "1.07rem", color: "#a889ed", fontWeight: 600 }}
                  >
                    {req.email || "No email"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  color: COLORS.faded,
                  fontWeight: 600,
                  fontSize: "1.09rem",
                  marginBottom: 7,
                  lineHeight: 1.42,
                }}
              >
                <span style={{ color: "#653cdb" }}>Reason:</span>{" "}
                {req.comment || (
                  <span style={{ opacity: 0.5, fontStyle: "italic" }}>
                    No comment
                  </span>
                )}
              </div>
              <div style={{ fontSize: ".97rem", color: COLORS.pending, marginBottom: 18 }}>
                Requested:{" "}
                {req.createdAt
                  ? new Date(req.createdAt).toLocaleString()
                  : "Unknown"}
              </div>
              {req.status === "pending" ? (
                <div style={{ display: "flex", gap: 18, marginTop: 7 }}>
                  <button
                    onClick={() => handleAction(req._id, "approved")}
                    style={{
                      background:
                        "linear-gradient(90deg,#51e3b6 20%,#2eca8b 100%)",
                      color: "#fff",
                      fontWeight: 800,
                      border: "none",
                      borderRadius: 9,
                      padding: "10px 36px",
                      fontSize: "1.07rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 11px #23e09728",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "rejected")}
                    style={{
                      background:
                        "linear-gradient(90deg,#f79969 5%,#e26c5c 100%)",
                      color: "#fff",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 9,
                      padding: "10px 22px",
                      fontSize: "1.07rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 11px #e56c5c2a",
                    }}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 18,
                    fontWeight: 800,
                    color: req.status === "approved" ? COLORS.success : COLORS.reject,
                    fontSize: "1.09rem",
                  }}
                >
                  {req.status === "approved" ? "✔ Approved" : "❌ Rejected"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
