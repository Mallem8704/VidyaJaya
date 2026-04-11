const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionText: { type: String },
  imageBase64: { type: String }, // Base64 image string
  subject: { type: String },
  aiSolution: {
    answer: { type: String },
    explanation: { type: String },
    relatedConcepts: [{ type: String }],
    memoryTips: { type: String }
  },
  isHelpful: { type: Boolean },
  status: { type: String, enum: ['pending', 'solved', 'failed'], default: 'pending' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Doubt', doubtSchema);
