import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://hvfuejbnxbfvzzdvbxem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZnVlamJueGJmdnp6ZHZieGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjg4NDgsImV4cCI6MjA2NDEwNDg0OH0.fV6CcDLzdFRlg-QYWaNvh08X-SOt_-cVinsx1PgWjvw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
