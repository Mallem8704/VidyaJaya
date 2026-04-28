const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

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

module.exports = router;
