import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Calendar, Search, Filter, FileText, CheckCircle, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageBackground from "../components/ui/PageBackground";

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filterText, setFilterText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/users/employees", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const generateReport = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee first");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        employeeId: selectedEmployee._id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const res = await fetch(`/api/daily-forms/reports/task-tracking?${params}`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setReportData(data.reportData || []);
      } else {
        console.error("Failed to generate report");
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert("No data to export");
      return;
    }

    // Get all unique tasks from all days
    const allTasks = new Set();
    reportData.forEach(day => {
      day.tasks.forEach(task => allTasks.add(task.taskText));
      day.customTasks.forEach(task => allTasks.add(task.taskText));
    });

    const headers = ['Date', ...Array.from(allTasks), 'Hours Attended', 'Screensharing', 'Submitted', 'Daily Report Submitted to Owner'];
    
    const csvData = reportData.map(day => {
      const row = [new Date(day.date).toLocaleDateString()];
      
      // Add task completion status for each task
      Array.from(allTasks).forEach(taskText => {
        const task = day.tasks.find(t => t.taskText === taskText) || 
                    day.customTasks.find(t => t.taskText === taskText);
        row.push(task?.employeeChecked ? '✓' : '');
      });
      
      row.push(day.hoursAttended || 0);
      row.push(day.screensharing ? '✓' : '');
      row.push(day.submitted ? '✓' : '');
      row.push(day.adminConfirmed ? '✓' : '');
      
      return row;
    });

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${selectedEmployee?.name || 'employee'}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTaskCompletionStats = () => {
    if (reportData.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    reportData.forEach(day => {
      totalTasks += day.tasks.length + day.customTasks.length;
      completedTasks += day.tasks.filter(t => t.employeeChecked).length + 
                      day.customTasks.filter(t => t.employeeChecked).length;
    });
    
    return {
      total: totalTasks,
      completed: completedTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getTaskCompletionStats();

  return (
    <PageBackground variant="slate">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-6 pb-20 pt-10 text-white">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Task Tracking Reports</h1>
              <p className="mt-2 text-slate-300">
                Generate detailed task completion reports for employees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-ghost flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              {reportData.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 glass-card p-6">
            <h2 className="mb-4 text-xl font-bold">Report Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee?._id || ""}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp._id === e.target.value);
                    setSelectedEmployee(emp || null);
                  }}
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={generateReport}
                disabled={loading || !selectedEmployee}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating Report..." : "Generate Report"}
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {reportData.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-emerald-400">{reportData.length}</div>
              <div className="text-sm text-slate-300">Total Days</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-slate-300">Total Tasks</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-slate-300">Completed Tasks</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.percentage}%</div>
              <div className="text-sm text-slate-300">Completion Rate</div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 ? (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Task Report - {selectedEmployee?.name}
              </h2>
              <div className="text-sm text-slate-300">
                {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 bg-slate-800/50 sticky left-0 z-10 min-w-[120px]">
                      Date
                    </th>
                    {/* Get all unique tasks for column headers */}
                    {(() => {
                      const allTasks = new Set();
                      reportData.forEach(day => {
                        day.tasks.forEach(task => allTasks.add(task.taskText));
                        day.customTasks.forEach(task => allTasks.add(task.taskText));
                      });
                      return Array.from(allTasks).map((taskText, idx) => (
                        <th key={idx} className="text-left p-3 min-w-[180px] text-xs">
                          {taskText}
                        </th>
                      ));
                    })()}
                    <th className="text-left p-3 min-w-[100px]">Hours</th>
                    <th className="text-left p-3 min-w-[100px]">Screensharing</th>
                    <th className="text-left p-3 min-w-[100px]">Submitted</th>
                    <th className="text-left p-3 min-w-[120px]">Admin Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((day, dayIdx) => {
                    // Get all unique tasks for this table
                    const allTasks = new Set();
                    reportData.forEach(d => {
                      d.tasks.forEach(task => allTasks.add(task.taskText));
                      d.customTasks.forEach(task => allTasks.add(task.taskText));
                    });

                    return (
                      <tr key={dayIdx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 font-medium bg-slate-800/30 sticky left-0 z-10">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        {Array.from(allTasks).map((taskText, taskIdx) => {
                          const task = day.tasks.find(t => t.taskText === taskText) || 
                                      day.customTasks.find(t => t.taskText === taskText);
                          return (
                            <td key={taskIdx} className="p-3 text-center">
                              {task?.employeeChecked ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                              ) : task ? (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center">{day.hoursAttended || 0}h</td>
                        <td className="p-3 text-center">
                          {day.screensharing ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {day.submitted ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {day.adminConfirmed ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedEmployee && !loading ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No Data Found</h3>
            <p className="text-slate-400">
              No task data found for the selected employee and date range.
            </p>
          </div>
        ) : !selectedEmployee ? (
          <div className="glass-card p-12 text-center">
            <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">Select Employee</h3>
            <p className="text-slate-400">
              Choose an employee and date range to generate a task tracking report.
            </p>
          </div>
        ) : null}
      </div>
    </PageBackground>
  );
}