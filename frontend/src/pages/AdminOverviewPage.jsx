

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
import AdminEmployeesPage from "./AdminEmployeesPage";
import AdminProjectsPage from "./AdminPage";
import AdminDailyFormsPage from "./AdminDailyFormsPage";
import AdminMeetingsPage from "./AdminMeetingsPage";
import AdminRequestsPage from "./AdminRequestsPage";
import AdminReportsPage from "./AdminReportsPage";
import AdminHackathonPage from "./AdminHackathonPage";
import AdminMessagesPage from "./AdminMessagesPage";
import LeaderboardPage from "./LeaderboardPage";

const NAV_ITEMS = [
  { key: "employees", label: "Employees", icon: Users },
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "dailyforms", label: "Daily Forms", icon: FileText },
  { key: "meetings", label: "Meetings", icon: Calendar },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "hackathon", label: "Hackathon", icon: Code },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "requests", label: "Requests", icon: Inbox },
  { key: "reports", label: "Reports", icon: FileText },
];

const PAGE_COMPONENTS = {
  employees: AdminEmployeesPage,
  projects: AdminProjectsPage,
  dailyforms: AdminDailyFormsPage,
  meetings: AdminMeetingsPage,
  leaderboard: LeaderboardPage,
  hackathon: AdminHackathonPage,
  messages: AdminMessagesPage,
  requests: AdminRequestsPage,
  reports: AdminReportsPage,
};

export default function AdminOverviewPage() {
  const [selected, setSelected] = useState("employees");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    window.location.href = "/";
  };

  const SelectedPage = PAGE_COMPONENTS[selected] || (() => <div className="p-8">Page not found</div>);

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
              <button
                key={item.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium text-base ${selected === item.key ? "bg-violet-700/80 text-white" : "text-slate-300 hover:bg-violet-700/40 hover:text-white"}`}
                onClick={() => setSelected(item.key)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
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
          <SelectedPage />
        </main>
      </div>
    </PageBackground>
  );
}