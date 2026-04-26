const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../utils/groq');
const supabase = require('../config/supabase');
const { protect, checkAiLimit } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/questions/generate-questions
 * @desc    Generate questions using AI and store them
 * @access  Private
 */
router.post('/generate-questions', protect, checkAiLimit, async (req, res) => {
  const { subject, difficulty, weakTopics } = req.body;

  if (!subject) {
    return res.status(400).json({ message: 'Subject is required' });
  }

  try {
    // 1. DUPLICATE PREVENTION: Check if a similar set was generated in the last 10 minutes
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentSets } = await supabase
      .from('ai_question_sets')
      .select('id, created_at')
      .eq('user_id', req.user.id)
      .eq('category', subject)
      .eq('difficulty', difficulty || 'medium')
      .gte('created_at', tenMinsAgo)
      .limit(1);

    if (recentSets && recentSets.length > 0) {
      return res.status(409).json({ 
        message: 'A similar set was generated recently.',
        code: 'RECENT_GENERATION_EXISTS',
        setId: recentSets[0].id
      });
    }

    // 2. Generate questions using AI
    let questions;
    try {
      questions = await generateQuestions(subject, difficulty || 'medium', weakTopics || []);
    } catch (aiError) {
      console.warn("AI Generation error, retrying...", aiError.message);
      questions = await generateQuestions(subject, difficulty || 'medium', weakTopics || []);
    }

    // 3. Format individual questions for the 'questions' table (for general feed)
    const questionsToInsert = questions.map(q => ({
      text: q.question,
      options: q.options,
      correct_index: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0,
      explanation: q.explanation,
      category: subject,
      difficulty: q.difficulty?.toLowerCase() || 'medium',
      user_id: req.user.id
    }));

    // 4. Save individual questions
    const { data: insertedQs, error: qError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    // 5. Save as a grouped SET in 'ai_question_sets'
    const { data: setEntry, error: setError } = await supabase
      .from('ai_question_sets')
      .insert({
        user_id: req.user.id,
        category: subject,
        difficulty: difficulty || 'medium',
        questions: questions, // Store full JSON
        usage_count: 1
      })
      .select()
      .single();

    if (setError) console.error('Failed to save AI question set:', setError.message);

    // 6. Increment usage count for free users
    if (!req.user.is_pro && req.user.role !== 'admin') {
        await supabase
        .from('profiles')
        .update({ ai_practice_count: (req.user.ai_practice_count || 0) + 1 })
        .eq('id', req.user.id);
    }

    res.status(201).json({
      message: 'Questions generated and stored successfully',
      questions: questions, // Return the raw AI objects for immediate UI display
      setId: setEntry?.id,
      count: questions.length
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
 * @route   GET /api/questions/ai-history
 * @desc    Get user's AI generation history
 * @access  Private
 */
router.get('/ai-history', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_question_sets')
      .select('id, category, difficulty, created_at, usage_count')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

/**
 * @route   GET /api/questions/ai-set/:id
 * @desc    Get a specific AI question set
 * @access  Private
 */
router.get('/ai-set/:id', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_question_sets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    
    // Increment usage count
    await supabase.rpc('increment_set_usage', { set_id: req.params.id });
    // Fallback
    await supabase.from('ai_question_sets').update({ usage_count: (data.usage_count || 0) + 1 }).eq('id', req.params.id);

    res.json(data);
  } catch (error) {
    console.error('Set Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch question set' });
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
