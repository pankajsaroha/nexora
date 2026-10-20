import { prisma } from "@/lib/prisma";
import { SessionUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const EXAM_TYPES = [
  { code: "HALF_YEARLY", label: "Half-Yearly Examination" },
  { code: "MID_TERM", label: "Mid-Term Assessment" },
  { code: "UNIT_TEST", label: "Unit Test" },
  { code: "PERIODIC_TEST", label: "Periodic Test" },
  { code: "FINAL", label: "Final / Annual Board" },
  { code: "PRACTICAL", label: "Practical / Lab" },
  { code: "INTERNAL", label: "Internal Assessment" },
  { code: "PRE_BOARD", label: "Pre-Board Examination" },
  { code: "OTHER", label: "Other Assessment" },
] as const;

export type ExamTypeCode = (typeof EXAM_TYPES)[number]["code"];

export const EXAM_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ONGOING",
  "COMPLETED",
  "RESULTS_IN_PROGRESS",
  "RESULTS_VERIFIED",
  "PUBLISHED",
  "POSTPONED",
  "CANCELLED",
] as const;

export type ExamStatus = (typeof EXAM_STATUSES)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["ONGOING", "POSTPONED", "CANCELLED", "DRAFT", "SCHEDULED"],
  POSTPONED: ["SCHEDULED", "CANCELLED"],
  ONGOING: ["COMPLETED", "POSTPONED", "CANCELLED", "ONGOING"],
  COMPLETED: ["RESULTS_IN_PROGRESS", "POSTPONED"],
  RESULTS_IN_PROGRESS: ["RESULTS_VERIFIED", "COMPLETED"],
  RESULTS_VERIFIED: ["PUBLISHED", "RESULTS_IN_PROGRESS"],
  PUBLISHED: ["RESULTS_VERIFIED"], // Reopened by administrator
  CANCELLED: [], // Terminal historical state
};

export function validateExamStatusTransition(
  currentStatus: string,
  nextStatus: string
): { valid: boolean; reason?: string } {
  if (currentStatus === nextStatus) return { valid: true };
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      reason: `Invalid examination status transition from ${currentStatus} to ${nextStatus}. Allowed transitions: ${
        allowed.join(", ") || "None (Terminal Historical State)"
      }.`,
    };
  }
  return { valid: true };
}

export type ExamLifecycleAction =
  | "VIEW"
  | "EDIT_CONFIG"
  | "SCHEDULE"
  | "START"
  | "COMPLETE"
  | "POSTPONE"
  | "RESCHEDULE"
  | "CANCEL"
  | "START_RESULTS"
  | "VERIFY_RESULTS"
  | "PUBLISH_RESULTS"
  | "REOPEN_RESULTS"
  | "DELETE";

/**
 * Production Permission Matrix Evaluation:
 * CREATOR: Can View, Edit Config (Draft), Schedule, Start, Complete, Postpone, Reschedule, Start Results Processing.
 *          CANNOT Cancel, Verify Results, Publish Results, Reopen Results, or Delete.
 * INSTITUTE ADMIN: Can perform all lifecycle actions + Cancel + Verify + Publish + Reopen. CANNOT hard delete.
 * SUPER ADMIN: Full authority + Delete (safe draft check only).
 */
export function canUserPerformExamAction(
  user: SessionUser,
  exam: { createdById?: string | null; status: string; institutionId: string },
  action: ExamLifecycleAction
): { allowed: boolean; reason?: string } {
  // Institution boundary check
  if (exam.institutionId !== user.institutionId) {
    return {
      allowed: false,
      reason: "Unauthorized: Examination belongs to a different institution.",
    };
  }

  const role = user.roleCode || "";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isInstAdmin =
    isSuperAdmin ||
    ["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "HOD", "EXAM_COORDINATOR"].includes(role);
  const isCreator = Boolean(
    exam.createdById &&
      (exam.createdById === user.id ||
        (user.teacherId && exam.createdById === user.teacherId))
  );

  // Super Admin check
  if (isSuperAdmin) {
    return { allowed: true };
  }

  // Action: DELETE (Super Admin, Institution Admin, or Exam Creator on their own exam)
  if (action === "DELETE") {
    if (isSuperAdmin || isInstAdmin || isCreator) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Forbidden: You do not have permission to delete this examination.",
    };
  }

  // Action: CANCEL (Institution Admin or Super Admin only)
  if (action === "CANCEL") {
    if (isInstAdmin) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Forbidden: Cancelling an examination requires institution-level authority (Institution Admin or Exam Coordinator).",
    };
  }

  // Action: VERIFY_RESULTS (Institution Admin or Super Admin only)
  if (action === "VERIFY_RESULTS") {
    if (isInstAdmin) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Forbidden: Result verification requires institution-level administrative authorization.",
    };
  }

  // Action: PUBLISH_RESULTS (Institution Admin or Super Admin only)
  if (action === "PUBLISH_RESULTS") {
    if (isInstAdmin) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Forbidden: Official publication of examination results requires institution-level administrative authority.",
    };
  }

  // Action: REOPEN_RESULTS (Institution Admin or Super Admin only)
  if (action === "REOPEN_RESULTS") {
    if (isInstAdmin) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Forbidden: Reopening published examination results requires institution-level administrative authority.",
    };
  }

  // Operational Lifecycle Actions: VIEW, EDIT_CONFIG, SCHEDULE, START, COMPLETE, POSTPONE, RESCHEDULE, START_RESULTS
  if (isInstAdmin || isCreator) {
    if (action === "EDIT_CONFIG" && exam.status !== "DRAFT") {
      return {
        allowed: false,
        reason: "Examination configuration can only be edited while in DRAFT status.",
      };
    }
    return { allowed: true };
  }

  // General teacher without exam ownership
  return {
    allowed: false,
    reason:
      "Forbidden: You are not the creator of this examination or an authorized institution administrator.",
  };
}

