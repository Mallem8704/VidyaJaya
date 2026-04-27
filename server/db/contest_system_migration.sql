-- Add contest_date to track results per competition day
ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS contest_date DATE DEFAULT CURRENT_DATE;

-- Create index for faster daily leaderboard queries
CREATE INDEX IF NOT EXISTS idx_test_results_contest_date ON public.test_results(contest_date);
