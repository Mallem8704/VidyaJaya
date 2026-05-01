  -- ============================================================
-- 🚨 CRITICAL FIX: Run this in Supabase SQL Editor NOW
-- This fixes the trigger that crashes when new users sign up
-- ============================================================

-- 1. Fix the handle_new_user trigger to be crash-proof
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Safely create wallet (ignore if exists)
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Never crash auth signup, just log and continue
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-attach the trigger (safe to run even if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create a profile for the user who got stuck (vders@gmail.com)
-- First find their auth ID
DO $$
DECLARE
  stuck_user_id UUID;
BEGIN
  -- Insert profile for any auth user who doesn't have one yet
  INSERT INTO public.profiles (id, name, email, plan, coins, streak, referral_code)
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    'free',
    0,
    0,
    UPPER(SUBSTRING(REPLACE(au.email, '@', ''), 1, 4) || SUBSTRING(au.id::text, 1, 4))
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Synced missing profiles';
END $$;

-- 4. Verify - show any auth users without profiles
SELECT au.email, au.created_at, (p.id IS NOT NULL) as has_profile
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;
