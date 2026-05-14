-- Table for Daily Current Affairs
CREATE TABLE IF NOT EXISTS current_affairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT, -- National, International, Economy, Science & Tech, Sports
  image_url TEXT,
  source_url TEXT,
  read_time TEXT DEFAULT '5 min read',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE current_affairs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Current Affairs are public)
DROP POLICY IF EXISTS "Public can view current affairs" ON current_affairs;
CREATE POLICY "Public can view current affairs" ON current_affairs FOR SELECT USING (true);

-- Allow admins to manage (This assumes you have an admin check logic)
-- For now, we allow the service role to bypass RLS, which the ingestion service uses.

-- Add sample data for testing
INSERT INTO current_affairs (title, summary, category, read_time, is_trending)
VALUES 
('India Launches New Semi-Conductor Mission', 'The Union Cabinet has approved a ₹76,000 crore incentive scheme...', 'National', '4 min read', true),
('G20 Summit 2026: Global Leaders Converge', 'The annual G20 summit kicks off today with a focus on climate finance.', 'International', '6 min read', true),
('RBI Keeps Repo Rate Unchanged at 6.5%', 'The Monetary Policy Committee decided to remain focused on withdrawal of accommodation.', 'Economy', '3 min read', false);
