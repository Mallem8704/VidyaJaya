const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, async (req, res) => {
  const { tier } = req.query; // 'pro' or 'free'
  
  try {
    let query = supabase
      .from('profiles')
      .select('name, avatar, total_score, streak, coins, exam_goal, is_pro')
      .order('total_score', { ascending: false })
      .limit(50);

    if (tier === 'pro') {
      query = query.eq('is_pro', true);
    } else if (tier === 'free') {
      query = query.eq('is_pro', false);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/weekly', protect, async (req, res) => {
  const { tier } = req.query;
  
  try {
    let query = supabase
      .from('profiles')
      .select('name, avatar, weekly_score, streak, coins, exam_goal, is_pro')
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (tier === 'pro') {
      query = query.eq('is_pro', true);
    } else if (tier === 'free') {
      query = query.eq('is_pro', false);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;
    res.json(leaderboard);
  } catch (error) {
    console.error('Weekly Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

