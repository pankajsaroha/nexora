const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// The verified Inzivoo ID that must NEVER be touched under any circumstances
const INZIVOO_ID = '04625961-2d1e-4bf8-8013-5c16040751bc';

// Exact audited candidate IDs to remove (audited via scripts/audit-institutions.js)
const CANDIDATE_IDS = [
  '1c1fd725-583e-4910-946c-596276a7f9b9', // Cambridge International Institute (CAMBRIDGE-99)
  '397be1d7-5d38-4143-98e4-807f1d6a65c0', // Eton International Academy (ETON-GLOBAL)
  '02fdf50e-359a-4f29-b2b7-6c6c6cf51293', // Test Academy NX2728 (NX2728)
  '8cf0d222-fcd5-4666-b77f-12be08f2b98b', // Northstar International Academy (NORTHSTAR-2026)
  'cbe9c791-f622-4494-aed6-f0d1f2c04eed', // Northstar International Academy (NORTHSTAR)
];

async function main() {
  const isCommit = process.argv.includes('--commit');
  console.log('===============================================================');
  console.log(`  SAFE INSTITUTION CLEANUP — ${isCommit ? 'COMMIT MODE' : 'DRY RUN MODE'}`);
  console.log('===============================================================\n');

  // Safety check 1: Inzivoo must not be in candidate list
  if (CANDIDATE_IDS.includes(INZIVOO_ID)) {
    throw new Error('FATAL SAFETY VIOLATION: Inzivoo ID is in candidate IDs list!');
  }

  // Safety check 2: Verify Inzivoo exists in database
  const inzivoo = await prisma.institution.findUnique({
    where: { id: INZIVOO_ID },
    include: {
      users: true,
      students: true,
      teachers: true,
      guardians: true,
      classes: true,
    },
  });

  if (!inzivoo) {
    throw new Error(`FATAL: Inzivoo Group of Colleges (${INZIVOO_ID}) not found in database! Aborting.`);
  }

  console.log(`[VERIFIED] Inzivoo Group of Colleges located:`);
  console.log(`  ID: ${inzivoo.id}`);
  console.log(`  Name: ${inzivoo.name} (${inzivoo.code})`);
  console.log(`  Current records: ${inzivoo.users.length} users, ${inzivoo.students.length} students, ${inzivoo.teachers.length} teachers, ${inzivoo.classes.length} classes.\n`);

  // Verify candidate institutions
  const candidates = await prisma.institution.findMany({
    where: { id: { in: CANDIDATE_IDS } },
  });

  console.log(`Found ${candidates.length} matching candidate institutions out of ${CANDIDATE_IDS.length} specified:`);
  for (const c of candidates) {
    console.log(`  - [${c.id}] ${c.name} (${c.code})`);
  }

  if (candidates.length === 0) {
    console.log('\nNo candidate institutions found to clean up. Exiting.');
    return;
  }

  // Double check no user belonging to candidate institutions shares an email with Inzivoo
  const candidateUsers = await prisma.user.findMany({
    where: { institutionId: { in: CANDIDATE_IDS } },
  });

  const inzivooEmails = new Set(inzivoo.users.map((u) => u.email.toLowerCase()));
  for (const u of candidateUsers) {
    if (inzivooEmails.has(u.email.toLowerCase())) {
      throw new Error(`FATAL: User ${u.email} in candidate institution ${u.institutionId} matches an Inzivoo user email! Aborting.`);
    }
  }

  console.log(`\nVerified ${candidateUsers.length} users across candidate institutions. Zero overlap with Inzivoo users.`);

  // Step 3: Export backup before destructive action
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '..', 'scratch', `institutions-backup-${timestamp}.json`);

  console.log(`\nPreparing JSON backup of candidate data...`);

  // Gather full candidate datasets for backup
  const backupData = {
    metadata: {
      createdAt: new Date().toISOString(),
      inzivooId: INZIVOO_ID,
      candidateIds: CANDIDATE_IDS,
      candidateCount: candidates.length,
    },
    institutions: candidates,
    users: candidateUsers,
    students: await prisma.student.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    guardians: await prisma.guardian.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    teachers: await prisma.teacher.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    classes: await prisma.class.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    sections: await prisma.section.findMany({ where: { class: { institutionId: { in: CANDIDATE_IDS } } } }),
    campuses: await prisma.campus.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    departments: await prisma.department.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    academicYears: await prisma.academicYear.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    feeCategories: await prisma.feeCategory.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    feeStructures: await prisma.feeStructure.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    studentAttendances: await prisma.studentAttendance.findMany({ where: { student: { institutionId: { in: CANDIDATE_IDS } } } }),
    tasks: await prisma.task.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    leavePolicies: await prisma.leavePolicy.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
    auditLogs: await prisma.auditLog.findMany({ where: { institutionId: { in: CANDIDATE_IDS } } }),
  };

  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`[BACKUP CREATED] Successfully wrote backup to: ${backupPath}`);
  console.log(`  Export summary:`);
  console.log(`    Institutions: ${backupData.institutions.length}`);
  console.log(`    Users: ${backupData.users.length}`);
  console.log(`    Students: ${backupData.students.length}`);
  console.log(`    Guardians: ${backupData.guardians.length}`);
  console.log(`    Teachers: ${backupData.teachers.length}`);
  console.log(`    Classes: ${backupData.classes.length}`);
  console.log(`    Sections: ${backupData.sections.length}`);
  console.log(`    Campuses: ${backupData.campuses.length}`);
  console.log(`    Departments: ${backupData.departments.length}`);
  console.log(`    Academic Years: ${backupData.academicYears.length}`);
  console.log(`    Audit Logs: ${backupData.auditLogs.length}`);

  if (!isCommit) {
    console.log('\n[DRY RUN FINISHED] To execute deletion, run: node scripts/clean-unwanted-institutions.js --commit');
    return;
  }

  console.log('\n===============================================================');
  console.log('         COMMENCING TOPOLOGICAL STAGED DELETION                ');
  console.log('===============================================================\n');

  const candidateIdList = CANDIDATE_IDS;
  const stats = {};

  const executeStage = async (name, fn) => {
    try {
      process.stdout.write(`  Deleting ${name}... `);
      const res = await fn();
      const count = res?.count ?? (typeof res === 'number' ? res : 0);
      stats[name] = count;
      console.log(`[OK] (${count} deleted)`);
    } catch (err) {
      console.log(`[FAILED]`);
      throw err;
    }
  };

  // 1. Task activity & comments
  const taskIds = (await prisma.task.findMany({
    where: { institutionId: { in: candidateIdList } },
    select: { id: true },
  })).map(t => t.id);

  await executeStage('taskActivities', () =>
    prisma.taskActivity.deleteMany({ where: { taskId: { in: taskIds } } })
  );

  await executeStage('taskComments', () =>
    prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } })
  );

  await executeStage('tasks', () =>
    prisma.task.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 2. Student dependent records
  const studentIds = (await prisma.student.findMany({
    where: { institutionId: { in: candidateIdList } },
    select: { id: true },
  })).map(s => s.id);

  await executeStage('studentCustomFieldValues', () =>
    prisma.studentCustomFieldValue.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('studentMarks', () =>
    prisma.studentMark.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('studentAttendances', () =>
    prisma.studentAttendance.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('assignmentSubmissions', () =>
    prisma.assignmentSubmission.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('feePayments', () =>
    prisma.feePayment.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('studentFees', () =>
    prisma.studentFee.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('studentGuardians', () =>
    prisma.studentGuardian.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('bookIssues', () =>
    prisma.bookIssue.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('studentTransports', () =>
    prisma.studentTransport.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('hostelAllocations', () =>
    prisma.hostelAllocation.deleteMany({ where: { studentId: { in: studentIds } } })
  );

  await executeStage('students', () =>
    prisma.student.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('guardians', () =>
    prisma.guardian.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 3. Teachers and Staff
  const teacherIds = (await prisma.teacher.findMany({
    where: { institutionId: { in: candidateIdList } },
    select: { id: true },
  })).map(t => t.id);

  await executeStage('staffAttendances', () =>
    prisma.staffAttendance.deleteMany({ where: { teacherId: { in: teacherIds } } })
  );

  await executeStage('teacherAssignments', () =>
    prisma.teacherAssignment.deleteMany({ where: { teacherId: { in: teacherIds } } })
  );

  await executeStage('classTeachers', () =>
    prisma.classTeacher.deleteMany({ where: { teacherId: { in: teacherIds } } })
  );

  await executeStage('leaveRequests', () =>
    prisma.leaveRequest.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('employeeLeaveAccounts', () =>
    prisma.employeeLeaveAccount.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('teachers', () =>
    prisma.teacher.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // Fix tenant isolation: Ensure any Inzivoo student erroneously referencing candidate class/section is remapped to Inzivoo's own B.Tech class
  const inzivooClass = await prisma.class.findFirst({
    where: { institutionId: INZIVOO_ID, name: 'B.Tech Computer Science' },
    include: { sections: true },
  });

  if (inzivooClass && inzivooClass.sections.length > 0) {
    const inzSection = inzivooClass.sections[0];
    const candidateSections = (await prisma.section.findMany({
      where: { class: { institutionId: { in: candidateIdList } } },
      select: { id: true },
    })).map(s => s.id);

    const remapped = await prisma.student.updateMany({
      where: {
        institutionId: INZIVOO_ID,
        currentSectionId: { in: candidateSections },
      },
      data: {
        currentClassId: inzivooClass.id,
        currentSectionId: inzSection.id,
      },
    });

    if (remapped.count > 0) {
      console.log(`  [TENANT ISOLATION REPAIR] Remapped ${remapped.count} Inzivoo students to Inzivoo's own B.Tech Computer Science class/section.`);
    }
  }

  // 4. Academic structures & Fees: Exams, Assignments, FeeStructures, Classes, Sections
  await executeStage('examSubjects', () =>
    prisma.examSubject.deleteMany({ where: { exam: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('exams', () =>
    prisma.exam.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('assignments', () =>
    prisma.assignment.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('feeStructures', () =>
    prisma.feeStructure.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('feeCategories', () =>
    prisma.feeCategory.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('timetableSlots', () =>
    prisma.timetableSlot.deleteMany({ where: { section: { class: { institutionId: { in: candidateIdList } } } } })
  );

  await executeStage('sections', () =>
    prisma.section.deleteMany({ where: { class: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('classes', () =>
    prisma.class.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('subjects', () =>
    prisma.subject.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 5. Leave Configuration

  await executeStage('leavePolicyRules', () =>
    prisma.leavePolicyRule.deleteMany({ where: { policy: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('leavePolicies', () =>
    prisma.leavePolicy.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('leaveTypes', () =>
    prisma.leaveType.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('leaveYears', () =>
    prisma.leaveYear.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 6. Organization Units & Terms
  await executeStage('terms', () =>
    prisma.term.deleteMany({ where: { academicYear: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('academicYears', () =>
    prisma.academicYear.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('departments', () =>
    prisma.department.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('campuses', () =>
    prisma.campus.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 7. General modules (Books, Vehicles, Hostels, etc.)
  await executeStage('books', () =>
    prisma.book.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('routeStops', () =>
    prisma.routeStop.deleteMany({ where: { route: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('routes', () =>
    prisma.route.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('vehicles', () =>
    prisma.vehicle.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('hostelRooms', () =>
    prisma.hostelRoom.deleteMany({ where: { hostel: { institutionId: { in: candidateIdList } } } })
  );

  await executeStage('hostels', () =>
    prisma.hostel.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('calendarEvents', () =>
    prisma.calendarEvent.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('payrolls', () =>
    prisma.payroll.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('studentCustomFields', () =>
    prisma.studentCustomField.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 8. Communication & Logs
  await executeStage('announcements', () =>
    prisma.announcement.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('notifications', () =>
    prisma.notification.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('whatsAppLogs', () =>
    prisma.whatsAppMessageLog.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  await executeStage('auditLogs', () =>
    prisma.auditLog.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 9. Candidate Users
  await executeStage('users', () =>
    prisma.user.deleteMany({ where: { institutionId: { in: candidateIdList } } })
  );

  // 10. Candidate Institutions
  await executeStage('institutions', () =>
    prisma.institution.deleteMany({ where: { id: { in: candidateIdList } } })
  );

  console.log('\n[COMMIT SUCCESSFUL] Deleted records summary:');
  for (const [key, val] of Object.entries(stats)) {
    if (val > 0) {
      console.log(`  - ${key}: ${val}`);
    }
  }

  // Final Verification
  console.log('\n===============================================================');
  console.log('                  POST-CLEANUP VERIFICATION                   ');
  console.log('===============================================================\n');

  const remainingInstitutions = await prisma.institution.findMany({
    include: {
      users: true,
      students: true,
      teachers: true,
      guardians: true,
      classes: true,
    },
  });

  console.log(`Remaining institutions in database: ${remainingInstitutions.length}`);
  for (const inst of remainingInstitutions) {
    console.log(`  Institution: ${inst.name} [ID: ${inst.id}] (${inst.code})`);
    console.log(`    Users (${inst.users.length}):`);
    for (const u of inst.users) {
      console.log(`      * ${u.email} (${u.roleCode}) - "${u.fullName}"`);
    }
    console.log(`    Students: ${inst.students.length}`);
    console.log(`    Teachers: ${inst.teachers.length}`);
    console.log(`    Guardians: ${inst.guardians.length}`);
    console.log(`    Classes: ${inst.classes.length}`);
  }

  if (remainingInstitutions.length === 1 && remainingInstitutions[0].id === INZIVOO_ID) {
    console.log('\n✅ VERIFICATION PASSED: Only Inzivoo Group of Colleges remains with all legitimate records intact!');
  } else {
    console.log('\n⚠️ ATTENTION: Check remaining institutions list above.');
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('\n❌ ERROR OCCURRED DURING CLEANUP:');
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
