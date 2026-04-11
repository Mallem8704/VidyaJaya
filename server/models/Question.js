const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true }, // 0 to 3
  explanation: { type: String },
  category: { type: String },
  subTopic: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  imageUrl: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
