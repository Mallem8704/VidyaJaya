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

/**
 * @route   POST /api/rewards/withdraw
 * @desc    Withdraw wallet balance to bank (Min Rs. 50, KYC required)
 */
router.post('/withdraw', protect, async (req, res) => {
    try {
        const { amount, upiId } = req.body;
        const user = req.user;

        // 0. PRO CHECK (ONLY Pro users eligible for rewards)
        if (!user.is_pro && user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Only Pro users can withdraw cash rewards. Upgrade to Pro to unlock withdrawals.',
                code: 'PRO_REQUIRED'
            });
        }

        // 1. MINIMUM WITHDRAWAL CHECK
        if (amount < 50) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is Rs. 50' });
        }

        // 2. KYC CHECK
        if (!user.is_verified) {
            return res.status(403).json({ message: 'KYC Verification required via DigiLocker to withdraw rewards.' });
        }

        // 3. BALANCE CHECK
        const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).single();
        if ((profile?.coins || 0) < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // BUG 4 FIX: Use correct column names (type not transaction_type, no source/status)
        const { error: withdrawError } = await supabase.from('rewards').insert({
            user_id: user.id,
            type: 'withdrawn',
            amount: -amount,
            description: `Withdrawal of ₹${amount} to UPI: ${upiId}`
        });

        if (withdrawError) throw withdrawError;

        await supabase.from('profiles').update({
            coins: profile.coins - amount
        }).eq('id', user.id);

        res.json({ message: 'Withdrawal request submitted successfully. Will be processed within 24-48 hours.' });

    } catch (error) {
        console.error('Withdrawal Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
