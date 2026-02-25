import { createClient } from '@supabase/supabase-js'

// Use only public, frontend-safe Vite env vars here
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon';

// Log values in dev to help diagnose blank-screen issues (safe public values)
if (import.meta.env.DEV) {
	// eslint-disable-next-line no-console
	console.debug('supabaseClient: VITE_SUPABASE_URL=', supabaseUrl, ' VITE_SUPABASE_ANON_KEY=', supabaseKey ? 'present' : 'missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey);