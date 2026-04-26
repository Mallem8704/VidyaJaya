const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is admin
// For now, we'll use a specific email or role. 
// Ideally, add an 'is_admin' column to profiles.
const isAdmin = async (req, res, next) => {
    // Basic check: Allow users with 'is_admin' true or specific master email
    const { data: profile } = await supabase.from('profiles').select('is_admin, email').eq('id', req.user.id).single();
    if (profile?.is_admin || profile?.email === 'mallem8704@gmail.com') { // Assuming user's email
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

/**
 * @route   GET /api/admin/withdrawals
 * @desc    Get all withdrawal requests with stats
 */
router.get('/withdrawals', protect, isAdmin, async (req, res) => {
    const { status } = req.query;
    try {
        const { data: requests, error } = await supabase
            .from('withdrawals')
            .select('*, profiles(name, plan, email)')
            .eq('status', status || 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch stats
        const { data: allReqs } = await supabase.from('withdrawals').select('status');
        const stats = {
            pending: allReqs.filter(r => r.status === 'pending').length,
            approved: allReqs.filter(r => r.status === 'approved').length,
            rejected: allReqs.filter(r => r.status === 'rejected').length
        };

        res.json({ requests, stats });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch withdrawals' });
    }
});

/**
 * @route   POST /api/admin/withdrawals/:id/:action
 * @desc    Approve or Reject a withdrawal
 */
router.post('/withdrawals/:id/:action', protect, isAdmin, async (req, res) => {
    const { id, action } = req.params; // action: 'approved' or 'rejected'
    const { notes } = req.body;

    try {
        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', id).single();
        if (!withdrawal) return res.status(404).json({ message: 'Request not found' });

        // Update withdrawal status
        await supabase.from('withdrawals').update({
            status: action,
            admin_notes: notes || `Request ${action} by admin.`
        }).eq('id', id);

        // If rejected, refund the coins?
        // User request said: "Prevent withdrawing fake rewards"
        // If rejected due to fraud, maybe DON'T refund. 
        // But for safety/fairness, let's refund if it's just a regular rejection.
        if (action === 'rejected') {
            const coinAmount = withdrawal.amount * 10;
            const { data: profile } = await supabase.from('profiles').select('coins').eq('id', withdrawal.user_id).single();
            await supabase.from('profiles').update({
                coins: (profile?.coins || 0) + coinAmount
            }).eq('id', withdrawal.user_id);

            await supabase.from('rewards').insert({
                user_id: withdrawal.user_id,
                amount: coinAmount,
                description: `Refund for rejected withdrawal request (Ref: ${id})`,
                type: 'refund'
            });
        }

        res.json({ message: `Withdrawal ${action} successfully.` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to process action' });
    }
});

module.exports = router;
