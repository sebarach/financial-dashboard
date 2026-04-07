import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqhiyizidaphnudefdzu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGl5aXppZGFwaG51ZGVmZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTg0MDMsImV4cCI6MjA5MTE3NDQwM30.oL7bouyfzWJ-Y54V2B_jexK6iIYM5s8DeHP06KNSxRU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
