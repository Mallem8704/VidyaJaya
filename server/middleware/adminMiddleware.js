const supabase = require('../config/supabase');

/**
 * Middleware to strictly protect routes for Admin access only.
 * Must be used AFTER the 'protect' middleware which attaches req.user.
 */
const adminProtect = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Fetch the user's role from the profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, is_blocked')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({ message: 'User profile not found' });
        }

        if (profile.is_blocked) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        if (profile.role !== 'admin') {
            console.warn(`[Security] Unauthorized admin access attempt by user: ${req.user.id} (${profile.role})`);
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Attach role to req.user for downstream use
        req.user.role = profile.role;
        next();
    } catch (error) {
        console.error('Admin Protection Error:', error);
        res.status(500).json({ message: 'Internal server error during authorization' });
    }
};

module.exports = { adminProtect };
