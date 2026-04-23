const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, planName } = req.body;

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                planName: planName
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature and upgrade user
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            planName 
        } = req.body;

        // 1. Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // 2. Signature is valid, Upgrade User to PRO
        const { error } = await supabase
            .from('profiles')
            .update({ 
                is_premium: true,
                updated_at: new Date()
            })
            .eq('id', req.user.id);

        if (error) throw error;

        res.json({ message: "Payment verified successfully! Welcome to PRO." });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

module.exports = router;
