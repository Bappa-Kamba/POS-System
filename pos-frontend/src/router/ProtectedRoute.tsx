import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) return null;

  if (!isAuthenticated) {
    console.log('Redirecting to login page...')
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

