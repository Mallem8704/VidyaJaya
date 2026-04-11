const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalScore: -1 })
      .limit(50)
      .select('name avatar totalScore globalRank streak coins examGoal');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/weekly', protect, async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ weeklyScore: -1 })
      .limit(50)
      .select('name avatar weeklyScore weeklyRank streak coins examGoal');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
