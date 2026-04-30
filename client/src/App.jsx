import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';

// Routes & Layouts
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

import Tests from './pages/Tests';
import TestInterface from './pages/TestInterface';
import Leaderboard from './pages/Leaderboard';
import AiAnalysis from './pages/AiAnalysis';
import Doubts from './pages/Doubts';
import Rewards from './pages/Rewards';
import Practice from './pages/Practice';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Result from './pages/Result';
import DailyAiQuestions from './pages/DailyAiQuestions';
import Pricing from './pages/Pricing';
import KYC from './pages/KYC';
import Wallet from './pages/Wallet';
import ProDashboard from './pages/ProDashboard';
import ProTests from './pages/ProTests';
import ProLeaderboard from './pages/ProLeaderboard';
import AdminLogin from './pages/AdminLogin';
import ReferAndEarn from './pages/ReferAndEarn';
import AdminReferrals from './pages/AdminReferrals';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminWithdrawals from './pages/AdminWithdrawals';

// SEO Articles
import WhatIsVidyajaya from './pages/articles/WhatIsVidyajaya';
import HowVidyajayaHelps from './pages/articles/HowVidyajayaHelps';
import WhyVidyajayaIsBest from './pages/articles/WhyVidyajayaIsBest';

import ProRoute from './components/ProRoute';
import AdminLayout from './components/AdminLayout';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();
    
    // 🛡️ Flexible Admin Check
    const isAdmin = user?.role === 'admin' || user?.isAdmin || user?.plan === 'admin';
    
    if (!isAuthenticated || !isAdmin) {
        console.warn("[ADMIN_GUARD] Access denied. Auth:", isAuthenticated, "User Role:", user?.role);
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

function App() {
  const { theme } = useAppStore();
  const { loadUser, token, setAuth, _hasHydrated, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // 🔗 GLOBAL REFERRAL CAPTURE
    // This captures the 'ref' code from any URL (Landing, Signup, etc.) and saves it
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('vidyajaya_ref_code', refCode.toUpperCase());
      console.log("[REFERRAL] Captured code from URL:", refCode.toUpperCase());
    }

    // 🛡️ AGGRESSIVE AUTH SYNC
    if (token && !useAuthStore.getState().isAuthenticated) {
      setAuth(null, token);
    }
  }, [token, setAuth]);

  useEffect(() => {
    if (_hasHydrated && token) {
      loadUser();
    }
  }, [_hasHydrated, token, loadUser]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 🔗 REFERRAL TRACKING
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      console.log(`[REFERRAL] Captured code: ${refCode}`);
      localStorage.setItem('vidyajaya_ref_code', refCode);
    }
  }, []);

  // 🔗 AUTOMATIC REFERRAL SYNC (For Google Login Users)
  React.useEffect(() => {
    const syncReferral = async () => {
      const storedCode = localStorage.getItem('vidyajaya_ref_code');
      if (isAuthenticated && user && !user.referred_by_code && storedCode) {
          try {
              console.log(`[SYNC] Attaching referral ${storedCode} to Google account...`);
              await axios.post('/api/referrals/sync', { referralCode: storedCode });
              // Clear code so we don't sync again
              localStorage.removeItem('vidyajaya_ref_code');
              console.log('[SYNC] Referral attached successfully ✓');
          } catch (err) {
              console.error('[SYNC] Failed to attach referral:', err.response?.data?.message);
          }
      }
    };

    if (isAuthenticated && user) {
      syncReferral();
    }
  }, [isAuthenticated, user]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            color: theme === 'dark' ? '#F1F5F9' : '#0A2540',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
          }
        }} 
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth type="Login" />} />
        <Route path="/signup" element={<Auth type="Signup" />} />
        <Route path="/forgot-password" element={<Auth type="Forgot Password" />} />
        <Route path="/reset-password/:token" element={<Auth type="Reset Password" />} />
        
        {/* SEO Articles */}
        <Route path="/what-is-vidyajaya" element={<WhatIsVidyajaya />} />
        <Route path="/how-it-helps-students" element={<HowVidyajayaHelps />} />
        <Route path="/why-vidyajaya-is-best" element={<WhyVidyajayaIsBest />} />

        {/* Admin Routes (Separate from standard User Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="referrals" element={<AdminReferrals />} />
        </Route>
        
        {/* Protected User Routes inside Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/analysis" element={<AiAnalysis />} />
            <Route path="/doubts" element={<Doubts />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />
            <Route path="/ai-questions" element={<DailyAiQuestions />} />
            
            {/* PRO Specific Routes */}
            <Route element={<ProRoute />}>
              <Route path="/pro-dashboard" element={<ProDashboard />} />
              <Route path="/pro-tests" element={<ProTests />} />
              <Route path="/pro-leaderboard" element={<ProLeaderboard />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Test Interface (no layout) */}
        <Route element={<PrivateRoute />}>
          <Route path="/test/:id" element={<TestInterface />} />
          <Route path="/result/:id" element={<Result />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
