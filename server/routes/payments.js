const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
  const { planType } = req.body; // 'weekly' or 'monthly'
  
  let amount;
  if (planType === 'weekly') {
    amount = 99 * 100; // Rs. 99
  } else if (planType === 'monthly') {
    amount = 299 * 100; // Rs. 299
  } else {
    return res.status(400).json({ message: 'Invalid plan type' });
  }

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user.id,
      planType
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay signature and upgrade user
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    planType 
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified
    try {
      const days = planType === 'weekly' ? 7 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      // 1. Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: `pro_${planType}`,
          pro_expiry: expiryDate.toISOString()
        })
        .eq('id', req.user.id);

      if (profileError) throw profileError;

      // 2. Log subscription
      await supabase.from('subscriptions').insert({
        user_id: req.user.id,
        plan_type: planType,
        amount: planType === 'weekly' ? 99 : 299,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'active',
        expiry_date: expiryDate.toISOString()
      });

      // 3. Initialize/Sync wallet (if needed)
      // For now, we assume the wallet system is linked to the coins field
      
      res.json({ message: 'Payment verified and PRO access granted!', success: true });
    } catch (error) {
      console.error('Verification Success handling error:', error);
      res.status(500).json({ message: 'Payment verified but failed to update profile. Please contact support.' });
    }
  } else {
    res.status(400).json({ message: 'Invalid payment signature', success: false });
  }
});

module.exports = router;
