const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/leaderboard/daily
 * @desc    Fetch today's top scorers from test_results
 */
router.get('/daily', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('submissions') // Note: existing table is 'submissions'
      .select(`
        score,
        time_taken,
        created_at,
        profiles (
          id,
          name,
          avatar,
          is_pro,
          plan
        )
      `)
      .eq('contest_date', today)
      .eq('profiles.is_pro', true)
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true })
      .limit(50);

    if (error) throw error;

    // Filter out null profiles (if any RLS issues)
    const leaderboard = (data || [])
      .filter(item => item.profiles)
      .map((item, index) => ({
        rank: index + 1,
        name: item.profiles.name,
        avatar: item.profiles.avatar,
        score: item.score,
        total_time: item.total_time,
        is_pro: item.profiles.is_pro
      }));

    res.json({ data: leaderboard });
  } catch (error) {
    console.error('Daily Leaderboard Error:', error);
    res.status(500).json({ data: [], message: 'Server error' });
  }
});

/**
 * @route   GET /api/leaderboard/global
 */
router.get('/global', protect, async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, total_score, streak, is_pro')
      .eq('is_pro', true) // Requirement: Only Pro users in rankings
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ data: leaderboard || [] });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ data: [] });
  }
});

/**
 * @route   GET /api/leaderboard/weekly
 */
router.get('/weekly', protect, async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, weekly_score, streak, is_pro')
      .eq('is_pro', true)
      .order('weekly_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ data: leaderboard || [] });
  } catch (error) {
    console.error('Weekly Leaderboard Error:', error);
    res.status(500).json({ data: [] });
  }
});

/**
 * @route   GET /api/leaderboard/monthly
 */
router.get('/monthly', protect, async (req, res) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, monthly_score, streak, is_pro')
      .eq('is_pro', true)
      .order('monthly_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ data: leaderboard || [] });
  } catch (error) {
    console.error('Monthly Leaderboard Error:', error);
    res.status(500).json({ data: [] });
  }
});

module.exports = router;

