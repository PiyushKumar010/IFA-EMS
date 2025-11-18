import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EMS_BG = "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)";
const CARD = "rgba(255,255,255,0.97)";
const COLORS = {
  accent: "#8447fb",
  accent2: "#387efb",
  accent3: "#19b37a",
  border: "#e2e4f0"
};

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.21)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200
    }}>
      <div style={{
        minWidth: 370, maxWidth: 820, width: "92%",
        background: CARD, borderRadius: 18, boxShadow: "0 6px 52px #387efb31",
        position: "relative", padding: "28px 26px",
        maxHeight: "80vh", overflowY: "auto"
      }}>
        <button
          style={{
            position: "absolute", top: 21, right: 22,
            background: "#ede7fa", color: COLORS.accent, border: "none",
            borderRadius: 9, fontWeight: 800, fontSize: "1.1rem", cursor: "pointer", padding: "4px 14px"
          }}
          onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [show, setShow] = useState(null); // for modal preview
  // Approval system removed
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/projects", { credentials: "include" })
      .then(res => res.json())
      .then(data => setProjects(data.projects || []));
    // Approval system removed
  }, []);

  

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) { /* ignore */ }
    navigate("/");
  }

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: EMS_BG, padding: "0", margin: "0",
    }}>
      {/* Top Navbar */}

      <div style={{
        height: 75,
        background: "#ffffffdd",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 46px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
        fontSize: "2rem",
        fontWeight: 900,
        color: COLORS.accent,
      }}>
        <span style={{
          fontWeight: 900,
          fontSize: "2rem",
          color: COLORS.accent,
          letterSpacing: "-1px"
        }}>
          Admin Dashboard
        </span>
        <div style={{ display: "flex", gap: "13px" }}>
          <button
            onClick={() => navigate("/admin/requests")}
            style={{
              background: COLORS.accent2,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "11px 30px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "1.08rem",
              boxShadow: "0 2px 8px #387efb14"
            }}
          >
            Requests
          </button>
          <button
            onClick={() => navigate("/admin/messages")}
            style={{
              background: COLORS.accent,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "11px 30px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "1.08rem",
              boxShadow: "0 2px 8px #8447fb14"
            }}
          >
            Messages
          </button>
          <button
            onClick={logout}
            style={{
              background: "#eee8ff",
              color: COLORS.accent,
              border: "none",
              borderRadius: 14,
              padding: "11px 30px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "1.08rem"
            }}
          >
            Logout
          </button>
        </div>
      </div>


      {/* Approval system removed */}

      {/* Projects grid */}
      <div style={{ maxWidth: 1200, margin: "42px auto 0 auto", padding: "0 22px" }}>
        <div style={{ fontWeight: 800, fontSize: "2rem", color: COLORS.accent2, marginBottom: 18 }}>
          All Projects
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 36
        }}>
          {projects.map(project => (
            <div key={project._id}
              style={{
                background: CARD,
                borderRadius: 18, boxShadow: "0 4px 20px #387efb10",
                padding: "30px 28px 19px 28px", position: "relative",
                cursor: "pointer", border: `1px solid ${COLORS.border}`,
                minHeight: 162, transition: "box-shadow .12s"
              }}
              onClick={() => setShow(project)}>
              <div style={{ fontWeight: 800, fontSize: "1.24rem", color: COLORS.accent }}>
                {project.projectName}
              </div>
              <div style={{ color: "#454555dd", fontSize: "1.07rem", fontWeight: 600, marginBottom: 7 }}>
                Client: {project.clientName} (<span style={{ color: COLORS.accent2, fontWeight: 500 }}>{project.clientEmail}</span>)
              </div>
              <div style={{
                fontWeight: 500, fontSize: "1.07rem", marginBottom: 8
              }}>
                <StatusTag status={project.status} />
                <span style={{ marginLeft: 18, color: COLORS.accent3, fontWeight: 700 }}>
                  {project.assignees && project.assignees.length ? "Assigned" : "Unassigned"}
                </span>
                {project.assignees && project.assignees.length
                  ? <span style={{ color: "#666", marginLeft: 8 }}>
                    ({project.assignees.map(a => a.name).join(", ")})
                  </span>
                  : null
                }
              </div>
              <div style={{
                color: "#7c7c9d", fontSize: "1.01rem", marginTop: 8,
                overflow: "hidden", textOverflow: "ellipsis", maxWidth: 305
              }}>
                {project.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Project Preview Modal */}
      {show &&
        <Modal onClose={() => setShow(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
            {/* Left column: main info */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, color: COLORS.accent, fontSize: '1.4rem' }}>{show.projectName}</h2>
                  <div style={{ marginTop: 6, color: COLORS.accent3, fontWeight: 700 }}>{show.clientName} <span style={{ color: '#666', fontWeight: 600 }}>({show.clientEmail})</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 8 }}><StatusTag status={show.status} /></div>
                  <div style={{ color: '#666', fontSize: '0.95rem' }}>{show.startDate ? (new Date(show.startDate)).toLocaleDateString() : '-'} — {show.endDate ? (new Date(show.endDate)).toLocaleDateString() : '-'}</div>
                </div>
              </div>

              <p style={{ color: '#5b6172', marginTop: 12, lineHeight: 1.6 }}>{show.description}</p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <div style={{ background: '#f8fbff', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontWeight: 800, color: '#333', marginBottom: 6 }}>Incharges</div>
                  <div style={{ color: '#333' }}><b>VA:</b> {show.vaIncharge || '-'}</div>
                  <div style={{ color: '#333' }}><b>Freelancer:</b> {show.freelancer || '-'}</div>
                  <div style={{ color: '#333' }}><b>Update:</b> {show.updateIncharge || '-'}</div>
                </div>

                <div style={{ background: '#f8fbff', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontWeight: 800, color: '#333', marginBottom: 6 }}>Hours</div>
                  <div style={{ color: '#333' }}><b>Estimated:</b> {show.estimatedHoursRequired || '-'}</div>
                  <div style={{ color: '#333' }}><b>Taken:</b> {show.estimatedHoursTaken || '-'}</div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Assignees</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(show.assignees && show.assignees.length) ? show.assignees.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: '8px 12px', borderRadius: 999, boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 999, background: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.accent2, fontWeight: 800 }}>{((a?.name||a?.email||'') .split(' ')[0]||'')[0] || 'U'}</div>
                      <div style={{ color: '#333' }}>{a?.name || a?.email || a}</div>
                    </div>
                  )) : <div style={{ color: '#666' }}>None</div>}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Lead Assignee</div>
                <div style={{ color: '#333' }}>{show.leadAssignee?.name || show.leadAssignee || '-'}</div>
              </div>
            </div>

            {/* Right column: metadata & links */}
            <aside>
              <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: 'inset 0 0 0 1px #f1f4fb' }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Details</div>
                <div style={{ color: '#333', marginBottom: 6 }}><b>Priority:</b> {show.priority || '-'}</div>
                <div style={{ color: '#333', marginBottom: 6 }}><b>Client Type:</b> {show.clientType || '-'}</div>
                <div style={{ color: '#333', marginBottom: 6 }}><b>Project Type:</b> {show.projectType || '-'}</div>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f4fb', margin: '12px 0' }} />

                <div style={{ fontWeight: 800, marginBottom: 8 }}>Leadership</div>
                <div style={{ color: '#333', marginBottom: 10 }}>{show.leadership || '-'}</div>

                <div style={{ fontWeight: 800, marginBottom: 8 }}>Coders Recommendation</div>
                <div style={{ color: '#333', marginBottom: 10 }}>{show.codersRecommendation || '-'}</div>

                <div style={{ fontWeight: 800, marginBottom: 8 }}>Links</div>
                <div style={{ marginBottom: 6 }}>
                  <b>GitHub:</b> {show.githubLinks ? <a href={show.githubLinks} target="_blank" rel="noreferrer">Open</a> : '-'}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <b>Loom:</b> {show.loomLink ? <a href={show.loomLink} target="_blank" rel="noreferrer">Open</a> : '-'}
                </div>
                <div>
                  <b>WhatsApp:</b> {show.whatsappGroupLink ? <a href={show.whatsappGroupLink} target="_blank" rel="noreferrer">Open</a> : '-'}
                </div>
              </div>
            </aside>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 18 }}>
            <button onClick={() => navigate(`/admin/project/${show._id}`)} style={{ background: COLORS.accent2, color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>Edit</button>
          </div>
        </Modal>
      }
    </div>
  );
}

// Colored status tag
function StatusTag({ status }) {
  const COLORS = {
    Completed: "#19b37a",
    Cancelled: "#d82929",
    "Client Meeting Done": "#e0c058",
    "Contact Made": "#6699a2",
    Active: "#2262fb",
    Recontacted: "#a47aff",
    Stalled: "#666",
    "Requirements Sent": "#dc6060",
    "Waiting for Requirement": "#aaa",
    "Awaiting Testimonial": "#c68967",
    Training: "#6c53b7",
    New: "#387efb"
  };
  return (
    <span style={{
      background: COLORS[status] || "#b2b2b2",
      color: "#fff",
      borderRadius: "8px",
      fontSize: "0.99rem",
      fontWeight: 700,
      padding: "4px 16px",
      marginRight: 10
    }}>
      {status}
    </span>
  );
}
