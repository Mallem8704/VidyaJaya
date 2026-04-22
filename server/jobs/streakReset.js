const cron = require('node-cron');
const supabase = require('../config/supabase');
const { subDays } = require('date-fns');

// Run daily at 11:59 PM IST (which is 18:29 UTC)
const startStreakResetJob = () => {
  cron.schedule('59 23 * * *', async () => {
    console.log('Running daily streak reset job...');
    
    // Today 00:00:00
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Yesterday 00:00:00
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    try {
      // 1. Fetch users with an active streak
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, streak, last_streak_update, freezes_remaining')
        .gt('streak', 0);

      if (error) throw error;
      
      for (const user of users) {
        const lastUpdate = user.last_streak_update ? new Date(user.last_streak_update) : null;
        
        // If they didn't take a test today AND didn't take one yesterday
        // (Streak is usually updated on test submission)
        if (!lastUpdate || lastUpdate < yesterdayStart) {
          
          if (user.freezes_remaining > 0) {
            // Automatically use a freeze
            console.log(`Using freeze for user ${user.id}`);
            await supabase
              .from('profiles')
              .update({ freezes_remaining: user.freezes_remaining - 1 })
              .eq('id', user.id);
            
            // In a real app, we would add a notification here
          } else {
            // Reset streak
            console.log(`Resetting streak for user ${user.id}`);
            await supabase
              .from('profiles')
              .update({ streak: 0 })
              .eq('id', user.id);
          }
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

