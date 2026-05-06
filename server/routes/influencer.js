const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/influencer/stats
 * @desc    Get stats for the influencer dashboard
 * @access  Private (Influencer only)
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const influencerId = req.user.id;
        console.log(`[INFLUENCER_STATS] Fetching for: ${influencerId}`);

        // 1. Check if user is an influencer
        if (!req.user.is_influencer && req.user.referral_type !== 'influencer') {
            console.warn(`[INFLUENCER_STATS] Access denied for ${influencerId}`);
            return res.status(403).json({ message: 'Access denied. Influencer account required.' });
        }

        // 2. Fetch Stats in Parallel for speed
        const [referralsRes, commissionsRes, refCodeRes] = await Promise.all([
            supabase.from('referrals').select('created_at, referred_user_id').eq('referrer_id', influencerId),
            supabase.from('commissions').select('*').eq('referrer_id', influencerId),
            supabase.from('referral_codes').select('code, commission_percent').eq('owner_user_id', influencerId).maybeSingle()
        ]);

        if (referralsRes.error) throw referralsRes.error;
        if (commissionsRes.error) throw commissionsRes.error;

        const totalMembers = referralsRes.data?.length || 0;
        const commissions = commissionsRes.data || [];

        const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
        const unpaidEarnings = commissions.filter(c => c.status === 'unpaid').reduce((sum, c) => sum + Number(c.amount), 0);
        const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);

        // 3. Fetch Recent Referral Profiles (Separate call to avoid complex join errors)
        const recentUserIds = referralsRes.data?.slice(0, 10).map(r => r.referred_user_id) || [];
        let recentReferrals = [];

        if (recentUserIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, email, plan')
                .in('id', recentUserIds);

            recentReferrals = referralsRes.data.slice(0, 10).map(ref => {
                const p = profiles?.find(profile => profile.id === ref.referred_user_id);
                return {
                    name: p?.name || 'Anonymous',
                    email: p?.email || 'N/A',
                    date: ref.created_at,
                    status: p?.plan === 'pro' ? 'Pro' : 'Free'
                };
            });
        }

        res.json({
            stats: {
                totalMembers,
                totalEarned,
                unpaidEarnings,
                paidEarnings,
                commissionRate: refCodeRes.data?.commission_percent || 10 // Fallback to 10%
            },
            referralCode: refCodeRes.data?.code || req.user.referral_code,
            recentReferrals
        });

    } catch (err) {
        console.error('[INFLUENCER_STATS_ERROR]', err.message);
        res.status(500).json({ message: 'Error loading stats: ' + err.message });
    }
});

/**
 * @route   POST /api/influencer/withdraw
 * @desc    Request a withdrawal of influencer commissions
 */
router.post('/withdraw', protect, async (req, res) => {
    const { amount, bankDetails } = req.body;

    try {
        if (!amount || amount < 500) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is ₹500' });
        }

        // 1. Check available commission
        const { data: commissions } = await supabase
            .from('commissions')
            .select('amount')
            .eq('referrer_id', req.user.id)
            .eq('status', 'unpaid');

        const available = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

        if (amount > available) {
            return res.status(400).json({ message: 'Insufficient commission balance' });
        }

        // 2. Create Withdrawal Request
        const { error: withdrawErr } = await supabase
            .from('withdrawals')
            .insert({
                user_id: req.user.id,
                amount,
                status: 'pending',
                type: 'influencer_commission',
                payment_method: 'bank_transfer',
                details: bankDetails, // Should include account number, IFSC, name
                admin_notes: 'Influencer Commission Withdrawal'
            });

        if (withdrawErr) throw withdrawErr;

        // 3. Mark commissions as "pending_payment" to prevent double withdrawal
        // Note: This requires a 'pending_payment' status or similar in DB, 
        // if not we just rely on the admin to mark them paid.
        // For now, let's just log it.

        res.json({ message: 'Withdrawal request submitted successfully! Admin will process it soon.' });

    } catch (err) {
        console.error('[INFLUENCER_WITHDRAW_ERROR]', err);
        res.status(500).json({ message: 'Failed to process withdrawal' });
    }
});

module.exports = router;
