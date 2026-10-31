import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Inserting default demo campus via service role...');

const { data, error } = await admin.from('campuses').upsert({
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'MIT Academy of Engineering',
  code: 'MITAOE',
  slug: 'mitaoe',
  domain: 'mitaoe.ac.in',
  is_active: true,
}).select();

if (error) {
  console.error('Failed to insert demo campus:', error.message);
  process.exit(1);
}

console.log('Demo campus ready:', data);

