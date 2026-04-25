const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.warn(`Profile not found for user ${userId}, returning default stats.`);
      return res.json({
        accuracy: 0,
        testsTaken: 0,
        streak: 0,
        coins: 0,
        rank: '?',
        performance: "Average",
        improvementMessage: "Take your first test!",
        recommendation: "🎯 Take tests to unlock AI insights!",
        lastUpdated: new Date().toISOString()
      });
    }

    // Fetch submissions from Supabase
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('correct_count, wrong_count, skipped_count, submitted_at, topic_wise')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (subError) {
      console.error("Submissions Fetch Error:", subError);
      // Return stats with empty submissions if table fetch fails
      return res.json({
        accuracy: user.accuracy || 0,
        testsTaken: 0,
        streak: user.streak || 0,
        coins: user.coins || 0,
        rank: '?',
        performance: "Average",
        improvementMessage: "Database connection issue",
        recommendation: "🎯 Statistics unavailable at the moment",
        lastUpdated: new Date().toISOString()
      });
    }

    // 1. Total Tests
    const totalTests = submissions.length;

    // 2. Accuracy
    const correct = submissions.reduce((sum, sub) => sum + (sub.correct_count || 0), 0);
    const total = submissions.reduce((sum, sub) => sum + (sub.correct_count || 0) + (sub.wrong_count || 0) + (sub.skipped_count || 0), 0);
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

    // 3. Coins
    const coins = user.coins || 0;

    // 4. Streak logic (fixed: no mutable Date mutation in loop)
    const dateSet = new Set(
      submissions.map(sub => new Date(sub.submitted_at).toISOString().split('T')[0])
    );
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Start from today if submitted today, otherwise from yesterday
    let startOffset = dateSet.has(todayStr) ? 0 : (dateSet.has(yesterdayStr) ? 1 : -1);
    
    if (startOffset >= 0) {
      for (let i = startOffset; ; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(checkStr)) {
          streak++;
        } else {
          break;
        }
      }
    }

    // 5. Rank (Count users with higher accuracy)
    const { count: betterUsers, error: rankError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('accuracy', accuracy);
      
    const rank = (betterUsers || 0) + 1;

    // 6. Insight Metric: Weekly Progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklySubmissions = submissions.filter(sub => new Date(sub.submitted_at) >= oneWeekAgo);
    let improvementMessage = "Take more tests to see insights!";
    
    if (weeklySubmissions.length > 0) {
       const weeklyC = weeklySubmissions.reduce((sum, sub) => sum + (sub.correct_count || 0), 0);
       const weeklyT = weeklySubmissions.reduce((sum, sub) => sum + (sub.correct_count || 0) + (sub.wrong_count || 0) + (sub.skipped_count || 0), 0);
       const weeklyAccuracy = weeklyT === 0 ? 0 : Math.round((weeklyC / weeklyT) * 100);
       const improvement = weeklyAccuracy - accuracy;
       
       if (totalTests === 0) improvementMessage = "Finish your first test!";
       else if (improvement > 0) improvementMessage = `🔥 You improved +${improvement}% recently`;
       else if (improvement < 0) improvementMessage = `Keep practicing to bounce back!`;
       else improvementMessage = `Consistent performance this week!`;
    }

    // 7. Performance Tag
    let performance = "Average";
    if (accuracy >= 80) performance = "Excellent";
    else if (accuracy >= 60) performance = "Good";
    else performance = "Needs Improvement";

    // 8. Next Action Recommendation
    const topicStats = {};
    submissions.forEach(sub => {
      if (sub.topic_wise && Array.isArray(sub.topic_wise)) {
        sub.topic_wise.forEach(t => {
          const topicName = t.topic || 'General';
          if (!topicStats[topicName]) topicStats[topicName] = { correct: 0, total: 0 };
          topicStats[topicName].correct += (t.correct || 0);
          topicStats[topicName].total += (t.total || 0);
        });
      }
    });

    let weakestTopic = null;
    let lowestAcc = 100;
    for (let topic in topicStats) {
      const { correct, total } = topicStats[topic];
      if (total > 0) {
        const acc = (correct / total) * 100;
        if (acc < lowestAcc) {
          lowestAcc = acc;
          weakestTopic = topic;
        }
      }
    }

    let recommendation = "🎯 Keep practicing to unlock insights!";
    if (accuracy > 80) recommendation = "🔥 You're doing great — attempt a mock test now!";
    else if (weakestTopic) recommendation = `🎯 Revise ${weakestTopic} — weakest area`;

    // 9. Chart Data (Last 7 tests trend)
    const chartData = [...submissions]
      .reverse()
      .slice(-7)
      .map((sub, i) => ({
        day: `T-${submissions.length - 1 - (submissions.length - 1 - i)}`,
        score: sub.accuracy || 0
      }));

    // 10. Recent Tests (Last 5)
    // Fetch titles for recent tests
    const { data: recentSubmissions } = await supabase
      .from('submissions')
      .select('id, accuracy, time_taken, tests(title)')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(5);

    const recentTests = recentSubmissions?.map(sub => ({
      id: sub.id,
      title: sub.tests?.title || 'Practice Session',
      score: sub.accuracy || 0,
      time: Math.round((sub.time_taken || 0) / 60) + 'm',
      status: 'Completed'
    })) || [];

    res.json({
      accuracy,
      testsTaken: totalTests,
      streak,
      coins,
      rank,
      performance,
      improvementMessage,
      recommendation,
      chartData,
      recentTests,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
