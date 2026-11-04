import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components';
import { LoginPage, ProfilePage, RegisterPage } from '../pages/auth';
import { ProductsPage } from '../pages/products/ProductsPage';
import { OrdersPage, OrderSuccessPage } from '../pages/orders';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { CreateAddressPage } from '../pages/checkout/CreateAddressPage';
import { AdminRoute } from './AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { 
  AdminDashboardPage, 
  AdminProductsPage, 
  AdminOrdersPage, 
  AdminUsersPage 
} from '../pages/Admin';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
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
        }
      />
    </Routes>
  );
};