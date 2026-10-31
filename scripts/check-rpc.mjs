import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase configuration.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Testing RPC exec_sql availability...');

try {
  const { data, error } = await admin.rpc('exec_sql', { sql: 'SELECT 1;' });
  if (error) {
    console.log('exec_sql RPC not directly exposed on project:', error.message);
  } else {
    console.log('exec_sql RPC available!');
  }
} catch (e) {
  console.log('exec_sql test failed:', e.message);
}

