const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Initializing Supabase with URL:', supabaseUrl);
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