export function mapStatusToExamAction(currentStatus: string, nextStatus: string): ExamLifecycleAction {
  if (nextStatus === "SCHEDULED") {
    return currentStatus === "POSTPONED" ? "RESCHEDULE" : "SCHEDULE";
  }
  if (nextStatus === "ONGOING") return "START";
  if (nextStatus === "COMPLETED") return "COMPLETE";
  if (nextStatus === "POSTPONED") return "POSTPONE";
  if (nextStatus === "CANCELLED") return "CANCEL";
  if (nextStatus === "RESULTS_IN_PROGRESS") return "START_RESULTS";
  if (nextStatus === "RESULTS_VERIFIED") {
    return currentStatus === "PUBLISHED" ? "REOPEN_RESULTS" : "VERIFY_RESULTS";
  }
  if (nextStatus === "PUBLISHED") return "PUBLISH_RESULTS";
  if (nextStatus === "DRAFT") return "EDIT_CONFIG";
  return "EDIT_CONFIG";
}

export function calculateGrade(marksObtained: number, maxMarks: number, isAbsent = false): string {
  if (isAbsent) return "AB";
  if (maxMarks <= 0) return "—";
  const pct = (marksObtained / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export function formatExamTypeName(code: string): string {
  const found = EXAM_TYPES.find((t) => t.code === code);
  if (found) return found.label;
  return code.replace(/_/g, " ");
}

/**
 * Check whether a user is authorized to enter marks for a given paper/subject
 */
export async function canUserEnterMarks(
  user: SessionUser,
  examSubjectId: string
): Promise<{ allowed: boolean; reason?: string; teacherId?: string }> {
  const isGlobalAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HOD",
  ].includes(user.roleCode || "");

  if (isGlobalAdmin) {
    return { allowed: true };
  }

  // Find teacher record for current user
  const teacher = await prisma.teacher.findFirst({
    where: {
      institutionId: user.institutionId,
      OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
    },
  });

  if (!teacher) {
    return { allowed: false, reason: "No faculty record associated with your user account." };
  }

  const examSubject = await prisma.examSubject.findUnique({
    where: { id: examSubjectId },
    include: {
      exam: true,
      class: {
        include: {
          sections: true,
        },
      },
    },
  });

  if (!examSubject) {
    return { allowed: false, reason: "Assessment paper not found." };
  }

  if (examSubject.exam.status === "PUBLISHED") {
    return {
      allowed: false,
      reason: "Assessment results are published and locked from editing. Contact an exam administrator to reopen.",
    };
  }

  const sectionIds = examSubject.class.sections.map((s) => s.id);

  const [assignmentCount, timetableCount, isClassTeacher] = await Promise.all([
    prisma.teacherAssignment.count({
      where: {
        teacherId: teacher.id,
        subjectId: examSubject.subjectId,
        sectionId: { in: sectionIds },
      },
    }),
    prisma.timetableSlot.count({
      where: {
        teacherId: teacher.id,
        subjectId: examSubject.subjectId,
        sectionId: { in: sectionIds },
      },
    }),
    prisma.section.count({
      where: {
        id: { in: sectionIds },
        classTeacherId: teacher.id,
      },
    }),
  ]);

  const hasSubjectAssignment = assignmentCount > 0 || timetableCount > 0;

  if (hasSubjectAssignment) {
    return { allowed: true, teacherId: teacher.id };
  }

  // If user is Class Teacher of this class but not assigned to this subject
  if (isClassTeacher > 0) {
    return {
      allowed: false,
      reason: "As Class Teacher, you can review class result readiness and report cards, but marks entry is restricted to the assigned subject teacher.",
    };
  }

  // General teacher without subject assignment
  return { allowed: false, reason: "You are not assigned to evaluate this subject or class." };
}

/**
 * Ensure core subject schema foundation exists if institution is newly initialized.
 * Does NOT generate fake exams or mock student marks.
 */
export async function ensureDefaultExamsAndSubjects(institutionId: string) {
  const subjectsCount = await prisma.subject.count({ where: { institutionId } });

  // If subjects don't exist, create standard core subject taxonomy
  if (subjectsCount === 0) {
    const defaultSubs = [
      { name: "Mathematics", code: "MATH-101", credits: 4 },
      { name: "Physics & Chemistry", code: "SCI-101", credits: 4 },
      { name: "English Literature", code: "ENG-101", credits: 3 },
      { name: "Social Science", code: "SOC-101", credits: 3 },
      { name: "Computer Science & AI", code: "CS-101", credits: 3 },
    ];

    for (const sub of defaultSubs) {
      await prisma.subject.create({
        data: {
          institutionId,
          name: sub.name,
          code: sub.code,
          credits: sub.credits,
          type: "THEORY",
        },
      });
    }
  }
}

/**
 * Fetch all exams with evaluation metrics for an institution
 */
export async function getInstitutionExams(institutionId: string, user?: SessionUser) {
  // Ensure real default data is initialized if first load
  await ensureDefaultExamsAndSubjects(institutionId);

  const exams = await prisma.exam.findMany({
    where: { institutionId },
    select: {
      id: true,
      name: true,
      examType: true,
      status: true,
      startDate: true,
      endDate: true,
      createdById: true,
      createdByUser: {
        select: { id: true, fullName: true, email: true, roleCode: true },
      },
      academicYear: { select: { id: true, name: true } },
      term: { select: { id: true, name: true } },
      examSubjects: {
        select: {
          id: true,
          subjectId: true,
          classId: true,
          examDate: true,
          startTime: true,
          endTime: true,
          maxMarks: true,
          passMarks: true,
          subject: { select: { id: true, name: true, code: true } },
          class: {
            select: {
              id: true,
              name: true,
              sections: { select: { id: true, name: true } },
              _count: { select: { students: { where: { status: "ACTIVE" } } } },
            },
          },
          marks: {
            select: {
              id: true,
              marksObtained: true,
              isAbsent: true,
            },
          },
        },
        orderBy: { examDate: "asc" },
      },
    },
    orderBy: { startDate: "desc" },
  });

  // Calculate comprehensive evaluation progress and metrics per exam
  const formattedExams = exams.map((e) => {
    let totalExpectedMarks = 0;
    let totalEnteredMarks = 0;
    let sumPercentages = 0;
    let scoredEntriesCount = 0;

    const subjects = e.examSubjects.map((es) => {
      const enrolledCount = es.class._count.students;
      const enteredCount = es.marks.length;
      totalExpectedMarks += enrolledCount;
      totalEnteredMarks += enteredCount;

      es.marks.forEach((m) => {
        if (!m.isAbsent && es.maxMarks > 0) {
          sumPercentages += (m.marksObtained / es.maxMarks) * 100;
          scoredEntriesCount++;
        }
      });

      let evaluationStatus: "NOT_STARTED" | "DRAFT" | "COMPLETED" = "NOT_STARTED";
      if (enteredCount === 0) {
        evaluationStatus = "NOT_STARTED";
      } else if (enteredCount < enrolledCount) {
        evaluationStatus = "DRAFT";
      } else {
        evaluationStatus = "COMPLETED";
      }

      return {
        id: es.id,
        subjectId: es.subjectId,
        subjectName: es.subject.name,
        subjectCode: es.subject.code,
        classId: es.classId,
        className: es.class.name,
        sections: es.class.sections,
        examDate: es.examDate ? es.examDate.toISOString() : null,
        startTime: es.startTime,
        endTime: es.endTime,
        maxMarks: es.maxMarks,
        passMarks: es.passMarks,
        enrolledStudentsCount: enrolledCount,
        enteredMarksCount: enteredCount,
        evaluationStatus,
      };
    });

    const progressPct =
      totalExpectedMarks > 0
        ? Math.round((totalEnteredMarks / totalExpectedMarks) * 100)
        : totalEnteredMarks > 0
        ? 100
        : 0;

    const averageScorePct =
      scoredEntriesCount > 0 ? +(sumPercentages / scoredEntriesCount).toFixed(1) : 0;

    const evaluatedPapersCount = subjects.filter((s) => s.evaluationStatus === "COMPLETED").length;
    let evaluationStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";
    if (totalEnteredMarks === 0) {
      evaluationStatus = "NOT_STARTED";
    } else if (totalExpectedMarks > 0 && totalEnteredMarks >= totalExpectedMarks) {
      evaluationStatus = "COMPLETED";
    } else {
      evaluationStatus = "IN_PROGRESS";
    }

    let resultStatus: "NOT_STARTED" | "IN_PROGRESS" | "VERIFIED" | "PUBLISHED" = "NOT_STARTED";
    if (e.status === "PUBLISHED") {
      resultStatus = "PUBLISHED";
    } else if (e.status === "RESULTS_VERIFIED") {
      resultStatus = "VERIFIED";
    } else if (totalEnteredMarks > 0) {
      resultStatus = "IN_PROGRESS";
    } else {
      resultStatus = "NOT_STARTED";
    }

    return {
      id: e.id,
      name: e.name,
      examType: e.examType,
      examTypeLabel: formatExamTypeName(e.examType),
      createdById: e.createdById,
      createdByName: e.createdByUser?.fullName || null,
      createdByEmail: e.createdByUser?.email || null,
      academicYearName: e.academicYear?.name || "Academic Year",
      termName: e.term?.name || "Term",
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status,
      targetClasses: Array.from(new Set<string>(subjects.map((s) => s.className))),
      papersCount: subjects.length,
      totalExpectedMarks,
      totalEnteredMarks,
      progressPct,
      averageScorePct,
      evaluatedPapersCount,
      evaluationStatus,
      resultStatus,
      subjects,
    };
  });

  // Calculate Overall Institution Evaluation KPI Metrics
  const totalExamsCount = formattedExams.length;
  const totalPapersScheduled = formattedExams.reduce((acc, e) => acc + e.papersCount, 0);
  const totalPossibleEntries = formattedExams.reduce((acc, e) => acc + e.totalExpectedMarks, 0);
  const totalDoneEntries = formattedExams.reduce((acc, e) => acc + e.totalEnteredMarks, 0);

  const overallEvaluationPct =
    totalPossibleEntries > 0
      ? +((totalDoneEntries / totalPossibleEntries) * 100).toFixed(1)
      : totalDoneEntries > 0
      ? 100
      : 0;

  let totalScoredEntries = 0;
  let totalScoreSum = 0;
  exams.forEach((e) => {
    e.examSubjects.forEach((es) => {
      es.marks.forEach((m) => {
        if (!m.isAbsent && es.maxMarks > 0) {
          totalScoreSum += (m.marksObtained / es.maxMarks) * 100;
          totalScoredEntries++;
        }
      });
    });
  });

  const institutionalAveragePct =
    totalScoredEntries > 0 ? +(totalScoreSum / totalScoredEntries).toFixed(1) : 0;

  const scheduledExamsCount = formattedExams.filter(
    (e) => e.status === "SCHEDULED" || e.status === "UPCOMING" || e.status === "DRAFT"
  ).length;
  const ongoingExamsCount = formattedExams.filter((e) => e.status === "ONGOING").length;
  const resultsPendingCount = formattedExams.filter(
    (e) => e.status === "COMPLETED" || e.status === "RESULTS_IN_PROGRESS" || e.status === "RESULTS_VERIFIED"
  ).length;
  const publishedExamsCount = formattedExams.filter((e) => e.status === "PUBLISHED").length;

  return {
    exams: formattedExams,
    stats: {
      totalExams: totalExamsCount,
      scheduledExams: scheduledExamsCount,
      ongoingExams: ongoingExamsCount,
      resultsPending: resultsPendingCount,
      resultsPublished: publishedExamsCount,
      papersScheduled: totalPapersScheduled,
      evaluationProgressPct: overallEvaluationPct,
      institutionalAveragePct: institutionalAveragePct,
    },
  };
}

/**
 * Get single exam detail with full papers and audit logs
 */
export async function getExamDetail(examId: string, institutionId: string) {
  const [exam, auditLogs] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        institutionId: true,
        name: true,
        examType: true,
        status: true,
        startDate: true,
        endDate: true,
        createdById: true,
        createdByUser: {
          select: { fullName: true, email: true },
        },
        academicYear: { select: { id: true, name: true } },
        term: { select: { id: true, name: true } },
        examSubjects: {
          select: {
            id: true,
            subjectId: true,
            classId: true,
            examDate: true,
            startTime: true,
            endTime: true,
            maxMarks: true,
            passMarks: true,
            subject: { select: { id: true, name: true, code: true } },
            class: {
              select: {
                id: true,
                name: true,
                sections: { select: { id: true, name: true } },
                _count: { select: { students: { where: { status: "ACTIVE" } } } },
              },
            },
            marks: {
              select: {
                id: true,
                marksObtained: true,
                isAbsent: true,
              },
            },
          },
          orderBy: { examDate: "asc" },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        institutionId,
        OR: [
          { entity: "EXAM", entityId: examId },
          { details: { contains: examId } },
        ],
      },
      select: {
        id: true,
        action: true,
        userName: true,
        userEmail: true,
        details: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  if (!exam || exam.institutionId !== institutionId) {
    return null;
  }

  let totalExpectedMarks = 0;
  let totalEnteredMarks = 0;
  let sumPercentages = 0;
  let scoredEntriesCount = 0;

  const subjects = exam.examSubjects.map((es) => {
    const enrolledCount = es.class._count.students;
    const enteredCount = es.marks.length;
    totalExpectedMarks += enrolledCount;
    totalEnteredMarks += enteredCount;

    es.marks.forEach((m) => {
      if (!m.isAbsent && es.maxMarks > 0) {
        sumPercentages += (m.marksObtained / es.maxMarks) * 100;
        scoredEntriesCount++;
      }
    });

    let evaluationStatus: "NOT_STARTED" | "DRAFT" | "COMPLETED" = "NOT_STARTED";
    if (enteredCount === 0) {
      evaluationStatus = "NOT_STARTED";
    } else if (enteredCount < enrolledCount) {
      evaluationStatus = "DRAFT";
    } else {
      evaluationStatus = "COMPLETED";
    }

    return {
      id: es.id,
      subjectId: es.subjectId,
      subjectName: es.subject.name,
      subjectCode: es.subject.code,
      classId: es.classId,
      className: es.class.name,
      sections: es.class.sections,
      examDate: es.examDate ? es.examDate.toISOString() : null,
      startTime: es.startTime,
      endTime: es.endTime,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      enrolledStudentsCount: enrolledCount,
      enteredMarksCount: enteredCount,
      evaluationStatus,
    };
  });

  const progressPct =
    totalExpectedMarks > 0
      ? Math.round((totalEnteredMarks / totalExpectedMarks) * 100)
      : totalEnteredMarks > 0
      ? 100
      : 0;

  const averageScorePct =
    scoredEntriesCount > 0 ? +(sumPercentages / scoredEntriesCount).toFixed(1) : 0;

  const evaluatedPapersCount = subjects.filter((s) => s.evaluationStatus === "COMPLETED").length;
  let evaluationStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";
  if (totalEnteredMarks === 0) {
    evaluationStatus = "NOT_STARTED";
  } else if (totalExpectedMarks > 0 && totalEnteredMarks >= totalExpectedMarks) {
    evaluationStatus = "COMPLETED";
  } else {
    evaluationStatus = "IN_PROGRESS";
  }

  let resultStatus: "NOT_STARTED" | "IN_PROGRESS" | "VERIFIED" | "PUBLISHED" = "NOT_STARTED";
  if (exam.status === "PUBLISHED") {
    resultStatus = "PUBLISHED";
  } else if (exam.status === "RESULTS_VERIFIED") {
    resultStatus = "VERIFIED";
  } else if (totalEnteredMarks > 0) {
    resultStatus = "IN_PROGRESS";
  } else {
    resultStatus = "NOT_STARTED";
  }

  return {
    id: exam.id,
    name: exam.name,
    examType: exam.examType,
    examTypeLabel: formatExamTypeName(exam.examType),
    createdById: exam.createdById,
    createdByName: exam.createdByUser?.fullName || null,
    createdByEmail: exam.createdByUser?.email || null,
    academicYearName: exam.academicYear?.name || "Academic Year",
    termName: exam.term?.name || "Term",
    startDate: exam.startDate.toISOString(),
    endDate: exam.endDate.toISOString(),
    status: exam.status,
    targetClasses: Array.from(new Set<string>(subjects.map((s) => s.className))),
    papersCount: subjects.length,
    totalExpectedMarks,
    totalEnteredMarks,
    progressPct,
    averageScorePct,
    evaluatedPapersCount,
    evaluationStatus,
    resultStatus,
    subjects,
    papers: subjects,
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      userName: log.userName || "Administrator",
      userEmail: log.userEmail || "",
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}



/**
 * Get student roster and marks for a specific ExamSubject / Paper
 */
export async function getPaperMarksRoster({
  examSubjectId,
  sectionId,
  institutionId,
  user,
}: {
  examSubjectId: string;
  sectionId?: string;
  institutionId: string;
  user?: SessionUser;
}) {
  const paper = await prisma.examSubject.findUnique({
    where: { id: examSubjectId },
    include: {
      exam: {
        include: {
          academicYear: true,
          term: true,
        },
      },
      subject: true,
      class: {
        include: {
          sections: {
            include: {
              classTeacher: true,
            },
          },
        },
      },
      marks: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!paper || paper.exam.institutionId !== institutionId) {
    throw new Error("Assessment paper not found in this institution.");
  }

  // Fetch enrolled students for this class (or specific section)
  const studentWhere: any = {
    institutionId,
    currentClassId: paper.classId,
    status: "ACTIVE",
  };

  if (sectionId && sectionId !== "ALL") {
    studentWhere.currentSectionId = sectionId;
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      currentSection: true,
    },
    orderBy: [{ currentSection: { name: "asc" } }, { rollNumber: "asc" }, { fullName: "asc" }],
  });

  // Map existing marks
  const marksMap = new Map<string, (typeof paper.marks)[0]>();
  paper.marks.forEach((m) => {
    marksMap.set(m.studentId, m);
  });

  const studentRoster = students.map((s) => {
    const existingMark = marksMap.get(s.id);
    return {
      studentId: s.id,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber || "—",
      fullName: s.fullName,
      sectionId: s.currentSectionId,
      sectionName: s.currentSection?.name || "A",
      marksObtained: existingMark ? existingMark.marksObtained : null,
      grade: existingMark ? existingMark.grade : null,
      isAbsent: existingMark ? existingMark.isAbsent : false,
      remarks: existingMark ? existingMark.remarks : "",
    };
  });

  return {
    paper: {
      id: paper.id,
      examId: paper.examId,
      examName: paper.exam.name,
      examType: paper.exam.examType,
      examTypeLabel: formatExamTypeName(paper.exam.examType),
      academicYearName: paper.exam.academicYear?.name || "Academic Year",
      termName: paper.exam.term?.name || "Term",
      subjectId: paper.subjectId,
      subjectName: paper.subject.name,
      subjectCode: paper.subject.code,
      classId: paper.classId,
      className: paper.class.name,
      sections: paper.class.sections.map((sec) => ({
        id: sec.id,
        name: sec.name,
        classTeacherName: sec.classTeacher?.fullName,
      })),
      examDate: paper.examDate ? paper.examDate.toISOString() : null,
      startTime: paper.startTime,
      endTime: paper.endTime,
      maxMarks: paper.maxMarks,
      passMarks: paper.passMarks,
    },
    students: studentRoster,
  };
}

/**
 * Save or submit marks for a paper with strict validation and grading
 */
export async function savePaperMarks({
  examSubjectId,
  marks,
  finalize = false,
  user,
  institutionId,
}: {
  examSubjectId: string;
  marks: Array<{
    studentId: string;
    marksObtained?: number | null;
    isAbsent?: boolean;
    remarks?: string;
  }>;
  finalize?: boolean;
  user: SessionUser;
  institutionId: string;
}) {
  const paper = await prisma.examSubject.findUnique({
    where: { id: examSubjectId },
    include: {
      exam: true,
      subject: true,
      class: true,
    },
  });

  if (!paper || paper.exam.institutionId !== institutionId) {
    throw new Error("Assessment paper not found.");
  }

  if (paper.exam.status === "PUBLISHED") {
    throw new Error("Assessment results are published and locked. Only an authorized administrator can reopen the assessment.");
  }

  // Validate authorization
  const authCheck = await canUserEnterMarks(user, examSubjectId);
  if (!authCheck.allowed) {
    throw new Error(authCheck.reason || "Unauthorized to enter marks for this paper.");
  }

  // Validate each mark
  for (const m of marks) {
    if (!m.isAbsent && m.marksObtained !== null && m.marksObtained !== undefined) {
      if (m.marksObtained < 0) {
        throw new Error(`Marks cannot be negative for student.`);
      }
      if (m.marksObtained > paper.maxMarks) {
        throw new Error(`Marks cannot exceed paper maximum of ${paper.maxMarks}.`);
      }
    }
  }

  // Atomic database upserts
  const upsertPromises = marks
    .filter((m) => m.isAbsent || (m.marksObtained !== null && m.marksObtained !== undefined))
    .map((m) => {
      const isAbsent = Boolean(m.isAbsent);
      const score = isAbsent ? 0 : Number(m.marksObtained ?? 0);
      const calculatedGrade = calculateGrade(score, paper.maxMarks, isAbsent);

      return prisma.studentMark.upsert({
        where: {
          examSubjectId_studentId: {
            examSubjectId,
            studentId: m.studentId,
          },
        },
        update: {
          marksObtained: score,
          grade: calculatedGrade,
          isAbsent,
          remarks: m.remarks || null,
        },
        create: {
          examSubjectId,
          studentId: m.studentId,
          marksObtained: score,
          grade: calculatedGrade,
          isAbsent,
          remarks: m.remarks || null,
        },
      });
    });

  await prisma.$transaction(upsertPromises);

  // If status was ONGOING or COMPLETED, promote to RESULTS_IN_PROGRESS upon marks entry
  if (paper.exam.status === "ONGOING" || paper.exam.status === "COMPLETED") {
    await prisma.exam.update({
      where: { id: paper.examId },
      data: { status: "RESULTS_IN_PROGRESS" },
    });
  }

  // Log audit event
  await logAuditEvent({
    institutionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    action: finalize ? "SUBMIT_MARKS" : "SAVE_MARKS_DRAFT",
    entity: "EXAM_SUBJECT",
    entityId: examSubjectId,
    details: {
      examId: paper.examId,
      examName: paper.exam.name,
      subjectName: paper.subject.name,
      className: paper.class.name,
      studentsCount: marks.length,
      finalized: finalize,
    },
  });

  return {
    success: true,
    message: finalize
      ? `Marks finalized and submitted successfully for ${marks.length} students.`
      : `Marks draft saved successfully for ${marks.length} students.`,
    finalized: finalize,
  };
}

/**
 * Update Exam Lifecycle Status with State Machine Validation & Audit Log
 */
export async function updateExamStatus({
  examId,
  status: newStatus,
  institutionId,
  user,
  reason,
  startDate,
  endDate,
}: {
  examId: string;
  status: string;
  institutionId: string;
  user: SessionUser;
  reason?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam || exam.institutionId !== institutionId) {
    throw new Error("Assessment not found.");
  }

  // Ensure createdById is populated
  let createdById = (exam as any).createdById;
  if (!createdById) {
    try {
      const rawExam: any = await (prisma as any).$queryRaw`
        SELECT "createdById" FROM "Exam" WHERE id = ${examId}
      `;
      if (Array.isArray(rawExam) && rawExam[0]?.createdById) {
        createdById = rawExam[0].createdById;
      }
    } catch (e) {}
  }
  (exam as any).createdById = createdById;

  // 1. Evaluate permission matrix for target lifecycle transition
  const action = mapStatusToExamAction(exam.status, newStatus);
  const authCheck = canUserPerformExamAction(user, exam, action);
  if (!authCheck.allowed) {
    throw new Error(authCheck.reason || "Forbidden: You do not have permission to execute this lifecycle transition.");
  }

  // 2. Validate state machine transition validity
  const transitionCheck = validateExamStatusTransition(exam.status, newStatus);
  if (!transitionCheck.valid) {
    throw new Error(transitionCheck.reason || "Invalid status transition.");
  }

  // 3. Reopening published results requires mandatory documented reason
  if (action === "REOPEN_RESULTS" && (!reason || !reason.trim())) {
    throw new Error("A mandatory administrative reason is required to reopen published examination results.");
  }

  // 4. Cancellation requires documented reason or standard notice
  if (action === "CANCEL" && (!reason || !reason.trim())) {
    reason = "Examination cancelled by authorized institutional administration.";
  }

  const updateData: any = { status: newStatus };
  if (startDate) updateData.startDate = new Date(startDate);
  if (endDate) updateData.endDate = new Date(endDate);

  const updated = await prisma.exam.update({
    where: { id: examId },
    data: updateData,
  });

  await logAuditEvent({
    institutionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    action: `UPDATE_EXAM_STATUS_${newStatus}`,
    entity: "EXAM",
    entityId: examId,
    details: {
      previousStatus: exam.status,
      newStatus,
      examName: exam.name,
      performedByRole: user.roleCode,
      isExamCreator: exam.createdById === user.id,
      reason: reason || "Status updated through operational lifecycle management",
      rescheduledStartDate: startDate || undefined,
      rescheduledEndDate: endDate || undefined,
    },
  });

  return updated;
}

/**
 * Configure and persist paper timetable, validate paper dates within exam period, and transition to SCHEDULED
 */
export async function scheduleExamTimetable({
  examId,
  institutionId,
  user,
  startDate,
  endDate,
  papers,
  reason,
  isReschedule = false,
}: {
  examId: string;
  institutionId: string;
  user: SessionUser;
  startDate?: string | Date;
  endDate?: string | Date;
  papers: Array<{
    id: string;
    examDate: string | Date;
    startTime: string;
    endTime: string;
    maxMarks?: number;
    passMarks?: number;
  }>;
  reason?: string;
  isReschedule?: boolean;
}) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examSubjects: {
        include: { subject: true, class: true },
      },
    },
  });

  if (!exam || exam.institutionId !== institutionId) {
    throw new Error("Assessment not found.");
  }

  // Ensure createdById is populated
  let createdById = (exam as any).createdById;
  if (!createdById) {
    try {
      const rawExam: any = await (prisma as any).$queryRaw`
        SELECT "createdById" FROM "Exam" WHERE id = ${examId}
      `;
      if (Array.isArray(rawExam) && rawExam[0]?.createdById) {
        createdById = rawExam[0].createdById;
      }
    } catch (e) {}
  }
  (exam as any).createdById = createdById;

  const action = isReschedule ? "RESCHEDULE" : "SCHEDULE";
  const authCheck = canUserPerformExamAction(user, exam, action);
  if (!authCheck.allowed) {
    throw new Error(
      authCheck.reason || "Forbidden: You do not have permission to schedule this examination timetable."
    );
  }

  const effectiveStartDate = startDate ? new Date(startDate) : new Date(exam.startDate);
  const effectiveEndDate = endDate ? new Date(endDate) : new Date(exam.endDate);

  if (effectiveStartDate > effectiveEndDate) {
    throw new Error("Examination start date cannot be after the end date.");
  }

  const startDay = new Date(
    effectiveStartDate.getFullYear(),
    effectiveStartDate.getMonth(),
    effectiveStartDate.getDate()
  );
  const endDay = new Date(
    effectiveEndDate.getFullYear(),
    effectiveEndDate.getMonth(),
    effectiveEndDate.getDate(),
    23,
    59,
    59,
    999
  );

  if (!papers || papers.length === 0) {
    throw new Error("No subject papers provided for the examination timetable.");
  }

  const existingSubjectMap = new Map(exam.examSubjects.map((es) => [es.id, es]));

  for (const p of papers) {
    const existingPaper = existingSubjectMap.get(p.id);
    const paperName = existingPaper ? existingPaper.subject.name : "Subject paper";

    if (!p.examDate) {
      throw new Error(`Examination date is required for ${paperName}.`);
    }

    const pDate = new Date(p.examDate);
    if (isNaN(pDate.getTime())) {
      throw new Error(`Invalid examination date provided for ${paperName}.`);
    }

    const pDay = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
    if (pDay < startDay || pDay > endDay) {
      const startStr = effectiveStartDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const endStr = effectiveEndDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      throw new Error(
        `Exam date for ${paperName} must fall between ${startStr} and ${endStr}.`
      );
    }

    if (!p.startTime || !p.endTime) {
      throw new Error(`Start time and end time are required for ${paperName}.`);
    }

    if (p.startTime >= p.endTime) {
      throw new Error(
        `Start time (${p.startTime}) must be earlier than end time (${p.endTime}) for ${paperName}.`
      );
    }
  }

  // Update paper records and exam status
  const paperUpdates = papers.map((p) =>
    prisma.examSubject.update({
      where: { id: p.id },
      data: {
        examDate: new Date(p.examDate),
        startTime: p.startTime,
        endTime: p.endTime,
        ...(p.maxMarks !== undefined ? { maxMarks: p.maxMarks } : {}),
        ...(p.passMarks !== undefined ? { passMarks: p.passMarks } : {}),
      },
    })
  );

  const targetStatus = "SCHEDULED";
  const updatedResults = await prisma.$transaction([
    ...paperUpdates,
    prisma.exam.update({
      where: { id: examId },
      data: {
        status: targetStatus,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
      },
    }),
  ]);

  await logAuditEvent({
    institutionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    action: isReschedule ? "RESCHEDULE_EXAM_TIMETABLE" : "SCHEDULE_EXAM_TIMETABLE",
    entity: "EXAM",
    entityId: examId,
    details: {
      previousStatus: exam.status,
      newStatus: targetStatus,
      examName: exam.name,
      papersUpdatedCount: papers.length,
      performedByRole: user.roleCode,
      isExamCreator: exam.createdById === user.id,
      reason: reason || (isReschedule ? "Examination timetable rescheduled" : "Examination timetable scheduled and finalized"),
      startDate: effectiveStartDate.toISOString().split("T")[0],
      endDate: effectiveEndDate.toISOString().split("T")[0],
    },
  });

  return updatedResults[updatedResults.length - 1];
}

