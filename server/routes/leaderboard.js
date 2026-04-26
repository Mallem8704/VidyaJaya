const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, async (req, res) => {
  console.log("Leaderboard API HIT: /global");
  console.log("Query params:", req.query);
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

    if (req.query.exam_goal) {
      query = query.eq('exam_goal', req.query.exam_goal);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;
    res.json({ data: leaderboard || [] });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(200).json({ data: [] }); // Return empty data on error to prevent frontend crash
  }
});

router.get('/weekly', protect, async (req, res) => {
  console.log("Leaderboard API HIT: /weekly");
  console.log("Query params:", req.query);
  const { tier } = req.query;
  try {
    let query = supabase
      .from('profiles')
      .select('name, avatar, weekly_score, streak, coins, exam_goal, is_pro, pro_expiry')
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (tier === 'pro') {
      query = query.eq('is_pro', true);
    } else if (tier === 'free') {
      query = query.eq('is_pro', false);
    }

    if (req.query.exam_goal) {
      query = query.eq('exam_goal', req.query.exam_goal);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;
    
    // Filter out expired users just in case the background job hasn't run
    const activeLeaderboard = (leaderboard || []).filter(u => {
      if (!u.is_pro) return true; // Allow free users if requested
      return !u.pro_expiry || new Date(u.pro_expiry) > new Date();
    });
    
    res.json({ data: activeLeaderboard });
  } catch (error) {
    console.error('Weekly Leaderboard Error:', error);
    res.status(200).json({ data: [] });
  }
});

router.get('/monthly', protect, async (req, res) => {
  console.log("Leaderboard API HIT: /monthly");
  console.log("Query params:", req.query);
  const { tier } = req.query;
  try {
    let query = supabase
      .from('profiles')
      .select('name, avatar, monthly_score, streak, coins, exam_goal, is_pro, pro_expiry')
      .order('monthly_score', { ascending: false })
      .limit(50);

    if (tier === 'pro') {
      query = query.eq('is_pro', true);
    } else if (tier === 'free') {
      query = query.eq('is_pro', false);
    }

    if (req.query.exam_goal) {
      query = query.eq('exam_goal', req.query.exam_goal);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;

    // Filter out expired users
    const activeLeaderboard = (leaderboard || []).filter(u => {
      if (!u.is_pro) return true;
      return !u.pro_expiry || new Date(u.pro_expiry) > new Date();
    });
    
    res.json({ data: activeLeaderboard });
  } catch (error) {
    console.error('Monthly Leaderboard Error:', error);
    res.status(200).json({ data: [] });
  }
});

module.exports = router;

