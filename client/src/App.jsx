import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import KYC from './pages/KYC';

function App() {
  const { theme } = useAppStore();
  const { loadUser, token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && token) {
      loadUser();
    }
  }, [_hasHydrated, token]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle routing
  return (
    <BrowserRouter>
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
        
        {/* Protected Routes inside Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/analysis" element={<AiAnalysis />} />
            <Route path="/doubts" element={<Doubts />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai-questions" element={<DailyAiQuestions />} />
            <Route path="/kyc" element={<KYC />} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Test Interface (no layout) */}
        <Route element={<PrivateRoute />}>
          <Route path="/test/:id" element={<TestInterface />} />
          <Route path="/result/:id" element={<Result />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
