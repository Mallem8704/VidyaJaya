const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// Lazy load Razorpay to prevent crash if env vars are missing at startup
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('[PAYMENT] Razorpay keys are missing from environment variables!');
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Helper to process referral rewards after successful payment
 */
async function processReferralCommission(userId, planAmount, planType) {
    try {
        console.log(`[REFERRAL] Processing commission for User: ${userId}, Amount: ${planAmount}`);
        
        // 1. Find referral record
        const { data: referral, error: refError } = await supabase
            .from('referrals')
            .select('*, profiles!referrer_id(name, pro_expiry, total_successful_referrals, referral_type)')
            .eq('referred_user_id', userId)
            .eq('is_successful', false)
            .single();

        if (refError || !referral) {
            console.log(`[REFERRAL] No pending referral found for user ${userId}`);
            return;
        }

        const referrerId = referral.referrer_id;
        const referrerProfile = referral.profiles;
        const referralType = referral.profiles?.referral_type || 'user';

        // 2. Mark referral as successful
        await supabase.from('referrals').update({ is_successful: true }).eq('id', referral.id);

        if (referralType === 'influencer') {
            // INFLUENCER: 10% Cash Commission
            const commissionAmount = planAmount * 0.10;
            await supabase.from('commissions').insert({
                referrer_id: referrerId,
                referred_user_id: userId,
                referral_id: referral.id,
                subscription_amount: planAmount,
                commission_amount: commissionAmount,
                status: 'pending'
            });
            console.log(`[REFERRAL] Influencer commission of ₹${commissionAmount} logged for ${referrerId}`);
            
            // Also give some Gold Coins as instant reward (1 Gold = ₹0.50)
            const goldReward = Math.floor(commissionAmount / 0.5);
            if (goldReward > 0) {
                const { data: currProfile } = await supabase.from('profiles').select('gold_coins').eq('id', referrerId).single();
                await supabase.from('profiles').update({ 
                    gold_coins: (currProfile?.gold_coins || 0) + goldReward 
                }).eq('id', referrerId);
                
                await supabase.from('rewards').insert({
                    user_id: referrerId, type: 'referral_gold', amount: goldReward,
                    description: `Influencer commission (Gold portion) for ${planType} referral.`
                });
            }

        } else {
            // REGULAR USER: Milestone Rewards (5 = 1wk, 10 = 1mo)
            const newTotal = (referrerProfile.total_successful_referrals || 0) + 1;
            
            await supabase.from('profiles').update({ 
                total_successful_referrals: newTotal 
            }).eq('id', referrerId);

            if (newTotal === 5 || newTotal === 10) {
                const bonusDays = newTotal === 5 ? 7 : 30;
                const rewardType = newTotal === 5 ? 'weekly_free' : 'monthly_free';
                
                // Extend PRO
                const currentExpiry = referrerProfile.pro_expiry ? new Date(referrerProfile.pro_expiry) : new Date();
                const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
                const newExpiry = new Date(baseDate);
                newExpiry.setDate(newExpiry.getDate() + bonusDays);

                await supabase.from('profiles').update({
                    is_pro: true,
                    pro_expiry: newExpiry.toISOString(),
                    plan: `reward_${rewardType}`
                }).eq('id', referrerId);

                await supabase.from('user_rewards').insert({
                    user_id: referrerId,
                    milestone_count: newTotal,
                    reward_type: rewardType,
                    status: 'granted'
                });

                await supabase.from('rewards').insert({
                    user_id: referrerId, type: 'referral_milestone', amount: 0,
                    description: `MILESTONE: ${newTotal} Referrals! You unlocked ${newTotal === 5 ? '1 Week' : '1 Month'} Free PRO.`
                });
                
                console.log(`[REFERRAL] User Milestone ${newTotal} reached by ${referrerId}`);
            }
        }
    } catch (err) {
        console.error('[REFERRAL] Processing Error:', err.message);
    }
}

/**
 * @route   POST /api/payments/test-create-order
 * @desc    Test Razorpay order creation (unprotected)
 */
router.post('/test-create-order', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    console.log('[PAYMENT_TEST] KEY_ID present:', !!keyId, '| First 8 chars:', keyId?.substring(0, 8));
    console.log('[PAYMENT_TEST] KEY_SECRET present:', !!keySecret, '| Length:', keySecret?.length);

    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({ status: '❌ KEYS MISSING', RAZORPAY_KEY_ID: keyId || 'NOT SET', RAZORPAY_KEY_SECRET: keySecret ? 'SET' : 'NOT SET' });
    }

    const order = await rzp.orders.create({
      amount: 6900,
      currency: 'INR',
      receipt: `receipt_test_${Date.now()}`
    });
    res.json({ status: '✅ SUCCESS', order });
  } catch (error) {
    console.error('Razorpay Test Order Error:', JSON.stringify(error));
    res.status(500).json({ 
      status: '❌ RAZORPAY ERROR',
      message: error.message,
      error: error.error || error,
      statusCode: error.statusCode,
      description: error.error?.description
    });
  }
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
    amount = 69 * 100; // ₹69
  } else if (planType === 'monthly') {
    amount = 199 * 100; // ₹199
  } else if (planType === 'elite') {
    amount = 499 * 100; // ₹499 (Elite Tier)
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
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    const order = await rzp.orders.create(options);
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

  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('[PAYMENT] Missing RAZORPAY_KEY_SECRET in environment!');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  console.log(`[PAYMENT] Verifying Order: ${razorpay_order_id}`);
  console.log(`[PAYMENT] Expected: ${expectedSign.substring(0, 10)}...`);
  console.log(`[PAYMENT] Received: ${razorpay_signature.substring(0, 10)}...`);

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
      const planAmount = planType === 'weekly' ? 69 : (planType === 'monthly' ? 199 : 499);
      await supabase.from('subscriptions').insert({
        user_id: req.user.id,
        plan_type: planType,
        amount: planAmount,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'active',
        expiry_date: expiryDate.toISOString()
      });

      // 3. REFERRAL COMMISSION LOGIC
      await processReferralCommission(req.user.id, planAmount, planType);

      // 2b. Log Analytics Conversion (Optional, don't fail if it fails)
      try {
        await supabase.from('analytics_logs').insert({
          user_id: req.user.id,
          event_type: 'conversion',
          details: { plan_type: planType, amount: planType === 'weekly' ? 49 : 99 }
        });
      } catch (err) {
        console.warn('[PAYMENT] Analytics log failed:', err.message);
      }

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
      const planAmount = planType === 'weekly' ? 69 : (planType === 'monthly' ? 199 : 499);
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planType,
        amount: planAmount,
        razorpay_order_id: orderId,
        razorpay_payment_id: payment.id,
        status: 'active',
        expiry_date: expiryDate.toISOString()
      });

      // 3b. Referral Commission (Webhook version)
      await processReferralCommission(userId, planAmount, planType);

      // 4. Log Analytics (Optional)
      try {
        await supabase.from('analytics_logs').insert({
          user_id: userId,
          event_type: 'conversion_webhook',
          details: { plan_type: planType, order_id: orderId, payment_id: payment.id }
        });
      } catch (err) {
        console.warn('[WEBHOOK] Analytics log failed:', err.message);
      }

      console.log(`[WEBHOOK] Successfully upgraded user ${userId} to PRO via webhook.`);
    } catch (error) {
      console.error('[WEBHOOK] Error processing payment:', error);
      return res.status(500).json({ status: 'error' });
    }
  }

  res.json({ status: 'ok' });
});

module.exports = router;
