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
    // 1. Get balance from user_wallets
    const { data: wallet, error: wErr } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (wErr) {
      // If wallet doesn't exist, create it (fallback)
      const { data: newWallet } = await supabase.from('user_wallets').insert({ user_id: req.user.id }).select().single();
      return res.json({ balance: 0, wallet: newWallet, transactions: [] });
    }

    // 2. Get recent transactions
    const { data: transactions, error: tErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (tErr) throw tErr;

    res.json({
      balance: wallet.available_balance || 0,
      wallet,
      transactions
    });
  } catch (error) {
    console.error('Wallet Balance Error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
});

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Request a withdrawal (Min ₹50)
 * @access  Private
 */
router.post('/withdraw', protect, async (req, res) => {
  const { amount, upiId } = req.body; 
  const coinAmount = parseInt(amount) * 10; // ₹1 = 10 coins

  try {
    if (!amount || isNaN(amount) || amount < 50) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹50' });
    }

    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ message: 'Invalid UPI ID' });
    }

    // Call the atomic RPC function
    const { error: rpcErr } = await supabase.rpc('request_withdrawal', {
      p_user_id: req.user.id,
      p_amount_inr: parseInt(amount),
      p_upi_id: upiId,
      p_coin_amount: coinAmount
    });

    if (rpcErr) {
      console.error('RPC Error:', rpcErr);
      return res.status(400).json({ message: rpcErr.message || 'Withdrawal failed' });
    }

    res.json({ 
      success: true,
      message: 'Withdrawal request submitted! You will receive ₹' + amount + ' once approved.' 
    });
  } catch (error) {
    console.error('Withdrawal Request Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
