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
    coinsEarned: sub.coins_earned_calc || 0, // returned from profile update
    createdAt: sub.created_at,
    answers: sub.submission_answers?.map(ans => ({
      questionId: ans.question_id,
      selectedIndex: ans.selected_index,
      timeTaken: ans.time_taken,
      question: ans.questions // nested question data
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
    if (currentHour >= 21) {
       return res.status(403).json({ 
         message: 'Contest Closed! Submissions are only accepted until 9:00 PM IST.' 
       });
    }

    // 2. FETCH TEST & QUESTIONS
    const { data: testData, error: testErr } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
    if (testErr || !testData) return res.status(404).json({ message: 'Test not found' });
    const test = testData;
    const questionsToGrade = testData.questions;

    // 3. TIER LIMITS CHECK
    const isProUser = user.is_pro && (!user.pro_expiry || new Date(user.pro_expiry) > new Date());
    const isPremium = isProUser || (user.plan === 'premium') || (user.plan === 'pro') || (user.plan === 'pro+');
    
    if (test.category === 'Daily Streak') {
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySubs } = await supabase
            .from('submissions')
            .select('id')
            .eq('user_id', user.id)
            .gte('created_at', today);

        if (!isPremium) {
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
            if (todaySubs && todaySubs.length >= 6) {
                return res.status(403).json({ message: 'Daily Limit Reached for all 6 sectors!' });
            }
        }
    }

    // 3b. PREMIUM TEST ATTEMPT LIMIT
    if (test.is_premium) {
      const today = new Date().toISOString().split('T')[0];
      const { data: premiumSubs, error: premErr } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .gte('created_at', today);
      
      if (premiumSubs && premiumSubs.length >= 3) {
        return res.status(403).json({
          message: 'Daily Limit Reached for this Premium Test! You can attempt each premium mock test up to 3 times daily to ensure fair competition.'
        });
      }
    }

    // 4. SCORING
    const result = calculateScore(answers, questionsToGrade, test);

    // BUG 3 FIX: Removed coins_earned from submissions insert (column doesn't exist)
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
        topic_wise: result.topicWise
      })
      .select()
      .single();
    
    if (subError) throw subError;

    // 5b. SAVE INDIVIDUAL ANSWERS to submission_answers table
    if (answers && answers.length > 0) {
      const answerRows = answers.map(ans => ({
        submission_id: submission.id,
        question_id: ans.questionId,
        selected_index: ans.selectedIndex !== undefined ? ans.selectedIndex : null,
        time_taken: ans.timeTaken || 0
      }));
      const { error: ansErr } = await supabase.from('submission_answers').insert(answerRows);
      if (ansErr) console.error('Warning: Failed to save answer details:', ansErr.message);
    }

    // Calculate coins for this submission
    let coinsEarned = 0;
    
    if (isPremium || user.role === 'admin') {
      coinsEarned = result.accuracy >= 80 ? 25 : 10;
      // Bonus for high performance
      if (result.accuracy === 100) coinsEarned += 15;
    } else {
      // Free users don't earn coins that can be withdrawn
      coinsEarned = 0; 
    }

    // 6. UPDATE PROFILE STATS & ANTI-CHEAT
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins, streak, weekly_score, total_score, last_streak_update, referred_by, daily_reward_accumulated, last_reward_reset')
      .eq('id', user.id)
      .single();

    // Check Daily Cap (Max 50 coins/day from test attempts)
    const today = new Date().toDateString();
    const lastReset = profile?.last_reward_reset ? new Date(profile.last_reward_reset).toDateString() : null;
    let currentDailyTotal = lastReset === today ? (profile?.daily_reward_accumulated || 0) : 0;
    
    if (currentDailyTotal >= 50) {
      coinsEarned = 0; // Cap reached
      console.log(`User ${user.id} reached daily reward cap.`);
    } else {
      // Don't exceed the cap in a single submission
      if (currentDailyTotal + coinsEarned > 50) {
        coinsEarned = 50 - currentDailyTotal;
      }
    }

    const lastUpdate = profile?.last_streak_update 
      ? new Date(profile.last_streak_update).toDateString() 
      : null;
    const shouldIncrementStreak = lastUpdate !== today;
    const newStreak = shouldIncrementStreak ? (profile?.streak || 0) + 1 : (profile?.streak || 0);

    // Milestone Rewards
    let milestoneBonus = 0;
    if (shouldIncrementStreak) {
      if (newStreak === 3) milestoneBonus = 50;
      if (newStreak === 7) milestoneBonus = 150;
      if (newStreak === 30) milestoneBonus = 1000;
    }

    await supabase.from('profiles').update({
      coins: (profile?.coins || 0) + coinsEarned + milestoneBonus,
      streak: newStreak,
      weekly_score: (profile?.weekly_score || 0) + result.score,
      total_score: (profile?.total_score || 0) + result.score,
      accuracy: result.accuracy,
      last_streak_update: shouldIncrementStreak ? new Date() : profile?.last_streak_update,
      daily_reward_accumulated: currentDailyTotal + coinsEarned,
      last_reward_reset: new Date()
    }).eq('id', user.id);

    // 7. RECORD REWARDS
    if (coinsEarned > 0) {
      await supabase.from('rewards').insert({
          user_id: user.id,
          type: 'earned',
          amount: coinsEarned,
          description: `Earned coins from completing: ${test.title}${coinsEarned < (result.accuracy >= 80 ? 25 : 10) ? ' (Daily Cap Applied)' : ''}`
      });
    }

    if (milestoneBonus > 0) {
      await supabase.from('rewards').insert({
          user_id: user.id,
          type: 'milestone',
          amount: milestoneBonus,
          description: `Streak Milestone Reward! Reached ${newStreak} days.`
      });
    }

    // 8. REFERRAL COMPLETION (If this is the first submission)
    const { count: submissionCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (submissionCount === 1 && profile.referred_by) {
      // First test completed! Pay referrer (₹10) and referee (₹5 already given or add more)
      const referrerId = profile.referred_by;
      
      // Pay Referrer (100 coins = ₹10 approx)
      const { data: referrer } = await supabase.from('profiles').select('coins').eq('id', referrerId).single();
      await supabase.from('profiles').update({ coins: (referrer?.coins || 0) + 100 }).eq('id', referrerId);
      
      await supabase.from('rewards').insert({
          user_id: referrerId,
          type: 'referral',
          amount: 100,
          description: `Referral Reward for inviting ${profile.name}!`
      });

      // Mark referral as completed
      await supabase.from('referrals')
        .update({ status: 'completed', reward_paid: true })
        .eq('referrer_id', referrerId)
        .eq('referee_id', user.id);
    }

    res.status(201).json({
      ...mapSubmission(submission),
      coinsEarned,
      milestoneBonus
    });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// Get submission by ID (with full answer details for Result page)
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
