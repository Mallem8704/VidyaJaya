const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendEmailOTP } = require('../utils/email');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, examGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user object
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      examGoal,
      otp,
      otpExpiry,
      isVerified: false
    });

    await user.save();
    
    // Bypass OTP for soft login - auto authenticate them
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        examGoal: user.examGoal,
        plan: user.plan,
        avatar: user.avatar,
        streak: user.streak,
        coins: user.coins
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for account activation
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
       return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      message: 'Account verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        examGoal: user.examGoal,
        plan: user.plan
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      /*
      if (!user.isVerified) {
         return res.status(401).json({ message: 'Please verify your account first' });
      }
      */
      // For development ease, allowing login without OTP verification. 
      // In production, uncomment the check above.

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          examGoal: user.examGoal,
          plan: user.plan,
          avatar: user.avatar,
          streak: user.streak,
          coins: user.coins
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile data
const { protect } = require('../middleware/authMiddleware');
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
