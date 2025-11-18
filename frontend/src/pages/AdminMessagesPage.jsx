import React, { useState, useEffect } from "react";
const EMS_BG = "linear-gradient(120deg,#ede7fe 0%, #f6f7fa 57%, #e8e9ff 100%)";
const CARD = "rgba(255,255,255,0.98)";
const BORDER = "#e4e1f8";
const COLORS = {
  accent: "#7659e7",
  accent2: "#26a9e0",
  success: "#12b48b",
  reject: "#e26c5c",
  faded: "#8577bc",
  pending: "#dbad4c",
};

export default function AdminMessagesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [multiSelected, setMultiSelected] = useState([]);
  const [multiMessage, setMultiMessage] = useState("");
  const handleMultiSelect = (id) => {
    setMultiSelected(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };

  const sendMultiMessage = async () => {
    if (!multiMessage.trim() || multiSelected.length === 0) return;
    setSending(true);
    const res = await fetch("/api/messages/admin/send-multi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: multiMessage, employeeIds: multiSelected }),
    });
    setSending(false);
    if (res.ok) {
      setMultiMessage("");
      setMultiSelected([]);
      alert("Message sent to selected employees!");
    } else {
      alert("Failed to send message.");
    }
  };

  useEffect(() => {
    fetch("/api/messages/employees", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []));
  }, []);

  const fetchChat = async (employeeId) => {
    const res = await fetch(`/api/messages/admin/chat/${employeeId}`, { credentials: "include" });
    const data = await res.json();
    setChatMessages(data.messages || []);
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    fetchChat(employee._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedEmployee) return;
    setSending(true);
    const res = await fetch("/api/messages/admin/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: newMessage, employeeId: selectedEmployee._id }),
    });
    setSending(false);
    if (res.ok) {
      setNewMessage("");
      fetchChat(selectedEmployee._id);
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: EMS_BG, fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}>
      <div style={{ height: 75, background: "#fff", borderBottom: `1.5px solid ${BORDER}`,
        display: "flex", alignItems: "center", padding: "0 55px", fontSize: "2.17rem", fontWeight: 900, color: COLORS.accent }}>
        Employee Messaging
      </div>
      <div style={{ maxWidth: 1100, margin: "44px auto", padding: "0 22px" }}>
        <div style={{ fontWeight: 800, fontSize: "1.45rem", color: COLORS.accent2, marginBottom: "2.3rem" }}>
          All Employees
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: 38 }}>
          {employees.map(emp => (
            <div key={emp._id} style={{ background: CARD, borderRadius: 14, boxShadow: "0 2px 8px #d2d3f621", padding: "14px 18px", border: `1px solid ${BORDER}`, minWidth: 220, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", outline: selectedEmployee?._id === emp._id ? `2px solid ${COLORS.accent2}` : "none" }}>
              <input type="checkbox" checked={multiSelected.includes(emp._id)} onChange={() => handleMultiSelect(emp._id)} style={{ marginRight: 8 }} />
              <div onClick={() => handleSelectEmployee(emp)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={emp.picture || "https://via.placeholder.com/38?text=User"} alt={emp.name || "User"} style={{ width: 38, height: 38, borderRadius: "50%", marginRight: 8, objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.accent2 }}>{emp.name || "Unnamed"}</div>
                  <div style={{ color: "#666", fontSize: ".97rem" }}>{emp.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 800, fontSize: "1.2rem", color: COLORS.accent, marginBottom: 12 }}>Send message to selected employees</div>
          <textarea value={multiMessage} onChange={e => setMultiMessage(e.target.value)} rows={3} style={{ width: "100%", borderRadius: 10, border: `1.5px solid ${BORDER}`, padding: 14, fontSize: "1.09rem", marginBottom: 12 }} placeholder="Type your message here..." />
          <button onClick={sendMultiMessage} disabled={sending || multiSelected.length === 0} style={{ background: COLORS.accent2, color: "#fff", fontWeight: 800, border: "none", borderRadius: 9, padding: "10px 36px", fontSize: "1.07rem", cursor: multiSelected.length === 0 ? "not-allowed" : "pointer", boxShadow: "0 2px 11px #23e09728", opacity: sending ? 0.7 : 1 }}>
            {sending ? "Sending..." : "Send to Selected"}
          </button>
        </div>
        {selectedEmployee && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: COLORS.accent, marginBottom: 12 }}>Chat with {selectedEmployee.name || selectedEmployee.email}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 18 }}>
              {chatMessages.length === 0 && (
                <div style={{ fontSize: "1.2rem", color: COLORS.faded, fontWeight: 700, padding: 32, background: "#f6f9fdcc", borderRadius: 14, textAlign: "center" }}>
                  No messages yet.
                </div>
              )}
              {chatMessages.map((msg) => (
                <div key={msg._id} style={{ background: CARD, borderRadius: 14, boxShadow: "0 2px 8px #d2d3f621", padding: "18px 22px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontWeight: 700, color: COLORS.accent2, marginBottom: 6 }}>
                    {msg.sender?.roles?.includes("admin") ? `${msg.sender?.name || "You"} (Admin)` : `${msg.sender?.name || "Employee"}`}
                  </div>
                  <div style={{ color: "#333", fontSize: "1.09rem", marginBottom: 4 }}>{msg.content}</div>
                  <div style={{ color: COLORS.faded, fontSize: ".97rem" }}>{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={3} style={{ width: "100%", borderRadius: 10, border: `1.5px solid ${BORDER}`, padding: 14, fontSize: "1.09rem", marginBottom: 12 }} placeholder="Type your message here..." />
            <button onClick={sendMessage} disabled={sending} style={{ background: COLORS.accent2, color: "#fff", fontWeight: 800, border: "none", borderRadius: 9, padding: "10px 36px", fontSize: "1.07rem", cursor: "pointer", boxShadow: "0 2px 11px #23e09728", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
