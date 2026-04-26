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
 * @route   POST /api/wallet/withdraw
 * @desc    Request a withdrawal (Min ₹100 / 1000 coins)
 * @access  Private
 */
router.post('/withdraw', protect, async (req, res) => {
  const { amount, upiId } = req.body; // Amount in Rupees
  const coinAmount = amount * 10; // 10 coins = ₹1

  try {
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹100' });
    }

    // 1. Check current balance
    const { data: profile } = await supabase.from('profiles').select('coins, is_verified').eq('id', req.user.id).single();
    
    if ((profile?.coins || 0) < coinAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 2. Check for existing pending requests
    const { data: existing } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request.' });
    }

    // 3. Create withdrawal record
    const { error: wErr } = await supabase.from('withdrawals').insert({
      user_id: req.user.id,
      amount: amount,
      upi_id: upiId,
      status: 'pending'
    });

    if (wErr) throw wErr;

    // 4. Deduct coins and log transaction
    await supabase.from('profiles').update({
      coins: profile.coins - coinAmount
    }).eq('id', req.user.id);

    await supabase.from('rewards').insert({
      user_id: req.user.id,
      amount: -coinAmount,
      description: `Withdrawal request for ₹${amount} (UPI: ${upiId})`,
      type: 'withdrawal'
    });

    res.json({ message: 'Withdrawal request submitted! It will be reviewed within 48 hours.' });
  } catch (error) {
    console.error('Withdrawal Request Error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
});

module.exports = router;
