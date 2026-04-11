const cron = require('node-cron');
const User = require('../models/User');
const { format, subDays } = require('date-fns');

// Run daily at 11:59 PM IST (which is 18:29 UTC)
const startStreakResetJob = () => {
  // node-cron is based on server local time unless timezone is specified.
  cron.schedule('59 23 * * *', async () => {
    console.log('Running daily streak reset job...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const users = await User.find({ 'streak.current': { $gt: 0 } });
      
      for (const user of users) {
        const lastTestDate = user.streak.lastTestDate;
        
        if (!lastTestDate || lastTestDate < yesterday) {
          // Missed testing yesterday
          if (user.streak.freezesRemaining > 0) {
            user.streak.freezesRemaining -= 1;
            user.notifications.push({
              type: 'streak',
              message: 'You missed your test yesterday! A streak freeze was automatically used to save your streak. 🔥'
            });
            console.log(`Used freeze for user ${user._id}`);
          } else {
            console.log(`Resetting streak for user ${user._id}`);
            user.streak.current = 0;
            user.notifications.push({
              type: 'streak',
              message: 'Your streak was reset! Start fresh today. 🔥'
            });
          }
          await user.save();
        }
      }
      console.log('Daily streak reset job completed.');
    } catch (error) {
      console.error('Error in daily streak reset job:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = startStreakResetJob;
