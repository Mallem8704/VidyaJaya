-- ============================================================
-- 🚨 FINAL REFERRAL FIX — Run this in Supabase SQL Editor
-- This adds the 2 missing columns that are blocking all saves
-- ============================================================

-- Add missing columns to the referrals table
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS is_successful BOOLEAN DEFAULT FALSE;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add missing columns to profiles (safe, won't break existing data)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_type TEXT;

-- Ensure unique constraint exists (safe if it already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'referrals_referred_user_id_key'
    ) THEN
        ALTER TABLE public.referrals 
        ADD CONSTRAINT referrals_referred_user_id_key UNIQUE (referred_user_id);
    END IF;
END $$;

-- Grant full permissions to service role
GRANT ALL ON public.referrals TO service_role;
GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO anon;

-- Verify the fix worked — you should see all columns listed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;
