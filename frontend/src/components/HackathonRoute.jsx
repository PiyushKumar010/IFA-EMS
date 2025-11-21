import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function HackathonRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.roles && data.user.roles.includes("hackathon-applicant")) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // User not authenticated
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}