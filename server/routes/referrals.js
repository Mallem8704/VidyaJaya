const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

/**
 * BARE MINIMUM TEST ROUTE
 * If this fails with 500, the issue is in the Middleware or Router registration.
 */
router.get('/my-stats', protect, async (req, res) => {
    console.log("[REFERRAL] HIT BARE MINIMUM TEST ROUTE");
    try {
        return res.json({
            total_referrals: 0,
            successful_referrals: 0,
            earnings: 0,
            referralCode: "SAFE-TEST",
            referralLink: "https://vidyajaya.in/signup?ref=SAFE",
            totalReferrals: 0,
            successfulReferrals: 0,
            nextMilestone: 5,
            progress: 0,
            referrals: [],
            rewards: []
        });
    } catch (error) {
        console.error("[REFERRAL] BARE MINIMUM FAILED:", error.message);
        return res.status(500).json({ message: "Bare minimum failed", error: error.message });
    }
});

/**
 * @route   POST /api/referrals/sync
 * @desc    Sync referral code for a user (used after Google Login)
 */
router.post('/sync', protect, async (req, res) => {
    const { referralCode } = req.body;
    const userId = req.user.id;
    const deviceId = req.headers['x-device-id'] || null;

    if (!referralCode) return res.status(400).json({ message: 'No code provided' });

    try {
        const codeUpper = referralCode.trim().toUpperCase();
        console.log(`[REFERRAL_SYNC] Syncing ${codeUpper} for User ${userId}`);

        // 1. Check if user already has a referrer
        if (req.user.referred_by_user_id || req.user.referred_by_code) {
            return res.json({ message: 'Referrer already set' });
        }

        // 2. Validate the code
        let referrerId = null;
        let referralType = 'user';

        // Check Influencer Codes
        const { data: refCodeObj } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', codeUpper)
            .single();

        if (refCodeObj) {
            referrerId = refCodeObj.owner_user_id;
            referralType = refCodeObj.type;
        } else {
            // Check Regular User Codes
            const { data: referrerUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('referral_code', codeUpper)
                .single();
            
            if (referrerUser) {
                referrerId = referrerUser.id;
            }
        }

        if (!referrerId) {
            return res.status(400).json({ message: 'Invalid referral code' });
        }

        // Prevent self-referral
        if (referrerId === userId) {
            return res.status(400).json({ message: 'Cannot refer yourself' });
        }

        // 3. Update User Profile
        await supabase.from('profiles').update({
            referred_by_code: codeUpper,
            referred_by_user_id: referrerId,
            referral_type: referralType,
            coins: 5 // Bonus for joining through referral
        }).eq('id', userId);

        // 4. Record in Referrals Table
        await supabase.from('referrals').upsert({
            referrer_id: referrerId,
            referred_user_id: userId,
            referral_code: codeUpper,
            is_successful: false
        }, { onConflict: 'referred_user_id' });

        console.log(`[REFERRAL_SYNC] Successfully synced ${codeUpper} for User ${userId} ✓`);
        res.json({ message: 'Referral synced successfully' });

    } catch (error) {
        console.error('[REFERRAL_SYNC] Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
