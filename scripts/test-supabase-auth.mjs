import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing required Supabase variables in .env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Testing Supabase Authentication & User Creation via Admin API...');

const testEmail = `test.student.${Date.now()}@example.com`;
const testPassword = 'CampusPulseTestPassword123!';

try {
  // Create user
  const { data: userRecord, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test Student' },
  });

  if (createError) {
    console.error('User creation failed:', createError.message);
    process.exit(1);
  }

  const userId = userRecord.user.id;
  console.log('Test user created successfully! ID:', userId);

  // Verify sign-in using public anon client with credentials
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: sessionData, error: signInError } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('Sign-in verification failed:', signInError.message);
    process.exit(1);
  }

  console.log('Sign-in verified successfully! Session established for:', sessionData.user.email);

  // Clean up test user
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.warn('Test user cleanup warning:', deleteError.message);
  } else {
    console.log('Test user cleaned up successfully.');
  }

  console.log('\nSupabase Auth test: PASSED');
} catch (err) {
  console.error('Supabase Auth test error:', err.message);
  process.exit(1);
}

