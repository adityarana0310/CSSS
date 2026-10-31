import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

try {
  const { data, error } = await admin.from('campuses').select('*');
  console.log('Admin select result:', { count: data?.length, error });

  if (!error && (data?.length ?? 0) === 0) {
    console.log('Inserting default campus...');
    const insertRes = await admin.from('campuses').insert({
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'MIT Academy of Engineering',
      code: 'MITAOE',
      slug: 'mitaoe',
      domain: 'mitaoe.ac.in',
      is_active: true,
    }).select();
    console.log('Insert response:', insertRes);
  }
} catch (e) {
  console.error('Error:', e.message);
}

