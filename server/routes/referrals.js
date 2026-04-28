const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/referrals/my-stats
 * @desc    Get current user's referral stats and progress
 */
router.get('/my-stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get referral code and basic counts from profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, referral_code, total_successful_referrals')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        let referralCode = profile.referral_code;
        
        // 🛡️ Resilience: Generate code if missing (for legacy users)
        if (!referralCode) {
            console.log(`[REFERRAL] Generating missing code for user ${userId}`);
            referralCode = (profile.name?.substring(0, 3) || 'USR') + Math.random().toString(36).substring(2, 6).toUpperCase();
            await supabase.from('profiles').update({ referral_code: referralCode }).eq('id', userId);
        }

        // 2. Get list of successful referrals
        const { data: referrals, error: refError } = await supabase
            .from('referrals')
            .select(`
                id,
                created_at,
                is_successful,
                profiles!referred_user_id(name)
            `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false });

        if (refError) throw refError;

        // 3. Get milestone rewards
        const { data: rewards } = await supabase
            .from('user_rewards')
            .select('*')
            .eq('user_id', userId);

        // 4. Calculate progress to next milestone
        const currentCount = profile.total_successful_referrals || 0;
        let nextMilestone = 5;
        if (currentCount >= 5 && currentCount < 10) nextMilestone = 10;
        if (currentCount >= 10) nextMilestone = 0; // Completed all for now

        res.json({
            referralCode: referralCode,
            referralLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/signup?ref=${referralCode}`,
            totalReferrals: referrals.length,
            successfulReferrals: currentCount,
            nextMilestone,
            progress: nextMilestone > 0 ? (currentCount / nextMilestone) * 100 : 100,
            referrals: referrals.map(r => ({
                id: r.id,
                name: r.profiles?.name || 'Anonymous User',
                date: r.created_at,
                status: r.is_successful ? 'Successful' : 'Pending'
            })),
            rewards: rewards || []
        });

    } catch (error) {
        console.error('Fetch referral stats error:', error);
        res.status(500).json({ message: 'Failed to fetch referral stats' });
    }
});

/**
 * @route   POST /api/referrals/validate
 * @desc    Validate a referral code
 */
router.post('/validate', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    try {
        const codeUpper = code.trim().toUpperCase();

        // Check referral_codes first
        const { data: refCode } = await supabase
            .from('referral_codes')
            .select('code, type')
            .eq('code', codeUpper)
            .single();

        if (refCode) {
            return res.json({ valid: true, type: refCode.type });
        }

        // Check profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('referral_code', codeUpper)
            .single();

        if (profile) {
            return res.json({ valid: true, type: 'user' });
        }

        res.status(404).json({ valid: false, message: 'Invalid referral code' });

    } catch (error) {
        res.status(500).json({ message: 'Validation failed' });
    }
});

module.exports = router;
