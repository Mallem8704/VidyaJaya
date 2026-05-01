const axios = require('axios');

/**
 * Send SMS via Fast2SMS (Indian Gateway)
 */
const sendSMS = async (phone, message) => {
    const API_KEY = process.env.FAST2SMS_API_KEY;
    
    // No API Key — Simulation Mode
    if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
        console.warn(`[SMS] ⚠️  FAST2SMS_API_KEY not set! Running in simulation mode.`);
        console.log(`[SMS_SIMULATION] OTP for ${phone}: ${message}`);
        return { success: true, simulated: true };
    }

    console.log(`[SMS] Attempting to send to ${phone} via Fast2SMS...`);

    try {
        // Fast2SMS requires phone WITHOUT country code for Indian numbers
        const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');
        
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q',
            message: message,
            language: 'english',
            numbers: cleanPhone,
        }, {
            headers: {
                "authorization": API_KEY,
                "Content-Type": "application/json"
            },
            timeout: 10000
        });

        const data = response.data;

        if (data.return === true || data.status === true) {
            console.log(`[SMS] ✅ OTP sent successfully to ${cleanPhone}`);
            return { success: true, data };
        } else {
            console.error(`[SMS] ❌ Fast2SMS returned failure:`, data.message);
            return { success: false, error: data.message, code: data.status_code };
        }
    } catch (err) {
        const errData = err.response?.data;
        const statusCode = errData?.status_code || err.response?.status;
        const errMsg = errData?.message || err.message;
        
        console.error(`[SMS] ❌ Fast2SMS Error [${statusCode}]: ${errMsg}`);
        
        return { success: false, error: errMsg, code: statusCode };
    }
};

/**
 * Send OTP specifically for signup verification
 */
const sendSignupOTP = async (phone, otp) => {
    const message = `Your VidyaJaya verification code is ${otp}. Valid for 10 minutes.`;
    return await sendSMS(phone, message);
};

/**
 * Send OTP for KYC
 */
const sendVerificationOTP = async (phone, otp) => {
    const message = `Your VidyaJaya KYC verification code is ${otp}. Valid for 10 minutes.`;
    return await sendSMS(phone, message);
};

module.exports = { sendSMS, sendSignupOTP, sendVerificationOTP };
