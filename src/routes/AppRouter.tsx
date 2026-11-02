import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { HomePage } from '../pages/home/HomePage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { OrderSuccessPage } from '../pages/orders/OrderSuccessPage'
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} /> 
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};