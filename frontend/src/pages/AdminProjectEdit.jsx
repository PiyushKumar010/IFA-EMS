import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EMS_BG = "linear-gradient(120deg, #ece9ff 0%, #fdf6fa 65%, #faf7ff 99%)";
const CARD = "rgba(255,255,255,0.97)";
const COLORS = {
  accent: "#8447fb",
  accent2: "#387efb",
  accent3: "#19b37a",
  border: "#e2e4f0"
};

export default function AdminProjectEdit() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/projects`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const proj = (data.projects || []).find(x => x._id === id);
        if (proj) {
          setProject(proj);
          setForm({
            status: proj.status || "",
            clientType: proj.clientType || "",
            priority: proj.priority || "",
            projectType: proj.projectType || "",
            estimatedHoursRequired: proj.estimatedHoursRequired || "",
            estimatedHoursTaken: proj.estimatedHoursTaken || "",
            startDate: proj.startDate?.slice(0, 10) || "",
            endDate: proj.endDate?.slice(0, 10) || "",
            assignees: proj.assignees?.map(a => a._id) || [],
            leadAssignee: proj.leadAssignee?._id || "",
            vaIncharge: proj.vaIncharge || "",
            freelancer: proj.freelancer || "",
            updateIncharge: proj.updateIncharge || "",
            codersRecommendation: proj.codersRecommendation || "",
            leadership: proj.leadership || "",
            githubLinks: proj.githubLinks || "",
            loomLink: proj.loomLink || "",
            whatsappGroupLink: proj.whatsappGroupLink || ""
          });
        }
      });
    fetch("/api/users/employees", { credentials: "include" })
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []));
  }, [id]);

  if (!project) return <div>Loading...</div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMultiChange = (e) => setForm({
    ...form,
    assignees: Array.from(e.target.selectedOptions).map((o) => o.value),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const resp = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (resp.ok) {
      navigate("/admin");
    } else {
      alert("Update failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: EMS_BG,
      padding: "0", margin: "0"
    }}>
      <div style={{
        height: 75,
        background: "#ffffffdd",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 46px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
        fontSize: "2rem",
        fontWeight: 900,
        color: COLORS.accent,
      }}>
        Admin - Edit Project
      </div>
      <div style={{
        maxWidth: 920,
        margin: "44px auto",
        background: CARD,
        padding: "42px 34px 32px 34px",
        borderRadius: 22,
        boxShadow: "0 4px 32px #8447fb0a",
        position: "relative"
      }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: COLORS.accent2, marginBottom: 22 }}>
          Project: {project.projectName}
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: COLORS.accent3 }}>Client: </span>
          {project.clientName} ({project.clientEmail})<br />
          <span style={{ fontWeight: 700, color: COLORS.accent }}>Description: </span>
          {project.description}
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <div style={labelStyle}>
              <div style={labelTitle}>Status</div>
              <select name="status" value={form.status} onChange={handleChange} style={inputBoxStyle}>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Active">Active</option>
                <option value="Recontacted">Recontacted</option>
                <option value="Training">Training</option>
                <option value="Requirements Sent">Requirements Sent</option>
                <option value="Stalled">Stalled</option>
                <option value="Awaiting Testimonial">Awaiting Testimonial</option>
                <option value="Contact Made">Contact Made</option>
                <option value="Client Meeting Done">Client Meeting Done</option>
                <option value="Waiting for Requirement">Waiting for Requirement</option>
                <option value="New">New</option>
              </select>
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Client Type</div>
              <select name="clientType" value={form.clientType} onChange={handleChange} style={inputBoxStyle}>
                <option value="New">New</option>
                <option value="Existing">Existing</option>
              </select>
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Priority</div>
              <select name="priority" value={form.priority} onChange={handleChange} style={inputBoxStyle}>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Project Type</div>
              <select name="projectType" value={form.projectType} onChange={handleChange} style={inputBoxStyle}>
                <option value="Client">Client</option>
                <option value="Research">Research</option>
                <option value="Management">Management</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>VA Incharge</div>
              <input name="vaIncharge" value={form.vaIncharge} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Freelancer</div>
              <input name="freelancer" value={form.freelancer} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Update Incharge</div>
              <input name="updateIncharge" value={form.updateIncharge} onChange={handleChange} style={inputBoxStyle} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>
              <div style={labelTitle}>Estimated Hours Required</div>
              <input name="estimatedHoursRequired" type="number" value={form.estimatedHoursRequired} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Estimated Hours Taken</div>
              <input name="estimatedHoursTaken" type="number" value={form.estimatedHoursTaken} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Start Date</div>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>End Date</div>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Coders Recommendation</div>
              <input name="codersRecommendation" value={form.codersRecommendation} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Leadership</div>
              <input name="leadership" value={form.leadership} onChange={handleChange} style={inputBoxStyle} />
            </div>
          </div>

          {/* Middle section: Assignees + Lead Assignee placed in the middle of form */}
          <div style={{ gridColumn: "span 2", display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>
                <div style={labelTitle}>Assignees (Ctrl + Click for multiple)</div>
                <select name="assignees" multiple value={form.assignees || []} onChange={handleMultiChange} style={{ ...inputBoxStyle, minHeight: 120 }}>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} ({e.email})</option>
                  ))}
                </select>
                <div style={{ marginTop: 8, fontStyle: "italic", fontSize: "0.95rem", color: "#888" }}>
                  Assign from employees who logged in as employee role.
                </div>
              </div>
            </div>
            <div style={{ flex: "0 0 320px" }}>
              <div style={labelStyle}>
                <div style={labelTitle}>Lead Assignee</div>
                <select name="leadAssignee" value={form.leadAssignee} onChange={handleChange} style={inputBoxStyle}>
                  <option value="">Select</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: "span 1" }}>
            <div style={labelStyle}>
              <div style={labelTitle}>Github Links</div>
              <input name="githubLinks" value={form.githubLinks} onChange={handleChange} style={inputBoxStyle} />
            </div>

            <div style={labelStyle}>
              <div style={labelTitle}>Loom Link</div>
              <input name="loomLink" value={form.loomLink} onChange={handleChange} style={inputBoxStyle} />
            </div>
          </div>

          <div style={{ gridColumn: "span 1" }}>
            <div style={labelStyle}>
              <div style={labelTitle}>WhatsApp Group Link</div>
              <input name="whatsappGroupLink" value={form.whatsappGroupLink} onChange={handleChange} style={inputBoxStyle} />
            </div>
          </div>

          <div style={{ gridColumn: "span 2", textAlign: "center", marginTop: 18 }}>
            <button type="submit" style={{
              background: COLORS.accent2,
              color: "#fff",
              border: "none",
              padding: "14px 44px",
              borderRadius: 13,
              fontWeight: 800,
              fontSize: "1.08rem",
              boxShadow: "0 2px 12px #387efb13",
              cursor: "pointer"
            }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputBoxStyle = {
  borderRadius: 11,
  border: "1.5px solid #e2e4f0",
  padding: "11px 12px",
  background: "#f5f5fe",
  marginTop: 4,
  fontWeight: 500,
  fontSize: "1.06rem",
  width: "100%"
};

const labelStyle = {
  marginBottom: 12,
  display: "block"
};

const labelTitle = {
  fontWeight: 700,
  marginBottom: 6,
  color: "#333"
};
