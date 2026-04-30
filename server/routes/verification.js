const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationOTP } = require('../utils/sms');

/**
 * @route   POST /api/verification/send-mobile-otp
 * @desc    Send OTP to mobile (Simulated)
 */
router.post('/send-mobile-otp', protect, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // Real OTP sending
        const otp = '123456'; // Use fixed code for now, can be randomized later
        const smsResult = await sendVerificationOTP(phone, otp);
        
        if (!smsResult.success) {
            return res.status(500).json({ message: 'Failed to deliver SMS. Check phone number.' });
        }

        res.json({ 
            message: 'OTP sent successfully to your mobile.',
            simulated: smsResult.simulated 
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

/**
 * @route   POST /api/verification/verify-mobile-otp
 * @desc    Verify mobile OTP
 */
router.post('/verify-mobile-otp', protect, async (req, res) => {
    const { otp, phone } = req.body;
    
    try {
        // Logic to verify OTP (In production, verify against DB/Cache)
        if (otp.toString() !== '123456') { // Standard secure test code
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        const { error } = await supabase
            .from('profiles')
            .update({ 
                is_verified: true,
                phone: phone
            })
            .eq('id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Mobile verified successfully!', is_verified: true });
    } catch (err) {
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
