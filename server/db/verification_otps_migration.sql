-- Table to store temporary verification OTPs
CREATE TABLE IF NOT EXISTS verification_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
    is_verified BOOLEAN DEFAULT FALSE
);

-- Index for fast lookup by phone
CREATE INDEX IF NOT EXISTS idx_verification_otps_phone ON verification_otps(phone);

-- Function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS trigger AS $$
BEGIN
    DELETE FROM verification_otps WHERE expires_at < NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
