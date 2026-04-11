import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';

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

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
        <Route path="/verify-otp" element={<Auth type="Verify OTP" />} />
        
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
