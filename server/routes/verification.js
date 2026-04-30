const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationOTP } = require('../utils/sms');

/**
 * @route   POST /api/verification/send-mobile-otp
 * @desc    Send dynamic OTP to mobile
 */
router.post('/send-mobile-otp', protect, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // 1. Generate 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 2. Store in database
        const { error: otpErr } = await supabase
            .from('verification_otps')
            .insert({ phone, otp });

        if (otpErr) throw otpErr;

        // 3. Send Real SMS
        const smsResult = await sendVerificationOTP(phone, otp);
        
        // Developer Bypass: If SMS fails (like IP blacklist), allow 123456 for testing
        if (!smsResult.success) {
            console.warn(`⚠️ SMS Failed. Using bypass code: 123456 for phone ${phone}`);
            await supabase.from('verification_otps').insert({ phone, otp: '123456' });
            return res.json({ 
                message: 'SMS delivery failed (IP Blocked). For testing, use code: 123456',
                bypass: true 
            });
        }

        res.json({ 
            message: 'Verification code sent to your mobile.',
            simulated: smsResult.simulated 
        });
    } catch (err) {
        console.error('[SEND_OTP_ERROR]', err);
        res.status(500).json({ message: 'Failed to process verification request' });
    }
});

/**
 * @route   POST /api/verification/verify-mobile-otp
 * @desc    Verify mobile OTP against database
 */
router.post('/verify-mobile-otp', protect, async (req, res) => {
    const { otp, phone } = req.body;
    
    try {
        // 1. Check latest valid OTP for this phone
        const { data: otpRecords, error: fetchErr } = await supabase
            .from('verification_otps')
            .select('*')
            .eq('phone', phone)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchErr || !otpRecords || otpRecords.length === 0) {
            return res.status(400).json({ message: 'OTP expired or not found. Please resend.' });
        }

        const latestOtp = otpRecords[0];

        if (otp.toString() !== latestOtp.otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        // 2. Mark OTP as used
        await supabase
            .from('verification_otps')
            .update({ is_verified: true })
            .eq('id', latestOtp.id);

        // 3. Update profile
        const { error } = await supabase
            .from('profiles')
            .update({ 
                is_verified: true,
                phone: phone
            })
            .eq('id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Mobile verified successfully!', success: true });
    } catch (err) {
        console.error('[VERIFY_OTP_ERROR]', err);
        res.status(500).json({ message: 'Verification process failed' });
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
        // Update status to pending for Admin Review
        await supabase
            .from('profiles')
            .update({ 
                kyc_status: 'pending',
                kyc_provider_id: idNumber // Store for reference
            })
            .eq('id', req.user.id);

        res.json({ message: 'KYC application submitted. Our team will review your documents within 24 hours.', status: 'pending' });
    } catch (err) {
        res.status(500).json({ message: 'KYC initialization failed' });
    }
});

module.exports = router;
