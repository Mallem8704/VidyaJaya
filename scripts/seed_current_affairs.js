const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: 'c:/Users/malle/OneDrive/Desktop/vidyajaya/server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleData = [
  {
    title: 'India Launches New Semi-Conductor Mission',
    summary: 'The Union Cabinet has approved a ₹76,000 crore incentive scheme for semi-conductors and display manufacturing ecosystem in India.',
    category: 'National',
    read_time: '4 min read',
    is_trending: true,
    published_at: new Date().toISOString()
  },
  {
    title: 'G20 Summit 2026: Global Leaders Converge',
    summary: 'The annual G20 summit kicks off today with a focus on climate finance and mobilizing $1 trillion annually for developing nations.',
    category: 'International',
    read_time: '6 min read',
    is_trending: true,
    published_at: new Date().toISOString()
  },
  {
    title: 'RBI Keeps Repo Rate Unchanged at 6.5%',
    summary: 'The Monetary Policy Committee decided to remain focused on withdrawal of accommodation to ensure inflation aligns with target.',
    category: 'Economy',
    read_time: '3 min read',
    is_trending: false,
    published_at: new Date().toISOString()
  }
];

async function seed() {
  console.log('Attempting to seed Current Affairs data...');
  
  // First, check if table exists by trying to select
  const { error: checkError } = await supabase.from('current_affairs').select('id').limit(1);
  
  if (checkError && (checkError.code === 'PGRST116' || checkError.message.includes('does not exist'))) {
    console.error('❌ Table "current_affairs" does not exist in Supabase.');
    console.log('Please run the SQL in "server/db/current_affairs.sql" in your Supabase SQL Editor first.');
    process.exit(1);
  }

  console.log('Table exists. Inserting sample data...');
  const { data, error } = await supabase.from('current_affairs').insert(sampleData);

  if (error) {
    console.error('Error inserting data:', error.message);
    process.exit(1);
  }

  console.log('✅ Successfully seeded current affairs data!');
  process.exit(0);
}

seed();
