


import React from "react";

export default function AdminOverviewPage() {
  // Place your overview content here. The sidebar is handled by AdminLayout.
  return (
    <div className="w-full min-h-screen flex flex-col items-start justify-start p-10">
      <h1 className="text-4xl font-bold mb-4">Admin Overview</h1>
      <p className="text-lg text-slate-300 mb-8">Welcome to the admin dashboard. Use the sidebar to navigate between sections.</p>
      {/* Add summary cards, stats, or quick links here as needed */}
    </div>
  );
}