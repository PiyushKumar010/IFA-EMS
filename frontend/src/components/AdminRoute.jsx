import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./ui/LoadingSpinner";

/**
 * AdminRoute - Requires admin role
 * Redirects to home if not authenticated or not admin
 */
export default function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const isAdmin = Array.isArray(data.roles) && data.roles.includes("admin");
        setAuthorized(isAdmin);
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white"><LoadingSpinner /></div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}

