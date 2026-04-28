-- VidyaJaya Referral System 2.0 Migration

-- 1. REFERRAL_CODES: Unique codes for users/influencers
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('influencer', 'user')) NOT NULL,
    owner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    commission_percent NUMERIC DEFAULT 10.0, -- Relevant for influencers
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REFERRALS: Linking Referrer to Referee
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT REFERENCES referral_codes(code),
    is_successful BOOLEAN DEFAULT FALSE, -- Set to true after referee pays
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_user_id) -- A user can only be referred once
);

-- 3. COMMISSIONS: Financial tracking for Influencers
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referrals(id),
    subscription_amount NUMERIC NOT NULL,
    commission_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER_REWARDS: Milestone tracking for regular users
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    milestone_count INTEGER NOT NULL, -- e.g. 5, 10
    reward_type TEXT CHECK (reward_type IN ('weekly_free', 'monthly_free')),
    status TEXT DEFAULT 'granted' CHECK (status IN ('granted', 'used')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Extend PROFILES Table with referral metadata
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS referral_type TEXT CHECK (referral_type IN ('influencer', 'user')),
ADD COLUMN IF NOT EXISTS total_successful_referrals INTEGER DEFAULT 0;

-- 6. Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- 7. Basic RLS Policies
DROP POLICY IF EXISTS "Referral codes are viewable by everyone" ON referral_codes;
CREATE POLICY "Referral codes are viewable by everyone" ON referral_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Referrers can see their own referrals" ON referrals;
CREATE POLICY "Referrers can see their own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Referrers can see their own commissions" ON commissions;
CREATE POLICY "Referrers can see their own commissions" ON commissions FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can see their own rewards" ON user_rewards;
CREATE POLICY "Users can see their own rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);
