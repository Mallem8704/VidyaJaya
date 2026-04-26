const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../utils/groq');
const supabase = require('../config/supabase');
const { protect, checkAiLimit } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/generate-questions
 * @desc    Generate questions using AI and store them
 * @access  Private
 */
router.post('/generate-questions', protect, checkAiLimit, async (req, res) => {
  const { subject, difficulty, weakTopics } = req.body;

  if (!subject) {
    return res.status(400).json({ message: 'Subject is required' });
  }

  try {
    // 1. Generate questions using Gemini
    let questions;
    try {
      questions = await generateQuestions(subject, difficulty || 'medium', weakTopics || []);
    } catch (aiError) {
      console.warn("Retrying question generation due to error:", aiError.message);
      // Simple retry once as requested
      questions = await generateQuestions(subject, difficulty || 'medium', weakTopics || []);
    }

    /* 
    // 2. Avoid duplicate generation for same subject today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: existing } = await supabase
      .from('questions')
      .select('id')
      .eq('category', subject)
      .gte('created_at', today.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ message: 'Questions for this subject have already been generated today.' });
    }
    */

    // 3. Format for Supabase and Store
    const questionsToInsert = questions.map(q => ({
      text: q.question,
      options: q.options,
      correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
      explanation: q.explanation,
      category: subject,
      difficulty: q.difficulty?.toLowerCase() || 'medium',
      user_id: req.user.id // Attribution
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
        // Fallback if user_id column doesn't exist
        if (error.message.includes('user_id')) {
            console.warn('user_id column missing in questions table. Inserting without it.');
            const fallbackInsert = questionsToInsert.map(({user_id, ...rest}) => rest);
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('questions')
                .insert(fallbackInsert)
                .select();
            if (fallbackError) throw fallbackError;

            // Increment usage count for free users
            if (!req.user.is_pro && req.user.role !== 'admin') {
                await supabase
                .from('profiles')
                .update({ ai_practice_count: (req.user.ai_practice_count || 0) + 1 })
                .eq('id', req.user.id);
            }

            return res.status(201).json({
                message: 'Questions generated (no user_id)',
                questions: fallbackData
            });
        }
        throw error;
    }

    // Increment usage count for free users
    if (!req.user.is_pro && req.user.role !== 'admin') {
        await supabase
        .from('profiles')
        .update({ ai_practice_count: (req.user.ai_practice_count || 0) + 1 })
        .eq('id', req.user.id);
    }

    res.status(201).json({
      message: 'Questions generated and stored successfully',
      count: data.length,
      questions: data
    });

  } catch (error) {
    console.error('Question Generation Route Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate questions', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/questions/daily
 * @desc    Get daily questions for a subject (Recent 20)
 * @access  Private
 */
router.get('/daily', protect, async (req, res) => {
  const { subject, difficulty } = req.query;
  
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .is('test_id', null) // Only AI questions
      .order('created_at', { ascending: false })
      .limit(20);

    if (subject) {
      query = query.eq('category', subject);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty.toLowerCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent questions' });
  }
});

/**
 * @route   GET /api/questions/counts-by-category
 * @desc    Get total question counts grouped by category
 * @access  Private
 */
router.get('/counts-by-category', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('category');

    if (error) throw error;

    // Normalization mapping to bridge legacy/DB names to UI names
    const categoryMapping = {
      'Indian Polity': 'Civic & Electoral',
      'History': 'UPSC & Govt Exams',
      'Geography': 'UPSC & Govt Exams',
      'UPSC': 'UPSC & Govt Exams',
      'SSC': 'UPSC & Govt Exams',
      'Science & Technology': 'Science & Technology',
      'Business & Finance': 'Business & Finance',
      'Current Affairs': 'Daily Current Affairs'
    };

    const counts = {};
    data.forEach(q => {
      const normalizedName = categoryMapping[q.category] || q.category;
      counts[normalizedName] = (counts[normalizedName] || 0) + 1;
    });

    res.json(counts);
  } catch (error) {
    console.error('Counts Error:', error);
    res.status(500).json({ message: 'Failed to fetch question counts' });
  }
});

/**
 * @route   GET /api/questions
 * @desc    Get questions by category
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  const { category, limit = 50 } = req.query;
  
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (category) {
      // Handle normalization in search too
      const normalizedCategories = [category];
      if (category === 'Civic & Electoral') normalizedCategories.push('Indian Polity');
      if (category === 'UPSC & Govt Exams') normalizedCategories.push('History', 'Geography', 'UPSC', 'SSC');
      if (category === 'Daily Current Affairs') normalizedCategories.push('Current Affairs');

      query = query.in('category', normalizedCategories);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Fetch Questions Error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

module.exports = router;
