const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Must read from User and Submission (Test results)
    // Optimization: explicitly selecting only the fields we need to reduce memory footprint
    const submissions = await Submission.find({ userId })
      .select('correctCount wrongCount skippedCount submittedAt')
      .sort({ submittedAt: -1 })
      .lean();

    // 1. Total Tests
    const totalTests = submissions.length;

    // 2. Accuracy
    const correct = submissions.reduce((sum, sub) => sum + (sub.correctCount || 0), 0);
    const total = submissions.reduce((sum, sub) => sum + (sub.correctCount || 0) + (sub.wrongCount || 0) + (sub.skippedCount || 0), 0);
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

    // Update User's base accuracy to keep our rank computation honest and fast
    if (user.accuracy !== accuracy) {
       user.accuracy = accuracy;
       user.totalTests = totalTests;
       await user.save();
    }

    // 3. Coins
    const coins = user.coins || totalTests * 10;

    // 4. Streak (Properly handling 'Yesterday' missing logic)
    const dates = [...new Set(submissions.map(sub => new Date(sub.submittedAt).toDateString()))];
    let streak = 0;
    
    // allow streak to start from today OR yesterday
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let checkDate = new Date();
    if (!dates.includes(today.toDateString()) && dates.includes(yesterday.toDateString())) {
        checkDate = yesterday;
    }

    for (let d of dates) {
      const dString = new Date(d).toDateString();
      if (dString === checkDate.toDateString()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (new Date(d) > checkDate) {
        // Skip ahead
        continue;
      } else {
        break; // streak broke
      }
    }

    // 5. Rank
    const betterUsers = await User.countDocuments({
      accuracy: { $gt: accuracy }
    });
    const rank = betterUsers + 1;

    // 6. Insight Metric: Weekly Progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklySubmissions = submissions.filter(sub => new Date(sub.submittedAt) >= oneWeekAgo);
    let improvementMessage = "Take more tests to see insights!";
    
    if (weeklySubmissions.length > 0) {
       const weeklyC = weeklySubmissions.reduce((sum, sub) => sum + (sub.correctCount || 0), 0);
       const weeklyT = weeklySubmissions.reduce((sum, sub) => sum + (sub.correctCount || 0) + (sub.wrongCount || 0) + (sub.skippedCount || 0), 0);
       const weeklyAccuracy = weeklyT === 0 ? 0 : Math.round((weeklyC / weeklyT) * 100);
       
       const improvement = weeklyAccuracy - accuracy;
       
       if (totalTests === 0) {
         improvementMessage = "Finish your first test!";
       } else if (improvement > 0) {
           improvementMessage = `🔥 You improved +${improvement}% recently`;
       } else if (improvement < 0) {
           improvementMessage = `Keep practicing to bounce back!`;
       } else {
           improvementMessage = `Consistent performance this week!`;
       }
    }

    // 7. Performance Tag
    let performance = "Average";
    if (accuracy >= 80) performance = "Excellent";
    else if (accuracy >= 60) performance = "Good";
    else performance = "Needs Improvement";

    res.json({
      accuracy,
      testsTaken: totalTests,
      streak,
      coins,
      rank,
      performance,
      improvementMessage,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
