import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoutes: React.FC = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  let isAdmin = false;

  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      // user.role is now 'ADMIN'
      if (user.role === 'ADMIN') {
        isAdmin = true;
      }
    }
  } catch (err) {
    console.error('Failed to parse user from local storage');
  }

  if (!token || !isAdmin) {
    return <Navigate to="/userLogin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoutes;
