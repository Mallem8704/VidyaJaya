const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionType: { type: String, enum: ['earned', 'spent'], required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true }, // e.g., 'test_completion', 'daily_login', 'streak_freeze'
  description: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
