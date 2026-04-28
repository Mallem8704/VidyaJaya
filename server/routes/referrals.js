const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/referrals/my-stats
 * @desc    Get current user's referral stats with safe error handling
 */
router.get('/my-stats', protect, async (req, res) => {
    // 🔍 1. DEBUG LOGGING: Log incoming request
    console.log("[REFERRAL] Request received for /my-stats");
    
    try {
        // 🔐 2. AUTHENTICATION CHECK
        if (!req.user) {
            console.error("[REFERRAL] Unauthorized: req.user is undefined");
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 🧠 3. SAFE USER HANDLING
        const userId = req.user?.id;
        console.log("[REFERRAL] Processing stats for User ID:", userId);

        if (!userId) {
            console.error("[REFERRAL] Bad Request: userId is missing from req.user");
            return res.status(400).json({ message: "User ID is required" });
        }

        // 🧱 4. DATABASE QUERIES (Safe & Null-Checked)
        console.log("[REFERRAL] Fetching profile from database...");
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, referral_code, total_successful_referrals, gold_coins')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error("[REFERRAL] Profile database query error:", profileError.message);
        }

        // ⚠️ 5. HANDLE EMPTY DATA (Safety Fallback)
        // If no profile found, we don't crash; we use defaults
        const safeProfile = profile || { 
            name: req.user.name || "Student", 
            referral_code: "REF" + userId.substring(0, 5).toUpperCase(),
            total_successful_referrals: 0,
            gold_coins: 0
        };

        console.log("[REFERRAL] Fetching referral history...");
        const { data: referrals, error: refError } = await supabase
            .from('referrals')
            .select('id, is_successful, referred_user_id, created_at')
            .eq('referrer_id', userId);

        if (refError) {
            console.error("[REFERRAL] Referrals database query error:", refError.message);
        }

        // ⚠️ Handle empty referral list
        const safeReferrals = referrals || [];
        const successCount = safeProfile.total_successful_referrals || 0;
        
        console.log(`[REFERRAL] Found ${safeReferrals.length} referrals (${successCount} successful)`);

        // 📊 6. MILESTONE LOGIC
        let nextMilestone = 5;
        if (successCount >= 5 && successCount < 10) nextMilestone = 10;
        if (successCount >= 10) nextMilestone = 0;

        // 📊 7. FINAL RESPONSE (Safe, Valid JSON, Frontend Compatible)
        console.log("[REFERRAL] Sending successful response");
        return res.json({
            // Stats requested by user
            total_referrals: safeReferrals.length,
            successful_referrals: successCount,
            earnings: safeProfile.gold_coins || 0,

            // Fields required by ReferAndEarn.jsx frontend
            referralCode: safeProfile.referral_code,
            referralLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/signup?ref=${safeProfile.referral_code}`,
            totalReferrals: safeReferrals.length,
            successfulReferrals: successCount,
            nextMilestone: nextMilestone,
            progress: nextMilestone > 0 ? (successCount / nextMilestone) * 100 : 100,
            referrals: safeReferrals.map(r => ({
                id: r.id,
                name: "Student", 
                date: r.created_at,
                status: r.is_successful ? 'Successful' : 'Pending'
            })),
            rewards: [] 
        });

    } catch (error) {
        // 🛡️ 8. MANDATORY TRY-CATCH SAFETY NET
        console.error("[REFERRAL] CRITICAL API ERROR:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

/**
 * @route   POST /api/referrals/validate
 * @desc    Validate a referral code (Public)
 */
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Code is required" });

        const codeUpper = code.trim().toUpperCase();

        // 1. Check Influencer Codes
        const { data: refCode } = await supabase
            .from('referral_codes')
            .select('code, type')
            .eq('code', codeUpper)
            .maybeSingle();

        if (refCode) return res.json({ valid: true, type: refCode.type });

        // 2. Check User Codes
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('referral_code', codeUpper)
            .maybeSingle();

        if (profile) return res.json({ valid: true, type: 'user' });

        return res.status(404).json({ valid: false, message: "Invalid referral code" });

    } catch (error) {
        console.error("[REFERRAL] Validation Error:", error.message);
        return res.status(500).json({ message: "Validation failed", error: error.message });
    }
});

module.exports = router;
