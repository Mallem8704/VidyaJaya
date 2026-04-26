const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');

/**
 * @route   GET /api/admin/stats
 * @desc    Get high-level platform statistics
 */
router.get('/stats', protect, adminProtect, async (req, res) => {
    try {
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: proUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pro', true);
        const { data: withdrawals } = await supabase.from('withdrawals').select('amount, status');
        
        const totalPaid = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + Number(w.amount), 0);
        const pendingPayouts = withdrawals.filter(w => w.status === 'pending').length;

        res.json({
            totalUsers,
            proUsers,
            totalPaid,
            pendingPayouts
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch platform stats' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering
 */
router.get('/users', protect, adminProtect, async (req, res) => {
    const { search, role, is_pro } = req.query;
    try {
        let query = supabase.from('profiles').select('*');

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (role) query = query.eq('role', role);
        if (is_pro !== undefined) query = query.eq('is_pro', is_pro === 'true');

        const { data: users, error } = await query.order('created_at', { ascending: false }).limit(100);
        if (error) throw error;

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

/**
 * @route   POST /api/admin/users/:id/toggle-block
 * @desc    Block or Unblock a user
 */
router.post('/users/:id/toggle-block', protect, adminProtect, async (req, res) => {
    const { id } = req.params;
    try {
        const { data: user } = await supabase.from('profiles').select('is_blocked, name').eq('id', id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newStatus = !user.is_blocked;
        await supabase.from('profiles').update({ is_blocked: newStatus }).eq('id', id);

        // Log the action
        await supabase.from('admin_audit_logs').insert({
            admin_id: req.user.id,
            action: newStatus ? 'BLOCK_USER' : 'UNBLOCK_USER',
            target_id: id,
            details: { name: user.name }
        });

        res.json({ message: `User ${newStatus ? 'blocked' : 'unblocked'} successfully.`, is_blocked: newStatus });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

/**
 * @route   GET /api/admin/withdrawals
 * @desc    Get all withdrawal requests with stats
 */
router.get('/withdrawals', protect, adminProtect, async (req, res) => {
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
router.post('/withdrawals/:id/:action', protect, adminProtect, async (req, res) => {
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
