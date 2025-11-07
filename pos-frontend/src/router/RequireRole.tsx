import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/user';

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: ReactNode;
}

export const RequireRole = ({ role, children }: RequireRoleProps) => {
  const { user, isAuthLoading } = useAuth();

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (isAuthLoading) return null; 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

