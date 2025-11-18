import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EMS_BG = "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)";

const COLORS = {
  accent: "#8447fb",
  accent2: "#387efb",
  accent3: "#19b37a",
  card: "#ffffffef",
  border: "#e2e4f0",
};

// Modal Component
function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "92%",
          maxWidth: 620,
          padding: "40px 36px",
          background: COLORS.card,
          borderRadius: 22,
          boxShadow: "0 8px 26px rgba(0,0,0,0.08)",
          position: "relative",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            background: "#eee8ff",
            color: COLORS.accent,
            border: "none",
            borderRadius: 10,
            padding: "5px 14px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ClientPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    description: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async () => {
    try {
      const resp = await fetch("/api/projects", {
        credentials: "include", // Send cookies with fetch
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          alert("Unauthorized! Please login again.");
          navigate("/");
        }
        return;
      }
      const data = await resp.json();
      if (Array.isArray(data.projects)) setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include", // Send cookies with fetch
      body: JSON.stringify(formData),
    });

    if (resp.ok) {
      setShowForm(false);
      setFormData({
        projectName: "",
        clientName: "",
        clientEmail: "",
        description: "",
      });
      fetchProjects();
    } else if (resp.status === 401) {
      alert("Unauthorized! Please login again.");
      navigate("/");
    } else {
      alert("Failed to create project");
    }
  };

  // Logout calls backend logout and redirects
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

  return (
    <div
      style={{
        background: EMS_BG,
        minHeight: "100vh",
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          height: 75,
          background: "#ffffffdd",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 46px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            fontSize: "1.9rem",
            fontWeight: 900,
            color: COLORS.accent,
          }}
        >
          Client Dashboard
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: COLORS.accent2,
              padding: "12px 32px",
              borderRadius: 14,
              border: "none",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Create Project
          </button>
          <button
            onClick={logout}
            style={{
              background: "#eee8ff",
              color: COLORS.accent,
              border: "none",
              borderRadius: 14,
              padding: "12px 32px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1250, margin: "0 auto", padding: "40px 30px" }}>
        <div
          style={{
            fontSize: "1.45rem",
            fontWeight: 700,
            color: COLORS.accent2,
            marginBottom: 26,
          }}
        >
          Your Projects
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 28,
          }}
        >
          {projects.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                background: COLORS.card,
                borderRadius: 16,
              }}
            >
              <div style={{ fontWeight: 700, color: COLORS.accent }}>
                No projects found
              </div>
            </div>
          ) : (
            projects.map((p, idx) => (
              <div
                key={p._id || idx}
                onClick={() => setViewProject(p)}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 18,
                  padding: "22px 20px",
                  cursor: "pointer",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
                  transition: "0.15s",
                  overflowWrap: "break-word",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: COLORS.accent2,
                  }}
                >
                  {p.projectName}
                </div>

                <div
                  style={{
                    color: "#666",
                    margin: "8px 0 12px",
                    maxHeight: 44,
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </div>

                <div style={{ color: COLORS.accent3, fontWeight: 700 }}>
                  By {p.clientName}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: 20,
              color: COLORS.accent2,
            }}
          >
            Create New Project
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <input
              name="projectName"
              placeholder="Project Name"
              value={formData.projectName}
              onChange={handleChange}
              required
              style={{
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <input
              name="clientName"
              placeholder="Your Name"
              value={formData.clientName}
              onChange={handleChange}
              required
              style={{
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <input
              name="clientEmail"
              type="email"
              placeholder="Your Email"
              value={formData.clientEmail}
              onChange={handleChange}
              required
              style={{
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <textarea
              name="description"
              placeholder="Project Description"
              value={formData.description}
              onChange={handleChange}
              required
              style={{
                padding: 14,
                borderRadius: 12,
                minHeight: 100,
                border: `1px solid ${COLORS.border}`,
              }}
            />

            <button
              type="submit"
              style={{
                background: COLORS.accent2,
                color: "#fff",
                border: "none",
                padding: "14px 0",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Save
            </button>
          </form>
        </Modal>
      )}

      {/* View Project Modal */}
      {viewProject && (
        <Modal onClose={() => setViewProject(null)}>
          <h2 style={{ color: COLORS.accent, marginBottom: 10 }}>
            {viewProject.projectName}
          </h2>

          <p
            style={{
              color: "#555",
              marginBottom: 16,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {viewProject.description}
          </p>

          <div style={{ fontWeight: 700, color: COLORS.accent3 }}>
            Client: {viewProject.clientName}
          </div>

          <div style={{ marginTop: 8, color: COLORS.accent2 }}>
            Email: {viewProject.clientEmail}
          </div>
        </Modal>
      )}
    </div>
  );
}
