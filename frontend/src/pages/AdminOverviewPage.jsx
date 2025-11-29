


import React, { useState, useEffect } from "react";
import { Users, FolderOpen, FileText, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    todayForms: 0,
    pendingForms: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, projectsRes, formsRes] = await Promise.all([
        fetch("/api/users/employees", { credentials: "include" }),
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/daily-forms", { credentials: "include" })
      ]);

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setStats(prev => ({ ...prev, totalEmployees: data.employees?.length || 0 }));
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        const projects = data.projects || [];
        setStats(prev => ({
          ...prev,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'Active').length,
          completedProjects: projects.filter(p => p.status === 'Completed').length
        }));
      }

      if (formsRes.ok) {
        const data = await formsRes.json();
        const forms = data.forms || [];
        const today = new Date().toDateString();
        const todayForms = forms.filter(f => new Date(f.date).toDateString() === today);
        setStats(prev => ({
          ...prev,
          todayForms: todayForms.length,
          pendingForms: todayForms.filter(f => !f.adminConfirmed).length
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <PageBackground variant="indigo">
      <div className="admin-viewport text-white">
        <div className="admin-header-compact border-b border-white/10">
          <h1 className="text-xl font-bold">Overview</h1>
          <p className="text-xs text-slate-400">System statistics and summary</p>
        </div>
        
        <div className="admin-content-area p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
            {/* Employees */}
            <div className="compact-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold">Employees</h3>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalEmployees}</div>
              <p className="text-xs text-slate-400">Total registered employees</p>
            </div>

            {/* Projects */}
            <div className="compact-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-semibold">Projects</h3>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalProjects}</div>
              <p className="text-xs text-slate-400">
                {stats.activeProjects} active, {stats.completedProjects} completed
              </p>
            </div>

            {/* Daily Forms Today */}
            <div className="compact-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold">Daily Forms Today</h3>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.todayForms}</div>
              <p className="text-xs text-slate-400">
                {stats.pendingForms} pending confirmation
              </p>
            </div>

            {/* Quick Actions */}
            <div className="compact-card p-4 lg:col-span-3">
              <h3 className="text-sm font-semibold mb-3">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <a href="/admin/employees" className="btn-ghost p-3 text-center text-xs flex flex-col items-center gap-1">
                  <Users className="h-4 w-4" />
                  Employees
                </a>
                <a href="/admin/projects" className="btn-ghost p-3 text-center text-xs flex flex-col items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </a>
                <a href="/admin/daily-forms" className="btn-ghost p-3 text-center text-xs flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Daily Forms
                </a>
                <a href="/admin/reports" className="btn-ghost p-3 text-center text-xs flex flex-col items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}