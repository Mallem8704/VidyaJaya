const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: 'c:/Users/malle/OneDrive/Desktop/vidyajaya/server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking for current_affairs table in Supabase...');
  try {
    const { data, error } = await supabase.from('current_affairs').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('❌ Table "current_affairs" does NOT exist.');
      } else {
        console.error('Error checking table:', error.message);
      }
    } else {
      console.log('✅ Table "current_affairs" exists.');
      console.log('Sample data count:', data ? data.length : 0);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkTable();
