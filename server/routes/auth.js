const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail, emailTemplates } = require('../utils/email');

// ── Validate required env vars once at startup ──────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('[FATAL] auth.js: SUPABASE_URL or SUPABASE_ANON_KEY is not set. Login/Register will fail.');
}

// ── Shared anon client (used for user-facing auth only) ─────────────────────
// This avoids recreating the client on every request and ensures env vars
// are read exactly once, making missing-key errors obvious at startup.
const getAuthClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Server configuration error: Supabase credentials are missing. Please contact support.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

// 🧪 TEMPORARY DB TEST ROUTE
router.get('/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').upsert({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'DB_TEST_USER',
            email: 'test@vidyajaya.in',
            referral_code: 'TEST_REF_OK'
        }).select();
        
        if (error) return res.status(500).json({ status: '❌ DATABASE ERROR', error });
        return res.json({ status: '✅ DATABASE CONNECTED & WRITING OK', data });
    } catch (err) {
        return res.status(500).json({ status: '🔥 SERVER CRASH', message: err.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  console.log("🚀 [REGISTER_ATTEMPT] Incoming Data:", JSON.stringify({
    name: req.body.name,
    email: req.body.email,
    referralCode: req.body.referralCode,
    deviceId: req.body.deviceId
  }, null, 2));

  try {
    const { name, email, phone, password, examGoal, referralCode, deviceId, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // 1. Mandatory OTP Verification for Production
    if (phone && otp) {
        const { data: otpRecords } = await supabase
            .from('verification_otps')
            .select('*')
            .eq('phone', phone)
            .eq('otp', otp)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (!otpRecords || otpRecords.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please resend.' });
        }

        // Mark as verified
        await supabase.from('verification_otps').update({ is_verified: true }).eq('id', otpRecords[0].id);
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Anti-Abuse: Check if deviceId already has many accounts (optional but recommended)
    if (deviceId) {
      const { data: deviceAccounts } = await supabase
        .from('profiles')
        .select('id')
        .eq('device_id', deviceId);
      
      if (deviceAccounts && deviceAccounts.length >= 3) {
        return res.status(403).json({ message: 'Maximum account limit reached for this device.' });
      }
    }

    // 1. Sign up or Recover existing user
    const authClient = getAuthClient();
    let authData, authError;

    try {
        const result = await authClient.auth.signUp({
            email,
            password,
            options: { data: { name, phone } }
        });
        authData = result.data;
        authError = result.error;
    } catch (e) {
        console.error('[Register] Critical Auth Exception:', e);
    }

    let profileId = authData?.user?.id;

    if (authError) {
        // Handle "Already Registered" cases
        if (authError.message.includes('already registered') || authError.status === 422) {
            console.log('[Register] User exists, recovering ID...');
            const { data: users } = await authClient.auth.admin.listUsers();
            profileId = users.users.find(u => u.email === email)?.id;
        }
        
        if (!profileId) {
            console.error('[Register] Auth Error:', authError.message);
            return res.status(400).json({ message: authError.message });
        }
    }

    if (!profileId) {
        return res.status(400).json({ message: 'Could not establish user identity. Please try a different email.' });
    }

    // Generate unique referral code
    const generatedCode = (name.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase();

    // 🛡️ REFERRAL VALIDATION
    let referrerId = null;
    let referralType = null;
    let refCodeStr = null;

    if (referralCode) {
      const codeUpper = referralCode.trim().toUpperCase();
      console.log(`[AUTH_REGISTER] Validating Referral Code: ${codeUpper}`);
      
      // 1. Check referral_codes table (Influencers/Admins)
      const { data: refCodeObj } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', codeUpper)
        .single();
      
      if (refCodeObj) {
        console.log(`[AUTH_REGISTER] FOUND INFLUENCER CODE: ${codeUpper} (Owner: ${refCodeObj.owner_user_id})`);
        referrerId = refCodeObj.owner_user_id;
        referralType = refCodeObj.type;
        refCodeStr = refCodeObj.code;
      } else {
        // 2. Check profiles table (Regular users)
        const { data: referrerUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', codeUpper)
          .single();
        
        if (referrerUser) {
          console.log(`[AUTH_REGISTER] FOUND USER CODE: ${codeUpper} (Owner: ${referrerUser.id})`);
          referrerId = referrerUser.id;
          referralType = 'user';
          refCodeStr = codeUpper;
        } else {
          console.log(`[AUTH_REGISTER] INVALID CODE: ${codeUpper}`);
        }
      }
    }

    /* 🛡️ TEMPORARILY DISABLED FOR TESTING
    if (referrerId && deviceId) {
        const { data: sameDeviceCheck } = await supabase
            .from('user_devices')
            .select('id')
            .eq('user_id', referrerId)
            .eq('device_id', deviceId);
        
        if (sameDeviceCheck && sameDeviceCheck.length > 0) {
            console.warn(`[FRAUD] Self-referral detected. Device: ${deviceId}`);
            referrerId = null;
            refCodeStr = null;
            referralType = null;
        }
    }
    */

    // 2. Create user profile — with retry on failure
    let profile = null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: profileId,
        name,
        email,
        phone: phone || null,
        exam_goal: examGoal || 'UPSC',
        is_verified: false,
        coins: referralCode && referrerId ? 5 : 0,
        streak: 0,
        referral_code: generatedCode,
        referred_by_code: refCodeStr,
        referred_by_user_id: referrerId,
        referral_type: referralType,
        device_id: deviceId || null,
        plan: 'free'
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      console.error('[Register] ❌ PROFILE CREATE FULL ERROR:', JSON.stringify(profileError));
      // Retry with only guaranteed-safe minimal columns
      const { data: minProfile, error: minErr } = await supabase
        .from('profiles')
        .upsert({ id: profileId, name, email, plan: 'free', referral_code: generatedCode }, { onConflict: 'id' })
        .select().single();
      if (minErr) {
        console.error('[Register] ❌ MINIMAL PROFILE ALSO FAILED:', JSON.stringify(minErr));
      } else {
        profile = minProfile;
        console.log('[Register] ✅ Minimal profile created successfully');
        // Now patch in the referral fields separately
        if (refCodeStr) {
          await supabase.from('profiles').update({
            referred_by_code: refCodeStr,
            referred_by_user_id: referrerId,
            referral_type: referralType,
            coins: 5
          }).eq('id', profileId);
        }
      }
    } else {
      profile = profileData;
      console.log('[Register] ✅ Full profile created successfully');
    }

    // Verify profile actually exists before referral FK insert
    const { data: verifyProfile } = await supabase.from('profiles').select('id').eq('id', profileId).single();
    const profileConfirmed = !!verifyProfile;
    console.log(`[Register] Profile confirmed in DB: ${profileConfirmed}`);

    // 🔗 3. GUARANTEED REFERRAL RECORDING
    if (referrerId && refCodeStr && profileConfirmed) {
      console.log(`[AUTH_REGISTER] 🚀 REFERRAL INSERT ATTEMPT: Referrer=${referrerId}, Referee=${profileId}, Code=${refCodeStr}`);
      
      // Primary attempt — full data
      const { error: finalRefErr } = await supabase.from('referrals').upsert({
        referrer_id: referrerId,
        referred_user_id: profileId,
        referral_code: refCodeStr,
        is_successful: false
      }, { onConflict: 'referred_user_id' });

      if (finalRefErr) {
          console.error('[AUTH_REGISTER] ❌ PRIMARY INSERT FAILED:', JSON.stringify(finalRefErr));
          
          // Fallback attempt — minimal columns in case schema is partial
          const { error: fallbackErr } = await supabase.from('referrals').upsert({
            referrer_id: referrerId,
            referred_user_id: profileId
          }, { onConflict: 'referred_user_id' });
          
          if (fallbackErr) {
            console.error('[AUTH_REGISTER] ❌ FALLBACK INSERT ALSO FAILED:', JSON.stringify(fallbackErr));
            console.error('[AUTH_REGISTER] 🚨 ACTION REQUIRED: Run FINAL_REFERRAL_FIX.sql in Supabase SQL Editor');
          } else {
            console.log('[AUTH_REGISTER] ✅ REFERRAL SAVED (minimal columns) ✓');
          }
      } else {
          console.log('[AUTH_REGISTER] ✅ REFERRAL SAVED SUCCESSFULLY ✓');
      }
    }

    // 3. Track Device & Duplicate Accounts
    // Fixed: Removed duplicate deviceId declaration
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const browserFingerprint = req.headers['user-agent'];

    if (deviceId) {
      await supabase.from('user_devices').insert({
        user_id: profileId,
        device_id: deviceId,
        ip_address: ipAddress,
        browser_fingerprint: browserFingerprint
      });

      const { data: deviceUsers } = await supabase
        .from('user_devices')
        .select('user_id')
        .eq('device_id', deviceId);
      
      const uniqueUsers = new Set(deviceUsers?.map(d => d.user_id) || []);
      
      if (uniqueUsers.size > 2) {
        await supabase.from('profiles').update({ user_flagged: true }).in('id', Array.from(uniqueUsers));
      }

      await supabase.from('profiles').update({ last_device_id: deviceId }).eq('id', profileId);
    }
    
    // 🛡️ ENSURE USER IS NEVER NULL
    const finalUser = profile || {
        id: profileId,
        name: name,
        email: email,
        plan: 'free'
    };

    // Send Welcome Email (Non-blocking)
    sendEmail({
      email: email,
      ...emailTemplates.welcome(name)
    }).catch(err => console.error('[Auth] Welcome email failed:', err));

    res.status(201).json({
      message: 'Welcome to VidyaJaya!',
      user: finalUser,
      token: authData.session?.access_token || null
    });
  } catch (error) {
    console.error('[Register] Unexpected error:', error.message);
    res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    let { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: 'Please provide email/phone and password.' });
    }

    // 1. Resolve email from phone if needed
    if (!email && phone) {
      console.log(`[Login] Attempting phone-to-email resolution for: ${phone}`);
      const { data: profileByPhone, error: phoneErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', phone)
        .single();
      
      if (phoneErr || !profileByPhone) {
        return res.status(401).json({ message: 'No account found with this phone number.' });
      }
      email = profileByPhone.email;
    }

    // Get shared auth client
    const authClient = getAuthClient();

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('[Login] Supabase auth error:', authError.message, '| code:', authError.code);
      // Map Supabase error codes to user-friendly messages
      if (authError.code === 'invalid_credentials' || authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({ message: 'Incorrect email or password. Please try again.' });
      }
      if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({ message: 'Please verify your email before logging in. Check your inbox.' });
      }
      return res.status(401).json({ message: authError.message });
    }

    if (!authData.session) {
      return res.status(401).json({ message: 'Login failed. Please try again.' });
    }

    // Fetch user profile using service role client
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profile?.is_blocked) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // 3. Track Device & Duplicate Accounts
    const deviceId = req.body.deviceId;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const browserFingerprint = req.headers['user-agent'];

    if (deviceId && authData?.user) {
      // Log this device session
      await supabase.from('user_devices').upsert({
        user_id: authData.user.id,
        device_id: deviceId,
        ip_address: ipAddress,
        browser_fingerprint: browserFingerprint
      }, { onConflict: 'user_id, device_id' });
    }

    // Check for account limit on this device
    if (deviceId) {
      const { data: deviceUsers } = await supabase
        .from('user_devices')
        .select('user_id')
        .eq('device_id', deviceId);
      
      const uniqueUsers = new Set(deviceUsers?.map(d => d.user_id) || []);
      
      if (uniqueUsers.size > 2) {
        // Automatically flag ALL users on this device
        await supabase.from('profiles').update({ user_flagged: true }).in('id', Array.from(uniqueUsers));
      }

      // Update latest device in profile
      await supabase.from('profiles').update({ last_device_id: deviceId }).eq('id', profile.id);
    }

    res.json({
      user: profile || { id: authData.user.id, email: authData.user.email },
      token: authData.session.access_token
    });
  } catch (error) {
    console.error('[Login] Unexpected error:', error.message);
    res.status(500).json({ message: error.message || 'Login failed. Please try again.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for authenticated user (BUG 11 & 15 FIX)
router.put('/change-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Use Supabase service role to update the user's password
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/google-url
// @desc    Get Google OAuth URL
router.post('/google-url', async (req, res) => {
  try {
    const authClient = getAuthClient();
    const { data, error } = await authClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) throw error;
    res.json({ url: data.url });
  } catch (error) {
    console.error('[Google Auth] Error:', error.message);
    res.status(500).json({ message: 'Failed to initiate Google login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile data
router.get('/me', protect, async (req, res) => {
  // req.user is already populated by the protect middleware
  res.json(req.user);
});

module.exports = router;

