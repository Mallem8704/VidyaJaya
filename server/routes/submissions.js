const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Test = require('../models/Test');
const User = require('../models/User');
const { calculateScore } = require('../utils/scoring');
const { protect } = require('../middleware/authMiddleware');

// Submit a test
router.post('/', protect, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    
    let test;
    let questionsToGrade;
    
    if (testId === 'mock-47') {
      test = {
        _id: 'mock-47',
        title: 'UPSC Prelims Mock 47',
        category: 'UPSC',
        totalMarks: 10,
        totalQuestions: 5,
        negativeMarking: 0.67
      };
      // For hardcoded frontend questions, the frontend will send the questions array in the request body
      questionsToGrade = req.body.questions || [];
    } else {
      test = await Test.findById(testId).populate('questions');
      if (!test) return res.status(404).json({ message: 'Test not found' });
      questionsToGrade = test.questions;
    }

    // Calculate score
    const result = calculateScore(answers, questionsToGrade, test);

    // Save submission
    const submission = new Submission({
      userId: req.user._id,
      testId: test._id,
      answers,
      ...result,
      coinsEarned: result.accuracy > 80 ? 25 : 10 // Base logic for coins
    });
    
    await submission.save();

    // Update User Stats
    const user = await User.findById(req.user._id);
    user.coins += submission.coinsEarned;
    user.totalCoinsEarned += submission.coinsEarned;
    user.totalTests += 1;
    user.streak.current += 1; // Basic streak increment for demo
    user.streak.lastTestDate = new Date();
    user.weeklyScore += result.score;
    user.monthlyScore += result.score;
    user.totalScore += result.score;
    
    await user.save();

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user submissions
router.get('/my', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate('testId', 'title category')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('testId')
      .populate({
        path: 'answers.questionId',
        model: 'Question'
      });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
