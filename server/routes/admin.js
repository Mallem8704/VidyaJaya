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
        
        const totalPaid = withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + Number(w.amount), 0);
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
 * @route   GET /api/admin/safety-data
 * @desc    Get flagged users and pending KYC applications
 */
router.get('/safety-data', protect, adminProtect, async (req, res) => {
    try {
        const { data: flaggedUsers } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('user_flagged', true);

        const { data: kycPending } = await supabase
            .from('profiles')
            .select('id, name, email, kyc_provider_id')
            .eq('kyc_status', 'pending');

        res.json({
            flaggedUsers: flaggedUsers || [],
            kycPending: kycPending || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
            rejected: allReqs.filter(r => r.status === 'rejected').length,
            paid: allReqs.filter(r => r.status === 'paid').length
        };

        res.json({ requests, stats });
    } catch (err) {
        console.error('Fetch Withdrawals Error:', err);
        res.status(500).json({ message: 'Failed to fetch withdrawals' });
    }
});

/**
 * @route   POST /api/admin/withdrawals/:id/update-status
 * @desc    Approve, Reject or Mark as Paid a withdrawal
 */
router.post('/withdrawals/:id/update-status', protect, adminProtect, async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'approved', 'rejected', 'paid'

    try {
        if (!['approved', 'rejected', 'paid'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const { error: rpcErr } = await supabase.rpc('update_withdrawal_status', {
            p_withdrawal_id: id,
            p_status: status,
            p_admin_notes: notes || `Request updated to ${status} by admin.`
        });

        if (rpcErr) throw rpcErr;

        res.json({ message: `Withdrawal status updated to ${status} successfully.` });
    } catch (err) {
        console.error('Update Withdrawal Error:', err);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

/**
 * @route   POST /api/admin/referral-codes
 * @desc    Create a new referral code (e.g. for Influencers)
 */
router.post('/referral-codes', protect, adminProtect, async (req, res) => {
    const { code, type, owner_email, commission_percent } = req.body;
    try {
        // 1. Find user by email
        const { data: user } = await supabase.from('profiles').select('id').eq('email', owner_email).single();
        if (!user) return res.status(404).json({ message: 'Owner user not found' });

        // 2. Create code
        const { data: newCode, error } = await supabase.from('referral_codes').insert({
            code: code.toUpperCase(),
            type,
            owner_user_id: user.id,
            commission_percent: commission_percent || 10.0
        }).select().single();

        if (error) throw error;

        // 3. Update user as influencer if type is influencer
        if (type === 'influencer') {
            await supabase.from('profiles').update({ 
                is_influencer: true,
                referral_type: 'influencer'
            }).eq('id', user.id);
        }

        res.json(newCode);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to create code' });
    }
});

/**
 * @route   GET /api/admin/referrals
 * @desc    Get all referrals with tracking data
 */
router.get('/referrals', protect, adminProtect, async (req, res) => {
    try {
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select(`
                *,
                referrer:profiles!referrer_id(name, email, referral_type),
                referee:profiles!referred_user_id(name, email, created_at)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(referrals);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch referrals' });
    }
});

/**
 * @route   GET /api/admin/commissions
 * @desc    Get all influencer commissions
 */
router.get('/commissions', protect, adminProtect, async (req, res) => {
    try {
        const { data: commissions, error } = await supabase
            .from('commissions')
            .select('*, referrer:profiles!referrer_id(name, email), referee:profiles!referred_user_id(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(commissions);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch commissions' });
    }
});

/**
 * @route   POST /api/admin/commissions/:id/pay
 * @desc    Mark a commission as paid
 */
router.post('/commissions/:id/pay', protect, adminProtect, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('commissions').update({ status: 'paid' }).eq('id', id);
        if (error) throw error;
        res.json({ message: 'Commission marked as paid' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update commission' });
    }
});

module.exports = router;
