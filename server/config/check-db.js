const supabase = require('./supabase');

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error selecting from profiles:', error);
  } else {
    console.log('Successfully selected from profiles. Table exists.');
    console.log('Sample data keys:', data.length > 0 ? Object.keys(data[0]) : 'No data in table yet');
  }
}

checkProfiles();
