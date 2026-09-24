const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("==================================================");
  console.log("PRISMA SUPABASE POSTGRESQL CONNECTION TEST");
  console.log("==================================================");
  
  const rawUrl = process.env.DATABASE_URL || "";
  const maskedUrl = rawUrl ? rawUrl.replace(/:[^:@]+@/, ":***@") : "EMPTY / UNDEFINED";
  console.log("Loaded DATABASE_URL:", maskedUrl);

  if (!rawUrl) {
    console.error("FATAL: process.env.DATABASE_URL is missing or empty!");
    process.exit(1);
  }

  try {
    const institutionCount = await prisma.institution.count();
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const sampleUser = await prisma.user.findFirst({
      select: { id: true, email: true, fullName: true, roleCode: true },
    });

    console.log("--------------------------------------------------");
    console.log("✅ REAL PRISMA QUERY SUCCEEDED!");
    console.log("Institutions count:", institutionCount);
    console.log("Users count:", userCount);
    console.log("Students count:", studentCount);
    console.log("Teachers count:", teacherCount);
    console.log("Sample User Record:", sampleUser);
    console.log("--------------------------------------------------");
    console.log("Supabase PostgreSQL database is healthy and reachable.");
  } catch (error) {
    console.error("❌ PRISMA CONNECTION FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
