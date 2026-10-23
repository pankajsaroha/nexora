const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const institutionId = 'cbe9c791-f622-4494-aed6-f0d1f2c04eed';
  const academicYearId = '0d7c39cf-047f-42f0-b37e-b34c7b0ec05f';
  const classId = '01285bc8-6b84-4947-8b62-cbf192b3c787'; // Grade 10
  const sectionId = 'b8235cd4-2e06-4739-979d-f7257d3564bc'; // Section A

  // 1. Get or verify user student@nexora.demo
  const studentUser = await prisma.user.findFirst({
    where: { email: 'student@nexora.demo', institutionId },
  });

  // 2. Get or verify guardian parent@nexora.demo
  const parentGuardian = await prisma.guardian.findFirst({
    where: { email: 'parent@nexora.demo', institutionId },
  });

  // 3. Upsert Aarav Sharma student record
  let aarav = await prisma.student.findFirst({
    where: { admissionNumber: 'ADM-2026-0001', institutionId },
  });

  if (!aarav) {
    aarav = await prisma.student.create({
      data: {
        institutionId,
        academicYearId,
        currentClassId: classId,
        currentSectionId: sectionId,
        userId: studentUser ? studentUser.id : null,
        admissionNumber: 'ADM-2026-0001',
        rollNumber: '101',
        firstName: 'Aarav',
        lastName: 'Sharma',
        fullName: 'Aarav Sharma',
        gender: 'MALE',
        dateOfBirth: new Date('2010-05-14'),
        email: 'student@nexora.demo',
        phone: '+91 98100 11009',
        address: 'Tower B-402, Sector 137, Noida',
        status: 'ACTIVE',
        portalAccessStatus: 'ACTIVE',
        loginId: 'NXAARAV',
      },
    });
    console.log('Created Aarav Sharma student record:', aarav.id);
  } else {
    console.log('Aarav Sharma already exists:', aarav.id);
  }

  // Link Aarav to Rahul Sharma if not linked
  if (parentGuardian) {
    const existingLink = await prisma.studentGuardian.findFirst({
      where: { studentId: aarav.id, guardianId: parentGuardian.id },
    });
    if (!existingLink) {
      await prisma.studentGuardian.create({
        data: {
          studentId: aarav.id,
          guardianId: parentGuardian.id,
          isPrimary: true,
        },
      });
      console.log('Linked Aarav Sharma to guardian Rahul Sharma');
    }
  }

  // 4. Upsert Meera Sharma student record (unprovisioned student)
  let meera = await prisma.student.findFirst({
    where: { admissionNumber: 'ADM-2026-0002', institutionId },
  });

  if (!meera) {
    meera = await prisma.student.create({
      data: {
        institutionId,
        academicYearId,
        currentClassId: classId,
        currentSectionId: sectionId,
        admissionNumber: 'ADM-2026-0002',
        rollNumber: '102',
        firstName: 'Meera',
        lastName: 'Sharma',
        fullName: 'Meera Sharma',
        gender: 'FEMALE',
        dateOfBirth: new Date('2011-09-21'),
        email: null, // No personal email initially
        phone: null,
        address: 'Tower B-402, Sector 137, Noida',
        status: 'ACTIVE',
        portalAccessStatus: 'NOT_ENABLED',
        loginId: null,
      },
    });
    console.log('Created Meera Sharma student record:', meera.id);
  } else {
    // Reset to NOT_ENABLED and null loginId if needed for testing
    await prisma.student.update({
      where: { id: meera.id },
      data: {
        portalAccessStatus: 'NOT_ENABLED',
        loginId: null,
        userId: null,
      },
    });
    console.log('Reset Meera Sharma to NOT_ENABLED for clean testing:', meera.id);
  }

  // 5. Add attendance sample for Aarav and Meera
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttAarav = await prisma.studentAttendance.findFirst({
    where: { studentId: aarav.id, date: today },
  });
  if (!existingAttAarav) {
    await prisma.studentAttendance.create({
      data: {
        sectionId,
        studentId: aarav.id,
        date: today,
        status: 'PRESENT',
        remarks: 'Present on time',
      },
    });
    console.log('Seeded attendance for Aarav');
  }

  const existingAttMeera = await prisma.studentAttendance.findFirst({
    where: { studentId: meera.id, date: today },
  });
  if (!existingAttMeera) {
    await prisma.studentAttendance.create({
      data: {
        sectionId,
        studentId: meera.id,
        date: today,
        status: 'PRESENT',
        remarks: 'Present on time',
      },
    });
    console.log('Seeded attendance for Meera');
  }

  // 6. Ensure Published Exam exists for Grade 10
  let publishedExam = await prisma.exam.findFirst({
    where: { institutionId, status: 'PUBLISHED' },
    include: { examSubjects: true },
  });

  if (!publishedExam) {
    // Check if there is any subject in Grade 10
    const subject = await prisma.subject.findFirst({
      where: { institutionId },
    });

    if (subject) {
      publishedExam = await prisma.exam.create({
        data: {
          institutionId,
          academicYearId,
          name: 'Mid-Term Assessment 2026',
          examType: 'MIDTERM',
          startDate: new Date('2026-09-10'),
          endDate: new Date('2026-09-20'),
          status: 'PUBLISHED',
          examSubjects: {
            create: {
              subjectId: subject.id,
              classId,
              examDate: new Date('2026-09-12'),
              maxMarks: 100,
              passMarks: 40,
              marks: {
                create: [
                  {
                    studentId: aarav.id,
                    marksObtained: 88,
                    grade: 'A',
                    isAbsent: false,
                    remarks: 'Excellent performance in calculus',
                  },
                  {
                    studentId: meera.id,
                    marksObtained: 94,
                    grade: 'A+',
                    isAbsent: false,
                    remarks: 'Outstanding analytical reasoning',
                  },
                ],
              },
            },
          },
        },
      });
      console.log('Created published exam with results for Aarav & Meera:', publishedExam.id);
    }
  }

  console.log('Portal student seed complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
