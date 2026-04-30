-- Drop existing constraint if it exists (Supabase/PG)
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;

-- Add updated constraint with support for Extra High difficulty
ALTER TABLE public.questions ADD CONSTRAINT questions_difficulty_check 
CHECK (difficulty IN ('easy', 'medium', 'hard', 'extra_high'));
