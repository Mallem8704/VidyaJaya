const cron = require('node-cron');
const User = require('../models/User');

const startLeaderboardUpdateJob = (io) => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running leaderboard update job...');
    try {
      // 1. Update Global Rankings (based on totalScore)
      const globalUsers = await User.find().sort({ totalScore: -1 }).select('_id totalScore globalRank');
      for (let i = 0; i < globalUsers.length; i++) {
        if (globalUsers[i].globalRank !== i + 1) {
          await User.updateOne({ _id: globalUsers[i]._id }, { globalRank: i + 1 });
        }
      }

      // 2. Update Weekly Rankings (based on weeklyScore)
      const weeklyUsers = await User.find().sort({ weeklyScore: -1 }).select('_id weeklyScore weeklyRank');
      for (let i = 0; i < weeklyUsers.length; i++) {
        if (weeklyUsers[i].weeklyRank !== i + 1) {
          await User.updateOne({ _id: weeklyUsers[i]._id }, { weeklyRank: i + 1 });
        }
      }

      // 3. Update Monthly Rankings (based on monthlyScore)
      const monthlyUsers = await User.find().sort({ monthlyScore: -1 }).select('_id monthlyScore monthlyRank');
      for (let i = 0; i < monthlyUsers.length; i++) {
        if (monthlyUsers[i].monthlyRank !== i + 1) {
          await User.updateOne({ _id: monthlyUsers[i]._id }, { monthlyRank: i + 1 });
        }
      }

      console.log('Leaderboard ranks updated.');
      
      // Emit socket event with top 50 global
      const top50 = await User.find().sort({ totalScore: -1 }).limit(50).select('name avatar totalScore globalRank streak coins');
      io.emit('leaderboard:updated', top50);
      
    } catch (error) {
      console.error('Error in leaderboard update job:', error);
    }
  });

  // Reset weekly scores every Sunday at 10 PM IST (16:30 UTC)
  cron.schedule('30 16 * * 0', async () => {
    console.log('Resetting weekly scores...');
    try {
      await User.updateMany({}, { weeklyScore: 0, weeklyRank: 0 });
      console.log('Weekly scores reset.');
    } catch (error) {
      console.error('Error resetting weekly scores:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Reset monthly scores at midnight on the 1st of every month
  cron.schedule('0 0 1 * *', async () => {
    console.log('Resetting monthly scores...');
    try {
      await User.updateMany({}, { monthlyScore: 0, monthlyRank: 0 });
      console.log('Monthly scores reset.');
    } catch (error) {
      console.error('Error resetting monthly scores:', error);
    }
  });
};

module.exports = startLeaderboardUpdateJob;
