-- Migration: Dual-Currency System (Vidyajaya 2.0)
-- 1. Add Gold and Silver coin columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gold_coins BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS silver_coins BIGINT DEFAULT 0;

-- 2. Migrate existing 'coins' to 'silver_coins'
UPDATE profiles SET silver_coins = coins WHERE silver_coins = 0 AND coins > 0;

-- 3. (Optional) Keep 'coins' column but mark as deprecated or remove if safe
-- ALTER TABLE profiles DROP COLUMN coins;

-- 4. Add Influencer tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS influencer_commission_rate NUMERIC DEFAULT 10.0;

-- 5. Add Referral Milestone Tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_count_current INTEGER DEFAULT 0;
