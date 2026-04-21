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
    const submissions = await Submission.find({ userId }).sort({ submittedAt: -1 });

    // 1. Total Tests
    const totalTests = submissions.length;

    // 2. Accuracy
    const correct = submissions.reduce((sum, sub) => sum + (sub.correctCount || 0), 0);
    const total = submissions.reduce((sum, sub) => sum + (sub.correctCount || 0) + (sub.wrongCount || 0) + (sub.skippedCount || 0), 0);
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

    // Update User's base accuracy to keep our rank computation honest across the board
    if (user.accuracy !== accuracy) {
       user.accuracy = accuracy;
       user.totalTests = totalTests;
       await user.save();
    }

    // 3. Coins
    const coins = user.coins || totalTests * 10;

    // 4. Streak
    const dates = [...new Set(submissions.map(sub => new Date(sub.submittedAt).toDateString()))];
    let streak = 0;
    let current = new Date();
    
    // Check if the user already did a test today; if not, we should also check if they did one yesterday to keep the streak alive.
    // However, following the STRICT SPEC exactly:
    let checkDate = new Date();
    for (let d of dates) {
      if (new Date(d).toDateString() === checkDate.toDateString()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If they haven't submitted TODAY, but they submitted YESTERDAY, the streak isn't visibly broken yet.
        if (streak === 0 && checkDate.toDateString() === new Date().toDateString()) {
             checkDate.setDate(checkDate.getDate() - 1);
             if (new Date(d).toDateString() === checkDate.toDateString()) {
                 streak++;
                 checkDate.setDate(checkDate.getDate() - 1);
                 continue;
             }
        }
        break;
      }
    }

    // 5. Rank
    const betterUsers = await User.countDocuments({
      accuracy: { $gt: accuracy }
    });
    const rank = betterUsers + 1;

    // 6. Performance Tag
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
      performance
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
