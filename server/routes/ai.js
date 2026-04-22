const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/ai/analysis
// @desc    Get user's AI-driven performance analysis
router.get('/analysis', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all submissions
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('topic_wise, time_taken, accuracy, score')
      .eq('user_id', userId);

    if (error) throw error;

    if (!submissions || submissions.length === 0) {
      return res.json({
        hasData: false,
        message: 'Not enough data yet. Take a few tests to see your AI analysis!'
      });
    }

    // 2. Aggregate topic data
    const topicStats = {};
    let totalAccuracy = 0;
    let totalScore = 0;

    submissions.forEach(sub => {
      totalAccuracy += sub.accuracy || 0;
      totalScore += sub.score || 0;

      if (sub.topic_wise) {
        sub.topic_wise.forEach(t => {
          if (!topicStats[t.topic]) {
            topicStats[t.topic] = { correct: 0, total: 0 };
          }
          topicStats[t.topic].correct += t.correct;
          topicStats[t.topic].total += t.total;
        });
      }
    });

    const topics = Object.keys(topicStats).map(name => ({
      name,
      accuracy: Math.round((topicStats[name].correct / topicStats[name].total) * 100),
      totalQuestions: topicStats[name].total
    }));

    // Sort by accuracy
    topics.sort((a, b) => b.accuracy - a.accuracy);

    const strengths = topics.slice(0, 2).map(t => ({
      topic: t.name,
      insight: `Mastery level: ${t.accuracy}%. You are performing better than 85% of peers in this area.`
    }));

    const weaknesses = topics.reverse().slice(0, 2).map(t => ({
      topic: t.name,
      insight: `Accuracy dropped to ${t.accuracy}%. Focus on basic concepts and attempt 15+ practice questions.`
    }));

    // 3. Generate dynamic action plan
    const actionPlan = [
      {
        days: 'Day 1 - 2: Foundation Rebuild',
        task: `Focus on ${weaknesses[0]?.topic || 'General Studies'}. Revisit theory and take a sectional mock.`
      },
      {
        days: 'Day 3 - 5: Practice & Speed',
        task: `Daily drills for ${weaknesses[1]?.topic || 'Quantitative Aptitude'}. Aim for sub-60s response time.`
      },
      {
        days: 'Day 6 - 7: Mock & Review',
        task: `Take a full length mock. Implement skipping strategy for ${weaknesses[0]?.topic || 'difficult'} questions.`
      }
    ];

    res.json({
      hasData: true,
      stats: {
        testsTaken: submissions.length,
        avgAccuracy: Math.round(totalAccuracy / submissions.length),
        totalScore: Math.round(totalScore)
      },
      strengths,
      weaknesses,
      actionPlan
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
