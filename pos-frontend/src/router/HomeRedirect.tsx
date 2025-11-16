import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomeRedirect = () => {
  const { user } = useAuth();

  // Redirect based on user role
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Default to POS for cashiers or if role is not determined
  return <Navigate to="/pos" replace />;
};

