import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fioxcjetotuxkefsnriz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3hjamV0b3R1eGtlZnNucml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDU5ODEsImV4cCI6MjA5MjQyMTk4MX0.LjM6ScrQZVuF1-LHBBa9xnHIyL7dpC_8t__e0jtx2-w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
