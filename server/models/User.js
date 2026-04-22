const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  examGoal: {
    type: String,
    enum: ['UPSC', 'SSC', 'RRB', 'Banking', 'Reasoning', 'Aptitude'],
  },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  plan: {
    type: String,
    enum: ['free', 'pro', 'pro+'],
    default: 'free'
  },
  planExpiresAt: { type: Date },
  streak: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    lastTestDate: { type: Date },
    freezesRemaining: { type: Number, default: 0 }
  },
  coins: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  monthlyScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  weeklyRank: { type: Number, default: 0 },
  monthlyRank: { type: Number, default: 0 },
  globalRank: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  avgTime: { type: Number, default: 0 },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  notifications: [{
    type: { type: String }, // e.g., 'streak', 'reward', 'test'
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
