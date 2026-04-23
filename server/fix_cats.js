const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

const fixCategories = async () => {
    console.log("--- FIXING TEST CATEGORIES ---");
    const { data, error } = await supabase
        .from('tests')
        .update({ category: 'UPSC' })
        .eq('category', 'Manual AI Generation');
        
    if (error) {
        console.error("FIX FAILED:", error);
    } else {
        console.log("FIX SUCCESS! All AI tests are now in UPSC category.");
    }

    const { data: qFix, error: qErr } = await supabase
        .from('tests')
        .update({ category: 'UPSC' })
        .eq('category', 'Daily Mega Contest');
    
    if (qErr) console.error("MEGA FIX FAILED:", qErr);
    else console.log("MEGA FIX SUCCESS!");
};

fixCategories();