/**
 * Safe Deletion of examinations (Creator, Institution Admin, Super Admin)
 * Blocks deletion if any student marks are recorded or results are completed/published
 */
export async function safeDeleteExam({
  examId,
  institutionId,
  user,
}: {
  examId: string;
  institutionId: string;
  user: SessionUser;
}) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examSubjects: {
        include: {
          marks: true,
        },
      },
    },
  });

  if (!exam || exam.institutionId !== institutionId) {
    throw new Error("Assessment not found.");
  }

  // Ensure createdById is populated
  let createdById = (exam as any).createdById;
  if (!createdById) {
    try {
      const rawExam: any = await (prisma as any).$queryRaw`
        SELECT "createdById" FROM "Exam" WHERE id = ${examId}
      `;
      if (Array.isArray(rawExam) && rawExam[0]?.createdById) {
        createdById = rawExam[0].createdById;
      }
    } catch (e) {}
  }
  (exam as any).createdById = createdById;

  // 1. Permission check (Super Admin, Inst Admin, or Creator)
  const authCheck = canUserPerformExamAction(user, exam, "DELETE");
  if (!authCheck.allowed) {
    throw new Error(authCheck.reason || "Forbidden: You are not authorized to delete this examination.");
  }

  // 2. Dependency & Academic safety checks using real data
  const totalMarksCount = exam.examSubjects.reduce((acc, es) => acc + es.marks.length, 0);

  if (totalMarksCount > 0) {
    throw new Error(
      `Cannot delete this examination because marks have already been recorded for ${totalMarksCount} student(s).`
    );
  }

  if (exam.status === "PUBLISHED") {
    throw new Error(
      "Cannot permanently delete this examination because official results have already been published."
    );
  }

  if (exam.status === "RESULTS_VERIFIED") {
    throw new Error(
      "Cannot permanently delete this examination because academic results have been verified and sealed."
    );
  }

  // Delete papers and exam safely
  await prisma.examSubject.deleteMany({ where: { examId } });
  const deleted = await prisma.exam.delete({ where: { id: examId } });

  await logAuditEvent({
    institutionId,
    userId: user.id,
    userEmail: user.email,
    userName: user.fullName,
    action: "DELETE_EXAM",
    entity: "EXAM",
    entityId: examId,
    details: {
      examName: exam.name,
      status: exam.status,
      deletedBy: user.email,
    },
  });

  return deleted;
}

