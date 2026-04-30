const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Optimization for Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send a professional HTML email
 */
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const message = {
        from: `"VidyaJaya Team" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message
    };

    try {
        await transporter.sendMail(message);
        console.log(`[EMAIL] Sent to ${options.email}: ${options.subject}`);
    } catch (err) {
        console.error('[EMAIL_ERROR]', err);
    }
};

/**
 * Predefined Templates
 */
const emailTemplates = {
    welcome: (name) => ({
        subject: "Welcome to VidyaJaya — Your Journey to Success Begins! 🚀",
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #FF6B00; margin-bottom: 0;">VidyaJaya</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">Where Knowledge Pays Off</p>
                </div>
                <h2 style="color: #1a1a1a;">Namaste ${name}! 🙏</h2>
                <p>Welcome to India's most innovative AI-powered exam preparation platform. We are thrilled to have you on board.</p>
                <div style="background-color: #FFF5EE; border-left: 4px solid #FF6B00; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Start your streak today!</strong> Every daily test you take brings you closer to your rank and weekly rewards.</p>
                </div>
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Complete your first Daily Mock Test at 9:00 AM.</li>
                    <li>Check the Live Leaderboard to see where you stand.</li>
                    <li>Refer your friends to earn Silver and Gold coins.</li>
                </ul>
                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                    © 2026 VidyaJaya Technologies Pvt Ltd. Kadiri, AP, India.
                </div>
            </div>
        `
    }),
    paymentSuccess: (name, plan) => ({
        subject: `Success! You are now a VidyaJaya PRO Member 💎`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #00C853;">Payment Successful! 🎉</h1>
                <p>Hello ${name}, your upgrade to <strong>VidyaJaya ${plan}</strong> has been processed successfully.</p>
                <p>Your Pro benefits are now active:</p>
                <ul>
                    <li>Unlimited Daily Mock Tests</li>
                    <li>Full AI Performance Analytics</li>
                    <li>Eligibility for Weekly Cash Rewards</li>
                    <li>3x Coin Multipliers on Streaks</li>
                </ul>
                <p>Go to your dashboard to start your premium journey!</p>
            </div>
        `
    })
};

module.exports = { sendEmail, emailTemplates };
