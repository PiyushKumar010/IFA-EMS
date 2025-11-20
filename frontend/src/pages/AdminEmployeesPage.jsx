import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Search, UserCircle2, MoreVertical, Ban, X } from "lucide-react";
import PageBackground from "../components/ui/PageBackground";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/users/employees", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []));
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query)
    );
  });

  const handleSuspend = async (employeeId, employeeName) => {
    if (!confirm(`Are you sure you want to suspend ${employeeName || "this employee"}? They will need to request approval again to access the system.`)) {
      return;
    }

    setSuspending(true);
    try {
      const res = await fetch(`/api/requests/suspend/${employeeId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        // Update local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeId ? { ...emp, status: "pending" } : emp
          )
        );
        setShowMenu(null);
        setShowSuspendConfirm(null);
        alert("Employee suspended successfully. They will need approval to access the system again.");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to suspend employee");
      }
    } catch (err) {
      console.error("Error suspending employee:", err);
      alert("Failed to suspend employee");
    } finally {
      setSuspending(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(".menu-container")) {
        setShowMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <PageBackground variant="violet">
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-20 pt-10 text-white">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300">
              Team management
            </p>
            <h1 className="mt-2 text-4xl font-bold">Approved Employees</h1>
            <p className="text-sm text-slate-300">
              View and manage your team members
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="input-field w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="rounded-[32px] border border-white/10 bg-white/5">
          <div className="divide-y divide-white/10">
            {filteredEmployees.length === 0 ? (
              <div className="p-10 text-center text-slate-300">
                {employees.length === 0
                  ? "No approved employees yet."
                  : "No employees match your search."}
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee._id}
                  className="relative p-6 transition-colors hover:bg-white/5"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/admin/employee/${employee._id}`)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20">
                      <UserCircle2 className="h-6 w-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {employee.name || "Unnamed Employee"}
                      </h3>
                      <p className="text-sm text-slate-300">{employee.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                        Approved
                      </span>
                      <div className="menu-container relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === employee._id ? null : employee._id);
                          }}
                          className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-slate-400" />
                        </button>
                        {showMenu === employee._id && (
                          <div className="absolute right-0 top-full mt-2 z-10 w-48 rounded-lg border border-white/10 bg-white/10 backdrop-blur-md shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSuspendConfirm(employee._id);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/20 transition-colors rounded-lg"
                            >
                              <Ban className="h-4 w-4" />
                              Suspend Access
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suspend Confirmation Modal */}
        {showSuspendConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
            <div className="glass-panel relative w-full max-w-md rounded-[32px] px-8 py-8">
              <button
                onClick={() => setShowSuspendConfirm(null)}
                className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                    <Ban className="h-8 w-8 text-red-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Suspend Employee Access</h2>
                  <p className="mt-2 text-slate-300">
                    Are you sure you want to suspend this employee's access?
                  </p>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-200">
                    <strong>Warning:</strong> Suspending this employee will:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-amber-200/80">
                    <li>Revoke their current access to the system</li>
                    <li>Require them to request approval again when they log in</li>
                    <li>Set their status back to "pending"</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowSuspendConfirm(null)}
                    className="btn-ghost flex-1"
                    disabled={suspending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const employee = employees.find((e) => e._id === showSuspendConfirm);
                      if (employee) {
                        handleSuspend(employee._id, employee.name || employee.email);
                      }
                    }}
                    disabled={suspending}
                    className="btn-primary flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {suspending ? "Suspending..." : "Confirm Suspend"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}

