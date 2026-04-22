const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  try {
    // Try to fetch something generic or just check if the client can reach the server
    const { data, error } = await supabase.from('tests').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error.message);
      if (error.message.includes('failed to fetch')) {
        console.log('Tip: Check if the URL is correct and your internet connection is active.');
      }
    } else {
      console.log('✅ Success! Supabase connection established.');
      console.log('Note: If you haven\'t run the schema.sql yet, some table queries might still fail.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();
