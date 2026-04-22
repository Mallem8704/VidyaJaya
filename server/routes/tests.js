const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// Get all tests
router.get('/', protect, async (req, res) => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, category, description, duration, total_marks, total_questions, negative_marking, is_premium');

    if (error) throw error;
    res.json(tests);
  } catch (error) {
    console.error('Fetch tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test by ID (includes questions)
router.get('/:id', protect, async (req, res) => {
  try {
    // In Supabase, we can use select('*, questions(*)') to fetch nested data if relationships are defined
    const { data: test, error } = await supabase
      .from('tests')
      .select('*, questions(*)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Test not found' });
      throw error;
    }
    
    res.json(test);
  } catch (error) {
    console.error('Fetch test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

