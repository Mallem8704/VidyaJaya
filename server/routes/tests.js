const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const { protect } = require('../middleware/authMiddleware');

// Get all tests
router.get('/', protect, async (req, res) => {
  try {
    // For demo purposes, we'll return mock data if the DB is empty
    const tests = await Test.find().select('-questions');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test by ID (includes questions)
router.get('/:id', protect, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Shuffle options for each question to prevent cheating (server-side format change)
    // Normally we'd do it here, but keeping it simple for now
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
