const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting connected institutional database seed for NEXORA...");

  // 1. Institution: Northstar International Academy
  const institution = await prisma.institution.upsert({
    where: { code: "NORTHSTAR" },
    update: {
      name: "Northstar International Academy",
      brandingColor: "#4f46e5",
    },
    create: {
      name: "Northstar International Academy",
      code: "NORTHSTAR",
      type: "SCHOOL",
      address: "Plot 12, Knowledge Park III",
      city: "Greater Noida",
      state: "Uttar Pradesh",
      pincode: "201306",
      phone: "+91 120 4567890",
      email: "contact@northstar.edu.in",
      website: "https://northstar.edu.in",
      timezone: "Asia/Kolkata",
      currency: "INR",
      currencySymbol: "₹",
      workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
      workingHours: "08:00 - 15:30",
      brandingColor: "#4f46e5",
    },
  });

  console.log(`✅ Institution configured: ${institution.name}`);

  // 2. Academic Year & Terms
  let academicYear = await prisma.academicYear.findFirst({
    where: { institutionId: institution.id, name: "2026-2027" },
    include: { terms: true },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        institutionId: institution.id,
        name: "2026-2027",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2027-03-31"),
        isCurrent: true,
        terms: {
          create: [
            { name: "Term 1 (Autumn)", startDate: new Date("2026-04-01"), endDate: new Date("2026-09-30"), isCurrent: true },
            { name: "Term 2 (Spring)", startDate: new Date("2026-10-01"), endDate: new Date("2027-03-31"), isCurrent: false },
          ],
        },
      },
      include: { terms: true },
    });
  }

  // 3. Campuses
  let campusMain = await prisma.campus.findFirst({
    where: { institutionId: institution.id, code: "MAC-01" },
  });
  if (!campusMain) {
    campusMain = await prisma.campus.create({
      data: {
        institutionId: institution.id,
        name: "Main Academic Campus",
        code: "MAC-01",
        address: "Knowledge Park III, Greater Noida",
        contactEmail: "admin.campus@northstar.edu.in",
        contactPhone: "+91 120 4567891",
        headName: "Dr. Arvind Menon",
      },
    });
  }

  // 4. Departments
  const deptData = [
    { name: "Science & Technology", code: "SCI" },
    { name: "Mathematics", code: "MATH" },
    { name: "Languages & Literature", code: "LANG" },
    { name: "Social Sciences & Humanities", code: "SOC" },
    { name: "Commerce & Management", code: "COMM" },
    { name: "Physical Education & Arts", code: "PEA" },
  ];

  const departments = {};
  for (const d of deptData) {
    const existingDept = await prisma.department.findFirst({
      where: { institutionId: institution.id, code: d.code },
    });
    if (existingDept) {
      departments[d.code] = existingDept;
    } else {
      departments[d.code] = await prisma.department.create({
        data: {
          institutionId: institution.id,
          name: d.name,
          code: d.code,
        },
      });
    }
  }

  // Common password hash for demo accounts: "demo123"
  const passwordHash = await bcrypt.hash("demo123", 10);

  // 5. Create Core Connected Demo Users
  // Principal: Dr. Arvind Menon
  const userPrincipal = await prisma.user.upsert({
    where: { email: "principal@nexora.demo" },
    update: { fullName: "Dr. Arvind Menon", roleCode: "PRINCIPAL" },
    create: {
      institutionId: institution.id,
      email: "principal@nexora.demo",
      fullName: "Dr. Arvind Menon",
      passwordHash,
      phone: "+91 98100 11001",
      roleCode: "PRINCIPAL",
    },
  });

  // Admin
  const userAdmin = await prisma.user.upsert({
    where: { email: "admin@nexora.demo" },
    update: { fullName: "System Super Admin", roleCode: "SUPER_ADMIN" },
    create: {
      institutionId: institution.id,
      email: "admin@nexora.demo",
      fullName: "System Super Admin",
      passwordHash,
      phone: "+91 98100 11000",
      roleCode: "SUPER_ADMIN",
    },
  });

  // Teacher: Mrs. Ananya Sharma (Maths Lead & Class Teacher of Grade 8A)
  const userTeacher = await prisma.user.upsert({
    where: { email: "teacher@nexora.demo" },
    update: { fullName: "Mrs. Ananya Sharma", roleCode: "TEACHER" },
    create: {
      institutionId: institution.id,
      email: "teacher@nexora.demo",
      fullName: "Mrs. Ananya Sharma",
      passwordHash,
      phone: "+91 98100 11002",
      roleCode: "TEACHER",
    },
  });

  // Accountant: Mrs. Neha Kapoor
  const userAccountant = await prisma.user.upsert({
    where: { email: "accountant@nexora.demo" },
    update: { fullName: "Mrs. Neha Kapoor", roleCode: "ACCOUNTANT" },
    create: {
      institutionId: institution.id,
      email: "accountant@nexora.demo",
      fullName: "Mrs. Neha Kapoor",
      passwordHash,
      phone: "+91 98100 11003",
      roleCode: "ACCOUNTANT",
    },
  });

  // Parent: Mr. Rahul Sharma (Father of Aarav & Meera)
  const userParent = await prisma.user.upsert({
    where: { email: "parent@nexora.demo" },
    update: { fullName: "Mr. Rahul Sharma", roleCode: "PARENT" },
    create: {
      institutionId: institution.id,
      email: "parent@nexora.demo",
      fullName: "Mr. Rahul Sharma",
      passwordHash,
      phone: "+91 98100 11005",
      roleCode: "PARENT",
    },
  });

  // Student: Aarav Sharma (Grade 8A, Roll #12)
  const userStudent = await prisma.user.upsert({
    where: { email: "student@nexora.demo" },
    update: { fullName: "Aarav Sharma", roleCode: "STUDENT" },
    create: {
      institutionId: institution.id,
      email: "student@nexora.demo",
      fullName: "Aarav Sharma",
      passwordHash,
      phone: "+91 98100 11006",
      roleCode: "STUDENT",
    },
  });

  console.log("✅ Core Interconnected Demo Users verified.");

  // 6. Seed Teachers
  const teacherSeedProfiles = [
    { firstName: "Ananya", lastName: "Sharma", email: "teacher@nexora.demo", phone: "+91 98100 11002", dept: "MATH", desig: "Senior Mathematics Teacher & Class 8A Incharge", userId: userTeacher.id, salary: 68000 },
    { firstName: "Arvind", lastName: "Menon", email: "principal@nexora.demo", phone: "+91 98100 11001", dept: "SCI", desig: "Principal & Head of Institution", userId: userPrincipal.id, salary: 125000 },
    { firstName: "Rajeshwar", lastName: "Kulkarni", email: "hod.science@nexora.demo", phone: "+91 98100 11010", dept: "SCI", desig: "HOD Science & Physics Faculty", salary: 88000 },
    { firstName: "Meenakshi", lastName: "Sundaram", email: "m.sundaram@northstar.edu.in", phone: "+91 98100 11011", dept: "LANG", desig: "HOD English Literature", salary: 78000 },
    { firstName: "Devendra", lastName: "Prasad", email: "d.prasad@northstar.edu.in", phone: "+91 98100 11012", dept: "SOC", desig: "Senior History Faculty", salary: 64000 },
    { firstName: "Pooja", lastName: "Bhatt", email: "p.bhatt@northstar.edu.in", phone: "+91 98100 11013", dept: "SCI", desig: "Chemistry Teacher", salary: 58000 },
  ];

  for (let i = 7; i <= 35; i++) {
    const fNames = ["Deepak", "Swati", "Gaurav", "Preeti", "Sanjay", "Ritu", "Manoj", "Anjali", "Karan", "Bhavna", "Sunil", "Madhuri", "Tarun", "Shilpa", "Vikas", "Neeru", "Sameer", "Harish", "Asha", "Naveen"];
    const lNames = ["Sen", "Agarwal", "Bose", "Pillai", "Reddy", "Patel", "Singh", "Joshi", "Bansal", "Saxena", "Choudhury", "Bhatnagar", "Rao", "Pandey", "Ghosh"];
    const fn = fNames[i % fNames.length];
    const ln = lNames[i % lNames.length];
    const depts = ["SCI", "MATH", "LANG", "SOC", "COMM", "PEA"];
    const dCode = depts[i % depts.length];

    teacherSeedProfiles.push({
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@northstar.edu.in`,
      phone: `+91 98100 ${11000 + i}`,
      dept: dCode,
      desig: `${dCode} Educator`,
      salary: 48000 + (i % 6) * 4000,
    });
  }

  const createdTeachers = [];
  for (let idx = 0; idx < teacherSeedProfiles.length; idx++) {
    const tp = teacherSeedProfiles[idx];
    const empId = `EMP-2026-${String(idx + 1).padStart(3, "0")}`;

    let t = await prisma.teacher.findFirst({
      where: {
        OR: [
          { email: tp.email },
          { employeeId: empId },
        ],
      },
    });

    if (t) {
      t = await prisma.teacher.update({
        where: { id: t.id },
        data: {
          email: tp.email,
          employeeId: empId,
          firstName: tp.firstName,
          lastName: tp.lastName,
          fullName: `${tp.firstName} ${tp.lastName}`,
          designation: tp.desig,
          departmentId: departments[tp.dept]?.id || null,
          basicSalary: tp.salary,
          userId: tp.userId || null,
        },
      });
    } else {
      t = await prisma.teacher.create({
        data: {
          institutionId: institution.id,
          campusId: campusMain.id,
          userId: tp.userId || null,
          employeeId: empId,
          firstName: tp.firstName,
          lastName: tp.lastName,
          fullName: `${tp.firstName} ${tp.lastName}`,
          email: tp.email,
          phone: tp.phone,
          designation: tp.desig,
          departmentId: departments[tp.dept]?.id || null,
          qualification: "M.Sc., B.Ed., NET Certified",
          basicSalary: tp.salary,
          bankAccountNumber: `HDFC000123456${idx}`,
          bankIfsc: "HDFC0001234",
          casualLeaveBalance: 12 - (idx % 3),
          sickLeaveBalance: 10 - (idx % 2),
          earnedLeaveBalance: 15,
        },
      });
    }
    createdTeachers.push(t);
  }

  console.log(`✅ ${createdTeachers.length} Teachers verified.`);

  // 7. Classes & Sections: Grade 8A assigned to Mrs. Ananya Sharma
  const classConfigs = [
    { name: "Grade 5", code: "G5", level: "PRIMARY", sections: ["A", "B"] },
    { name: "Grade 6", code: "G6", level: "MIDDLE", sections: ["A", "B", "C"] },
    { name: "Grade 7", code: "G7", level: "MIDDLE", sections: ["A", "B", "C"] },
    { name: "Grade 8", code: "G8", level: "MIDDLE", sections: ["A", "B", "C"] },
    { name: "Grade 9", code: "G9", level: "SECONDARY", sections: ["A", "B"] },
    { name: "Grade 10", code: "G10", level: "SECONDARY", sections: ["A", "B"] },
    { name: "Grade 11 Science", code: "G11-SCI", level: "HIGHER_SECONDARY", sections: ["A", "B"] },
    { name: "Grade 12 Science", code: "G12-SCI", level: "HIGHER_SECONDARY", sections: ["A", "B"] },
  ];

  const createdSections = [];
  let secIdx = 0;

  for (const cc of classConfigs) {
    let c = await prisma.class.findFirst({
      where: { institutionId: institution.id, code: cc.code },
    });
    if (!c) {
      c = await prisma.class.create({
        data: {
          institutionId: institution.id,
          name: cc.name,
          code: cc.code,
          level: cc.level,
          orderIndex: secIdx + 1,
          academicYearId: academicYear.id,
        },
      });
    }

    for (const sName of cc.sections) {
      // Grade 8A has Mrs. Ananya Sharma (Teacher 0)
      const is8A = cc.code === "G8" && sName === "A";
      const teacherAssigned = is8A ? createdTeachers[0] : createdTeachers[(secIdx + 1) % createdTeachers.length];

      let sec = await prisma.section.findFirst({
        where: { classId: c.id, name: sName },
      });

      if (!sec) {
        sec = await prisma.section.create({
          data: {
            classId: c.id,
            name: sName,
            roomNumber: `Room-${100 + secIdx}`,
            capacity: 35,
            classTeacherId: teacherAssigned.id,
          },
        });
      } else {
        await prisma.section.update({
          where: { id: sec.id },
          data: { classTeacherId: teacherAssigned.id },
        });
      }

      createdSections.push({ ...sec, className: c.name, classCode: c.code });
      secIdx++;
    }
  }

  // 8. Guardian: Mr. Rahul Sharma
  let guardianSharma = await prisma.guardian.findFirst({
    where: { institutionId: institution.id, email: "parent@nexora.demo" },
  });

  if (!guardianSharma) {
    guardianSharma = await prisma.guardian.create({
      data: {
        institutionId: institution.id,
        userId: userParent.id,
        fullName: "Mr. Rahul Sharma",
        relation: "FATHER",
        phone: "+91 98100 11005",
        email: "parent@nexora.demo",
        occupation: "Principal Software Architect",
        annualIncome: 3200000,
        address: "Tower B-402, Sector 137, Noida",
      },
    });
  } else {
    await prisma.guardian.update({
      where: { id: guardianSharma.id },
      data: { fullName: "Mr. Rahul Sharma", userId: userParent.id },
    });
  }

  // 9. Aarav Sharma (Grade 8A, Roll 12) & Meera Sharma (Grade 5B, Roll 08)
  const sec8A = createdSections.find((s) => s.classCode === "G8" && s.name === "A");
  const sec5B = createdSections.find((s) => s.classCode === "G5" && s.name === "B") || createdSections[0];

  // Aarav
  let aarav = await prisma.student.findFirst({
    where: { admissionNumber: "ADM-2026-0001" },
  });
  if (aarav) {
    await prisma.student.update({
      where: { id: aarav.id },
      data: {
        fullName: "Aarav Sharma",
        firstName: "Aarav",
        lastName: "Sharma",
        rollNumber: "12",
        currentClassId: sec8A.classId,
        currentSectionId: sec8A.id,
        userId: userStudent.id,
        emergencyContactName: "Mr. Rahul Sharma",
        emergencyContactPhone: "+91 98100 11005",
      },
    });
  }

  // Meera (Sibling)
  let meera = await prisma.student.findFirst({
    where: { admissionNumber: "ADM-2026-0002" },
  });
  if (meera) {
    await prisma.student.update({
      where: { id: meera.id },
      data: {
        fullName: "Meera Sharma",
        firstName: "Meera",
        lastName: "Sharma",
        rollNumber: "08",
        currentClassId: sec5B.classId,
        currentSectionId: sec5B.id,
        emergencyContactName: "Mr. Rahul Sharma",
        emergencyContactPhone: "+91 98100 11005",
      },
    });
  }

  // Ensure Guardianship junction is linked
  if (aarav && guardianSharma) {
    await prisma.studentGuardian.upsert({
      where: { studentId_guardianId: { studentId: aarav.id, guardianId: guardianSharma.id } },
      update: { isPrimary: true },
      create: { studentId: aarav.id, guardianId: guardianSharma.id, isPrimary: true },
    });
  }

  if (meera && guardianSharma) {
    await prisma.studentGuardian.upsert({
      where: { studentId_guardianId: { studentId: meera.id, guardianId: guardianSharma.id } },
      update: { isPrimary: true },
      create: { studentId: meera.id, guardianId: guardianSharma.id, isPrimary: true },
    });
  }

  console.log("🎉 NEXORA institutional connected personas seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
