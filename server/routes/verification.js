const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/verification/send-mobile-otp
 * @desc    Send OTP to mobile (Simulated)
 */
router.post('/send-mobile-otp', protect, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // Simulated OTP sending
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(`[OTP] Sent to ${phone}: ${otp}`);

        // Store OTP in a temp table or meta (simulated here)
        // In production, use Twilio/Fast2SMS
        
        res.json({ message: 'OTP sent successfully to your mobile.', simulatedOtp: otp });
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
        // Logic to verify OTP (Simulated success for any 6 digit otp for now)
        if (otp.toString().length !== 6) {
            return res.status(400).json({ message: 'Invalid OTP format' });
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
 * @desc    Initialize KYC Process (Simulated)
 */
router.post('/start-kyc', protect, async (req, res) => {
    const { name, idNumber, idType } = req.body;

    if (!name || !idNumber) {
        return res.status(400).json({ message: 'Name and ID number are required' });
    }

    try {
        // Update status to pending
        await supabase
            .from('profiles')
            .update({ 
                kyc_status: 'pending' 
            })
            .eq('id', req.user.id);

        // Simulate a delay and then auto-approve for demonstration
        // In production, this would call Razorpay/Signzy API
        setTimeout(async () => {
            await supabase
                .from('profiles')
                .update({ 
                    kyc_status: 'approved',
                    kyc_verified: true,
                    kyc_provider_id: 'sim_' + Math.random().toString(36).substring(7)
                })
                .eq('id', req.user.id);
        }, 5000);

        res.json({ message: 'KYC application submitted. Review in progress.', status: 'pending' });
    } catch (err) {
        res.status(500).json({ message: 'KYC initialization failed' });
    }
});

module.exports = router;
