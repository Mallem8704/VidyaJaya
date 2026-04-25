const supabase = require('../config/supabase');

async function checkSchema() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in profiles table:', Object.keys(data[0]));
  } else {
    console.log('No data in profiles table to check columns.');
  }
}

checkSchema();
