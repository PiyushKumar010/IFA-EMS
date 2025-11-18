import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const EMS_BG = "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)";
const CARD = "rgba(255,255,255,0.98)";
const COLORS = { accent: "#8447fb", accent2: "#387efb", accent3: "#19b37a", border: "#e2e4f0" };

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState([]);
  // Approval system removed
  const navigate = useNavigate();

  // Logout function
  const logout = async () => {
    try {
      const apiBase = "http://localhost:5000";
      await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) { /* ignore */ }
    navigate("/");
  }

  useEffect(() => {
    // Approval system removed
    fetch("/api/projects", { credentials: "include" })
      .then(async res => {
        const data = await res.json();
        setProjects(data.projects || []);
      });
  }, []);

  // Approval system removed

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: EMS_BG }}>
      {/* Top Navbar */}
      <div style={{
        height: 75, background: "#ffffffdd", borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        fontWeight: 900, color: COLORS.accent, fontSize: "2rem"
      }}>
        <span>Employee Dashboard</span>
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
      <div style={{ maxWidth: 1200, margin: "38px auto", padding: "0 18px" }}>
        <div style={{ fontWeight: 800, fontSize: "2rem", color: COLORS.accent2, marginBottom: 18 }}>
          Assigned Projects
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px,1fr))",
          gap: 36
        }}>
          {projects.map(project => (
            <div key={project._id}
              style={{
                background: CARD, borderRadius: 18, boxShadow: "0 4px 20px #387efb10",
                padding: "24px 20px", border: `1px solid ${COLORS.border}`,
                minHeight: 152, cursor: "pointer", transition: "box-shadow .12s"
              }}
              onClick={() => navigate(`/employee/project/${project._id}`)}>
              <div style={{ fontWeight: 800, fontSize: "1.18rem", color: COLORS.accent }}>
                {project.projectName}
              </div>
              <div style={{ color: "#446", fontWeight: 600, fontSize: "1.04rem", marginBottom: 8 }}>
                Client: {project.clientName}
              </div>
              <div style={{ color: "#7c7c9d", fontSize: "1.01rem" }}>
                {project.description}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <button
            onClick={() => navigate("/employee/messages")}
            style={{
              background: COLORS.accent2,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 32px",
              fontWeight: 700,
              fontSize: "1.09rem",
              cursor: "pointer",
              marginRight: 8,
              boxShadow: "0 2px 8px #387efb15"
            }}
          >
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
}
