const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/streak
// @desc    Get user's streak data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('streak coins badges');
    res.json(user);
  } catch (error) {
    console.error('Get Streak Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/streak/freeze
// @desc    Use a streak freeze in exchange for 50 coins
router.post('/freeze', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.coins < 50) {
      return res.status(400).json({ message: 'Not enough coins. Need 50 coins to freeze streak.' });
    }

    if (user.streak.freezesRemaining >= 2) {
      return res.status(400).json({ message: 'You already have the max number of freezes (2).' });
    }

    user.coins -= 50;
    user.streak.freezesRemaining += 1;
    await user.save();

    res.json({ message: 'Streak freeze purchased!', streak: user.streak, coins: user.coins });
  } catch (error) {
    console.error('Freeze Streak Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
