const supabase = require('../server/config/supabase');

async function testApiLogic() {
    // Simulated User (Your Master Admin ID from logs)
    const userId = 'dd3811ce-7b5e-4e8f-817a-966817abef8c'; 
    console.log('Testing logic for User ID:', userId);

    try {
        console.log('1. Checking profile...');
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, referral_code, total_successful_referrals')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Profile fetch failed:', profileError);
            return;
        }

        if (!profile) {
            console.log('2. Profile missing, attempting creation...');
            const generatedCode = 'TEST' + Math.random().toString(36).substring(2, 5).toUpperCase();
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    name: 'Master Admin',
                    email: 'admin@test.com',
                    referral_code: generatedCode,
                    plan: 'free'
                })
                .select()
                .single();
            
            if (createError) {
                console.error('CRITICAL: Profile creation failed!', createError.message);
                console.log('Details:', createError.details);
                return;
            }
            profile = newProfile;
            console.log('Profile created successfully!');
        }

        console.log('3. Checking referrals table...');
        const { data: referrals, error: refError } = await supabase
            .from('referrals')
            .select('id, referred_user_id')
            .eq('referrer_id', userId);

        if (refError) {
            console.error('Referrals query failed:', refError.message);
            return;
        }
        console.log('Referrals count:', referrals?.length || 0);

        console.log('4. Checking rewards table...');
        const { error: rewardError } = await supabase
            .from('user_rewards')
            .select('*')
            .eq('user_id', userId);
        
        if (rewardError) {
            console.error('Rewards table check failed:', rewardError.message);
            return;
        }

        console.log('✅ ALL DATABASE QUERIES ARE PASSING INDEPENDENTLY.');

    } catch (err) {
        console.error('Unexpected Script Error:', err.message);
    }
}

testApiLogic();
