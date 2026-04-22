const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/practice/drill
// @desc    Generate a custom drill based on user's weak topics
router.get('/drill', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user submissions to find weakest topic
    const { data: submissions } = await supabase
      .from('submissions')
      .select('topic_wise')
      .eq('user_id', userId);

    const topicStats = {};
    submissions?.forEach(sub => {
      sub.topic_wise?.forEach(t => {
        if (!topicStats[t.topic]) topicStats[t.topic] = { correct: 0, total: 0 };
        topicStats[t.topic].correct += t.correct;
        topicStats[t.topic].total += t.total;
      });
    });

    let weakestTopic = 'General';
    let minAccuracy = 101;

    Object.keys(topicStats).forEach(topic => {
      const acc = (topicStats[topic].correct / topicStats[topic].total) * 100;
      if (acc < minAccuracy) {
        minAccuracy = acc;
        weakestTopic = topic;
      }
    });

    // 2. Fetch questions for the weakest topic
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .ilike('topic', `%${weakestTopic}%`)
      .limit(20);

    if (error) throw error;

    // 3. Fallback if no questions found for that topic
    if (!questions || questions.length === 0) {
      const { data: randomQs } = await supabase.from('questions').select('*').limit(20);
      return res.json({ 
        topic: 'Mixed Practice', 
        questions: randomQs || [] 
      });
    }

    res.json({ 
      topic: weakestTopic, 
      questions 
    });

  } catch (error) {
    console.error('AI Drill Generation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
