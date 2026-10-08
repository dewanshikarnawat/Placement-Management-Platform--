import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole, UserProfile } from '../types';
import AccessDenied from './AccessDenied';

interface RoleGuardProps {
  currentUser: UserProfile | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ currentUser, allowedRoles, children }: RoleGuardProps) {
  if (!currentUser) {
    // Session token might still exist in local storage while loading, 
    // but if it's completely null/unauthenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <AccessDenied currentRole={currentUser.role} allowedRoles={allowedRoles} />;
  }

  return <>{children}</>;
}
