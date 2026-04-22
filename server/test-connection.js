const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env');
  process.exit(1);
}

// Strip trailing slash if present
const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

const supabase = createClient(cleanUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to:', cleanUrl);
  try {
    const { data, error } = await supabase.from('tests').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('Code:', error.code);
    } else {
      console.log('✅ Success! Supabase connection established.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();
