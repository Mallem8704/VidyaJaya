const supabase = require('./config/supabase');

async function checkTables() {
  const tables = ['leaderboard', 'scores', 'users'];
  for (const table of tables) {
    console.log(`Checking ${table} table...`);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
      } else {
        console.log(`Successfully fetched ${table} data:`, data);
      }
    } catch (err) {
      console.error(`Unexpected error for ${table}:`, err);
    }
  }
}

checkTables();
