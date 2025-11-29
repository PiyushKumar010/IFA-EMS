import React, { useState, useEffect } from "react";
import { TrendingUp, Search } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminProjectUpdatesPage() {
  const [allUpdates, setAllUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllUpdates();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUpdates(allUpdates);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allUpdates.filter(
        (update) =>
          update.clientName?.toLowerCase().includes(term) ||
          update.projectName?.toLowerCase().includes(term) ||
          update.employeeName?.toLowerCase().includes(term) ||
          update.updateText?.toLowerCase().includes(term)
      );
      setFilteredUpdates(filtered);
    }
  }, [searchTerm, allUpdates]);

  const fetchAllUpdates = async () => {
    try {
      // Fetch all projects to get progress reports
      const projectsRes = await fetch("/api/projects", {
        credentials: "include",
      });
      const projectsData = await projectsRes.json();
      const projects = projectsData.projects || [];

      // Fetch all progress reports for all projects
      const updatesPromises = projects.map(async (project) => {
        try {
          const progressRes = await fetch(`/api/progress/${project._id}`, {
            credentials: "include",
          });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            return (progressData.progress || []).map((report) => ({
              _id: report._id,
              clientName: project.clientName,
              projectName: project.projectName,
              status: project.status,
              employeeName: report.employee?.name || "Unknown",
              employeeEmail: report.employee?.email || "",
              updateText: report.text,
              date: report.date,
              vaIncharge: project.vaIncharge || "-",
              updateIncharge: project.updateIncharge || "-",
              milestoneDetails: project.milestoneDetails || "-",
            }));
          }
          return [];
        } catch (err) {
          console.error(`Error fetching progress for project ${project._id}:`, err);
          return [];
        }
      });

      const updatesArrays = await Promise.all(updatesPromises);
      const allReports = updatesArrays.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAllUpdates(allReports);
      setFilteredUpdates(allReports);
    } catch (err) {
      console.error("Error fetching updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-blue-500/20 text-blue-300";
      case "completed":
        return "bg-emerald-500/20 text-emerald-300";
      case "new":
        return "bg-slate-500/20 text-slate-300";
      default:
        return "bg-slate-500/20 text-slate-300";
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

  return (
    <div className="mx-auto w-full px-6 pb-20 pt-10 text-white">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-bold">Project Daily Updates</h1>
          <p className="mt-2 text-slate-300">
            Track all daily project updates from employees
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, project, or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-sm text-slate-300">
              Total Updates: <span className="font-bold text-white">{filteredUpdates.length}</span>
            </span>
          </div>
        </div>
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-400">
            {searchTerm ? "No updates found matching your search" : "No project updates yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="border-b border-white/20 bg-white/5">
              <tr>
                <th className="p-4 text-left font-semibold text-slate-300">Client Name</th>
                <th className="p-4 text-left font-semibold text-slate-300">Project Name</th>
                <th className="p-4 text-left font-semibold text-slate-300">Status</th>
                <th className="p-4 text-left font-semibold text-slate-300">VA Incharge</th>
                <th className="p-4 text-left font-semibold text-slate-300">Update Incharge</th>
                <th className="p-4 text-left font-semibold text-slate-300">Employee</th>
                <th className="p-4 text-left font-semibold text-slate-300">Milestone Details</th>
                <th className="p-4 text-left font-semibold text-slate-300">Date</th>
                <th className="p-4 text-left font-semibold text-slate-300">Daily Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredUpdates.map((update, idx) => (
                <tr
                  key={update._id}
                  className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                    idx % 2 === 0 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="p-4">
                    <span className="font-medium text-white">{update.clientName}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300">{update.projectName}</span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded px-2 py-1 text-xs ${getStatusColor(update.status)}`}>
                      {update.status || "New"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{update.vaIncharge}</td>
                  <td className="p-4 text-slate-300">{update.updateIncharge}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-white">{update.employeeName}</span>
                      <span className="text-xs text-slate-400">{update.employeeEmail}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs">
                    <div className="line-clamp-2">{update.milestoneDetails}</div>
                  </td>
                  <td className="p-4 text-slate-300 whitespace-nowrap">
                    {new Date(update.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-slate-300 max-w-md">
                    <div className="line-clamp-3">{update.updateText}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
