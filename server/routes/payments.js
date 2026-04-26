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
    amount = 49 * 100; // Rs. 49
  } else if (planType === 'monthly') {
    amount = 99 * 100; // Rs. 99
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
        amount: planType === 'weekly' ? 49 : 99,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'active',
        expiry_date: expiryDate.toISOString()
      });

      // 2b. Log Analytics Conversion
      console.log(`[ANALYTICS] Conversion: User ${req.user.id} upgraded to PRO (${planType})`);
      await supabase.from('analytics_logs').insert({
        user_id: req.user.id,
        event_type: 'conversion',
        details: { plan_type: planType, amount: planType === 'weekly' ? 49 : 99 }
      }).catch(() => {});

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

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay Webhooks (Live Payment Notifications)
 * @access  Public (Signature Verified)
 */
router.post('/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    console.warn('[WEBHOOK] Missing secret or signature. Ignoring.');
    return res.status(400).json({ status: 'ignored' });
  }

  // Verify signature
  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    console.error('[WEBHOOK] Invalid signature detected!');
    return res.status(403).json({ status: 'invalid signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`[WEBHOOK] Received Razorpay event: ${event}`);

  // Handle successful payment events
  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = payload.payment ? payload.payment.entity : payload.order.entity;
    const orderId = payment.order_id || (payload.order ? payload.order.entity.id : null);
    
    // Extract notes (where we stored userId and planType)
    const notes = payment.notes || (payload.order ? payload.order.entity.notes : {});
    const { userId, planType } = notes;

    if (!userId || !planType) {
      console.warn(`[WEBHOOK] Missing userId or planType in notes for order ${orderId}. skipping.`);
      return res.json({ status: 'ok', message: 'missing metadata' });
    }

    try {
      // 1. Check if already processed (Idempotency)
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('razorpay_order_id', orderId)
        .single();

      if (existingSub) {
        console.log(`[WEBHOOK] Subscription for order ${orderId} already processed. skipping.`);
        return res.json({ status: 'ok', message: 'already processed' });
      }

      const days = planType === 'weekly' ? 7 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      // 2. Upgrade User
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: `pro_${planType}`,
          pro_expiry: expiryDate.toISOString()
        })
        .eq('id', userId);

      // 3. Log Subscription
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planType,
        amount: planType === 'weekly' ? 49 : 99,
        razorpay_order_id: orderId,
        razorpay_payment_id: payment.id,
        status: 'active',
        expiry_date: expiryDate.toISOString()
      });

      // 4. Log Analytics
      await supabase.from('analytics_logs').insert({
        user_id: userId,
        event_type: 'conversion_webhook',
        details: { plan_type: planType, order_id: orderId, payment_id: payment.id }
      }).catch(() => {});

      console.log(`[WEBHOOK] Successfully upgraded user ${userId} to PRO via webhook.`);
    } catch (error) {
      console.error('[WEBHOOK] Error processing payment:', error);
      return res.status(500).json({ status: 'error' });
    }
  }

  res.json({ status: 'ok' });
});

module.exports = router;
