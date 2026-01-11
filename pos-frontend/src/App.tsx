import { useEffect } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { ProductDetailsPage } from './pages/admin/ProductDetailsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { BranchesPage } from './pages/admin/BranchesPage';
import { SubdivisionsPage } from './pages/admin/SubdivisionsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { ExpensesPage } from './pages/admin/ExpensesPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { CreditSalesPage } from './pages/admin/CreditSalesPage';
import { PosPage } from './pages/cashier/PosPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './router/ProtectedRoute';
import { RequireRole } from './router/RequireRole';
import { HomeRedirect } from './router/HomeRedirect';
import { MainLayout } from './components/layout/MainLayout';
import { useAuthStore } from './store/authStore';
import { UnlockPage } from './pages/UnlockPage';

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
                <ProductManagementPage />
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
          {/* Redirect old inventory route to unified products page */}
          <Route path="/inventory" element={<Navigate to="/products" replace />} />
          <Route
            path="/users"
            element={
              <RequireRole role="ADMIN">
                <UsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/branches"
            element={
              <RequireRole role="ADMIN">
                <BranchesPage />
              </RequireRole>
            }
          />
          <Route
            path="/subdivisions"
            element={
              <RequireRole role="ADMIN">
                <SubdivisionsPage />
              </RequireRole>
            }
          />
          <Route
            path="/categories"
            element={
              <RequireRole role="ADMIN">
                <CategoriesPage />
              </RequireRole>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireRole role="ADMIN">
                <ReportsPage />
              </RequireRole>
            }
          />
          <Route
            path="/expenses"
            element={
              <RequireRole role="ADMIN">
                <ExpensesPage />
              </RequireRole>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <RequireRole role="ADMIN">
                <AuditLogsPage />
              </RequireRole>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireRole role="ADMIN">
                <SettingsPage />
              </RequireRole>
            }
          />
          <Route
            path="/credit-sales"
            element={
              <RequireRole role={['ADMIN', 'CASHIER']}>
                <CreditSalesPage />
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
          <Route
            path="/unlock"
            element={
              <RequireRole role="ADMIN">
                <UnlockPage />
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

