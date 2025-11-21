import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Clock,
  ShieldCheck,
  BriefcaseBusiness,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function HomePage() {
  const navigate = useNavigate();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const gotoRole = (role) => {
    if (role === "employee") {
      setShowEmployeeModal(true);
      return;
    }
    navigate("/verify", { state: { role } });
  };

  const handleEmployeeRoleSelect = (employeeType) => {
    setShowEmployeeModal(false);
    navigate("/verify", { state: { role: "employee", employeeType } });
  };

  const roles = [
    {
      id: "admin",
      title: "Administrator",
      description: "Full system access with project and team management capabilities",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "indigo",
      features: ["Manage Projects", "Team Oversight", "System Settings"],
    },
    {
      id: "employee",
      title: "Team Member",
      description: "Access to assigned tasks, projects, and collaboration tools",
      icon: <Users className="w-8 h-8" />,
      color: "emerald",
      features: ["Task Management", "Time Tracking", "Team Chat"],
    },
    {
      id: "client",
      title: "Client",
      description: "View project progress, deliverables, and communicate with team",
      icon: <BriefcaseBusiness className="w-8 h-8" />,
      color: "cyan",
      features: ["Project Updates", "File Access", "Direct Communication"],
    },
  ];

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Navigation */}
        <nav className="mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EMS</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-white md:text-6xl">
            Employee Monitoring System
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-300">
            Choose your role to access your personalized dashboard and start
            collaborating with your team
          </p>
        </div>

        {/* Role Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="glass-card group relative cursor-pointer p-8 transition-all hover:scale-105 hover:border-white/20"
              onClick={() => gotoRole(role.id)}
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl transition-colors ${
                  role.color === "indigo"
                    ? "bg-indigo-500/10 group-hover:bg-indigo-500/20"
                    : role.color === "emerald"
                    ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                    : "bg-cyan-500/10 group-hover:bg-cyan-500/20"
                }`}
              >
                <div
                  className={
                    role.color === "indigo"
                      ? "text-indigo-400"
                      : role.color === "emerald"
                      ? "text-emerald-400"
                      : "text-cyan-400"
                  }
                >
                  {role.icon}
                </div>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-white">{role.title}</h3>
              <p className="mb-6 text-slate-300">{role.description}</p>

              <div className="mb-6 space-y-2">
                {role.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                className={`btn-primary flex w-full items-center justify-center gap-2 bg-gradient-to-r ${
                  role.color === "indigo" 
                    ? "from-indigo-500 via-purple-500 to-indigo-600"
                    : role.color === "emerald"
                    ? "from-emerald-500 via-teal-500 to-emerald-600"
                    : "from-cyan-500 via-blue-500 to-cyan-600"
                }`}
              >
                Access Dashboard
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Real-time Analytics</h3>
            <p className="text-sm text-slate-300">
              Track progress and performance metrics in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Team Collaboration</h3>
            <p className="text-sm text-slate-300">
              Work together seamlessly with integrated tools
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
              <Clock className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Time Management</h3>
            <p className="text-sm text-slate-300">
              Stay on schedule with smart deadline tracking
            </p>
          </div>
        </div>
      </div>

      {/* Employee Role Selection Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl mx-6 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Select Employee Type</h2>
            <p className="text-slate-300 mb-8">Choose your role to access the appropriate dashboard and features.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regular Employee */}
              <div 
                className="glass-card group cursor-pointer p-6 transition-all hover:scale-105 hover:border-white/20"
                onClick={() => handleEmployeeRoleSelect("employee")}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Employee</h3>
                <p className="text-sm text-slate-300 mb-4">Regular team member with full access to projects, tasks, and collaboration tools.</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Requires admin approval</li>
                  <li>• Full project access</li>
                  <li>• Task management & tracking</li>
                </ul>
              </div>
              
              {/* Hackathon Applicant */}
              <div 
                className="glass-card group cursor-pointer p-6 transition-all hover:scale-105 hover:border-white/20"
                onClick={() => handleEmployeeRoleSelect("hackathon-applicant")}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Hackathon Applicant</h3>
                <p className="text-sm text-slate-300 mb-4">Apply for hackathon participation with streamlined onboarding process.</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Instant access</li>
                  <li>• Application dashboard</li>
                  <li>• Event-specific features</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                onClick={() => setShowEmployeeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageBackground>
  );
}
