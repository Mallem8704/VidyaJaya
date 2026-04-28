const supabase = require('../server/config/supabase');

async function deepAudit() {
    console.log('--- STARTING DEEP AUDIT ---');
    
    // 1. Check Profile Columns
    const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'profiles' }); // Note: this might not exist, trying fallback

    const { data: profileSample, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.error('Error fetching profile sample:', profileError.message);
    } else if (profileSample && profileSample.length > 0) {
        console.log('Profile columns found:', Object.keys(profileSample[0]));
    } else {
        console.log('Profiles table is empty.');
    }

    // 2. Check Referrals Join Compatibility
    const { data: refCheck, error: refCheckError } = await supabase
        .from('referrals')
        .select('id, profiles!referred_user_id(name)')
        .limit(1);
    
    if (refCheckError) {
        console.error('REFERRALS JOIN ERROR:', refCheckError.message);
        if (refCheckError.message.includes('column profiles.name does not exist')) {
            console.log('>>> FIX: profiles table uses a different name column (likely full_name or displayName)');
        }
    } else {
        console.log('Referrals join is working.');
    }

    console.log('--- AUDIT COMPLETE ---');
}

deepAudit();
