/**
 * Supabase connectivity probe — run via: node --env-file=.env.local scripts/probe-supabase.mjs
 * Does NOT log any credential values.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required env vars. Check NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

console.log('Supabase URL configured: YES');
console.log('Anon key configured: YES');
console.log('Service role key configured: YES');

// Test anon client — should be able to reach the health endpoint
const anon = createClient(url, anonKey);

try {
  // Simple connectivity test: query campuses (public read via RLS)
  // If tables don't exist yet, we'll get a specific error, not a network error
  const { data, error } = await anon.from('campuses').select('id').limit(1);

  if (error) {
    if (error.code === '42P01') {
      // relation does not exist — migrations not yet applied
      console.log('Supabase connectivity: OK (but migrations not yet applied — "campuses" table missing)');
      console.log('ACTION REQUIRED: Apply migrations from supabase/migrations/ in Supabase SQL editor');
    } else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      console.error('Supabase auth error:', error.message);
      console.error('Check your NEXT_PUBLIC_SUPABASE_ANON_KEY value.');
      process.exit(1);
    } else {
      console.log('Supabase connectivity: OK');
      console.log('Query error (non-fatal for probe):', error.message, '| code:', error.code);
    }
  } else {
    console.log(`Supabase connectivity: OK`);
    console.log(`Campuses table: accessible, rows found: ${data?.length ?? 0}`);
  }
} catch (err) {
  console.error('Supabase connectivity FAILED (network error):', err.message);
  process.exit(1);
}

// Test service role client — admin access
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

try {
  const { data, error } = await admin.from('campuses').select('id').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log('Admin client: OK (migrations not yet applied)');
    } else {
      console.log('Admin client error:', error.message);
    }
  } else {
    console.log(`Admin client: OK, campuses rows: ${data?.length ?? 0}`);
  }
} catch (err) {
  console.error('Admin client FAILED:', err.message);
  process.exit(1);
}

console.log('\nProbe complete.');

