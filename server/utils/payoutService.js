const axios = require('axios');
require('dotenv').config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAYX_ACCOUNT_NUMBER = process.env.RAZORPAYX_ACCOUNT_NUMBER;

const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

const razorpayX = axios.create({
    baseURL: 'https://api.razorpay.com/v1',
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Creates a payout via RazorpayX
 * @param {Object} withdrawal - Withdrawal object from DB
 * @param {Object} user - User profile object
 */
const initiatePayout = async (withdrawal, user) => {
    try {
        if (!RAZORPAYX_ACCOUNT_NUMBER) {
            throw new Error('RAZORPAYX_ACCOUNT_NUMBER is missing in environment variables');
        }

        // 1. Create or Find Contact
        let contactId;
        try {
            const contactRes = await razorpayX.post('/contacts', {
                name: user.name || 'User',
                email: user.email,
                type: 'customer',
                reference_id: user.id
            });
            contactId = contactRes.data.id;
        } catch (err) {
            // If contact exists, try to find it
            const searchRes = await razorpayX.get(`/contacts?reference_id=${user.id}`);
            if (searchRes.data.items && searchRes.data.items.length > 0) {
                contactId = searchRes.data.items[0].id;
            } else {
                console.error('[RAZORPAYX_CONTACT_ERROR]', err.response?.data || err.message);
                throw new Error('Failed to create or find RazorpayX contact');
            }
        }

        // 2. Create Fund Account (UPI VPA)
        let fundAccountId;
        try {
            const fundAccountRes = await razorpayX.post('/fund_accounts', {
                contact_id: contactId,
                account_type: 'vpa',
                vpa: {
                    address: withdrawal.upi_id
                }
            });
            fundAccountId = fundAccountRes.data.id;
        } catch (err) {
            // Check if fund account already exists for this contact and VPA
            const searchRes = await razorpayX.get(`/fund_accounts?contact_id=${contactId}`);
            const existing = searchRes.data.items?.find(fa => fa.vpa?.address === withdrawal.upi_id);
            if (existing) {
                fundAccountId = existing.id;
            } else {
                console.error('[RAZORPAYX_FUND_ACCOUNT_ERROR]', err.response?.data || err.message);
                throw new Error('Failed to create or find fund account');
            }
        }

        // 3. Create Payout
        const payoutRes = await razorpayX.post('/payouts', {
            account_number: RAZORPAYX_ACCOUNT_NUMBER,
            fund_account_id: fundAccountId,
            amount: Math.round(withdrawal.amount * 100), // INR to Paise
            currency: 'INR',
            mode: 'UPI',
            purpose: 'payout',
            queue_if_low_balance: true,
            reference_id: withdrawal.id.substring(0, 40), // Razorpay has length limits
            narration: 'VidyaJaya Reward Payout'
        });

        return {
            success: true,
            payoutId: payoutRes.data.id,
            status: payoutRes.data.status,
            data: payoutRes.data
        };

    } catch (error) {
        console.error('[RAZORPAYX_PAYOUT_ERROR]', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.description || error.message
        };
    }
};

module.exports = { initiatePayout };