/**
 * Fetch Assigned Subject Papers for Subject Teacher
 */
export async function getTeacherAssignedPapers(institutionId: string, user: SessionUser) {
  const isGlobalAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HOD",
  ].includes(user.roleCode || "");

  let assignedSubjectIds: string[] = [];

  if (!isGlobalAdmin) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        institutionId,
        OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
      },
      include: {
        assignments: true,
        timetableSlots: true,
      },
    });

    if (teacher) {
      teacher.assignments.forEach((a) => {
        if (a.subjectId) assignedSubjectIds.push(a.subjectId);
      });
      teacher.timetableSlots.forEach((t) => {
        if (t.subjectId) assignedSubjectIds.push(t.subjectId);
      });
    }
  }

  const examSubjects = await prisma.examSubject.findMany({
    where: {
      exam: { institutionId },
      ...(isGlobalAdmin || assignedSubjectIds.length === 0
        ? {}
        : { subjectId: { in: assignedSubjectIds } }),
    },
    include: {
      exam: true,
      subject: true,
      class: {
        include: {
          sections: true,
          students: { where: { status: "ACTIVE" } },
        },
      },
      marks: true,
    },
    orderBy: { examDate: "desc" },
  });

  return examSubjects.map((es) => {
    const enrolledCount = es.class.students.length;
    const enteredCount = es.marks.length;
    return {
      id: es.id,
      examId: es.examId,
      examName: es.exam.name,
      examStatus: es.exam.status,
      subjectId: es.subjectId,
      subjectName: es.subject.name,
      subjectCode: es.subject.code,
      classId: es.classId,
      className: es.class.name,
      sections: es.class.sections.map((s) => ({ id: s.id, name: s.name })),
      examDate: es.examDate ? es.examDate.toISOString() : null,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      enrolledStudentsCount: enrolledCount,
      enteredMarksCount: enteredCount,
      isCompleted: enteredCount >= enrolledCount && enrolledCount > 0,
    };
  });
}

