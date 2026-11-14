import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { Spinner } from '../components/common/Spinner';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { tab } = useParams<{ tab?: string }>();

  if (isLoading) {
    return <Spinner size="lg" className="py-32" />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard initialTab={tab} />;
};
