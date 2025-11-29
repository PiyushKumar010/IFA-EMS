import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./ui/LoadingSpinner";

/**
 * EmployeeRoute - Requires employee role
 * Redirects to home if not authenticated or not employee
 */
export default function EmployeeRoute({ children }) {
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
        const isEmployee = Array.isArray(data.roles) && data.roles.includes("employee");
        setAuthorized(isEmployee);
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

