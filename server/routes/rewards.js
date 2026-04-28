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
// @desc    Get user's current coin balances
router.get('/balance', protect, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('gold_coins, silver_coins, coins')
            .eq('id', req.user.id)
            .single();
        
        if (error) throw error;

        // Fallback for transition period
        const silver = profile.silver_coins || profile.coins || 0;
        const gold = profile.gold_coins || 0;

        res.json({ 
            silver_coins: silver,
            gold_coins: gold,
            coins: silver // for legacy frontend support
        });
    } catch (error) {
        console.error('Fetch Balance Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/rewards/withdraw
 * @desc    Withdraw Gold Coins to bank (Min ₹50, 100 Gold = ₹50)
 */
router.post('/withdraw', protect, async (req, res) => {
    try {
        const { amount, upiId } = req.body; // amount is in RUPEES
        const user = req.user;

        // 0. PRO CHECK
        if (!user.is_pro && user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Only Pro users can withdraw cash rewards. Upgrade to Pro to unlock withdrawals.',
                code: 'PRO_REQUIRED'
            });
        }

        // 1. MINIMUM WITHDRAWAL CHECK (₹50)
        if (amount < 50) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is ₹50 (requires 100 Gold Coins)' });
        }

        // 2. KYC CHECK
        if (!user.is_verified && !user.kyc_verified) {
            return res.status(403).json({ message: 'KYC Verification required via DigiLocker to withdraw rewards.' });
        }

        // 3. CONVERSION & BALANCE CHECK
        // 100 Gold = ₹50 => GoldNeeded = RupeeAmount * 2
        const goldNeeded = amount * 2;

        const { data: profile } = await supabase.from('profiles').select('gold_coins').eq('id', user.id).single();
        
        if ((profile?.gold_coins || 0) < goldNeeded) {
            return res.status(400).json({ 
                message: `Insufficient Gold Coins. You need ${goldNeeded} Gold Coins to withdraw ₹${amount}.`,
                required: goldNeeded,
                available: profile?.gold_coins || 0
            });
        }

        // 4. RECORD TRANSACTION
        const { error: withdrawError } = await supabase.from('rewards').insert({
            user_id: user.id,
            type: 'withdrawn',
            amount: -goldNeeded,
            description: `Withdrawal request: ₹${amount} (Deducted ${goldNeeded} Gold Coins) to UPI: ${upiId}`
        });

        if (withdrawError) throw withdrawError;

        // 5. DEDUCT FROM PROFILE
        await supabase.from('profiles').update({
            gold_coins: profile.gold_coins - goldNeeded
        }).eq('id', user.id);

        res.json({ 
            message: `Withdrawal request for ₹${amount} submitted successfully. Will be processed within 24-48 hours.`,
            deducted: goldNeeded
        });

    } catch (error) {
        console.error('Withdrawal Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
