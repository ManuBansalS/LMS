import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Wraps public-only pages (Login, Register).
 * If the user is already authenticated, redirect them away to the dashboard.
 */
const PublicOnlyRoutes: React.FC = () => {
  const token = localStorage.getItem("token");

  if (token) {
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();

    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoutes;
