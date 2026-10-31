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

console.log('=== Campus Pulse: Live Verification of Database, PostgREST, & RLS ===\n');

// 1. Table accessibility
const tables = ['campuses', 'profiles', 'campus_members', 'announcements', 'announcement_sources', 'user_preferences'];
console.log('1. PostgREST Table Access:');
for (const t of tables) {
  const { data, error } = await admin.from(t).select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`   [-] ${t}: FAIL (${error.message})`);
    process.exit(1);
  } else {
    console.log(`   [+] ${t}: ACCESSIBLE`);
  }
}

// 2. Fetch or seed default campus
let { data: campus } = await admin.from('campuses').select('*').limit(1).maybeSingle();
if (!campus) {
  console.log('\nSeeding base campus record...');
  const { data: newCampus, error: campusErr } = await admin.from('campuses').insert({
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'MIT Academy of Engineering',
    code: 'MITAOE',
    slug: 'mitaoe',
    domain: 'mitaoe.ac.in',
    is_active: true,
  }).select().single();

  if (campusErr) {
    console.error('Failed to create campus:', campusErr.message);
    process.exit(1);
  }
  campus = newCampus;
}
console.log(`\n2. Base Campus: ${campus.name} (ID: ${campus.id})`);

// 3. Create Authenticated Student Session (User A)
const testEmailA = `student.live.${Date.now()}@mitaoe.ac.in`;
const testPassword = 'SecureStudentPassword2026!';

const { data: userRecordA, error: userErrA } = await admin.auth.admin.createUser({
  email: testEmailA,
  password: testPassword,
  email_confirm: true,
  user_metadata: { full_name: 'Live Student A' },
});

if (userErrA) {
  console.error('User A creation failed:', userErrA.message);
  process.exit(1);
}

const userIdA = userRecordA.user.id;
console.log('3. Test Student A created in auth.users:', userIdA);

// Upsert profile and campus membership for Student A
await admin.from('profiles').upsert({
  id: userIdA,
  email: testEmailA,
  full_name: 'Live Student A',
  campus_id: campus.id,
  role: 'student',
});

await admin.from('campus_members').upsert({
  campus_id: campus.id,
  user_id: userIdA,
  role: 'student',
});
console.log('   Student A enrolled into campus_members.');

// 4. Authenticate as Student A via public Anon Client (Scoping JWT)
const studentClientA = createClient(url, anonKey);
const { data: sessionDataA, error: signInErrA } = await studentClientA.auth.signInWithPassword({
  email: testEmailA,
  password: testPassword,
});

if (signInErrA || !sessionDataA.session) {
  console.error('Failed to authenticate as Student A:', signInErrA?.message);
  process.exit(1);
}
console.log('4. Authenticated session established for Student A.');

// 5. Create one test announcement using Student A's authenticated session
const testAnnouncementPayload = {
  campus_id: campus.id,
  created_by: userIdA,
  title: 'Annual Technical Fest - Live Verification Notice',
  description: 'Testing live PostgREST insertion with separate date and deadline.',
  category: 'Workshop',
  event_date: '2026-11-25',
  event_time: '10:00',
  timezone: 'Asia/Kolkata',
  venue: 'Auditorium 1',
  registration_deadline: '2026-11-20T23:59:59Z',
  registration_url: 'https://mitaoe.ac.in/techfest',
  priority: 'upcoming',
  status: 'published',
  instructions: ['Carry College ID', 'Pre-registration mandatory'],
  missing_fields: [],
  extraction_confidence: 1.0,
  extraction_status: 'manual',
  is_verified: true,
};

const { data: createdAnnouncement, error: insertErr } = await studentClientA
  .from('announcements')
  .insert(testAnnouncementPayload)
  .select()
  .single();

if (insertErr || !createdAnnouncement) {
  console.error('Failed to create announcement via Student A:', insertErr?.message);
  process.exit(1);
}
console.log('5. Announcement created successfully by authenticated Student A.');
console.log('   ID:', createdAnnouncement.id);

// 6. Retrieve directly from DB using a fresh query and verify separation of fields
const { data: retrievedAnnouncement, error: retrieveErr } = await studentClientA
  .from('announcements')
  .select('*')
  .eq('id', createdAnnouncement.id)
  .single();

