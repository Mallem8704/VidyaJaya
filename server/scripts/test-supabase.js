const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabase() {
    console.log("Testing Supabase connection...");
    console.log("URL:", process.env.SUPABASE_URL);
    
    try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        if (error) {
            console.error("Supabase Error:", error.message);
        } else {
            console.log("SUCCESS! Connected to Supabase. Found", data.length, "profiles.");
        }
    } catch (error) {
        console.error("FAILURE! Could not connect to Supabase:");
        console.error(error);
    }
}

testSupabase();