/**
 * Fetch Class Result Readiness & Missing Marks Overview for Class Teachers / Admins
 */
export async function getClassReadinessOverview({
  institutionId,
  user,
  classId,
  sectionId,
}: {
  institutionId: string;
  user: SessionUser;
  classId?: string;
  sectionId?: string;
}) {
  const isGlobalAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HOD",
  ].includes(user.roleCode || "");

  let teacherSectionIds: string[] = [];
  if (!isGlobalAdmin) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        institutionId,
        OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
      },
    });

    if (teacher) {
      const classSecs = await prisma.section.findMany({
        where: { classTeacherId: teacher.id },
        select: { id: true },
      });
      teacherSectionIds = classSecs.map((s) => s.id);
    }
  }

  const sections = await prisma.section.findMany({
    where: {
      class: { institutionId },
      ...(classId ? { classId } : {}),
      ...(sectionId ? { id: sectionId } : {}),
      ...(!isGlobalAdmin && teacherSectionIds.length > 0 ? { id: { in: teacherSectionIds } } : {}),
    },
    include: {
      class: true,
      classTeacher: true,
      students: {
        where: { status: "ACTIVE" },
        include: {
          marks: {
            include: {
              examSubject: {
                include: { subject: true, exam: true },
              },
            },
          },
        },
      },
    },
  });

  return sections.map((sec) => {
    const totalStudents = sec.students.length;
    return {
      sectionId: sec.id,
      sectionName: sec.name,
      classId: sec.classId,
      className: sec.class.name,
      classTeacherName: sec.classTeacher?.fullName || "Not Assigned",
      totalStudents,
      students: sec.students.map((st) => ({
        id: st.id,
        fullName: st.fullName,
        admissionNumber: st.admissionNumber,
        rollNumber: st.rollNumber,
        marksEnteredCount: st.marks.length,
      })),
    };
  });
}

