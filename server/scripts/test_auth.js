const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key start:', supabaseKey?.substring(0, 10));

const authClient = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    // Just try to fetch something public or check session
    const { data, error } = await authClient.auth.getSession();
    if (error) {
      console.error('Auth check failed:', error.message);
    } else {
      console.log('Auth check success!');
    }
  } catch (err) {
    console.error('Crash during auth check:', err.message);
  }
}

testAuth();
