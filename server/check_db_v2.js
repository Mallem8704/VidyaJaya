const supabase = require('./config/supabase');

async function checkProfiles() {
  console.log('Checking profiles table...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      console.log('Successfully fetched profile data:', data);
      if (data && data.length > 0) {
        console.log('Columns in profiles table:', Object.keys(data[0]));
      } else {
        console.log('Profiles table is empty.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkProfiles();
