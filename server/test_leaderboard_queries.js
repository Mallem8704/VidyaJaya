const supabase = require('./config/supabase');

async function testLeaderboardQueries() {
  const endpoints = ['global', 'weekly', 'monthly'];
  
  for (const ep of endpoints) {
    console.log(`Testing query for ${ep}...`);
    try {
      let scoreCol = ep === 'global' ? 'total_score' : `${ep}_score`;
      let selectCols = `name, avatar, ${scoreCol}, streak, coins, exam_goal, is_pro`;
      if (ep !== 'global') selectCols += ', pro_expiry';

      const { data, error } = await supabase
        .from('profiles')
        .select(selectCols)
        .order(scoreCol, { ascending: false })
        .limit(5);

      if (error) {
        console.error(`Error in ${ep} query:`, error.message);
      } else {
        console.log(`Success for ${ep}! Found ${data.length} records.`);
        if (data.length > 0) {
            console.log('Sample data:', data[0]);
        }
      }
    } catch (err) {
      console.error(`Unexpected error for ${ep}:`, err);
    }
    console.log('---');
  }
}

testLeaderboardQueries();
