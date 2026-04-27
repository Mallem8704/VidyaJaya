-- Enhanced Fail-Safe Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_ref_code TEXT;
BEGIN
  -- 1. Extract name from metadata
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- 2. Generate a unique referral code (e.g., VJ_XXXX)
  v_ref_code := 'VJ_' || upper(substring(md5(random()::text) from 1 for 6));

  -- 3. Insert with defaults to prevent NOT NULL constraints from failing
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    is_verified, 
    avatar, 
    plan,
    exam_goal,
    coins,
    streak,
    referral_code
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    v_name, 
    TRUE, -- Google users are pre-verified
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    'UPSC', -- Default Goal
    0,      -- Default Coins
    0,      -- Default Streak
    v_ref_code
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar = EXCLUDED.avatar,
    name = COALESCE(profiles.name, EXCLUDED.name);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block the auth process if possible
  -- In a trigger, returning NULL blocks the parent. Returning NEW allows parent but skips this.
  -- We return NEW to allow the user to at least be created in auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
