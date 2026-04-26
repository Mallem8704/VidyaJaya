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
    // 1. Fetch test basic info first to check premium status
    const { data: testInfo, error: infoError } = await supabase
      .from('tests')
      .select('is_premium')
      .eq('id', req.params.id)
      .single();

    if (infoError) {
      if (infoError.code === 'PGRST116') return res.status(404).json({ message: 'Test not found' });
      throw infoError;
    }

    // 2. Check Pro access for premium tests
    const isPro = req.user.is_pro || req.user.role === 'admin' || req.user.plan === 'admin';
    if (testInfo.is_premium && !isPro) {
      return res.status(403).json({ 
        message: 'Upgrade to Pro to attempt full mock tests and compete for rewards',
        code: 'PRO_REQUIRED'
      });
    }

    // 3. Fetch full test data with questions
    const { data: test, error } = await supabase
      .from('tests')
      .select('*, questions(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    
    res.json(test);
  } catch (error) {
    console.error('Fetch test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

