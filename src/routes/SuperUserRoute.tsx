import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';

export const SuperUserRoute = () => {
  const { user, isAuthenticated, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      checkAuthStatus();
    }
  }, [isAuthenticated, user, checkAuthStatus]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-medium">Loading super-user permissions...</p>
      </div>
    );
  }

  let userRoles: string[] = [];
  if (Array.isArray(user.roles)) {
    userRoles = user.roles;
  } else if (typeof user.roles === 'string') {
    userRoles = (user.roles as string)
      .replace(/[{}]/g, '')
      .split(',')
      .map((r) => r.trim());
  }

  const hasSuperUserRole = userRoles.includes('super-user');

  if (!hasSuperUserRole) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};