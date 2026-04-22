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
    testId: sub.tests || sub.test_id, // Populate case
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

// Submit a test
router.post('/', protect, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    
    let test;
    let questionsToGrade;
    
    if (testId === 'mock-47') {
      test = {
        id: 'mock-47',
        title: 'UPSC Prelims Mock 47',
        category: 'UPSC',
        total_marks: 10,
        total_questions: 5,
        negative_marking: 0.67
      };
      questionsToGrade = req.body.questions || [];
    } else {
      const { data, error } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
      if (error || !data) return res.status(404).json({ message: 'Test not found' });
      test = data;
      questionsToGrade = data.questions;
    }

    // Calculate score
    const result = calculateScore(answers, questionsToGrade, test);

    // Save submission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        user_id: req.user.id,
        test_id: test.id === 'mock-47' ? null : test.id,
        score: result.score,
        total_marks: test.total_marks || test.totalMarks,
        accuracy: result.accuracy,
        time_taken: result.timeTaken,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        skipped_count: result.skippedCount,
        topic_wise: result.topicWise,
        coins_earned: result.accuracy > 80 ? 25 : 10
      })
      .select()
      .single();
    
    if (subError) throw subError;

    // Save answers
    if (answers && answers.length > 0) {
      const answersToInsert = answers.map(ans => ({
        submission_id: submission.id,
        question_id: ans.questionId,
        selected_index: ans.selectedIndex,
        time_taken: ans.timeTaken
      }));
      
      const { error: ansError } = await supabase
        .from('submission_answers')
        .insert(answersToInsert);
        
      if (ansError) console.error('Answer Insert Error:', ansError);
    }

    // Update User Stats (Calculate overall accuracy and total score)
    const { data: allSubs } = await supabase.from('submissions').select('correct_count, wrong_count, skipped_count, score').eq('user_id', req.user.id);
    
    const totalCorrect = allSubs.reduce((sum, s) => sum + (s.correct_count || 0), 0);
    const totalAttempted = allSubs.reduce((sum, s) => sum + (s.correct_count || 0) + (s.wrong_count || 0) + (s.skipped_count || 0), 0);
    const overallAccuracy = totalAttempted === 0 ? 0 : Math.round((totalCorrect / totalAttempted) * 100);
    const totalScore = allSubs.reduce((sum, s) => sum + (s.score || 0), 0);

    const { data: profile } = await supabase.from('profiles').select('coins, streak, weekly_score').eq('id', req.user.id).single();
    
    await supabase.from('profiles').update({
      coins: (profile?.coins || 0) + (submission.coins_earned || 0),
      streak: (profile?.streak || 0) + 1,
      total_score: totalScore,
      weekly_score: (profile?.weekly_score || 0) + result.score,
      accuracy: overallAccuracy,
      last_streak_update: new Date()
    }).eq('id', req.user.id);

    // Record the transaction in the rewards table
    await supabase.from('rewards').insert({
        user_id: req.user.id,
        transaction_type: 'earned',
        amount: submission.coins_earned || 0,
        source: 'test_completion',
        description: `Earned from ${test.title || 'test'}`
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