/**
 * Schedule / Create a new Exam Cycle with Papers
 */
export async function createExamSchedule({
  institutionId,
  createdById,
  name,
  examType,
  academicYearId,
  termId,
  classId,
  startDate,
  endDate,
  papers,
  user,
}: {
  institutionId: string;
  createdById?: string;
  name: string;
  examType: string;
  academicYearId?: string;
  termId?: string;
  classId?: string;
  startDate: Date | string;
  endDate: Date | string;
  papers?: Array<{
    subjectId: string;
    classId?: string;
    examDate?: Date | string | null;
    startTime?: string;
    endTime?: string;
    maxMarks?: number;
    passMarks?: number;
  }>;
  user?: SessionUser;
}) {
  // Resolve or create academic year & term
  let effectiveAyId = academicYearId;
  if (!effectiveAyId) {
    const currentAy = await prisma.academicYear.findFirst({
      where: { institutionId, isCurrent: true },
    });
    if (currentAy) {
      effectiveAyId = currentAy.id;
    } else {
      const anyAy = await prisma.academicYear.findFirst({
        where: { institutionId },
        orderBy: { startDate: "desc" },
      });
      if (anyAy) {
        effectiveAyId = anyAy.id;
      } else {
        const newAy = await prisma.academicYear.create({
          data: {
            institutionId,
            name: "2026-2027",
            startDate: new Date("2026-04-01"),
            endDate: new Date("2027-03-31"),
            isCurrent: true,
          },
        });
        effectiveAyId = newAy.id;
      }
    }
  }

  // Resolve target class if needed
  let effectiveClassId = classId;
  if (!effectiveClassId) {
    const defaultClass = await prisma.class.findFirst({
      where: { institutionId },
      orderBy: { orderIndex: "asc" },
    });
    effectiveClassId = defaultClass?.id;
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const resolvedCreatorId = createdById || user?.id || null;

  const createdExam = await prisma.exam.create({
    data: {
      institutionId,
      createdById: resolvedCreatorId,
      academicYearId: effectiveAyId,
      termId: termId || null,
      name,
      examType,
      startDate: sDate,
      endDate: eDate,
      status: "DRAFT",
    },
  });

  // Create papers if provided
  if (papers && papers.length > 0 && effectiveClassId) {
    const paperCreates = papers.map((p) => ({
      examId: createdExam.id,
      subjectId: p.subjectId,
      classId: p.classId || effectiveClassId!,
      examDate: p.examDate ? new Date(p.examDate) : null,
      startTime: p.startTime || "09:00",
      endTime: p.endTime || "12:00",
      maxMarks: p.maxMarks || 100,
      passMarks: p.passMarks || 40,
    }));

    await prisma.examSubject.createMany({
      data: paperCreates,
    });
  }

  if (user) {
    await logAuditEvent({
      institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "CREATE_EXAM_SCHEDULE",
      entity: "EXAM",
      entityId: createdExam.id,
      details: {
        examName: createdExam.name,
        examType: createdExam.examType,
        status: createdExam.status,
        createdById: resolvedCreatorId,
        papersCount: papers?.length || 0,
      },
    });
  }

  return createdExam;
}

/**
 * Generate Scoped Academic Report Card
 */
export async function getScopedReportCard({
  examId,
  studentId,
  institutionId,
}: {
  examId: string;
  studentId: string;
  institutionId: string;
}) {
  const [exam, student, institution] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      include: {
        academicYear: true,
        term: true,
        examSubjects: {
          include: {
            subject: true,
            class: true,
            marks: {
              where: { studentId },
            },
          },
          orderBy: { examDate: "asc" },
        },
      },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: true,
        currentSection: {
          include: { classTeacher: true },
        },
        attendance: true,
      },
    }),
    prisma.institution.findUnique({
      where: { id: institutionId },
    }),
  ]);

  if (!exam || exam.institutionId !== institutionId) {
    throw new Error("Assessment not found.");
  }
  if (!student || student.institutionId !== institutionId) {
    throw new Error("Student record not found.");
  }

  // Filter exam subjects relevant to student's class
  const studentPapers = exam.examSubjects.filter(
    (es) => es.classId === student.currentClassId
  );

  const marksList = studentPapers.map((p) => {
    const markRec = p.marks[0];
    const score = markRec?.marksObtained ?? 0;
    const isAbsent = Boolean(markRec?.isAbsent);
    const grade = markRec?.grade || (isAbsent ? "AB" : calculateGrade(score, p.maxMarks));

    return {
      subjectName: p.subject.name,
      subjectCode: p.subject.code,
      maxMarks: p.maxMarks,
      marksObtained: score,
      passMarks: p.passMarks,
      grade,
      isAbsent,
      remarks: markRec?.remarks || undefined,
    };
  });

  const totalMax = marksList.reduce((acc, m) => acc + m.maxMarks, 0);
  const totalObtained = marksList.reduce(
    (acc, m) => acc + (m.isAbsent ? 0 : m.marksObtained),
    0
  );
  const overallPct = totalMax > 0 ? +((totalObtained / totalMax) * 100).toFixed(1) : 0;
  const overallGrade = calculateGrade(totalObtained, totalMax);

  // Attendance calculation
  const totalAttendanceDays = student.attendance.length;
  const presentDays = student.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attendancePct =
    totalAttendanceDays > 0
      ? +((presentDays / totalAttendanceDays) * 100).toFixed(1)
      : 95.0;

  return {
    institution: {
      name: institution?.name || "Northstar International Academy",
      address: institution?.address || "Knowledge Park III, Greater Noida",
      city: institution?.city || "Greater Noida",
      state: institution?.state || "Uttar Pradesh",
      brandingColor: institution?.brandingColor || "#0F172A",
    },
    exam: {
      id: exam.id,
      name: exam.name,
      examType: exam.examType,
      examTypeLabel: formatExamTypeName(exam.examType),
      academicYearName: exam.academicYear?.name || "2026-2027",
      termName: exam.term?.name || "Term 1",
      startDate: exam.startDate.toISOString(),
      endDate: exam.endDate.toISOString(),
      status: exam.status,
    },
    student: {
      id: student.id,
      fullName: student.fullName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber || "1",
      className: student.currentClass.name,
      sectionName: student.currentSection?.name || "A",
      classTeacherName: student.currentSection?.classTeacher?.fullName || "Class Tutor",
      attendancePct,
    },
    marks: marksList,
    summary: {
      totalMaxMarks: totalMax,
      totalMarksObtained: totalObtained,
      overallPercentage: overallPct,
      overallGrade,
      resultStatus: overallPct >= 40 ? "Promoted with Distinction" : "Needs Improvement",
    },
  };
}
