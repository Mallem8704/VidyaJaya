const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationOTP, sendSignupOTP } = require('../utils/sms');
const { sendOTP: sendEmailOTP } = require('../utils/email');

// ============================================================
// In-Memory OTP Store (Fallback if DB table doesn't exist yet)
// Format: identifier (email or phone) -> { otp, expiresAt }
// ============================================================
const memOtpStore = new Map();

const storeOtpInMemory = (identifier, otp) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    memOtpStore.set(identifier, { otp, expiresAt });
};

const verifyOtpFromMemory = (identifier, otp) => {
    const record = memOtpStore.get(identifier);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
        memOtpStore.delete(identifier);
        return false;
    }
    if (record.otp !== otp.toString()) return false;
    memOtpStore.delete(identifier); // One-time use
    return true;
};

/**
 * @route   POST /api/verification/send-mobile-otp
 * @desc    Send dynamic OTP to mobile (Public - for Signup)
 */
router.post('/send-mobile-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        let dbStored = false;

        // 1. Try to store in Database (non-fatal if table missing)
        try {
            const { error: otpErr } = await supabase
                .from('verification_otps')
                .insert({ phone, otp });
            if (!otpErr) dbStored = true;
            else console.warn('[OTP_DB] Table may not exist, using memory store:', otpErr.message);
        } catch (dbEx) {
            console.warn('[OTP_DB] DB exception, using memory store:', dbEx.message);
        }

        // Always store in memory as backup
        storeOtpInMemory(phone, otp);

        // 2. Try to send real SMS
        const smsResult = await sendSignupOTP(phone, otp);

        if (smsResult.success && !smsResult.simulated) {
            // Real SMS sent successfully
            console.log(`[OTP_SENT] Real OTP sent to ${phone}`);
            return res.json({ message: 'Verification code sent to your mobile.', success: true });
        }

        if (smsResult.simulated) {
            // No API key configured, simulation mode
            console.log(`[OTP_SIMULATED] Code for ${phone}: ${otp}`);
            return res.json({ message: 'OTP simulated (no API key). Check server logs.', success: true, simulated: true });
        }

        // SMS failed (IP blocked, API error, etc.) — use bypass
        console.warn(`[OTP_BYPASS] SMS failed for ${phone}. Storing bypass code 123456.`);
        storeOtpInMemory(phone, '123456'); // Override with bypass

        return res.json({
            message: 'SMS delivery unavailable. Please use code 123456 to continue.',
            success: true,
            bypass: true
        });

    } catch (err) {
        console.error('[SEND_OTP_ERROR]', err);
        // Even on full failure, allow bypass so user isn't stuck
        storeOtpInMemory(phone, '123456');
        return res.json({
            message: 'SMS service error. Please use code 123456 to continue.',
            success: true,
            bypass: true
        });
    }
});

/**
 * @route   POST /api/verification/send-email-otp
 * @desc    Send OTP to email (Public - for Signup)
 */
router.post('/send-email-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Try to store in Database
        try {
            await supabase
                .from('verification_otps')
                .insert({ phone: email, otp }); // Reusing phone column for email if needed, or if schema allows
        } catch (dbEx) {
            console.warn('[OTP_DB] Using memory store only.');
        }

        // Always store in memory
        storeOtpInMemory(email, otp);

        // 2. Send Email
        await sendEmailOTP(email, otp);

        console.log(`[OTP_SENT] Email OTP sent to ${email}`);
        return res.json({ message: 'Verification code sent to your email.', success: true });

    } catch (err) {
        console.error('[SEND_EMAIL_OTP_ERROR]', err);
        return res.status(500).json({ message: 'Failed to send email OTP. Please try again later.' });
    }
});

/**
 * @route   POST /api/verification/verify-mobile-otp
 * @desc    Verify mobile OTP (Checks DB first, then memory)
 */
router.post('/verify-mobile-otp', protect, async (req, res) => {
    const { otp, phone } = req.body;

    if (!otp || !phone) {
        return res.status(400).json({ message: 'OTP and phone are required' });
    }

    try {
        let verified = false;

        // 1. Check DB first
        try {
            const { data: otpRecords } = await supabase
                .from('verification_otps')
                .select('*')
                .eq('phone', phone)
                .eq('otp', otp)
                .eq('is_verified', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);

            if (otpRecords && otpRecords.length > 0) {
                await supabase
                    .from('verification_otps')
                    .update({ is_verified: true })
                    .eq('id', otpRecords[0].id);
                verified = true;
            }
        } catch (dbEx) {
            console.warn('[VERIFY_OTP_DB]', dbEx.message);
        }

        // 2. Fallback to memory check
        if (!verified) {
            verified = verifyOtpFromMemory(phone, otp);
        }

        if (!verified) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please resend.' });
        }

        // Update profile verification status
        await supabase
            .from('profiles')
            .update({ is_verified: true, phone })
            .eq('id', req.user.id);

        res.json({ message: 'Mobile verified successfully!', success: true });
    } catch (err) {
        console.error('[VERIFY_OTP_ERROR]', err);
        res.status(500).json({ message: 'Verification process failed' });
    }
});

/**
 * @route   POST /api/verification/verify-email-otp
 * @desc    Verify email OTP
 */
router.post('/verify-email-otp', async (req, res) => {
    const { otp, email } = req.body;

    if (!otp || !email) {
        return res.status(400).json({ message: 'OTP and email are required' });
    }

    try {
        let verified = false;

        // Check memory store (Simple and effective for email)
        verified = verifyOtpFromMemory(email, otp);

        if (!verified) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please resend.' });
        }

        res.json({ message: 'Email verified successfully!', success: true });
    } catch (err) {
        console.error('[VERIFY_EMAIL_OTP_ERROR]', err);
        res.status(500).json({ message: 'Verification failed' });
    }
});

/**
 * @route   POST /api/verification/start-kyc
 * @desc    Initialize KYC Process
 */
router.post('/start-kyc', protect, async (req, res) => {
    const { name, idNumber, idType } = req.body;

    if (!name || !idNumber) {
        return res.status(400).json({ message: 'Name and ID number are required' });
    }

    try {
        // Check for duplicate Aadhaar
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('kyc_provider_id', idNumber)
            .neq('id', req.user.id)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            return res.status(403).json({ message: 'This Aadhaar number is already linked to another account. Duplicate accounts are not allowed.' });
        }

        await supabase
            .from('profiles')
            .update({
                kyc_status: 'pending',
                kyc_provider_id: idNumber
            })
            .eq('id', req.user.id);

        res.json({ message: 'KYC application submitted. Our team will review your documents within 24 hours.', status: 'pending' });
    } catch (err) {
        res.status(500).json({ message: 'KYC initialization failed' });
    }
});

module.exports = router;
module.exports.verifyOtpFromMemory = verifyOtpFromMemory;
