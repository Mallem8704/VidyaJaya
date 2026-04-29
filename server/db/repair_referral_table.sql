-- 🛠️ REPAIR REFERRAL TABLE
-- Run this in your Supabase SQL Editor to fix the "Missing Column" error.

-- 1. Ensure columns exist in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_type TEXT;

-- 2. Ensure referrals table has the correct columns
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referred_user_id UUID REFERENCES public.profiles(id);

-- 3. Add UNIQUE constraint to referred_user_id if not already there
-- This prevents a user from being referred multiple times
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referred_user_id_key') THEN
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_user_id_key UNIQUE (referred_user_id);
    END IF;
END $$;

-- 4. Grant permissions to anon and authenticated users
GRANT ALL ON public.referrals TO anon;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
