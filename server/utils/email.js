const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
  // Mock email implementation. In production use nodemailer transporter
  console.log(`------------- EMAIL SENT -------------`);
  console.log(`To: ${email}`);
  console.log(`Subject: Your VidyaJaya OTP Code`);
  console.log(`Body: Your OTP code is ${otp}. It will expire in 10 minutes.`);
  console.log(`--------------------------------------`);
  return true;
};

module.exports = { generateOTP, sendEmailOTP };
