-- ============================================================
-- VidyaJaya — Instagram Posts Log Table
-- Tracks every post auto-published to Instagram
-- ============================================================

CREATE TABLE IF NOT EXISTS instagram_posts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  current_affair_id   UUID        REFERENCES current_affairs(id) ON DELETE SET NULL,
  ig_post_id          TEXT,
  image_url           TEXT,
  caption             TEXT,
  post_type           TEXT        DEFAULT 'morning_current_affairs',
  -- 'morning_current_affairs' | 'evening_quiz_promo' | 'evening_brand_promo'
  status              TEXT        DEFAULT 'published',
  error_message       TEXT,
  posted_at           TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Only service role can write (the backend cron job uses the service role key)
-- Public/admin can read for dashboard purposes
DROP POLICY IF EXISTS "Admin can view instagram posts" ON instagram_posts;
CREATE POLICY "Admin can view instagram posts" ON instagram_posts
  FOR SELECT USING (true);

-- Index for fast lookup by date
CREATE INDEX IF NOT EXISTS idx_instagram_posts_posted_at ON instagram_posts(posted_at DESC);
