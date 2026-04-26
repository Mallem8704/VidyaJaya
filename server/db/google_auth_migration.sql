-- Migration: Google Auth & Automatic Profile Creation

-- 1. Function to handle new user signup (Email or Google)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
BEGIN
  -- Extract name from raw_user_meta_data (Supabase standard)
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    is_verified, 
    avatar, 
    plan
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    v_name, 
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    NEW.raw_user_meta_data->>'avatar_url',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. Update existing profiles if name is missing (Optional cleanup)
UPDATE profiles 
SET name = split_part(email, '@', 1) 
WHERE name IS NULL OR name = '';
