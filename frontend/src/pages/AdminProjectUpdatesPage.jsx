import React, { useState, useEffect } from "react";
import { TrendingUp, Search } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminProjectUpdatesPage() {
  const [projectRows, setProjectRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateColumns, setDateColumns] = useState([]);

  useEffect(() => {
    fetchAllUpdates();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRows(projectRows);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = projectRows.filter(
        (row) =>
          row.clientName?.toLowerCase().includes(term) ||
          row.projectName?.toLowerCase().includes(term) ||
          row.vaIncharge?.toLowerCase().includes(term) ||
          row.updateIncharge?.toLowerCase().includes(term)
      );
      setFilteredRows(filtered);
    }
  }, [searchTerm, projectRows]);

  const fetchAllUpdates = async () => {
    try {
      // Fetch all projects to get progress reports
      const projectsRes = await fetch("/api/projects", {
        credentials: "include",
      });
      const projectsData = await projectsRes.json();
      const projects = projectsData.projects || [];

      // Fetch all progress reports for all projects
      const projectDataPromises = projects.map(async (project) => {
        try {
          const progressRes = await fetch(`/api/progress/${project._id}`, {
            credentials: "include",
          });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const reports = progressData.progress || [];
            
            return {
              projectId: project._id,
              clientName: project.clientName,
              projectName: project.projectName,
              status: project.status,
              vaIncharge: project.vaIncharge || "-",
              updateIncharge: project.updateIncharge || "-",
              projectDeadline: project.projectDeadline || "-",
              milestoneDeadline: project.milestoneDeadline || "-",
              telegramGroupUpdate: project.telegramGroupUpdate || "-",
              milestoneDetails: project.milestoneDetails || "-",
              reports: reports,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching progress for project ${project._id}:`, err);
          return null;
        }
      });

      const projectData = (await Promise.all(projectDataPromises)).filter(Boolean);
      
      // Get all unique dates from all reports
      const allDates = new Set();
      projectData.forEach((proj) => {
        proj.reports.forEach((report) => {
          const dateKey = new Date(report.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          });
          allDates.add(dateKey);
        });
      });
      
      // Sort dates
      const sortedDates = Array.from(allDates).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
      });
      
      setDateColumns(sortedDates);
      
      // Create rows with updates organized by date
      const rows = projectData.map((proj) => {
        const updatesByDate = {};
        proj.reports.forEach((report) => {
          const dateKey = new Date(report.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          });
          if (!updatesByDate[dateKey]) {
            updatesByDate[dateKey] = [];
          }
          updatesByDate[dateKey].push({
            text: report.text,
            employee: report.employee?.name || "Unknown",
          });
        });
        
        return {
          ...proj,
          updatesByDate,
        };
      });
      
      setProjectRows(rows);
      setFilteredRows(rows);
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
          <div className="flex flex-col items-center gap-4">
            <div className="loader"></div>
            <style jsx>{`
              .loader {
                display: inline-flex;
                gap: 10px;
              }
              .loader:before,
              .loader:after {
                content: "";
                height: 20px;
                aspect-ratio: 1;
                border-radius: 50%;
                background:
                  radial-gradient(farthest-side, #8b5cf6 95%, #0000) 35% 35%/6px 6px no-repeat
                  #fff;
                transform: scaleX(var(--s, 1)) rotate(0deg);
                animation: l6 1s infinite linear;
              }
              .loader:after {
                --s: -1;
                animation-delay: -0.1s;
              }
              @keyframes l6 {
                100% {
                  transform: scaleX(var(--s, 1)) rotate(360deg);
                }
              }
            `}</style>
          </div>
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
            Track all daily project updates organized by date
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, project, or incharge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-sm text-slate-300">
              Total Projects: <span className="font-bold text-white">{filteredRows.length}</span>
            </span>
          </div>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-400">
            {searchTerm ? "No projects found matching your search" : "No project updates yet"}
          </p>
        </div>
      ) : (
        <div 
          className="overflow-x-auto overflow-y-auto rounded-[32px] border border-white/10 bg-white/5" 
          style={{ maxHeight: "calc(100vh - 300px)", maxWidth: "calc(100vw - 350px)" }}
        >
          <table className="w-full text-sm" style={{ minWidth: "2000px" }}>
            <thead className="border-b border-white/20 bg-slate-800 sticky top-0 z-20">
              <tr>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10 sticky left-0 bg-slate-800 z-30" style={{ width: "180px" }}>
                  Client Name
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "100px" }}>
                  Status
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "120px" }}>
                  VA Incharge
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "140px" }}>
                  Update Incharge
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "130px" }}>
                  Project Deadline
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "140px" }}>
                  Milestone Deadline
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "170px" }}>
                  Telegram Group Update
                </th>
                <th className="p-3 text-left font-semibold text-slate-300 border-r border-white/10" style={{ width: "200px" }}>
                  Milestone Details
                </th>
                {dateColumns.map((date) => (
                  <th
                    key={date}
                    className="p-3 text-left font-semibold text-slate-300 border-r border-white/10"
                    style={{ width: "250px" }}
                  >
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.projectId}
                  className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                    idx % 2 === 0 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="p-3 border-r border-white/10 sticky left-0 bg-slate-800 z-10">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{row.clientName}</span>
                      <span className="text-xs text-slate-400">{row.projectName}</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-white/10">
                    <span className={`rounded px-2 py-1 text-xs ${getStatusColor(row.status)}`}>
                      {row.status || "New"}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 border-r border-white/10">{row.vaIncharge}</td>
                  <td className="p-3 text-slate-300 border-r border-white/10">{row.updateIncharge}</td>
                  <td className="p-3 text-slate-300 border-r border-white/10">
                    {row.projectDeadline !== "-" 
                      ? new Date(row.projectDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "-"}
                  </td>
                  <td className="p-3 text-slate-300 border-r border-white/10">
                    {row.milestoneDeadline !== "-"
                      ? new Date(row.milestoneDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "-"}
                  </td>
                  <td className="p-3 text-slate-300 border-r border-white/10">{row.telegramGroupUpdate}</td>
                  <td className="p-3 text-slate-300 border-r border-white/10">
                    <div className="line-clamp-2">{row.milestoneDetails}</div>
                  </td>
                  {dateColumns.map((date) => (
                    <td key={date} className="p-3 text-slate-300 border-r border-white/10 align-top">
                      {row.updatesByDate[date] && row.updatesByDate[date].length > 0 ? (
                        <div className="space-y-2">
                          {row.updatesByDate[date].map((update, updateIdx) => (
                            <div key={updateIdx} className="text-xs">
                              <div className="font-semibold text-indigo-300 mb-1">{update.employee}:</div>
                              <div className="text-slate-300">{update.text}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
