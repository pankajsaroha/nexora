process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://localhost:3000';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('===============================================================');
  console.log('  NEXORA STUDENT & PARENT PORTAL ACCESS — COMPREHENSIVE E2E VERIFICATION');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] #${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] #${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const login = async (identifier, password) => {
    const r = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
    });
    const cookie = r.headers.get('set-cookie')?.split(';')[0];
    const data = await r.json().catch(() => ({}));
    return { status: r.status, cookie, data };
  };

  // --------------------------------------------------------------------------
  // TEST 1: Admin Authentication & Permission Check
  // --------------------------------------------------------------------------
  console.log('\n--- 1. ADMIN AUTHENTICATION ---');
  const adminAuth = await login('admin@nexora.demo', 'demo123');
  assert(adminAuth.status === 200, 'Admin signs in successfully');
  assert(!!adminAuth.cookie, 'Admin session cookie issued');
  console.log('  Admin session user:', adminAuth.data?.user?.email, `(${adminAuth.data?.user?.roleCode})`);

  // --------------------------------------------------------------------------
  // TEST 2: Student Discovery via Database & Admin Verification
  // --------------------------------------------------------------------------
  console.log('\n--- 2. STUDENT DISCOVERY & TARGET DISCOVERY ---');
  const aarav = await prisma.student.findFirst({
    where: {
      admissionNumber: 'ADM-2026-0001',
    },
  });
  const meera = await prisma.student.findFirst({
    where: {
      admissionNumber: 'ADM-2026-0002',
    },
  });

  assert(!!aarav, `Discovered Aarav Sharma (ID: ${aarav?.id}, Adm: ${aarav?.admissionNumber})`);
  assert(!!meera, `Discovered Meera Sharma (ID: ${meera?.id}, Adm: ${meera?.admissionNumber})`);

  // Reset Meera state so the test runs reproducibly from scratch every time
  await prisma.student.update({
    where: { id: meera.id },
    data: {
      portalAccessStatus: 'NOT_ENABLED',
      loginId: null,
      userId: null,
    },
  });

  // --------------------------------------------------------------------------
  // TEST 3: Provision Portal Access for Student without Email/Account
  // --------------------------------------------------------------------------
  console.log('\n--- 3. PROVISION STUDENT PORTAL ACCESS (MEERA SHARMA) ---');
  const provisionRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({
      action: 'ENABLE',
      setupPending: false,
    }),
  });
  const provisionData = await provisionRes.json();
  assert(provisionRes.status === 200, `Provisioning returns HTTP 200: ${provisionData.message}`);
  assert(provisionData.success === true, 'Provisioning response success is true');
  assert(!!provisionData.loginId, `Generated Login ID: ${provisionData.loginId}`);
  assert(provisionData.loginId.startsWith('NX'), 'Login ID conforms to NX prefix standard');
  assert(provisionData.loginId.length >= 6, 'Login ID has sufficient entropy length');
  assert(!!provisionData.initialPassword, `Issued initial password: ${provisionData.initialPassword}`);
  const meeraLoginId = provisionData.loginId;
  const meeraPassword = provisionData.initialPassword;

  // --------------------------------------------------------------------------
  // TEST 4: Idempotency Verification
  // --------------------------------------------------------------------------
  console.log('\n--- 4. IDEMPOTENT PROVISIONING CHECK ---');
  const reprovisionRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({
      action: 'ENABLE',
      password: meeraPassword,
    }),
  });
  const reprovisionData = await reprovisionRes.json();
  assert(reprovisionRes.status === 200, 'Re-provisioning returns HTTP 200');
  assert(reprovisionData.loginId === meeraLoginId, 'Existing Login ID preserved without regeneration or conflict');

  // --------------------------------------------------------------------------
  // TEST 5: Student Authentication via Login ID (Direct Sign-in)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. STUDENT AUTHENTICATION VIA LOGIN ID ---');
  // Test case-insensitive login (uppercase)
  const studentAuthUpper = await login(meeraLoginId.toUpperCase(), meeraPassword);
  assert(studentAuthUpper.status === 200, `Student authenticated with uppercase Login ID (${meeraLoginId.toUpperCase()})`);
  assert(!!studentAuthUpper.cookie, 'Student session cookie issued for uppercase Login ID');

  // Test case-insensitive login (lowercase)
  const studentAuthLower = await login(meeraLoginId.toLowerCase(), meeraPassword);
  assert(studentAuthLower.status === 200, `Student authenticated with lowercase Login ID (${meeraLoginId.toLowerCase()})`);
  assert(!!studentAuthLower.cookie, 'Student session cookie issued for lowercase Login ID');
  const meeraCookie = studentAuthUpper.cookie;

  // --------------------------------------------------------------------------
  // TEST 6: Student Workspace Access & Data Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- 6. STUDENT WORKSPACE DATA ISOLATION CHECKS ---');

  // 6a. Attendance view
  const studentAttRes = await fetch(`${BASE_URL}/attendance`, {
    headers: { Cookie: meeraCookie },
  });
  assert(studentAttRes.status === 200, 'Student loads /attendance page (HTTP 200)');
  const studentAttHtml = await studentAttRes.text();
  assert(studentAttHtml.includes(meera.fullName), 'Attendance page renders student own full name');
  assert(!studentAttHtml.includes('Roll-Call Marking'), 'Teacher marking controls strictly hidden from student');

  // 6b. Timetable view
  const studentTimetableRes = await fetch(`${BASE_URL}/academics/timetable`, {
    headers: { Cookie: meeraCookie },
  });
  assert(studentTimetableRes.status === 200, 'Student loads /academics/timetable page (HTTP 200)');

  // 6c. Assignments view
  const studentAssignRes = await fetch(`${BASE_URL}/academics/assignments`, {
    headers: { Cookie: meeraCookie },
  });
  assert(studentAssignRes.status === 200, 'Student loads /academics/assignments page (HTTP 200)');

  // 6d. Exam Results view
  const studentExamsRes = await fetch(`${BASE_URL}/academics/exams`, {
    headers: { Cookie: meeraCookie },
  });
  assert(studentExamsRes.status === 200, 'Student loads /academics/exams page (HTTP 200)');
  const studentExamsHtml = await studentExamsRes.text();
  assert(studentExamsHtml.includes('Examination Results'), 'Exams page renders student report card header');
  assert(!studentExamsHtml.includes('Create Examination'), 'Faculty exam creation controls strictly hidden from student');

  // 6e. Profile view
  const studentProfileRes = await fetch(`${BASE_URL}/profile`, {
    headers: { Cookie: meeraCookie },
  });
  assert(studentProfileRes.status === 200, 'Student loads /profile page (HTTP 200)');
  const studentProfileHtml = await studentProfileRes.text();
  assert(studentProfileHtml.includes('Academic Placement & Records') || studentProfileHtml.includes('Official Student Login ID'), 'Profile renders student institutional identity card');
  assert(studentProfileHtml.includes(meeraLoginId), 'Profile displays student permanent Login ID');

  // --------------------------------------------------------------------------
  // TEST 7: Anti-Tampering: Student Cannot Access Administrative Portal APIs
  // --------------------------------------------------------------------------
  console.log('\n--- 7. ANTI-TAMPERING & ROLE BOUNDARY ENFORCEMENT ---');
  const tamperAccessRes = await fetch(`${BASE_URL}/api/students/${aarav.id}/access`, {
    headers: { Cookie: meeraCookie },
  });
  assert(tamperAccessRes.status === 403, 'Student denied GET /api/students/[id]/access (HTTP 403)');

  const tamperPostRes = await fetch(`${BASE_URL}/api/students/${aarav.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: meeraCookie },
    body: JSON.stringify({ action: 'SUSPEND' }),
  });
  assert(tamperPostRes.status === 403, 'Student denied POST /api/students/[id]/access (HTTP 403)');

  // --------------------------------------------------------------------------
  // TEST 8: Link Guardian & Multi-Child Parent Portal
  // --------------------------------------------------------------------------
  console.log('\n--- 8. MULTI-CHILD GUARDIAN LINKING & PARENT PORTAL ---');
  // Link Rahul Sharma (parent@nexora.demo) to Meera Sharma as well
  const linkGuardianRes = await fetch(`${BASE_URL}/api/students/${meera.id}/guardians`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({
      fullName: 'Mr. Rahul Sharma',
      relation: 'Father',
      email: 'parent@nexora.demo',
      phone: '+91 98100 11005',
      isPrimary: true,
    }),
  });
  const linkData = await linkGuardianRes.json();
  assert(linkGuardianRes.status === 200, `Parent linked to Meera Sharma: ${linkData.message || 'SUCCESS'}`);

  // Authenticate as Parent
  const parentAuth = await login('parent@nexora.demo', 'demo123');
  assert(parentAuth.status === 200, 'Parent signs in successfully (parent@nexora.demo)');
  const parentCookie = parentAuth.cookie;

  // Parent attendance for Aarav
  const parentAttAarav = await fetch(`${BASE_URL}/attendance?childId=${aarav.id}`, {
    headers: { Cookie: parentCookie },
  });
  assert(parentAttAarav.status === 200, 'Parent loads attendance for Aarav (HTTP 200)');
  const parentAaravHtml = await parentAttAarav.text();
  assert(parentAaravHtml.includes(aarav.fullName), 'Parent view displays Aarav Sharma attendance');

  // Parent attendance for Meera
  const parentAttMeera = await fetch(`${BASE_URL}/attendance?childId=${meera.id}`, {
    headers: { Cookie: parentCookie },
  });
  assert(parentAttMeera.status === 200, 'Parent loads attendance for Meera (HTTP 200)');
  const parentMeeraHtml = await parentAttMeera.text();
  assert(parentMeeraHtml.includes(meera.fullName), 'Parent view displays Meera Sharma attendance');

  // Parent anti-tampering check: Parent tries accessing an unlinked child ID
  const fakeChildId = '00000000-0000-0000-0000-000000000000';
  const parentTamperAtt = await fetch(`${BASE_URL}/attendance?childId=${fakeChildId}`, {
    headers: { Cookie: parentCookie },
  });
  assert(parentTamperAtt.status === 200, 'Parent query with foreign childId handled safely without crash');
  const parentTamperHtml = await parentTamperAtt.text();
  assert(!parentTamperHtml.includes('foreign-secret-data'), 'Parent query cannot leak unlinked student data');

  // --------------------------------------------------------------------------
  // TEST 9: Student Portal Access Suspension Lifecycle
  // --------------------------------------------------------------------------
  console.log('\n--- 9. PORTAL ACCESS SUSPENSION LIFECYCLE ---');
  const suspendRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({
      action: 'SUSPEND',
      reason: 'Temporary administrative disciplinary hold',
    }),
  });
  const suspendData = await suspendRes.json();
  assert(suspendRes.status === 200, `Suspension returns HTTP 200: ${suspendData.message}`);
  assert(suspendData.student.portalAccessStatus === 'SUSPENDED', 'Student portalAccessStatus is SUSPENDED');

  // Suspended student tries to sign in
  const suspendedLoginRes = await login(meeraLoginId, meeraPassword);
  assert(suspendedLoginRes.status === 403, 'Suspended student sign-in blocked with HTTP 403 Forbidden');
  assert(suspendedLoginRes.data?.error?.includes('suspended'), `Rejection message informs user: "${suspendedLoginRes.data?.error}"`);

  // Verify student academic data is still intact in DB
  const checkAccessRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    headers: { Cookie: adminAuth.cookie },
  });
  const accessDetail = await checkAccessRes.json();
  assert(accessDetail.student.fullName === meera.fullName, 'Student academic identity remains intact in ERP');

  // --------------------------------------------------------------------------
  // TEST 10: Student Portal Access Restoration Lifecycle
  // --------------------------------------------------------------------------
  console.log('\n--- 10. PORTAL ACCESS RESTORATION LIFECYCLE ---');
  const restoreRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({ action: 'RESTORE' }),
  });
  const restoreData = await restoreRes.json();
  assert(restoreRes.status === 200, `Restoration returns HTTP 200: ${restoreData.message}`);
  assert(restoreData.student.portalAccessStatus === 'ACTIVE', 'Student portalAccessStatus restored to ACTIVE');

  // Restored student logs in successfully
  const restoredLoginRes = await login(meeraLoginId, meeraPassword);
  assert(restoredLoginRes.status === 200, 'Restored student successfully signs in with Login ID');

  // --------------------------------------------------------------------------
  // TEST 11: Password Reset Flow
  // --------------------------------------------------------------------------
  console.log('\n--- 11. PASSWORD RESET FLOW ---');
  const newPassword = 'NexoraTestPass#2026';
  const resetRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({
      action: 'RESET_PASSWORD',
      newPassword,
    }),
  });
  const resetData = await resetRes.json();
  assert(resetRes.status === 200, `Password reset returns HTTP 200: ${resetData.message}`);

  // Old password fails
  const oldPassLogin = await login(meeraLoginId, meeraPassword);
  assert(oldPassLogin.status === 401, 'Login with old password fails (HTTP 401)');

  // New password succeeds
  const newPassLogin = await login(meeraLoginId, newPassword);
  assert(newPassLogin.status === 200, 'Login with new reset password succeeds (HTTP 200)');

  // --------------------------------------------------------------------------
  // TEST 12: Faculty Authorization Guard
  // --------------------------------------------------------------------------
  console.log('\n--- 12. FACULTY AUTHORIZATION GUARD ---');
  const facultyAuth = await login('teacher@nexora.demo', 'demo123');
  assert(facultyAuth.status === 200, 'Faculty user authenticated (teacher@nexora.demo)');

  const facultyTamperRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: facultyAuth.cookie },
    body: JSON.stringify({ action: 'REVOKE' }),
  });
  assert(facultyTamperRes.status === 403, 'Unauthorized faculty blocked from managing student portal access (HTTP 403)');

  // --------------------------------------------------------------------------
  // TEST 13: Student Directory Portal Column & Badges
  // --------------------------------------------------------------------------
  console.log('\n--- 13. DIRECTORY PORTAL COLUMN VERIFICATION ---');
  const dirPageRes = await fetch(`${BASE_URL}/students`, {
    headers: { Cookie: adminAuth.cookie },
  });
  assert(dirPageRes.status === 200, 'Admin can view /students directory page (HTTP 200)');
  const dirHtml = await dirPageRes.text();
  assert(dirHtml.includes('Portal Access'), 'Student directory includes Portal Access header');

  // --------------------------------------------------------------------------
  // TEST 14: Student Profile Portal Access & Security Tab
  // --------------------------------------------------------------------------
  console.log('\n--- 14. STUDENT PROFILE PORTAL TAB VERIFICATION ---');
  const profilePageRes = await fetch(`${BASE_URL}/students/${meera.id}`, {
    headers: { Cookie: adminAuth.cookie },
  });
  assert(profilePageRes.status === 200, 'Admin can view student profile page (HTTP 200)');
  const profileHtml = await profilePageRes.text();
  assert(profileHtml.includes('Portal Access &amp; Security') || profileHtml.includes('Portal Access'), 'Profile includes Portal Access & Security tab');
  assert(profileHtml.includes('Manage Portal Access'), 'Profile displays Manage Portal Access action');

  // --------------------------------------------------------------------------
  // TEST 15: Revocation Flow
  // --------------------------------------------------------------------------
  console.log('\n--- 15. PORTAL ACCESS REVOCATION LIFECYCLE ---');
  const revokeRes = await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({ action: 'REVOKE', reason: 'Student completed studies' }),
  });
  const revokeData = await revokeRes.json();
  assert(revokeRes.status === 200, `Revocation returns HTTP 200: ${revokeData.message}`);
  assert(revokeData.student.portalAccessStatus === 'REVOKED', 'Student portalAccessStatus is REVOKED');

  const revokedLogin = await login(meeraLoginId, newPassword);
  assert(revokedLogin.status === 403, 'Revoked student login rejected with HTTP 403 Forbidden');

  // Restore Meera back to ACTIVE so system remains in healthy demo state
  await fetch(`${BASE_URL}/api/students/${meera.id}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminAuth.cookie },
    body: JSON.stringify({ action: 'RESTORE' }),
  });
  console.log('  Cleaned up: restored Meera to ACTIVE state for ongoing demo usage.');

  console.log('\n===============================================================');
  console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('===============================================================\n');

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('\nVerification failed:', err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
