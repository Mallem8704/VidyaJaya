-- 1. Create Test Results Table
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER DEFAULT 0,
    accuracy FLOAT DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- in seconds
    test_type TEXT DEFAULT 'daily_mock',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Question Attempts Table (Detailed analytics)
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    selected_option TEXT,
    is_correct BOOLEAN DEFAULT false,
    time_taken FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add RLS Policies
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "Users can view own results" ON public.test_results
    FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard is public (Top 50)
CREATE POLICY "Public can view leaderboard" ON public.test_results
    FOR SELECT USING (true);

-- Users can insert their own results
CREATE POLICY "Users can insert own results" ON public.test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Function for Daily Limit Check
CREATE OR REPLACE FUNCTION check_daily_test_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    test_count INTEGER;
    user_plan TEXT;
BEGIN
    -- Get user plan
    SELECT plan INTO user_plan FROM public.profiles WHERE id = p_user_id;
    
    -- If Pro, no limit
    IF user_plan = 'pro' THEN
        RETURN TRUE;
    END IF;

    -- Count tests today for Free users
    SELECT count(*) INTO test_count 
    FROM public.test_results 
    WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;

    RETURN test_count < 1; -- Limit to 1 test per day
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
