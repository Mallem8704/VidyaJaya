const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

const checkTests = async () => {
    console.log("--- CHECKING TESTS TABLE ---");
    const { data, error } = await supabase.from('tests').select('*').limit(5);
    if (error) {
        console.error("DB ERROR:", error);
    } else {
        console.log("COLUMNS:", Object.keys(data[0] || {}));
        console.log("DATA SAMPLES:", data.map(t => ({ title: t.title, cat: t.category })));
    }
};

checkTests();
