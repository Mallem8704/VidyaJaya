const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/wallet
 * @desc    Get user wallet balance and recent transactions
 */
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch Balances from Profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('gold_coins, silver_coins, coins')
      .eq('id', userId)
      .single();

    if (profileErr) throw profileErr;

    // 2. Fetch Recent 20 Transactions from Rewards table
    const { data: transactions, error: transErr } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transErr) throw transErr;

    res.json({
      gold_coins: profile.gold_coins || 0,
      silver_coins: profile.silver_coins || profile.coins || 0,
      balance: profile.silver_coins || profile.coins || 0, // for legacy UI
      recent_transactions: transactions || []
    });
    
  } catch (err) {
    console.error('Wallet Error:', err);
    res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get full transaction history
 */
router.get('/transactions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Transactions Error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
