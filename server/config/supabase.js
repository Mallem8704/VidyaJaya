const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Initializing Supabase with URL:', supabaseUrl);
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key missing in environment variables');
} else {
  console.log('Supabase Key loaded (first 10 chars):', supabaseKey.substring(0, 10) + '...');
  // Check if it matches the expected SERVICE_ROLE_KEY start
  const expectedKeyStart = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10);
  console.log('Is it the Service Role Key?', supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

module.exports = supabase;

