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

    // 1. Fetch Balance
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('balance, updated_at')
      .eq('user_id', userId)
      .single();

    if (walletErr) throw walletErr;

    // 2. Fetch Recent 20 Transactions
    const { data: transactions, error: transErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transErr) throw transErr;

    res.json({
      balance: wallet.balance,
      updated_at: wallet.updated_at,
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
