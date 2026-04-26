const supabase = require('./config/supabase');

async function checkTests() {
  console.log('Checking tests table...');
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching tests:', error.message);
    } else {
      console.log('Successfully fetched test data:', data);
      if (data && data.length > 0) {
        console.log('Columns in tests table:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTests();
