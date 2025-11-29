import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./ui/LoadingSpinner";

/**
 * ClientRoute - Requires client role
 * Redirects to home if not authenticated or not client
 */
export default function ClientRoute({ children }) {
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
        const isClient = Array.isArray(data.roles) && data.roles.includes("client");
        setAuthorized(isClient);
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

