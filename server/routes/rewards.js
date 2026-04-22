const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/rewards
// @desc    Get user's reward transaction history
router.get('/', protect, async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(transactions);
  } catch (error) {
    console.error('Fetch Rewards Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rewards/balance
// @desc    Get user's current coin balance (shortcut)
router.get('/balance', protect, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('coins')
            .eq('id', req.user.id)
            .single();
        
        if (error) throw error;
        res.json({ coins: profile.coins });
    } catch (error) {
        console.error('Fetch Balance Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
