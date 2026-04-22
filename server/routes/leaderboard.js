const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('name, avatar, total_score, streak, coins, exam_goal')
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/weekly', protect, async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('name, avatar, weekly_score, streak, coins, exam_goal')
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(leaderboard);
  } catch (error) {
    console.error('Weekly Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

