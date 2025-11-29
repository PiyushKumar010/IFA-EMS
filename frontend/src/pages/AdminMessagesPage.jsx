import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Users } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminMessagesPage() {
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("employees"); // "employees" or "clients"
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [multiSelected, setMultiSelected] = useState([]);
  const [multiMessage, setMultiMessage] = useState("");

  useEffect(() => {
    fetch("/api/messages/employees", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []));
    
    fetch("/api/messages/clients", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []));
  }, []);

  const handleMultiSelect = (id) => {
    setMultiSelected((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id],
    );
  };

  const fetchChat = useCallback(async (employeeId) => {
    const res = await fetch(`/api/messages/admin/chat/${employeeId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setChatMessages(data.messages || []);
  }, []);

  const fetchClientChat = useCallback(async (clientId) => {
    const res = await fetch(`/api/messages/admin/client-chat/${clientId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setChatMessages(data.messages || []);
  }, []);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSelectedClient(null);
    fetchChat(employee._id);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSelectedEmployee(null);
    fetchClientChat(client._id);
  };

  useEffect(() => {
    if (!selectedEmployee) return;
    const interval = setInterval(() => {
      fetchChat(selectedEmployee._id);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedEmployee?._id, fetchChat]);

  useEffect(() => {
    if (!selectedClient) return;
    const interval = setInterval(() => {
      fetchClientChat(selectedClient._id);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedClient?._id, fetchClientChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || (!selectedEmployee && !selectedClient)) return;
    setSending(true);
    let res;
    if (selectedEmployee) {
      res = await fetch("/api/messages/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: newMessage,
          employeeId: selectedEmployee._id,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchChat(selectedEmployee._id);
      }
    } else if (selectedClient) {
      res = await fetch("/api/messages/admin/send-to-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: newMessage,
          clientId: selectedClient._id,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchClientChat(selectedClient._id);
      }
    }
    setSending(false);
    if (!res || !res.ok) {
      alert("Failed to send message.");
    }
  };

  const sendMultiMessage = async () => {
    if (!multiMessage.trim() || multiSelected.length === 0) return;
    setSending(true);
    const res = await fetch("/api/messages/admin/send-multi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content: multiMessage,
        employeeIds: multiSelected,
      }),
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

  return (
    <PageBackground variant="violet">
      <div className="admin-viewport text-white">
        <header className="admin-header-compact border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="text-xs text-slate-400">Chat with employees and clients</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 px-4 pt-2">
          <button
            onClick={() => {
              setActiveTab("employees");
              setSelectedEmployee(null);
              setSelectedClient(null);
              setChatMessages([]);
            }}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "employees"
                ? "border-b-2 border-indigo-400 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => {
              setActiveTab("clients");
              setSelectedEmployee(null);
              setSelectedClient(null);
              setChatMessages([]);
            }}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "clients"
                ? "border-b-2 border-indigo-400 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Clients
          </button>
        </div>

        <div className="admin-content-area">
          <div className="flex gap-4 h-full">
          <aside className="w-80 flex-shrink-0 rounded-[28px] border border-white/10 bg-white/5 p-5 overflow-y-auto">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-slate-400">
              <Users className="h-4 w-4" />
              {activeTab === "employees" ? "Employees" : "Clients"}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {activeTab === "employees" ? (
                employees.map((emp) => (
                <label
                  key={emp._id}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selectedEmployee?._id === emp._id
                      ? "border-indigo-300 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex flex-1 cursor-pointer flex-col"
                      onClick={() => handleSelectEmployee(emp)}
                    >
                      <span className="font-semibold text-white">
                        {emp.name || "Unnamed"}
                      </span>
                      <span className="text-xs text-slate-300">
                        {emp.email}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={multiSelected.includes(emp._id)}
                      onChange={() => handleMultiSelect(emp._id)}
                      className="h-4 w-4 accent-indigo-400"
                    />
                  </div>
                </label>
              ))
              ) : (
                clients.map((client) => (
                  <label
                    key={client._id}
                    className={`rounded-2xl border px-4 py-3 text-left transition cursor-pointer ${
                      selectedClient?._id === client._id
                        ? "border-indigo-300 bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">
                        {client.name || "Unnamed Client"}
                      </span>
                      <span className="text-xs text-slate-300">
                        {client.email}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </aside>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {activeTab === "employees" && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-slate-300">
                  <MessageCircle className="h-5 w-5" />
                  Broadcast
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Select multiple employees on the left to send this message.
                </p>
                <textarea
                  rows={3}
                  value={multiMessage}
                  onChange={(e) => setMultiMessage(e.target.value)}
                  className="input-field mt-4 bg-white/10"
                  placeholder="Type announcement..."
                />
                <button
                  onClick={sendMultiMessage}
                  disabled={sending || multiSelected.length === 0}
                  className="btn-primary mt-4 inline-flex w-full justify-center disabled:opacity-60 md:w-auto"
                >
                  {sending ? "Sending..." : "Send to selected"}
                </button>
              </section>
            )}

            {(selectedEmployee || selectedClient) ? (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      Direct chat
                    </p>
                    <h2 className="text-2xl font-semibold text-white">
                      {selectedEmployee?.name || selectedEmployee?.email || selectedClient?.name || selectedClient?.email}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
                    {chatMessages.length} messages
                  </span>
                </div>

                <div className="mt-6 flex max-h-[300px] flex-col gap-4 overflow-y-auto pr-2">
                  {chatMessages.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-300">
                      No messages yet.
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`rounded-2xl px-5 py-4 text-sm ${
                        msg.sender?.roles?.includes("admin")
                          ? "self-end border border-indigo-300/40 bg-indigo-500/20 text-white"
                          : "self-start border border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
                        {msg.sender?.roles?.includes("admin")
                          ? "You"
                          : msg.sender?.name || (activeTab === "employees" ? "Employee" : "Client")}
                      </p>
                      <p className="mt-2 text-base">{msg.content}</p>
                      <p className="mt-2 text-[11px] text-slate-300">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                  <textarea
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="input-field flex-1 bg-white/10"
                    placeholder="Reply..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className="btn-primary flex items-center justify-center gap-2 md:min-w-[160px]"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-[32px] border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-300">
                Select an {activeTab === "employees" ? "employee" : "client"} to open their conversation timeline.
              </section>
            )}
          </div>
        </div>
      </div>
      </div>
    </PageBackground>
  );
}
