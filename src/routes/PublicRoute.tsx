import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';

export const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const isFromCheckout = localStorage.getItem('fromCheckout') === 'true';

  if (isAuthenticated && !isFromCheckout) {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
};