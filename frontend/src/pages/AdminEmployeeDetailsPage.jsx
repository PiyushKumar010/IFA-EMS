import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserCircle2,
  FolderOpen,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Edit,
  Save,
  Plus,
  X,
  TrendingUp,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminEmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch employee info
      const empRes = await fetch("/api/users/employees", {
        credentials: "include",
      });
      const empData = await empRes.json();
      const foundEmployee = empData.employees?.find((e) => e._id === id);
      setEmployee(foundEmployee);

      // Fetch employee projects
      const projRes = await fetch(`/api/projects/employee/${id}`, {
        credentials: "include",
      });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
      }

      // Fetch employee progress reports
      const progressRes = await fetch(`/api/progress/employee/${id}`, {
        credentials: "include",
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgressReports(progressData.progress || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          Loading...
        </div>
      </PageBackground>
    );
  }

  if (!employee) {
    return (
      <PageBackground variant="violet">
        <div className="flex min-h-screen items-center justify-center text-white">
          Employee not found
        </div>
      </PageBackground>
    );
  }



  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/admin/employees")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
                <UserCircle2 className="h-8 w-8 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {employee.name || "Unnamed Employee"}
                </h1>
                <p className="text-slate-300">{employee.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => navigate("/admin/messages")}
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>
        </header>

        {/* Projects & Daily Updates Table */}
        <div className="mb-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-300" />
            <h2 className="text-xl font-semibold text-white">Projects & Daily Updates</h2>
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              {progressReports.length} updates
            </span>
          </div>
          
          {progressReports.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No project updates yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 font-semibold text-slate-300">Date</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Project Name</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Client Name</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Role</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Status</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Priority</th>
                    <th className="text-left p-3 font-semibold text-slate-300">Daily Project Update</th>
                  </tr>
                </thead>
                <tbody>
                  {progressReports
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((report) => {
                      const project = report.project;
                      const isAssignee = project?.assignees?.some(a => a._id === id || a === id);
                      const isLeadAssignee = project?.leadAssignee?._id === id || project?.leadAssignee === id;
                      
                      let role = "";
                      if (isLeadAssignee && isAssignee) {
                        role = "Lead & Team Member";
                      } else if (isLeadAssignee) {
                        role = "Lead Assignee";
                      } else if (isAssignee) {
                        role = "Team Member";
                      } else {
                        role = "Team Member";
                      }
                      
                      return (
                        <tr 
                          key={report._id} 
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3 text-slate-300 whitespace-nowrap">
                            {new Date(report.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-white">
                              {project?.projectName || "Unknown Project"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            {project?.clientName || "-"}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              isLeadAssignee 
                                ? "bg-purple-500/20 text-purple-300" 
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project?.status === "Active"
                                ? "bg-blue-500/20 text-blue-300"
                                : project?.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}>
                              {project?.status || "New"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project?.priority === "High" || project?.priority === "high"
                                ? "bg-red-500/20 text-red-300"
                                : project?.priority === "Medium" || project?.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                            }`}>
                              {project?.priority || "Normal"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-md">
                            <p className="line-clamp-2">{report.text}</p>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}
