const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/streak
// @desc    Get user's streak data
router.get('/', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('streak, coins, badges, freezes_remaining')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
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
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('coins, freezes_remaining')
      .eq('id', req.user.id)
      .single();
    
    if (fetchError || !user) throw fetchError || new Error('User not found');
    
    if (user.coins < 50) {
      return res.status(400).json({ message: 'Not enough coins. Need 50 coins to freeze streak.' });
    }

    if (user.freezes_remaining >= 2) {
      return res.status(400).json({ message: 'You already have the max number of freezes (2).' });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        coins: user.coins - 50,
        freezes_remaining: user.freezes_remaining + 1
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    // BUG 4 FIX: Use correct column names (type, not transaction_type; no source column)
    await supabase.from('rewards').insert({
        user_id: req.user.id,
        type: 'spent',
        amount: 50,
        description: 'Purchased a Streak Freeze'
    });

    res.json({ message: 'Streak freeze purchased!', streak: updatedUser.streak, coins: updatedUser.coins, freezesRemaining: updatedUser.freezes_remaining });
  } catch (error) {
    console.error('Freeze Streak Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

