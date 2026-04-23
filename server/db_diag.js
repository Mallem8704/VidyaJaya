const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

const checkQuestions = async () => {
    console.log("--- CHECKING QUESTIONS TABLE ---");
    const { data, error } = await supabase.from('questions').select('*').limit(1);
    if (error) {
        console.error("DB ERROR:", error);
    } else if (data && data.length > 0) {
        console.log("COLUMNS:", Object.keys(data[0]));
    } else {
        console.log("TABLE EMPTY. Attempting to get table info...");
    }
};

checkQuestions();
