const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting connected institutional database seed for NEXORA...");

  // 1. Institution: Northstar International Academy
  const institution = await prisma.institution.upsert({
    where: { code: "NORTHSTAR-2026" },
    update: {
      name: "Northstar International Academy",
      brandingColor: "#0F172A",
    },
    create: {
      name: "Northstar International Academy",
      code: "NORTHSTAR-2026",
      type: "SCHOOL",
      address: "Plot 12, Knowledge Park III",
      city: "Greater Noida",
      state: "Uttar Pradesh",
      pincode: "201306",
      phone: "+91 98100 11000",
      email: "admissions@northstar.edu.in",
      website: "https://northstar.edu.in",
      timezone: "Asia/Kolkata",
      currency: "INR",
      currencySymbol: "₹",
      workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
      workingHours: "08:00 - 15:30",
      brandingColor: "#0F172A",
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
    let existingDept = await prisma.department.findFirst({
      where: { institutionId: institution.id, code: d.code },
    });
    if (!existingDept) {
      existingDept = await prisma.department.create({
        data: {
          institutionId: institution.id,
          name: d.name,
          code: d.code,
        },
      });
    }
    departments[d.code] = existingDept;
  }

  // Common password hash for demo accounts: "demo123"
  const passwordHash = await bcrypt.hash("demo123", 10);

  // 5. Create Core Connected Demo Users
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
        OR: [{ email: tp.email }, { employeeId: empId }],
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

  // 7. Classes & Sections
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

  // 8. Subjects
  const subjectList = [
    { name: "Mathematics", code: "MATH-801", dept: "MATH" },
    { name: "General Science & Physics", code: "SCI-801", dept: "SCI" },
    { name: "English Literature & Grammar", code: "ENG-801", dept: "LANG" },
    { name: "Social Science & History", code: "SOC-801", dept: "SOC" },
    { name: "Computer Science & Python", code: "CS-801", dept: "SCI" },
    { name: "Hindi Language & Sahitya", code: "HIN-801", dept: "LANG" },
  ];

  const createdSubjects = {};
  for (const s of subjectList) {
    let sub = await prisma.subject.findFirst({
      where: { institutionId: institution.id, code: s.code },
    });
    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          institutionId: institution.id,
          name: s.name,
          code: s.code,
          departmentId: departments[s.dept]?.id || null,
          credits: 4,
          type: "THEORY",
        },
      });
    }
    createdSubjects[s.code] = sub;
  }

  // 9. Guardian: Mr. Rahul Sharma
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

  // 10. Students: Aarav Sharma (Grade 8A) & Meera Sharma (Grade 5B) & Classmates
  const sec8A = createdSections.find((s) => s.classCode === "G8" && s.name === "A");
  const sec5B = createdSections.find((s) => s.classCode === "G5" && s.name === "B") || createdSections[0];

  // Aarav Sharma
  let aarav = await prisma.student.findFirst({
    where: { admissionNumber: "ADM-2026-0001" },
  });
  if (!aarav) {
    aarav = await prisma.student.create({
      data: {
        institutionId: institution.id,
        campusId: campusMain.id,
        academicYearId: academicYear.id,
        currentClassId: sec8A.classId,
        currentSectionId: sec8A.id,
        userId: userStudent.id,
        admissionNumber: "ADM-2026-0001",
        rollNumber: "12",
        firstName: "Aarav",
        lastName: "Sharma",
        fullName: "Aarav Sharma",
        email: "student@nexora.demo",
        phone: "+91 98100 11006",
        dateOfBirth: new Date("2012-05-14"),
        gender: "MALE",
        bloodGroup: "B+",
        address: "Tower B-402, Sector 137, Noida",
        emergencyContactName: "Mr. Rahul Sharma",
        emergencyContactPhone: "+91 98100 11005",
        status: "ACTIVE",
      },
    });
  } else {
    await prisma.student.update({
      where: { id: aarav.id },
      data: {
        userId: userStudent.id,
        currentClassId: sec8A.classId,
        currentSectionId: sec8A.id,
      },
    });
  }

  // Meera Sharma (Sibling)
  let meera = await prisma.student.findFirst({
    where: { admissionNumber: "ADM-2026-0002" },
  });
  if (!meera) {
    meera = await prisma.student.create({
      data: {
        institutionId: institution.id,
        campusId: campusMain.id,
        academicYearId: academicYear.id,
        currentClassId: sec5B.classId,
        currentSectionId: sec5B.id,
        admissionNumber: "ADM-2026-0002",
        rollNumber: "08",
        firstName: "Meera",
        lastName: "Sharma",
        fullName: "Meera Sharma",
        email: "meera.sharma@northstar.edu.in",
        phone: "+91 98100 11005",
        dateOfBirth: new Date("2015-08-22"),
        gender: "FEMALE",
        bloodGroup: "O+",
        address: "Tower B-402, Sector 137, Noida",
        emergencyContactName: "Mr. Rahul Sharma",
        emergencyContactPhone: "+91 98100 11005",
        status: "ACTIVE",
      },
    });
  }

  // Link Guardianship
  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: aarav.id, guardianId: guardianSharma.id } },
    update: { isPrimary: true },
    create: { studentId: aarav.id, guardianId: guardianSharma.id, isPrimary: true },
  });

  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: meera.id, guardianId: guardianSharma.id } },
    update: { isPrimary: true },
    create: { studentId: meera.id, guardianId: guardianSharma.id, isPrimary: true },
  });

  // Seed Classmates for Grade 8A so Mrs. Ananya Sharma has a full roster
  const classmates = [
    { fn: "Rohan", ln: "Verma", roll: "01", gender: "MALE" },
    { fn: "Ananya", ln: "Iyer", roll: "02", gender: "FEMALE" },
    { fn: "Kabir", ln: "Kapoor", roll: "03", gender: "MALE" },
    { fn: "Diya", ln: "Mehta", roll: "04", gender: "FEMALE" },
    { fn: "Ishaan", ln: "Gupta", roll: "05", gender: "MALE" },
    { fn: "Sanya", ln: "Malhotra", roll: "06", gender: "FEMALE" },
    { fn: "Arjun", ln: "Patel", roll: "07", gender: "MALE" },
    { fn: "Rhea", ln: "Chopra", roll: "08", gender: "FEMALE" },
    { fn: "Aditya", ln: "Rao", roll: "09", gender: "MALE" },
    { fn: "Tanvi", ln: "Bansal", roll: "10", gender: "FEMALE" },
    { fn: "Vivaan", ln: "Reddy", roll: "11", gender: "MALE" },
  ];

  for (const cm of classmates) {
    const adm = `ADM-2026-00${cm.roll}`;
    let s = await prisma.student.findFirst({ where: { admissionNumber: adm } });
    if (!s) {
      await prisma.student.create({
        data: {
          institutionId: institution.id,
          campusId: campusMain.id,
          academicYearId: academicYear.id,
          currentClassId: sec8A.classId,
          currentSectionId: sec8A.id,
          admissionNumber: adm,
          rollNumber: cm.roll,
          firstName: cm.fn,
          lastName: cm.ln,
          fullName: `${cm.fn} ${cm.ln}`,
          email: `${cm.fn.toLowerCase()}.${cm.ln.toLowerCase()}@northstar.edu.in`,
          dateOfBirth: new Date("2012-03-10"),
          gender: cm.gender,
          bloodGroup: "A+",
          status: "ACTIVE",
        },
      });
    }
  }

  // 11. Timetable Slots for Grade 8A (Mrs. Ananya Sharma)
  const mathSub = createdSubjects["MATH-801"];
  const sciSub = createdSubjects["SCI-801"];
  const engSub = createdSubjects["ENG-801"];
  const socSub = createdSubjects["SOC-801"];
  const csSub = createdSubjects["CS-801"];
  const teacherAnanya = createdTeachers[0]; // Mrs. Ananya Sharma

  const scheduleSlots = [
    { period: 1, day: "MONDAY", sub: mathSub, teacher: teacherAnanya, start: "08:30", end: "09:15", room: "Room-104" },
    { period: 2, day: "MONDAY", sub: sciSub, teacher: createdTeachers[1] || teacherAnanya, start: "09:15", end: "10:00", room: "Room-104" },
    { period: 3, day: "MONDAY", sub: engSub, teacher: createdTeachers[3] || teacherAnanya, start: "10:15", end: "11:00", room: "Room-104" },
    { period: 4, day: "MONDAY", sub: socSub, teacher: createdTeachers[4] || teacherAnanya, start: "11:00", end: "11:45", room: "Room-104" },
    { period: 5, day: "MONDAY", sub: csSub, teacher: createdTeachers[2] || teacherAnanya, start: "12:30", end: "01:15", room: "Computer Lab 2" },
  ];

  for (const sl of scheduleSlots) {
    await prisma.timetableSlot.upsert({
      where: {
        sectionId_dayOfWeek_periodNumber: {
          sectionId: sec8A.id,
          dayOfWeek: sl.day,
          periodNumber: sl.period,
        },
      },
      update: {
        subjectId: sl.sub.id,
        teacherId: sl.teacher.id,
        startTime: sl.start,
        endTime: sl.end,
        roomNumber: sl.room,
      },
      create: {
        sectionId: sec8A.id,
        subjectId: sl.sub.id,
        teacherId: sl.teacher.id,
        dayOfWeek: sl.day,
        periodNumber: sl.period,
        startTime: sl.start,
        endTime: sl.end,
        roomNumber: sl.room,
      },
    });
  }

  // 12. Active Assignments for Mrs. Ananya Sharma
  let assign1 = await prisma.assignment.findFirst({
    where: { sectionId: sec8A.id, title: "Polynomial Factorization Practice Set" },
  });
  if (!assign1) {
    assign1 = await prisma.assignment.create({
      data: {
        institutionId: institution.id,
        sectionId: sec8A.id,
        subjectId: mathSub.id,
        teacherId: teacherAnanya.id,
        title: "Polynomial Factorization Practice Set",
        description: "Complete Exercise 4.2 Problems 1-15 from NCERT Mathematics Textbook. Show complete working steps.",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
        priority: "HIGH",
        status: "PUBLISHED",
        maxMarks: 25,
      },
    });
  }

  let assign2 = await prisma.assignment.findFirst({
    where: { sectionId: sec8A.id, title: "Linear Equations in One Variable - Real World Problems" },
  });
  if (!assign2) {
    assign2 = await prisma.assignment.create({
      data: {
        institutionId: institution.id,
        sectionId: sec8A.id,
        subjectId: mathSub.id,
        teacherId: teacherAnanya.id,
        title: "Linear Equations in One Variable - Real World Problems",
        description: "Submit word problem application worksheet for Chapter 2.",
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
        priority: "MEDIUM",
        status: "PUBLISHED",
        maxMarks: 50,
      },
    });
  }

  // 13. Tasks for Teacher
  await prisma.task.createMany({
    data: [
      {
        institutionId: institution.id,
        createdById: userPrincipal.id,
        assigneeUserId: userTeacher.id,
        title: "Submit Grade 8 Mid-Term Question Paper Blueprint",
        description: "Prepare standard CBSE blueprint for Grade 8 Mathematics mid-term evaluation.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        institutionId: institution.id,
        createdById: userPrincipal.id,
        assigneeUserId: userTeacher.id,
        title: "Parent-Teacher Conference Slot Allocation",
        description: "Finalize meeting schedule slots for Grade 8A parents on Saturday.",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  // 14. Fee Structure & Student Fees for Aarav & Meera
  let feeCat = await prisma.feeCategory.findFirst({
    where: { institutionId: institution.id, name: "Tuition & Academic Term Fee" },
  });
  if (!feeCat) {
    feeCat = await prisma.feeCategory.create({
      data: {
        institutionId: institution.id,
        name: "Tuition & Academic Term Fee",
        description: "Regular term tuition, lab charges and library services",
      },
    });
  }

  let feeStruct8 = await prisma.feeStructure.findFirst({
    where: { classId: sec8A.classId, academicYearId: academicYear.id },
  });
  if (!feeStruct8) {
    feeStruct8 = await prisma.feeStructure.create({
      data: {
        institutionId: institution.id,
        feeCategoryId: feeCat.id,
        classId: sec8A.classId,
        academicYearId: academicYear.id,
        amount: 38000,
        dueDate: new Date("2026-10-15"),
        frequency: "TERM",
      },
    });
  }

  let feeStruct5 = await prisma.feeStructure.findFirst({
    where: { classId: sec5B.classId, academicYearId: academicYear.id },
  });
  if (!feeStruct5) {
    feeStruct5 = await prisma.feeStructure.create({
      data: {
        institutionId: institution.id,
        feeCategoryId: feeCat.id,
        classId: sec5B.classId,
        academicYearId: academicYear.id,
        amount: 32000,
        dueDate: new Date("2026-10-15"),
        frequency: "TERM",
      },
    });
  }

  // Aarav's Fee (Paid)
  let aaravFee = await prisma.studentFee.findFirst({ where: { studentId: aarav.id } });
  if (!aaravFee) {
    aaravFee = await prisma.studentFee.create({
      data: {
        studentId: aarav.id,
        feeStructureId: feeStruct8.id,
        academicYearId: academicYear.id,
        totalAmount: 38000,
        paidAmount: 38000,
        pendingAmount: 0,
        dueDate: new Date("2026-10-15"),
        status: "PAID",
        remarks: "Term 1 fee paid in full via Net Banking",
      },
    });

    await prisma.feePayment.create({
      data: {
        studentFeeId: aaravFee.id,
        studentId: aarav.id,
        receiptNumber: "REC-2026-0891",
        amount: 38000,
        paymentMethod: "ONLINE",
        paymentDate: new Date(),
        notes: "Full payment received",
      },
    });
  }

  // Meera's Fee (Paid)
  let meeraFee = await prisma.studentFee.findFirst({ where: { studentId: meera.id } });
  if (!meeraFee) {
    meeraFee = await prisma.studentFee.create({
      data: {
        studentId: meera.id,
        feeStructureId: feeStruct5.id,
        academicYearId: academicYear.id,
        totalAmount: 32000,
        paidAmount: 32000,
        pendingAmount: 0,
        dueDate: new Date("2026-10-15"),
        status: "PAID",
        remarks: "Term 1 fee paid in full via UPI",
      },
    });

    await prisma.feePayment.create({
      data: {
        studentFeeId: meeraFee.id,
        studentId: meera.id,
        receiptNumber: "REC-2026-0892",
        amount: 32000,
        paymentMethod: "UPI",
        paymentDate: new Date(),
        notes: "Full payment received",
      },
    });
  }

  // 15. Student Attendance History for Aarav & Grade 8A
  for (let d = 1; d <= 15; d++) {
    const attDate = new Date(`2026-09-${String(d).padStart(2, "0")}T00:00:00.000Z`);
    await prisma.studentAttendance.upsert({
      where: { studentId_date: { studentId: aarav.id, date: attDate } },
      update: { status: d === 7 ? "ABSENT" : "PRESENT" },
      create: {
        studentId: aarav.id,
        sectionId: sec8A.id,
        date: attDate,
        status: d === 7 ? "ABSENT" : "PRESENT",
        remarks: d === 7 ? "Medical leave submitted" : "Regular attendance",
      },
    });
  }

  console.log("🎉 Complete institutional connected personas seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
