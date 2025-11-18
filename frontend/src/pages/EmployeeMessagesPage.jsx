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

export default function EmployeeMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/messages/employee/chat", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const res = await fetch("/api/messages/employee/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: newMessage }),
    });
    setSending(false);
    if (res.ok) {
      setNewMessage("");
      // Refresh chat
      fetch("/api/messages/employee/chat", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []));
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: EMS_BG, fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}>
      <div style={{ height: 75, background: "#fff", borderBottom: `1.5px solid ${BORDER}`,
        display: "flex", alignItems: "center", padding: "0 55px", fontSize: "2.17rem", fontWeight: 900, color: COLORS.accent }}>
        Admin Messages
      </div>
      <div style={{ maxWidth: 900, margin: "44px auto", padding: "0 22px" }}>
        <div style={{ fontWeight: 800, fontSize: "1.45rem", color: COLORS.accent2, marginBottom: "2.3rem" }}>
          Chat with Admin
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 38 }}>
          {messages.length === 0 && (
            <div style={{ fontSize: "1.2rem", color: COLORS.faded, fontWeight: 700, padding: 32, background: "#f6f9fdcc", borderRadius: 14, textAlign: "center" }}>
              No messages yet.
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg._id} style={{ background: CARD, borderRadius: 14, boxShadow: "0 2px 8px #d2d3f621", padding: "18px 22px", border: `1px solid ${BORDER}` }}>
              <div style={{ fontWeight: 700, color: COLORS.accent2, marginBottom: 6 }}>
                {msg.sender?.roles?.includes("admin") ? `${msg.sender?.name || "Admin"} (Admin)` : `${msg.sender?.name || "You"}`}
              </div>
              <div style={{ color: "#333", fontSize: "1.09rem", marginBottom: 4 }}>{msg.content}</div>
              <div style={{ color: COLORS.faded, fontSize: ".97rem" }}>{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.2rem", color: COLORS.accent, marginBottom: 12 }}>Send a message to Admin</div>
        <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} style={{ width: "100%", borderRadius: 10, border: `1.5px solid ${BORDER}`, padding: 14, fontSize: "1.09rem", marginBottom: 12 }} placeholder="Type your message here..." />
        <button onClick={sendMessage} disabled={sending} style={{ background: COLORS.accent2, color: "#fff", fontWeight: 800, border: "none", borderRadius: 9, padding: "10px 36px", fontSize: "1.07rem", cursor: "pointer", boxShadow: "0 2px 11px #23e09728", opacity: sending ? 0.7 : 1 }}>
          {sending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
}
