import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://ahjdgyrbexgncqlsdxrk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoamRneXJiZXhnbmNxbHNkeHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQxMjgsImV4cCI6MjA2NTQ5MDEyOH0.KtjYPCSUKUEEVc8YKecrrOAepLuJNJSScAF5cTRdo0U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
