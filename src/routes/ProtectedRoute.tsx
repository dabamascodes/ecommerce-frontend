import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  const token = localStorage.getItem('token');

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};