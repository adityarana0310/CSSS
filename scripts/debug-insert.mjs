import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

try {
  const { data, error } = await admin.from('campuses').insert({
    name: 'MIT Academy of Engineering',
    code: 'MITAOE',
    slug: 'mitaoe',
    domain: 'mitaoe.ac.in',
    is_active: true,
  }).select();

  console.log('Insert result:', { data, error });
} catch (e) {
  console.log('Exception:', e.message);
}

