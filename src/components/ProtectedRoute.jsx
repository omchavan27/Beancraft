import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If admin tries to access customer page or customer tries to access admin page
    return <Navigate to={user.role === 'admin' ? '/admin' : '/customer'} replace />;
  }

  return children;
}
