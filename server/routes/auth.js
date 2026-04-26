const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// ── Validate required env vars once at startup ──────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('[FATAL] auth.js: SUPABASE_URL or SUPABASE_ANON_KEY is not set. Login/Register will fail.');
}

// ── Shared anon client (used for user-facing auth only) ─────────────────────
// This avoids recreating the client on every request and ensures env vars
// are read exactly once, making missing-key errors obvious at startup.
const getAuthClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Server configuration error: Supabase credentials are missing. Please contact support.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, examGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // 1. Get shared auth client (throws if env vars missing)
    const authClient = getAuthClient();

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (authError) {
      console.error('[Register] Supabase auth error:', authError.message);
      // Map Supabase errors to user-friendly messages
      if (authError.message.includes('already registered') || authError.message.includes('User already')) {
        return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
      }
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: 'Registration failed. Please try again.' });
    }

    // 2. Create user profile in the profiles table using service role client
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone: phone || null,
        exam_goal: examGoal || 'UPSC',
        is_verified: false,
        coins: 0,
        streak: 0
      })
      .select()
      .single();

    if (profileError) {
      console.error('[Register] Profile creation error:', profileError.message, profileError.details);
      // Still return success — profile can be created later
      return res.status(201).json({
        message: 'Account created! Please log in.',
        user: { id: authData.user.id, email, name },
        token: authData.session?.access_token || null
      });
    }
    
    res.status(201).json({
      message: 'Welcome to VidyaJaya!',
      user: profile,
      token: authData.session?.access_token || null
    });
  } catch (error) {
    console.error('[Register] Unexpected error:', error.message);
    res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Get shared auth client (throws if env vars missing with a clear message)
    const authClient = getAuthClient();

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('[Login] Supabase auth error:', authError.message, '| code:', authError.code);
      // Map Supabase error codes to user-friendly messages
      if (authError.code === 'invalid_credentials' || authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
      }
      if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({ message: 'Please verify your email before logging in. Check your inbox.' });
      }
      return res.status(401).json({ message: authError.message });
    }

    if (!authData.session) {
      return res.status(401).json({ message: 'Login failed. Please try again.' });
    }

    // Fetch user profile using service role client
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.json({
      user: profile || { id: authData.user.id, email: authData.user.email },
      token: authData.session.access_token
    });
  } catch (error) {
    console.error('[Login] Unexpected error:', error.message);
    // Return the actual error message (useful for config issues on Render)
    res.status(500).json({ message: error.message || 'Login failed. Please try again.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for authenticated user (BUG 11 & 15 FIX)
router.put('/change-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Use Supabase service role to update the user's password
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile data
router.get('/me', protect, async (req, res) => {
  // req.user is already populated by the protect middleware
  res.json(req.user);
});

module.exports = router;

