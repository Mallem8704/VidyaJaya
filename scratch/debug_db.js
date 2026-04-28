const supabase = require('../server/config/supabase');

async function checkDatabase() {
    console.log('Checking database tables...');
    
    const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, total_successful_referrals')
        .limit(1);

    if (error) {
        console.error('DATABASE ERROR:', error.message);
        if (error.message.includes('column "referral_code" does not exist')) {
            console.log('>>> MISSING COLUMNS: You need to run the migration!');
        }
    } else {
        console.log('SUCCESS: Profiles table has referral columns.');
    }

    const { data: refCodes, error: refError } = await supabase
        .from('referral_codes')
        .select('*')
        .limit(1);
    
    if (refError) {
        console.error('TABLE ERROR (referral_codes):', refError.message);
    } else {
        console.log('SUCCESS: referral_codes table exists.');
    }
}

checkDatabase();
