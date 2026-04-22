const cron = require('node-cron');
const supabase = require('../config/supabase');

const startLeaderboardUpdateJob = (io) => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running leaderboard update job...');
    try {
      // In PostgreSQL, we can fetch the top users directly and emit them.
      // Ranks are usually calculated on the fly in the frontend or during query.
      
      const { data: top50, error } = await supabase
        .from('profiles')
        .select('name, avatar, total_score, streak, coins')
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (top50 && io) {
        io.emit('leaderboard:updated', top50);
      }
      
      console.log('Leaderboard socket update emitted.');
    } catch (error) {
      console.error('Error in leaderboard update job:', error);
    }
  });

  // Reset weekly scores every Sunday at 10 PM IST (16:30 UTC)
  cron.schedule('30 16 * * 0', async () => {
    console.log('Resetting weekly scores...');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ weekly_score: 0 });
        
      if (error) throw error;
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
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_score: 0 });
        
      if (error) throw error;
      console.log('Monthly scores reset.');
    } catch (error) {
      console.error('Error resetting monthly scores:', error);
    }
  });
};

module.exports = startLeaderboardUpdateJob;

