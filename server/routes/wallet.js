const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/wallet/balance
 * @desc    Get current wallet balance and recent transactions
 * @access  Private
 */
router.get('/balance', protect, async (req, res) => {
  try {
    // 1. Get balance from profiles (synced)
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', req.user.id)
      .single();

    if (pErr) throw pErr;

    // 2. Get recent transactions
    const { data: transactions, error: tErr } = await supabase
      .from('rewards') // We reuse the rewards table as the transaction log
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (tErr) throw tErr;

    res.json({
      balance: profile.coins || 0,
      transactions
    });
  } catch (error) {
    console.error('Wallet Balance Error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
});

/**
 * @route   POST /api/wallet/claim-reward
 * @desc    Claim rewards for activity (Accuracy/Speed)
 * @access  Private
 */
router.post('/claim-reward', protect, async (req, res) => {
  const { amount, description, type } = req.body;

  try {
    // Basic anti-fraud: Check if this specific reward description was already claimed today
    const today = new Date();
    today.setHours(0,0,0,0);

    const { data: existing } = await supabase
      .from('rewards')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('description', description)
      .gte('created_at', today.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'Reward already claimed for this activity today.' });
    }

    // 1. Log transaction
    const { error: tErr } = await supabase.from('rewards').insert({
      user_id: req.user.id,
      amount,
      description,
      type: type || 'reward'
    });

    if (tErr) throw tErr;

    // 2. Update profile balance
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', req.user.id).single();
    
    await supabase.from('profiles').update({
      coins: (profile?.coins || 0) + amount
    }).eq('id', req.user.id);

    res.json({ message: 'Reward claimed successfully!', newBalance: (profile?.coins || 0) + amount });
  } catch (error) {
    console.error('Claim Reward Error:', error);
    res.status(500).json({ message: 'Failed to claim reward' });
  }
});

module.exports = router;
