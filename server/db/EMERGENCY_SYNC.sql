-- Emergency Sync: Vidyajaya DB Consistency Fix
-- This script adds missing columns expected by the backend routes

-- 1. Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS daily_reward_accumulated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_reset TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS gold_coins BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS silver_coins BIGINT DEFAULT 0;

-- 2. Submissions Table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS contest_date DATE;

-- 3. Referrals Table (Syncing with submissions.js expectations)
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reward_paid BOOLEAN DEFAULT FALSE;

-- Ensure test_id is nullable for AI sets
ALTER TABLE public.submissions ALTER COLUMN test_id DROP NOT NULL;
