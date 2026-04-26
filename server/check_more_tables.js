const supabase = require('./config/supabase');

async function checkMoreTables() {
  const tables = ['results', 'attempts', 'submissions'];
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
        if (data && data.length > 0) {
            console.log(`Columns in ${table}:`, Object.keys(data[0]));
        }
      }
    } catch (err) {
      console.error(`Unexpected error for ${table}:`, err);
    }
  }
}

checkMoreTables();
