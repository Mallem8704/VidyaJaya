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
  if (req.user && (req.user.isAdmin || req.user.plan === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const isPro = (req, res, next) => {
  if (req.user && (req.user.is_pro || req.user.plan === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      message: 'This feature is for PRO members only.',
      code: 'PRO_REQUIRED'
    });
  }
};

module.exports = { protect, admin, isPro };

