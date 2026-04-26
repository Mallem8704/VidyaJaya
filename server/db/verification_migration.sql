-- Migration: User Verification & Anti-Fraud System

-- 1. Update Profiles table with verification fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_status TEXT CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS kyc_provider_id TEXT,
ADD COLUMN IF NOT EXISTS last_device_id TEXT;

-- 2. Create User Devices Table for duplicate account detection
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  ip_address TEXT,
  browser_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

-- 4. Enable RLS
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view their own devices" ON user_devices;
CREATE POLICY "Users can view their own devices" ON user_devices FOR SELECT USING (auth.uid() = user_id);

-- 6. Function to check for duplicate accounts on a device
CREATE OR REPLACE FUNCTION get_device_account_count(p_device_id TEXT) 
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT user_id) FROM user_devices WHERE device_id = p_device_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
