const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, async (req, res) => {
  const { tier } = req.query; // 'pro' or 'free'
  
  try {
    let query = supabase
      .from('profiles')
      .select('name, avatar, avatar_url, total_score, streak, coins, exam_goal, is_pro')
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
  // Weekly is ONLY for Pro users per requirement
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('name, avatar, avatar_url, weekly_score, streak, coins, exam_goal, is_pro, pro_expiry')
      .eq('is_pro', true) // Strictly Pro
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    // Filter out expired users just in case the background job hasn't run
    const activeProLeaderboard = leaderboard.filter(u => !u.pro_expiry || new Date(u.pro_expiry) > new Date());
    
    res.json(activeProLeaderboard);
  } catch (error) {
    console.error('Weekly Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/monthly', protect, async (req, res) => {
  // Monthly is ONLY for Pro users per requirement
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('name, avatar, avatar_url, monthly_score, streak, coins, exam_goal, is_pro, pro_expiry')
      .eq('is_pro', true) // Strictly Pro
      .order('monthly_score', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Filter out expired users
    const activeProLeaderboard = leaderboard.filter(u => !u.pro_expiry || new Date(u.pro_expiry) > new Date());
    
    res.json(activeProLeaderboard);
  } catch (error) {
    console.error('Monthly Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

