const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback to basic auth user info if profile isn't found
        req.user = { id: user.id, email: user.email, ...user.user_metadata };
      } else {
        // Auto-expire PRO plan if needed
        if (profile.is_pro && profile.pro_expiry && new Date(profile.pro_expiry) < new Date()) {
          console.log(`Plan expired for user ${profile.id}. Downgrading to free.`);
          await supabase.from('profiles').update({ is_pro: false, plan: 'free' }).eq('id', profile.id);
          profile.is_pro = false;
          profile.plan = 'free';
        }
        req.user = profile;
      }

      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.plan === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const isPro = (req, res, next) => {
  const user = req.user;
  const isProUser = user && (user.is_pro || user.role === 'admin' || user.plan === 'admin' || user.plan === 'pro' || user.plan === 'pro+');
  
  // Check for expiry if is_pro is true
  const isExpired = user && user.pro_expiry && new Date(user.pro_expiry) < new Date();

  if (isProUser && !isExpired) {
    next();
  } else {
    res.status(403).json({ 
      message: isExpired ? 'Your PRO plan has expired. Please renew to continue.' : 'Upgrade to PRO to unlock this feature and earn real rewards.',
      code: 'PRO_REQUIRED'
    });
  }
};

const checkAiLimit = async (req, res, next) => {
  const userId = req.user.id;
  const isProUser = req.user.is_pro || req.user.role === 'admin' || req.user.plan === 'admin';

  if (isProUser) {
    return next();
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*') // Select all to avoid column-specific error if missing
      .eq('id', userId)
      .single();

    if (error) throw error;

    const limit = 3;
    const currentUsage = profile.ai_practice_count || 0;

    if (currentUsage >= limit) {
      return res.status(403).json({ 
        message: 'Free AI Practice limit reached',
        code: 'AI_LIMIT_REACHED',
        limit: limit
      });
    }

    next();
  } catch (error) {
    console.error('AI Limit Check Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { protect, admin, isPro, checkAiLimit };

