const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['UPSC', 'SSC', 'RRB', 'Banking', 'Reasoning', 'Aptitude'],
    required: true 
  },
  subCategory: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  negativeMarking: { type: Number, default: 0 },
  duration: { type: Number, required: true }, // in minutes
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  isPaid: { type: Boolean, default: false },
  requiredPlan: { type: String, enum: ['free', 'pro', 'pro+'], default: 'free' },
  attempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
