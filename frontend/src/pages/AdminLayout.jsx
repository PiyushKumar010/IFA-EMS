import React, { useState } from "react";
import {
  Users,
  FolderOpen,
  FileText,
  Calendar,
  LogOut,
  Inbox,
  Code,
  MessageCircle,
  Trophy,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

const NAV_ITEMS = [
  { key: "employees", label: "Employees", icon: Users, path: "/admin/employees" },
  { key: "projects", label: "Projects", icon: FolderOpen, path: "/admin/projects" },
  { key: "dailyforms", label: "Daily Forms", icon: FileText, path: "/admin/daily-forms" },
  { key: "meetings", label: "Meetings", icon: Calendar, path: "/admin/meetings" },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/admin/leaderboard" },
  { key: "hackathon", label: "Hackathon", icon: Code, path: "/admin/hackathon" },
  { key: "messages", label: "Messages", icon: MessageCircle, path: "/admin/messages" },
  { key: "requests", label: "Requests", icon: Inbox, path: "/admin/requests" },
  { key: "reports", label: "Reports", icon: FileText, path: "/admin/reports" },
];

export default function AdminLayout({ children }) {
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    const path = window.location.pathname;
    const found = NAV_ITEMS.find((item) => path.startsWith(item.path));
    setSelected(found ? found.key : null);
  }, [window.location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    window.location.href = "/";
  };

  return (
    <PageBackground variant="violet">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#18122B] border-r border-white/10 py-8 px-4 text-white">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-2xl">IFA</div>
            <span className="font-bold text-lg tracking-wide">EMS Admin</span>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium text-base ${selected === item.key ? "bg-violet-700/80 text-white" : "text-slate-300 hover:bg-violet-700/40 hover:text-white"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-10 flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-transparent min-h-screen">
          {children}
        </main>
      </div>
    </PageBackground>
  );
}
