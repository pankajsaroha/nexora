const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const INZIVOO_ID = "04625961-2d1e-4bf8-8013-5c16040751bc";

async function runVerification() {
  console.log("===============================================================");
  console.log("        NEXORA INSTITUTION & LIFECYCLE VERIFICATION SUITE       ");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify Inzivoo Group of Colleges Exists Under Verified ID
  console.log("--- 1. Inzivoo Group of Colleges Integrity ---");
  const inzivoo = await prisma.institution.findUnique({
    where: { id: INZIVOO_ID },
    include: {
      users: true,
      students: { include: { currentClass: true, currentSection: true } },
      guardians: true,
      teachers: true,
      classes: { include: { sections: true } },
      tasks: true,
      auditLogs: true,
    },
  });

  assert(!!inzivoo, `Inzivoo exists with verified ID: ${INZIVOO_ID}`);
  assert(inzivoo?.name === "Inzivoo Group of Colleges", `Name is "${inzivoo?.name}"`);
  assert(inzivoo?.code === "INZ", `Code is "${inzivoo?.code}"`);
  assert(inzivoo?.type === "COLLEGE", `Type is "${inzivoo?.type}"`);
  assert((inzivoo?.status || "ACTIVE") === "ACTIVE", `Status is "${inzivoo?.status || 'ACTIVE'}"`);

  // Verify users
  assert(inzivoo?.users?.length === 4, `4 legitimate Inzivoo users intact (found: ${inzivoo?.users?.length})`);
  const adminUser = inzivoo?.users?.find(u => u.email === "pankajsaroya6@gmail.com");
  assert(!!adminUser, `Super Admin "pankajsaroya6@gmail.com" exists`);
  assert(adminUser?.roleCode === "SUPER_ADMIN", `Super Admin has role SUPER_ADMIN`);

  // Verify students
  assert(inzivoo?.students?.length === 3, `3 legitimate students intact (found: ${inzivoo?.students?.length})`);
  assert(inzivoo?.teachers?.length === 2, `2 faculty members intact (found: ${inzivoo?.teachers?.length})`);
  assert(inzivoo?.guardians?.length === 3, `3 parents/guardians intact (found: ${inzivoo?.guardians?.length})`);
  assert(inzivoo?.classes?.length === 5, `5 college classes intact (found: ${inzivoo?.classes?.length})`);
  assert(inzivoo?.tasks?.length === 2, `2 tasks intact (found: ${inzivoo?.tasks?.length})`);
  assert(inzivoo?.auditLogs?.length === 67, `67 audit logs intact (found: ${inzivoo?.auditLogs?.length})`);

  // 2. Tenant Isolation & Student Section Foreign Key Check
  console.log("\n--- 2. Tenant Isolation & Section Integrity ---");
  for (const s of (inzivoo?.students || [])) {
    assert(
      s.currentClass?.institutionId === INZIVOO_ID,
      `Student ${s.fullName} is enrolled in Inzivoo class "${s.currentClass?.name}"`
    );
    assert(
      s.institutionId === INZIVOO_ID,
      `Student ${s.fullName} institutionId matches Inzivoo`
    );
  }

  // 3. Verify Elimination of Unwanted Institutions
  console.log("\n--- 3. Elimination of Unwanted Candidate Institutions ---");
  const allInstitutions = await prisma.institution.findMany();
  assert(allInstitutions.length === 1, `Exactly 1 institution exists in database (found: ${allInstitutions.length})`);

  const deletedIds = [
    "1c1fd725-583e-4910-946c-596276a7f9b9", // Cambridge
    "397be1d7-5d38-4143-98e4-807f1d6a65c0", // Eton
    "02fdf50e-359a-4f29-b2b7-6c6c6cf51293", // Test Academy
    "8cf0d222-fcd5-4666-b77f-12be08f2b98b", // Northstar duplicate
    "cbe9c791-f622-4494-aed6-f0d1f2c04eed", // Northstar demo
  ];

  for (const delId of deletedIds) {
    const exists = allInstitutions.some(i => i.id === delId);
    assert(!exists, `Unwanted candidate ID [${delId}] is absent from database`);
  }

  // 4. Verify No Orphan Demo Users
  console.log("\n--- 4. User Accounts Integrity ---");
  const allUsers = await prisma.user.findMany();
  assert(allUsers.length === 4, `Exactly 4 users exist platform-wide (found: ${allUsers.length})`);
  for (const u of allUsers) {
    assert(u.institutionId === INZIVOO_ID, `User ${u.email} belongs strictly to Inzivoo`);
  }

  const demoEmails = ["admin@nexora.demo", "principal@nexora.demo", "teacher@nexora.demo", "student@nexora.demo", "parent@nexora.demo"];
  for (const email of demoEmails) {
    const exists = allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    assert(!exists, `Fake user ${email} is absent from database`);
  }

  // 5. Test Lifecycle Status Persistence
  console.log("\n--- 5. Institution Lifecycle Status Persistence ---");
  const updatedStatus = await prisma.institution.update({
    where: { id: INZIVOO_ID },
    data: { status: "ACTIVE", statusReason: null },
    select: { id: true, status: true },
  });
  assert(updatedStatus.status === "ACTIVE", `Institution status field supports ACTIVE`);

  // Final Summary
  console.log("\n===============================================================");
  console.log(`       SUMMARY: ${passed} PASSED, ${failed} FAILED           `);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((e) => {
    console.error("Verification error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
