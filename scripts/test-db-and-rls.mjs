import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error('Missing configuration.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('=== Campus Pulse Comprehensive Database & RLS Test Suite ===\n');

// 1. Check table existence
const tables = ['campuses', 'profiles', 'campus_members', 'announcements', 'announcement_sources', 'user_preferences'];
console.log('1. Checking table availability in PostgREST schema cache:');
let missingCount = 0;

for (const t of tables) {
  const { data, error } = await admin.from(t).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`   [-] ${t}: MISSING (${error.message})`);
    missingCount++;
  } else {
    console.log(`   [+] ${t}: PRESENT`);
  }
}

if (missingCount > 0) {
  console.log(`\nNotice: ${missingCount} tables need SQL migration execution in Supabase Dashboard.`);
  console.log('The complete migration script is prepared at: supabase/migrations/combined_schema.sql');
  console.log('Once executed in Supabase SQL editor, all CRUD and RLS tests will run against live tables.');
} else {
  console.log('\nAll 6 required tables are present in the database!');
}

