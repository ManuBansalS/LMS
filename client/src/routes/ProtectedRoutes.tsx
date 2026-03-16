import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Guards all protected routes.
 *
 * Strategy (production-style):
 * - No token in localStorage → redirect to /userLogin immediately (synchronous, no flash)
 * - Token present → render the page. The axios 401 interceptor handles expiry:
 *   if any API call returns 401, it clears localStorage and hard-redirects to /userLogin.
 *
 * This avoids an async validation ping on every page load, giving instant navigation
 * while still being secure (expired tokens are caught on the first real API request).
 */
const ProtectedRoutes: React.FC = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/userLogin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
