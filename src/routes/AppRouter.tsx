import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components';
import { LoginPage, ProfilePage, RegisterPage } from '../pages/auth';
import { ProductsPage } from '../pages/products/ProductsPage';
import { OrdersPage, OrderSuccessPage } from '../pages/orders';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { CreateAddressPage } from '../pages/checkout/CreateAddressPage';

export const AppRouter = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout/address" element={<CreateAddressPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
};