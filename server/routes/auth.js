const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, examGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // 2. Create user profile in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        exam_goal: examGoal,
        is_verified: true // Supabase auth handles verification via email if enabled
      })
      .select()
      .single();

    if (profileError) {
      const logger = require('../utils/logger');
      logger.error('Profile Creation Error:', profileError);
      return res.status(500).json({ 
        message: 'Error creating user profile.', 
        error: profileError.message,
        details: profileError.details
      });
    }
    
    res.status(201).json({
      message: 'User registered successfully.',
      user: profile,
      token: authData.session?.access_token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: authError.message });
    }

    // Fetch profile
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
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
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

// @route   GET /api/auth/me
// @desc    Get user profile data
router.get('/me', protect, async (req, res) => {
  // req.user is already populated by the protect middleware
  res.json(req.user);
});

module.exports = router;

