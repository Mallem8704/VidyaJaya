-- 1. Leaderboard Snapshot Table
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contest_date DATE DEFAULT CURRENT_DATE,
    user_id UUID REFERENCES auth.users(id),
    score INTEGER,
    time_taken INTEGER,
    rank INTEGER,
    is_verified BOOLEAN DEFAULT true,
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rewards Table (if not exists)
CREATE TABLE IF NOT EXISTS public.rewards_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    contest_date DATE,
    rank INTEGER,
    amount INTEGER,
    type TEXT DEFAULT 'contest_win',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add Index for Date Lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON public.leaderboard_snapshots(contest_date);

-- Ensure Wallet columns exist in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_earnings INTEGER DEFAULT 0;
