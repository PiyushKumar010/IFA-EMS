


import React from "react";
import { Users, FileText, Calendar, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";

export default function AdminOverviewPage() {
  return (
    <div className="admin-viewport">
      <div className="admin-header-compact border-b border-white/10">
        <h1 className="text-xl font-bold">Admin Overview</h1>
        <p className="text-xs text-slate-400">Dashboard summary and quick stats</p>
      </div>
      
      <div className="admin-content-area">
        <div className="horizontal-scroll-container">
          {/* Stats Cards */}
          <div className="compact-section flex-shrink-0 w-64">
            <div className="compact-card h-full">
              <h2 className="text-sm font-semibold mb-3">Quick Stats</h2>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Employees</span>
                    <Users className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-xl font-bold">--</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Daily Forms</span>
                    <FileText className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold">--</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Meetings</span>
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold">--</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Messages</span>
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="compact-section flex-1 min-w-[400px]">
            <div className="compact-card h-full">
              <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
              <div className="space-y-2 text-xs overflow-y-auto">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-300">System initialized</p>
                      <p className="text-slate-500 text-xs">Navigate using sidebar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="compact-section flex-shrink-0 w-72">
            <div className="compact-card h-full">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Performance
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Attendance Rate</span>
                    <span className="font-semibold">--%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{width: '0%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Task Completion</span>
                    <span className="font-semibold">--%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{width: '0%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Avg Working Hours</span>
                    <span className="font-semibold">-- hrs</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}