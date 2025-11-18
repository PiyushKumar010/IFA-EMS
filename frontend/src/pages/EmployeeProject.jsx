import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EMS_BG = "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)";
const CARD = "rgba(255,255,255,0.98)";
const COLORS = { accent: "#8447fb", accent2: "#387efb", accent3: "#19b37a", border: "#e2e4f0" };

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.21)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        minWidth: 370, maxWidth: 600, background: CARD, borderRadius: 16, boxShadow: "0 6px 40px #387efb21",
        position: "relative", padding: "34px 27px"
      }}>
        <button onClick={onClose}
          style={{
            position: "absolute", top: 13, right: 13, background: "#ede7fa", color: COLORS.accent,
            border: "none", borderRadius: 8, fontWeight: 700, fontSize: "1.09rem", cursor: "pointer", padding: "4px 12px"
          }}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function EmployeeProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");

  // Logout function
  const logout = async () => {
    try {
      const apiBase = "http://localhost:5000";
      await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) { /* ignore */ }
    navigate("/");
  }

  useEffect(() => {
    const apiBase = "http://localhost:5000";

    fetch(`${apiBase}/api/projects`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const proj = (data.projects || []).find(x => x._id === id);
        if (proj) setProject(proj);
      });

    fetch(`${apiBase}/api/progress/${id}`, { credentials: "include" })
      .then(async res => {
        if (!res.ok) {
          return setProgressHistory([]);
        }
        return res.json();
      })
      .then(data => setProgressHistory(data?.progress || []));
  }, [id]);

  // Submit daily progress report
  const submitReport = async (e) => {
    e.preventDefault();

    const apiBase = "http://localhost:5000";

    const resp = await fetch(`${apiBase}/api/progress/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: reportText }),
    });

    if (resp.ok) {
      setReportText("");
      setShowReport(false);
      // Refresh progress history after successful submission
      fetch(`${apiBase}/api/progress/${id}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setProgressHistory(data?.progress || []))
        .catch(err => console.error('Error refreshing progress:', err));
    } else {
      const errMsg = await resp.json();
      console.error('Submit failed:', resp.status, errMsg);
    }
  };

  if (!project) return (
    <div style={{ minHeight: "100vh", width: "100vw", background: EMS_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: COLORS.accent }}>Loading...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: EMS_BG,
      padding: 0, margin: 0
    }}>
      {/* Top Navbar */}
      <div style={{
        height: 75, background: "#ffffffdd", borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        fontSize: "1.35rem", fontWeight: 800, color: COLORS.accent
      }}>
        <span>Project Progress</span>
        <button
          onClick={logout}
          style={{
            background: "#eee8ff", color: COLORS.accent, border: "none",
            borderRadius: 12, padding: "9px 26px", fontWeight: 700,
            cursor: "pointer", fontSize: "1.01rem", boxShadow: "0 2px 8px #8447fb15"
          }}>
          Logout
        </button>
      </div>
      <div style={{
        maxWidth: 830, margin: "40px auto",
        background: CARD, borderRadius: 22, boxShadow: "0 4px 22px #387efb10",
        padding: "38px 33px 30px 33px"
      }}>
        <div style={{ fontWeight: 800, fontSize: "1.38rem", color: COLORS.accent2 }}>{project?.projectName}</div>
        <div style={{ fontWeight: 700, marginBottom: 6, color: COLORS.accent3 }}>
          Client: <span style={{ fontWeight: 500, color: "#555" }}>{project?.clientName}</span>
        </div>
        <div style={{
          color: "#666", fontWeight: 600, marginBottom: 26,
        }}>{project?.description}</div>
        <button
          style={{
            background: COLORS.accent2, color: "#fff", border: "none",
            borderRadius: 14, fontWeight: 700, padding: "10px 38px",
            fontSize: "1.11rem", margin: "15px 0 26px 0",
            boxShadow: "0 3px 12px #387efb22", cursor: "pointer"
          }}
          onClick={() => setShowReport(true)}
        >
          + Add Today's Work Report
        </button>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 800, color: COLORS.accent, fontSize: "1.15rem", marginBottom: 15 }}>
            Progress History
          </div>
          {progressHistory.length === 0 && (
            <div style={{ padding: 12, color: "#999", fontWeight: 600 }}>No reports yet.</div>
          )}
          {progressHistory.map((progress, idx) => (
            <div key={progress._id || idx} style={{
              marginBottom: 21, background: "#edefff88", padding: "13px 15px",
              borderRadius: 10, boxShadow: "0 2px 12px #8447fb20"
            }}>
              <div style={{ fontWeight: 700, color: COLORS.accent2 }}>
                {progress.employee?.name || "Employee"} ({new Date(progress.date).toLocaleDateString()})
              </div>
              <div style={{ fontSize: "1.01rem", color: "#333" }}>{progress.text}</div>
            </div>
          ))}
        </div>
      </div>
      {showReport &&
        <Modal onClose={() => setShowReport(false)}>
          <h2 style={{ color: COLORS.accent2, marginBottom: 14 }}>Add Today's Work</h2>
          <form onSubmit={submitReport}>
            <textarea
              rows={6}
              value={reportText}
              required
              onChange={e => setReportText(e.target.value)}
              style={{
                borderRadius: 11, border: `1.5px solid ${COLORS.border}`,
                padding: "11px 12px", background: "#f5f5fe",
                fontWeight: 500, fontSize: "1.06rem", width: "100%", minWidth: 330, marginBottom: 24
              }}
              placeholder="Describe today's progress..."
            />
            <button
              type="submit"
              style={{
                background: COLORS.accent2, color: "#fff", border: "none", padding: "10px 32px",
                borderRadius: 11, fontWeight: 700, fontSize: "1.06rem", boxShadow: "0 2px 8px #387efb13"
              }}>
              Save
            </button>
          </form>
        </Modal>
      }
    </div>
  );
}

