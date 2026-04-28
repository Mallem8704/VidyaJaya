const supabase = require('../config/supabase');

async function check() {
    console.log("\n--- 🔍 VIDYAJAYA DATABASE DIAGNOSTIC ---");
    
    try {
        // 1. Check if the code VIBE10 exists
        const { data: vibeCode, error: codeErr } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', 'VIBE10')
            .maybeSingle();

        if (codeErr) console.error("Error fetching VIBE10:", codeErr.message);
        
        if (vibeCode) {
            console.log(`✅ VIBE10 Code FOUND. Owner User ID: ${vibeCode.owner_user_id}`);
        } else {
            console.log("❌ VIBE10 Code NOT FOUND in referral_codes table.");
        }

        // 2. Check the 'referrals' table
        const { data: referrals, error: refErr } = await supabase
            .from('referrals')
            .select('*');
        
        if (refErr) console.error("Error fetching referrals:", refErr.message);
        console.log(`📊 Total records in 'referrals' table: ${referrals?.length || 0}`);
        
        if (referrals && referrals.length > 0) {
            console.log("Recent Referral Entries:");
            console.table(referrals.map(r => ({
                id: r.id.substring(0,8),
                referrer: r.referrer_id?.substring(0,8),
                referee: r.referred_user_id?.substring(0,8),
                code: r.referral_code,
                success: r.is_successful
            })));
        }

        // 3. Check profiles for the 'referred_by_code' column
        const { data: joinedUsers, error: profErr } = await supabase
            .from('profiles')
            .select('name, email, referred_by_code, created_at')
            .eq('referred_by_code', 'VIBE10');

        if (profErr) console.error("Error fetching profiles:", profErr.message);
        console.log(`👤 Users found in profiles with 'VIBE10': ${joinedUsers?.length || 0}`);
        
        if (joinedUsers && joinedUsers.length > 0) {
            console.table(joinedUsers);
        }

    } catch (err) {
        console.error("Diagnostic Failed:", err.message);
    }
    
    console.log("--- END DIAGNOSTIC ---\n");
    process.exit();
}

check();
