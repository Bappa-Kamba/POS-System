import { useEffect } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { ProductDetailsPage } from './pages/admin/ProductDetailsPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { UsersPage } from './pages/admin/UsersPage';
import { PosPage } from './pages/cashier/PosPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './router/ProtectedRoute';
import { RequireRole } from './router/RequireRole';
import { HomeRedirect } from './router/HomeRedirect';
import { MainLayout } from './components/layout/MainLayout';
import { useAuthStore } from './store/authStore';

export default function App() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/dashboard"
            element={
              <RequireRole role="ADMIN">
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/products"
            element={
              <RequireRole role="ADMIN">
                <ProductsPage />
              </RequireRole>
            }
          />
          <Route
            path="/products/:id"
            element={
              <RequireRole role="ADMIN">
                <ProductDetailsPage />
              </RequireRole>
            }
          />
          <Route
            path="/inventory"
            element={
              <RequireRole role="ADMIN">
                <InventoryPage />
              </RequireRole>
            }
          />
          <Route
            path="/users"
            element={
              <RequireRole role="ADMIN">
                <UsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/pos"
            element={
              <RequireRole role={['ADMIN', 'CASHIER']}>
                <PosPage />
              </RequireRole>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

