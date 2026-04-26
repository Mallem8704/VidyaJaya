import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ProUpgradeModal from './ProUpgradeModal';

const ProRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const isPro = user?.is_pro && (!user?.pro_expiry || new Date(user?.pro_expiry) > new Date());
  const isAdmin = user?.role === 'admin' || user?.plan === 'admin' || user?.isAdmin;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isPro || isAdmin) {
    return <Outlet />;
  }

  // If not PRO, redirect to pricing or show a prompt
  // For now, redirecting to pricing but we could also show the modal
  return <Navigate to="/pricing" state={{ from: location, showProPrompt: true }} replace />;
};

export default ProRoute;
