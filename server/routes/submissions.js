const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { calculateScore } = require('../utils/scoring');
const { protect } = require('../middleware/authMiddleware');

// Helper to map Supabase snake_case to Frontend camelCase
const mapSubmission = (sub) => {
  if (!sub) return null;
  return {
    _id: sub.id,
    id: sub.id,
    userId: sub.user_id,
    testId: sub.tests || sub.test_id,
    score: sub.score,
    totalMarks: sub.total_marks,
    accuracy: sub.accuracy,
    timeTaken: sub.time_taken,
    correctCount: sub.correct_count,
    wrongCount: sub.wrong_count,
    skippedCount: sub.skipped_count,
    topicWise: sub.topic_wise,
    coinsEarned: sub.coins_earned,
    createdAt: sub.created_at,
    answers: sub.submission_answers?.map(ans => ({
      questionId: ans.question_id,
      selectedIndex: ans.selected_index,
      timeTaken: ans.time_taken
    }))
  };
};

/**
 * @route   POST /api/submissions
 * @desc    Submit a test with Curfew (9 PM) and Tier Limits
 */
router.post('/', protect, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const user = req.user;

    // 1. CURFEW CHECK (9:00 PM CLOSURE)
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 21) { // 9 PM onwards
       return res.status(403).json({ 
         message: 'Contest Closed! Submissions are only accepted until 9:00 PM IST.' 
       });
    }

    // 2. FETCH TEST & QUESTIONS
    let test;
    let questionsToGrade;
    
    const { data: testData, error: testErr } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
    if (testErr || !testData) return res.status(404).json({ message: 'Test not found' });
    test = testData;
    questionsToGrade = testData.questions;

    // 3. TIER LIMITS CHECK
    const isPremium = user.is_premium || false;
    
    // Check if today's daily test
    if (test.category === 'Daily Streak') {
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySubs } = await supabase
            .from('submissions')
            .select('id, test_id')
            .eq('user_id', user.id)
            .gte('created_at', today);

        if (!isPremium) {
            // Free Tier: 1 sector/day, 10 questions limit
            if (todaySubs && todaySubs.length >= 1) {
                return res.status(403).json({ 
                    message: 'Daily Limit Reached! Free tier users can attempt 1 sector per day. Upgrade to Pro for all 6 sectors.' 
                });
            }
            if (answers.length > 10) {
                return res.status(403).json({ 
                    message: 'Free Tier Limit! You can only submit up to 10 questions. Upgrade to Pro for full 30 questions.' 
                });
            }
        } else {
            // Premium Tier: All 6 sectors (max 6 submissions for the daily test if categorized by sector)
            // Or if it's one big test, 180 questions.
            if (todaySubs && todaySubs.length >= 6) {
                return res.status(403).json({ message: 'Daily Limit Reached for all 6 sectors!' });
            }
        }
    }

    // 4. SCORING (Precision Engine)
    const result = calculateScore(answers, questionsToGrade, test);

    // 5. SAVE SUBMISSION
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        test_id: test.id,
        score: result.score,
        total_marks: test.total_marks,
        accuracy: result.accuracy,
        time_taken: result.timeTaken,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        skipped_count: result.skippedCount,
        topic_wise: result.topicWise,
        coins_earned: result.accuracy > 80 ? 25 : 10 // Basic coin logic, can be refined
      })
      .select()
      .single();
    
    if (subError) throw subError;

    // 6. UPDATE PROFILE STATS
    const { data: profile } = await supabase.from('profiles').select('coins, streak, weekly_score').eq('id', user.id).single();
    
    await supabase.from('profiles').update({
      coins: (profile?.coins || 0) + (submission.coins_earned || 0),
      streak: (profile?.streak || 0) + 1,
      weekly_score: (profile?.weekly_score || 0) + result.score,
      last_streak_update: new Date()
    }).eq('id', user.id);

    // 7. RECORD REWARD
    await supabase.from('rewards').insert({
        user_id: user.id,
        transaction_type: 'earned',
        amount: submission.coins_earned || 0,
        source: 'test_completion',
        description: `Earned from ${test.title}`
    });

    res.status(201).json(mapSubmission(submission));
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user submissions
router.get('/my', protect, async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*, tests(title, category)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(submissions.map(mapSubmission));
  } catch (error) {
    console.error('Fetch My Submissions Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*, tests(*), submission_answers(*, questions(*))')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Submission not found' });
      throw error;
    }
    
    res.json(mapSubmission(submission));
  } catch (error) {
    console.error('Fetch Submission Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
