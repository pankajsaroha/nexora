const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log('===============================================================');
  console.log('         NEXORA INSTITUTIONS & DATA AUDIT REPORT              ');
  console.log('===============================================================\n');

  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${institutions.length} institutions in database:\n`);

  for (const inst of institutions) {
    console.log(`---------------------------------------------------------------`);
    console.log(`Institution: ${inst.name}`);
    console.log(`  ID:   ${inst.id}`);
    console.log(`  Code: ${inst.code}`);
    console.log(`  Type: ${inst.type}`);
    console.log(`  Created At: ${inst.createdAt ? inst.createdAt.toISOString() : 'N/A'}`);

    // Count all dependents
    const [
      users,
      students,
      guardians,
      teachers,
      classes,
      sections,
      exams,
      studentMarks,
      studentAttendances,
      staffAttendances,
      assignments,
      assignmentSubmissions,
      feeCategories,
      feeStructures,
      studentFees,
      feePayments,
      tasks,
      announcements,
      auditLogs,
      campuses,
      departments,
      academicYears,
      leavePolicies,
      leaveRequests,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { institutionId: inst.id },
        select: { id: true, email: true, fullName: true, roleCode: true },
      }),
      prisma.student.count({ where: { institutionId: inst.id } }),
      prisma.guardian.count({ where: { institutionId: inst.id } }),
      prisma.teacher.count({ where: { institutionId: inst.id } }),
      prisma.class.count({ where: { institutionId: inst.id } }),
      prisma.section.count({ where: { class: { institutionId: inst.id } } }),
      prisma.exam.count({ where: { institutionId: inst.id } }),
      prisma.studentMark.count({ where: { student: { institutionId: inst.id } } }),
      prisma.studentAttendance.count({ where: { student: { institutionId: inst.id } } }),
      prisma.staffAttendance.count({ where: { teacher: { institutionId: inst.id } } }),
      prisma.assignment.count({ where: { institutionId: inst.id } }),
      prisma.assignmentSubmission.count({ where: { student: { institutionId: inst.id } } }),
      prisma.feeCategory.count({ where: { institutionId: inst.id } }),
      prisma.feeStructure.count({ where: { institutionId: inst.id } }),
      prisma.studentFee.count({ where: { student: { institutionId: inst.id } } }),
      prisma.feePayment.count({ where: { student: { institutionId: inst.id } } }),
      prisma.task.count({ where: { institutionId: inst.id } }),
      prisma.announcement.count({ where: { institutionId: inst.id } }),
      prisma.auditLog.count({ where: { institutionId: inst.id } }),
      prisma.campus.count({ where: { institutionId: inst.id } }),
      prisma.department.count({ where: { institutionId: inst.id } }),
      prisma.academicYear.count({ where: { institutionId: inst.id } }),
      prisma.leavePolicy.count({ where: { institutionId: inst.id } }),
      prisma.leaveRequest.count({ where: { institutionId: inst.id } }),
    ]);

    console.log(`  Dependent Counts:`);
    console.log(`    Users: ${users.length}`);
    console.log(`    Students: ${students}`);
    console.log(`    Guardians: ${guardians}`);
    console.log(`    Teachers/Staff: ${teachers}`);
    console.log(`    Classes: ${classes}`);
    console.log(`    Sections: ${sections}`);
    console.log(`    Exams: ${exams}`);
    console.log(`    Student Marks: ${studentMarks}`);
    console.log(`    Student Attendance: ${studentAttendances}`);
    console.log(`    Staff Attendance: ${staffAttendances}`);
    console.log(`    Assignments: ${assignments}`);
    console.log(`    Submissions: ${assignmentSubmissions}`);
    console.log(`    Fee Categories: ${feeCategories}`);
    console.log(`    Fee Structures: ${feeStructures}`);
    console.log(`    Student Fees: ${studentFees}`);
    console.log(`    Fee Payments: ${feePayments}`);
    console.log(`    Tasks: ${tasks}`);
    console.log(`    Announcements: ${announcements}`);
    console.log(`    Campuses: ${campuses}`);
    console.log(`    Departments: ${departments}`);
    console.log(`    Academic Years: ${academicYears}`);
    console.log(`    Leave Policies: ${leavePolicies}`);
    console.log(`    Leave Requests: ${leaveRequests}`);
    console.log(`    Audit Logs: ${auditLogs}`);

    console.log(`  Users list:`);
    for (const u of users) {
      console.log(`    - ${u.email} (${u.roleCode}) - "${u.fullName}" [ID: ${u.id}]`);
    }
  }

  // Cross-institution check for users (e.g. same email across multiple institutions)
  console.log('\n===============================================================');
  console.log('              ALL USERS & EMAIL UNIQUENESS AUDIT               ');
  console.log('===============================================================\n');

  const allUsers = await prisma.user.findMany({
    include: { institution: { select: { id: true, name: true, code: true } } },
    orderBy: { email: 'asc' },
  });

  const emailGroups = {};
  for (const u of allUsers) {
    if (!emailGroups[u.email]) emailGroups[u.email] = [];
    emailGroups[u.email].push(u);
  }

  for (const [email, userList] of Object.entries(emailGroups)) {
    if (userList.length > 1) {
      console.log(`⚠️ SHARED EMAIL: ${email} exists in multiple records:`);
      for (const u of userList) {
        console.log(`    User ${u.id} in Inst: ${u.institution?.name} (${u.institutionId})`);
      }
    } else {
      const u = userList[0];
      console.log(`  ${u.email} (${u.roleCode}) -> Inst: ${u.institution?.name} [Inst ID: ${u.institutionId}]`);
    }
  }

  await prisma.$disconnect();
}

audit().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