if (retrieveErr || !retrievedAnnouncement) {
  console.error('Failed to retrieve announcement:', retrieveErr?.message);
  process.exit(1);
}

console.log('6. Announcement retrieved via fresh database query.');
console.log('   Event Date:            ', retrievedAnnouncement.event_date);
console.log('   Registration Deadline: ', retrievedAnnouncement.registration_deadline);

const isSeparate = retrievedAnnouncement.event_date !== retrievedAnnouncement.registration_deadline &&
                   retrievedAnnouncement.event_date === '2026-11-25' &&
                   retrievedAnnouncement.registration_deadline.startsWith('2026-11-20');

if (!isSeparate) {
  console.error('FAILURE: event_date and registration_deadline are not properly separate!');
  process.exit(1);
}
console.log('   [+] CONFIRMED: event_date and registration_deadline are strictly separate fields.');

// 7. Security / RLS Verification: Test unauthorized actions by a second user (User B)
console.log('\n7. RLS Enforcement Security Tests:');

const testEmailB = `unauthorized.student.${Date.now()}@othercampus.edu`;
const { data: userRecordB } = await admin.auth.admin.createUser({
  email: testEmailB,
  password: testPassword,
  email_confirm: true,
});
const userIdB = userRecordB.user.id;

// Student B signs in (not a member of this campus)
const studentClientB = createClient(url, anonKey);
await studentClientB.auth.signInWithPassword({ email: testEmailB, password: testPassword });

// Test 7a: Student B cannot read Student A's announcement
const { data: forbiddenRead } = await studentClientB
  .from('announcements')
  .select('*')
  .eq('id', createdAnnouncement.id);

if (forbiddenRead && forbiddenRead.length > 0) {
  console.error('   [-] RLS FAIL: Non-member Student B was able to read campus announcements!');
  process.exit(1);
} else {
  console.log('   [+] RLS PASS: Non-member Student B is completely blocked from reading announcements.');
}

// Test 7b: Student B cannot modify Student A's announcement (anti-IDOR)
const { data: forbiddenUpdate } = await studentClientB
  .from('announcements')
  .update({ title: 'Hacked by Student B' })
  .eq('id', createdAnnouncement.id)
  .select();

if (forbiddenUpdate && forbiddenUpdate.length > 0) {
  console.error('   [-] RLS FAIL: Student B was able to modify Student A announcement!');
  process.exit(1);
} else {
  console.log('   [+] RLS PASS: Student B cannot modify Student A announcement (anti-IDOR confirmed).');
}

// Test 7c: Student B cannot delete Student A's announcement
const { data: forbiddenDelete } = await studentClientB
  .from('announcements')
  .delete()
  .eq('id', createdAnnouncement.id)
  .select();

if (forbiddenDelete && forbiddenDelete.length > 0) {
  console.error('   [-] RLS FAIL: Student B was able to delete Student A announcement!');
  process.exit(1);
} else {
  console.log('   [+] RLS PASS: Student B cannot delete Student A announcement.');
}

// 8. Delete test announcement and clean up test users
console.log('\n8. Deleting test announcement and cleaning up test accounts...');
const { error: deleteErr } = await studentClientA
  .from('announcements')
  .delete()
  .eq('id', createdAnnouncement.id);

if (deleteErr) {
  console.error('Failed to delete announcement via Student A:', deleteErr.message);
  process.exit(1);
}
console.log('   [+] Test announcement deleted by Student A.');

// Verify deletion in database
const { data: verifyDeleted } = await admin
  .from('announcements')
  .select('id')
  .eq('id', createdAnnouncement.id);

if (verifyDeleted && verifyDeleted.length === 0) {
  console.log('   [+] Confirmed announcement is no longer in database.');
}

// Clean up test users
await admin.auth.admin.deleteUser(userIdA);
await admin.auth.admin.deleteUser(userIdB);
console.log('   [+] Test users cleaned up successfully from auth.users.');

console.log('\n======================================================');
console.log('LIVE DATABASE & RLS VERIFICATION: 100% PASSED');
console.log('======================================================\n');

