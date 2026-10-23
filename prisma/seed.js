const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent production-safe system seed for NEXORA...");

  // 1. Seed Core System Roles & Permissions
  const SYSTEM_ROLES = [
    { code: "SUPER_ADMIN", name: "Platform Administrator", description: "Full multi-tenant governance and infrastructure access" },
    { code: "PRINCIPAL", name: "Principal / Executive Head", description: "Executive overview of attendance, finances, academic ledgers, and staff" },
    { code: "TEACHER", name: "Faculty Member", description: "Classroom roll-call, timetable schedules, homework, and marks management" },
    { code: "STUDENT", name: "Enrolled Scholar", description: "Student portal: personal timetable, marks, attendance, and homework submissions" },
    { code: "PARENT", name: "Parent / Guardian", description: "Guardian portal: children academic records, fee ledgers, and notices" },
    { code: "ACCOUNTANT", name: "Bursar & Finance Lead", description: "Fee collections, billing ledgers, staff payroll, and accounts" },
    { code: "HOD", name: "Head of Department", description: "Curriculum oversight and department faculty allocations" },
    { code: "HR_ADMIN", name: "Human Resources Lead", description: "Staff profiles, recruitment records, and leave accounts" },
  ];

  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
  }
  console.log(`✅ System roles verified (${SYSTEM_ROLES.length} roles).`);

  // 2. Production Environment Check:
  // We NEVER create fake/demo institutions in production or default seed.
  const INZIVOO_ID = "04625961-2d1e-4bf8-8013-5c16040751bc";
  const inzivoo = await prisma.institution.findUnique({
    where: { id: INZIVOO_ID },
  });

  if (inzivoo) {
    console.log(`✅ Verified legitimate institutional tenant: ${inzivoo.name} (${inzivoo.code}) [${inzivoo.id}]`);
  } else {
    console.log("ℹ️ No default institutional tenant found. Register an institution via Super Admin.");
  }

  console.log("🏁 Seed completed successfully with zero unwanted demo institutions created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
