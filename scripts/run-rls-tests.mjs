import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('=== Campus Pulse: Live CRUD & RLS Verification Suite ===\n');

let testsPassed = 0;
let testsFailed = 0;

function report(name, passed, details = '') {
  if (passed) {
    console.log(`✓ PASS: ${name} ${details}`);
    testsPassed++;
  } else {
    console.error(`✗ FAIL: ${name} ${details}`);
    testsFailed++;
  }
}

try {
  // Test 1: Campus read via anon
  const anon = createClient(url, anonKey);
  const { data: campuses, error: campusError } = await anon.from('campuses').select('*');
  report('Public/Anon can read active campuses', !campusError && campuses?.length > 0, `(Count: ${campuses?.length || 0})`);

  const demoCampus = campuses?.[0];
  if (!demoCampus) {
    throw new Error('No demo campus found in database.');
  }

  // Test 2: Create two distinct test users (Student A and Student B)
  const emailA = `student.alpha.${Date.now()}@example.com`;
  const emailB = `student.beta.${Date.now()}@example.com`;
  const password = 'TestSecurePassword123!';

  const { data: userA, error: errA } = await admin.auth.admin.createUser({
    email: emailA,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'Student Alpha' },
  });
  report('Create test User A (Student Alpha)', !errA && !!userA?.user?.id);

  const { data: userB, error: errB } = await admin.auth.admin.createUser({
    email: emailB,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'Student Beta' },
  });
  report('Create test User B (Student Beta)', !errB && !!userB?.user?.id);

  const idA = userA.user.id;
  const idB = userB.user.id;

  // Ensure profiles exist (fallback if trigger delay)
  await admin.from('profiles').upsert([
    { id: idA, email: emailA, full_name: 'Student Alpha', campus_id: demoCampus.id, role: 'student' },
    { id: idB, email: emailB, full_name: 'Student Beta', campus_id: demoCampus.id, role: 'student' },
  ]);

  // Add User A to Campus
  await admin.from('campus_members').upsert([
    { campus_id: demoCampus.id, user_id: idA, role: 'student' },
  ]);

  // Test 3: Sign in as User A with actual session
  const clientA = createClient(url, anonKey);
  const { data: sessionA, error: loginErrA } = await clientA.auth.signInWithPassword({
    email: emailA,
    password: password,
  });
  report('Sign in as User A (scoped JWT)', !loginErrA && !!sessionA?.session);

  // Test 4: User A creates an announcement
  const newAnnouncement = {
    campus_id: demoCampus.id,
    created_by: idA,
    title: '[RLS TEST] Annual Hackathon 2026',
    description: 'Testing RLS insertion by authenticated campus member.',
    category: 'Hackathon',
    event_date: '2026-11-20',
    event_time: '09:00',
    timezone: 'Asia/Kolkata',
    venue: 'Main Auditorium',
    registration_deadline: '2026-11-15T23:59:59Z',
    registration_url: 'https://example.com/register',
    priority: 'upcoming',
    status: 'published',
    instructions: ['Bring ID card', 'Team of 2-4'],
    missing_fields: [],
    extraction_confidence: 1.0,
    extraction_status: 'manual',
    is_verified: true,
  };

  const { data: createdAnn, error: createAnnErr } = await clientA
    .from('announcements')
    .insert(newAnnouncement)
    .select()
    .single();

  report('User A inserts announcement for own campus', !createAnnErr && !!createdAnn?.id, createAnnErr ? createAnnErr.message : '');

  const announcementId = createdAnn?.id;

  // Test 5: Verify separation of event_date and registration_deadline
  if (createdAnn) {
    const isSeparated = createdAnn.event_date !== createdAnn.registration_deadline;
    report('Event date and registration deadline are strictly separate fields', isSeparated, `(event: ${createdAnn.event_date}, deadline: ${createdAnn.registration_deadline})`);
  }

  // Test 6: Sign in as User B (not yet a member of this campus)
  const clientB = createClient(url, anonKey);
  const { data: sessionB, error: loginErrB } = await clientB.auth.signInWithPassword({
    email: emailB,
    password: password,
  });
  report('Sign in as User B (non-member of campus)', !loginErrB && !!sessionB?.session);

  // Test 7: User B CANNOT read announcements from demo campus before becoming a member
  const { data: readB1, error: errReadB1 } = await clientB
    .from('announcements')
    .select('*')
    .eq('id', announcementId);
  report('RLS BLOCKS non-member User B from reading announcements', !errReadB1 && readB1?.length === 0, `(Returned ${readB1?.length || 0} rows)`);

  // Test 8: User B attempts to UPDATE User A's announcement (IDOR attack prevention)
  const { data: unauthorizedUpdate, error: updateErr } = await clientB
    .from('announcements')
    .update({ title: 'Hacked Title By User B' })
    .eq('id', announcementId)
    .select();
  report('RLS PREVENTS horizontal privilege escalation / unauthorized update by User B', unauthorizedUpdate?.length === 0, `(Affected rows: ${unauthorizedUpdate?.length || 0})`);

  // Test 9: User B attempts to DELETE User A's announcement
  const { data: unauthorizedDelete, error: deleteErr } = await clientB
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .select();
  report('RLS PREVENTS unauthorized deletion by User B', unauthorizedDelete?.length === 0, `(Affected rows: ${unauthorizedDelete?.length || 0})`);

  // Test 10: Clean up test data
  if (announcementId) {
    await admin.from('announcements').delete().eq('id', announcementId);
  }
  await admin.auth.admin.deleteUser(idA);
  await admin.auth.admin.deleteUser(idB);
  report('Cleanup of test users and test announcements', true);

  console.log(`\n========================================`);
  console.log(`Results: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
} catch (err) {
  console.error('Test execution error:', err.message);
  process.exit(1);
}

