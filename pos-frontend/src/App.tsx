import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { PosPage } from './pages/cashier/PosPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './router/ProtectedRoute';
import { RequireRole } from './router/RequireRole';
import { useAuthStore } from './store/authStore';

export default function App() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    console.log('This app is running')
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          path="/pos"
          element={
            <RequireRole role="CASHIER">
              <PosPage />
            </RequireRole>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

