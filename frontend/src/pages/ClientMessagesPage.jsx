import React, { useState, useEffect, useCallback } from "react";
import { MessageSquareText, Send } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function ClientMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(() => {
    fetch("/api/messages/client/chat", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const res = await fetch("/api/messages/client/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: newMessage }),
    });
    setSending(false);
    if (res.ok) {
      setNewMessage("");
      loadMessages();
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <PageBackground variant="cyan">
      <div className="mx-auto min-h-screen w-full max-w-3xl px-6 pb-20 pt-10 text-white">
        <header className="glass-panel rounded-[32px] px-7 py-8">
          <p className="text-xs uppercase tracking-[0.6em] text-cyan-100/80">
            Communication
          </p>
          <h1 className="mt-2 text-4xl font-bold">Admin Messages</h1>
          <p className="text-sm text-slate-200">
            Direct communication with admin for project updates and inquiries.
          </p>
        </header>

        <section className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-slate-300">
            <MessageSquareText className="h-5 w-5" />
            Conversation
          </div>

          <div className="mb-6 flex max-h-[500px] flex-col gap-4 overflow-y-auto pr-2">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-300">
                No messages yet. Start a conversation with admin.
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`rounded-2xl px-5 py-4 text-sm ${
                  msg.sender?.roles?.includes("admin")
                    ? "self-start border border-cyan-300/40 bg-cyan-500/20 text-white"
                    : "self-end border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
                  {msg.sender?.roles?.includes("admin")
                    ? "Admin"
                    : msg.sender?.name || "You"}
                </p>
                <p className="mt-2 text-base">{msg.content}</p>
                <p className="mt-2 text-[11px] text-slate-300">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="input-field flex-1 bg-white/10"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="btn-primary flex items-center justify-center gap-2 md:min-w-[160px] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </div>
    </PageBackground>
  );
}

