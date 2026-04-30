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
    const { testId, aiSetId, answers } = req.body;
    const user = req.user;

    // 1. CONTEST WINDOW CHECK (Only for non-AI tests)
    if (!aiSetId) {
      const now = new Date();
      const currentHour = now.getHours();
      
      if (currentHour < 9) {
         return res.status(403).json({ 
           message: 'Contest Not Started! The battle begins at 09:00 AM IST. Prepare yourself!' 
         });
      }

      if (currentHour >= 21) {
         return res.status(403).json({ 
           message: 'Contest Ended! Submissions for today are closed. Come back tomorrow at 09:00 AM!' 
         });
      }
    }

    // 2. FETCH TEST & QUESTIONS
    let test;
    let questionsToGrade;

    if (aiSetId) {
        // AI Test Logic
        const { data: setData, error: setErr } = await supabase
            .from('ai_question_sets')
            .select('*')
            .eq('id', aiSetId)
            .single();
            
        if (setErr || !setData) return res.status(404).json({ message: 'AI Test not found' });
        
        let parsedQuestions = typeof setData.questions === 'string' ? JSON.parse(setData.questions) : setData.questions;
        
        // AI questions usually lack an ID, so we assign their index as ID to match frontend
        questionsToGrade = parsedQuestions.map((q, idx) => ({
            id: q.id || idx,
            category: q.category || setData.category || 'General',
            correct_index: q.correct_index !== undefined ? q.correct_index : (q.options ? q.options.indexOf(q.answer) : 0)
        }));
        
        test = { 
            id: null, 
            total_marks: questionsToGrade.length * 10, 
            is_premium: false,
            total_questions: questionsToGrade.length,
            category: setData.category || 'AI Practice'
        };
    } else {
        // Standard Mock Test Logic
        const { data: testData, error: testErr } = await supabase
            .from('tests')
            .select('*, questions(*)')
            .eq('id', testId)
            .single();
            
        if (testErr || !testData) return res.status(404).json({ message: 'Test not found' });
        test = testData;
        questionsToGrade = testData.questions;
    }

    // 3. TIER LIMITS CHECK
    const isProUser = user.is_pro && (!user.pro_expiry || new Date(user.pro_expiry) > new Date());
    const isPremium = isProUser || (user.plan === 'premium') || (user.plan === 'pro') || (user.plan === 'pro+');
    
    if (!aiSetId && test.category === 'Daily Streak') {
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
    if (!aiSetId && test.is_premium) {
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

    // 5. SAVE SUBMISSION
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        test_id: test.id, // null for AI tests
        score: result.score,
        total_marks: test.total_marks,
        accuracy: result.accuracy,
        time_taken: result.timeTaken,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        skipped_count: result.skippedCount,
        topic_wise: result.topicWise,
        contest_date: new Date().toISOString().split('T')[0]
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

    // 6. ANTI-CHEAT LOGIC
    let isSuspicious = false;
    const minTimePerQuestion = 1.5; // 1.5 seconds minimum per question
    const totalQuestions = answers.length;
    
    // Flag if speed is impossible (e.g., 10 questions in < 15 seconds)
    if (result.timeTaken < (totalQuestions * minTimePerQuestion) && totalQuestions >= 5) {
      isSuspicious = true;
    }

    // Flag if perfect score in very low time
    if (result.accuracy === 100 && result.timeTaken < (totalQuestions * 3)) {
      isSuspicious = true;
    }

    if (isSuspicious) {
      console.warn(`[ANTI-CHEAT] Suspicious submission from ${user.id}. Flagging user.`);
      await supabase.from('profiles').update({ user_flagged: true }).eq('id', user.id);
    }

    // Calculate coins for this submission
    let silverEarned = 0;
    let goldEarned = 0;
    
    const isVerified = user.is_verified || user.kyc_verified;
    const isFlagged = user.user_flagged || isSuspicious;

    if (isFlagged) {
        console.log(`[REWARDS] Blocked for user ${user.id} due to flag.`);
    } else {
        // 1. SILVER COINS (Engagement) - Awarded for any test completion
        silverEarned = result.accuracy >= 80 ? 25 : 10;
        if (result.accuracy === 100) silverEarned += 15;

        // 2. GOLD COINS (Achievement) - Awarded ONLY for Premium/Scholarship tests
        if (test.is_premium && isVerified && result.accuracy === 100) {
            goldEarned = 10; // Merit reward
            console.log(`[GOLD REWARD] User ${user.id} earned 10 Gold Coins for perfect score.`);
        }
    }

    // 6. UPDATE PROFILE STATS & ANTI-CHEAT
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins, streak, weekly_score, total_score, last_streak_update, referred_by, daily_reward_accumulated, last_reward_reset')
      .eq('id', user.id)
      .single();

    // Check Daily Cap (Max 50 silver coins/day from test attempts)
    const today = new Date().toDateString();
    const lastReset = profile?.last_reward_reset ? new Date(profile.last_reward_reset).toDateString() : null;
    let currentDailyTotal = lastReset === today ? (profile?.daily_reward_accumulated || 0) : 0;
    
    if (currentDailyTotal >= 50) {
      silverEarned = 0; // Cap reached
      console.log(`User ${user.id} reached daily reward cap.`);
    } else {
      if (currentDailyTotal + silverEarned > 50) {
        silverEarned = 50 - currentDailyTotal;
      }
    }

    const lastUpdate = profile?.last_streak_update 
      ? new Date(profile.last_streak_update).toDateString() 
      : null;
    const shouldIncrementStreak = lastUpdate !== today;
    const newStreak = shouldIncrementStreak ? (profile?.streak || 0) + 1 : (profile?.streak || 0);

    // Milestone Rewards (In Silver)
    let milestoneBonus = 0;
    if (shouldIncrementStreak) {
      if (newStreak === 3) milestoneBonus = 50;
      if (newStreak === 7) milestoneBonus = 150;
      if (newStreak === 30) milestoneBonus = 1000;
    }

    // Update Profile Stats
    const profileUpdate = {
      accuracy: result.accuracy,
      last_streak_update: shouldIncrementStreak ? new Date() : profile?.last_streak_update,
      daily_reward_accumulated: currentDailyTotal + silverEarned,
      last_reward_reset: new Date(),
      streak: newStreak,
      silver_coins: (profile?.silver_coins || profile?.coins || 0) + silverEarned + milestoneBonus,
      gold_coins: (profile?.gold_coins || 0) + goldEarned,
      coins: (profile?.silver_coins || profile?.coins || 0) + silverEarned + milestoneBonus // legacy
    };

    // Only PRO test results go to PRO leaderboard
    if (test.is_premium) {
      profileUpdate.weekly_score = (profile?.weekly_score || 0) + result.score;
      profileUpdate.monthly_score = (profile?.monthly_score || 0) + result.score;
      profileUpdate.total_score = (profile?.total_score || 0) + result.score;
    }

    await supabase.from('profiles').update(profileUpdate).eq('id', user.id);

    // 7. RECORD REWARDS
    if (silverEarned > 0) {
      await supabase.from('rewards').insert({
          user_id: user.id,
          type: 'silver_earned',
          amount: silverEarned,
          description: `Earned silver coins from: ${test.title}`
      });
    }

    if (goldEarned > 0) {
        await supabase.from('rewards').insert({
            user_id: user.id,
            type: 'gold_earned',
            amount: goldEarned,
            description: `Achievement Reward: 100% accuracy on ${test.title}`
        });
      }

    if (milestoneBonus > 0) {
      await supabase.from('rewards').insert({
          user_id: user.id,
          type: 'milestone',
          amount: milestoneBonus,
          description: `Streak Milestone (${newStreak} days)`
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

    const responseData = mapSubmission(submission) || {};
    
    res.status(201).json({
      ...responseData,
      id: submission?.id || responseData.id,
      silverEarned,
      goldEarned,
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
    const { id } = req.params;
    
    // Safety check for invalid UUIDs (prevents 500 database errors)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (id === 'null' || !uuidRegex.test(id)) {
      return res.status(404).json({ message: 'Invalid submission ID' });
    }

    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*, tests(*), submission_answers(*, questions(*))')
      .eq('id', id)
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
