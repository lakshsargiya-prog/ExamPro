import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600 text-sm mb-6">
          Your account role (<code className="font-mono font-semibold">{user?.role}</code>) does not have permission to access this area.
        </p>
        <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
      </div>
    );
  }

  return children;
}

