const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedIndex: { type: Number }, // 0 to 3, or -1 if skipped
    timeTaken: { type: Number } // in seconds
  }],
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // total time taken in seconds
  correctCount: { type: Number, required: true },
  wrongCount: { type: Number, required: true },
  skippedCount: { type: Number, required: true },
  rank: { type: Number },
  percentile: { type: Number },
  topicWise: [{
    topic: { type: String },
    correct: { type: Number },
    total: { type: Number }
  }],
  coinsEarned: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
