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
      <div className="admin-viewport text-white">
        <header className="admin-header-compact flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Reports</h1>
              <p className="text-xs text-slate-400">Task tracking reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-ghost flex items-center gap-1 px-2 py-1 text-xs"
            >
              <Filter className="h-3 w-3" />
              Filters
            </button>
            {reportData.length > 0 && (
              <button
                onClick={exportToCSV}
                className="btn-primary flex items-center gap-1 px-2 py-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Export
              </button>
            )}
          </div>
        </header>

        <div className="admin-content-area">
            {/* Filters */}
            {showFilters && (
              <div className="compact-card p-3 mb-3">
                <h2 className="mb-2 text-sm font-bold">Filters</h2>
                <div className="grid grid-cols-3 gap-2">
                  {/* Employee Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployee?._id || ""}
                      onChange={(e) => {
                        const emp = employees.find(emp => emp._id === e.target.value);
                        setSelectedEmployee(emp || null);
                      }}
                      className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none"
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={generateReport}
                    disabled={loading || !selectedEmployee}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Generating Report..." : "Generate Report"}
                  </button>
                </div>
              </div>
            )}

            {/* Report Table */}
            {reportData.length > 0 ? (
              <div className="compact-card" style={{height: showFilters ? 'calc(100% - 180px)' : '100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">
                      {selectedEmployee?.name} - {stats.completed}/{stats.total} ({stats.percentage}%)
                    </h2>
                    <div className="text-xs text-slate-400">
                      {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{flex: 1, overflow: 'auto'}}>
                  <table className="text-xs text-white" style={{borderCollapse: 'collapse', minWidth: '1800px'}}>
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 bg-slate-800/80 sticky left-0 z-10 min-w-[100px]">
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
                            <th key={idx} className="text-left p-2 min-w-[150px]">
                              {taskText}
                            </th>
                          ));
                        })()}
                        <th className="text-left p-2 min-w-[60px]">Hrs</th>
                        <th className="text-left p-2 min-w-[60px]">Screen</th>
                        <th className="text-left p-2 min-w-[70px]">Submit</th>
                        <th className="text-left p-2 min-w-[80px]">Confirm</th>
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
                            <td className="p-2 font-medium bg-slate-800/50 sticky left-0 z-10">
                              {new Date(day.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                            </td>
                            {Array.from(allTasks).map((taskText, taskIdx) => {
                              const task = day.tasks.find(t => t.taskText === taskText) || 
                                          day.customTasks.find(t => t.taskText === taskText);
                              return (
                                <td key={taskIdx} className="p-2 text-center">
                                  {task?.employeeChecked ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" />
                                  ) : task ? (
                                    <X className="h-3 w-3 text-red-400 mx-auto" />
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-2 text-center">{day.hoursAttended || 0}</td>
                            <td className="p-2 text-center">
                              {day.screensharing ? (
                                <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" />
                              ) : (
                                <X className="h-3 w-3 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {day.submitted ? (
                                <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" />
                              ) : (
                                <X className="h-3 w-3 text-red-400 mx-auto" />
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {day.adminConfirmed ? (
                                <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto" />
                              ) : (
                                <X className="h-3 w-3 text-slate-500 mx-auto" />
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
              <div className="compact-card p-6 text-center flex-1 flex items-center justify-center flex-col">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-slate-300 mb-1">No Data Found</h3>
                <p className="text-xs text-slate-400">
                  No task data found for the selected employee and date range.
                </p>
              </div>
            ) : !selectedEmployee ? (
              <div className="compact-card p-6 text-center" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-slate-300 mb-1">Select Employee</h3>
                <p className="text-xs text-slate-400">
                  Choose an employee and date range to generate a task tracking report.
                </p>
              </div>
            ) : null}
        </div>
      </div>
    </PageBackground>
  );
}