const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../utils/gemini');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/generate-questions
 * @desc    Generate questions using AI and store them
 * @access  Private
 */
router.post('/generate-questions', protect, async (req, res) => {
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

    // 3. Format for Supabase and Store (Only using verified existing columns)
    const questionsToInsert = questions.map(q => ({
      text: q.question,
      options: q.options,
      correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
      explanation: q.explanation,
      category: subject,
      difficulty: q.difficulty?.toLowerCase() || 'medium'
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;

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
 * @desc    Get daily questions for a subject
 * @access  Private
 */
router.get('/daily', protect, async (req, res) => {
  const { subject } = req.query;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabase
      .from('questions')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (subject) {
      query = query.eq('category', subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch daily questions' });
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

    const counts = {};
    data.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question counts' });
  }
});

module.exports = router;
