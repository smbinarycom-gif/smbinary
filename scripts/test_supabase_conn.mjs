import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
  process.exit(2);
}

const supabase = createClient(url, key);

(async function test(){
  try {
    // Try a lightweight request: list tables via REST root to check connectivity
    const res = await fetch(`${url}/rest/v1/`, { method: 'GET', headers: { apikey: key } });
    console.log('Fetch to /rest/v1 status:', res.status);
    // Try a simple select on a known table 'users' (may fail if not present)
    try {
      const { data, error, status } = await supabase.from('users').select('id').limit(1);
      console.log('supabase.from("users") status:', status, 'error:', error ? error.message : null);
      if (data) console.log('sample rows:', data.length);
    } catch (e) {
      console.error('Query error:', e.message || e);
    }
  } catch (e) {
    console.error('Connection test failed:', e.message || e);
    process.exit(1);
  }
})();
