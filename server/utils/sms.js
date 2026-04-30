const axios = require('axios');

/**
 * Send SMS via Fast2SMS (Indian Gateway)
 */
const sendSMS = async (phone, message) => {
    const API_KEY = process.env.FAST2SMS_API_KEY;
    
    // 🛡️ Simulation Fallback
    if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
        console.log(`[SMS_SIMULATION] To ${phone}: ${message}`);
        return { success: true, simulated: true };
    }

    try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q', // Quick SMS route
            message: message,
            language: 'english',
            numbers: phone,
        }, {
            headers: {
                "authorization": API_KEY,
                "Content-Type": "application/json"
            }
        });

        console.log(`[SMS_SUCCESS] Sent to ${phone}: ${response.data.message}`);
        return { success: true, data: response.data };
    } catch (err) {
        console.error('[SMS_ERROR]', err.response?.data || err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Send OTP for KYC
 */
const sendVerificationOTP = async (phone, otp) => {
    const message = `Your VidyaJaya OTP for Aadhaar Verification is ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
    return await sendSMS(phone, message);
};

module.exports = { sendSMS, sendVerificationOTP };
