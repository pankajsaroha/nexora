import { describe, it } from "node:test";
import assert from "node:assert/strict";

const EXAM_TYPES = [
  { code: "HALF_YEARLY", label: "Half-Yearly Examination" },
  { code: "MID_TERM", label: "Mid-Term Assessment" },
  { code: "UNIT_TEST", label: "Unit Test" },
  { code: "PERIODIC_TEST", label: "Periodic Test" },
  { code: "FINAL", label: "Final / Annual Board" },
  { code: "PRACTICAL", label: "Practical / Lab" },
  { code: "INTERNAL", label: "Internal Assessment" },
  { code: "PRE_BOARD", label: "Pre-Board Examination" },
  { code: "OTHER", label: "Other Assessment" },
];

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["ONGOING", "POSTPONED", "CANCELLED", "DRAFT"],
  POSTPONED: ["SCHEDULED", "CANCELLED"],
  ONGOING: ["COMPLETED", "POSTPONED", "CANCELLED"],
  COMPLETED: ["RESULTS_IN_PROGRESS", "POSTPONED"],
  RESULTS_IN_PROGRESS: ["RESULTS_VERIFIED", "COMPLETED"],
  RESULTS_VERIFIED: ["PUBLISHED", "RESULTS_IN_PROGRESS"],
  PUBLISHED: ["RESULTS_VERIFIED"], // Admin reopened only
  CANCELLED: [], // Terminal historical state
};

function validateExamStatusTransition(
  currentStatus: string,
  nextStatus: string
): { valid: boolean; reason?: string } {
  if (currentStatus === nextStatus) return { valid: true };
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      reason: `Invalid transition from ${currentStatus} to ${nextStatus}`,
    };
  }
  return { valid: true };
}

function calculateGrade(marksObtained: number, maxMarks: number, isAbsent = false): string {
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

function formatExamTypeName(code: string): string {
  const found = EXAM_TYPES.find((t) => t.code === code);
  if (found) return found.label;
  return code.replace(/_/g, " ");
}

describe("Exams & Assessment Architecture Workflow Logic", () => {
  it("Exam Types: Supports Half-Yearly, Mid-Term, Unit Test, Practical, Final, etc.", () => {
    const codes = EXAM_TYPES.map((t) => t.code);
    assert.ok(codes.includes("HALF_YEARLY"), "HALF_YEARLY must be supported");
    assert.ok(codes.includes("MID_TERM"), "MID_TERM must be supported");
    assert.ok(codes.includes("UNIT_TEST"), "UNIT_TEST must be supported");
    assert.ok(codes.includes("FINAL"), "FINAL must be supported");
    assert.ok(codes.includes("PRACTICAL"), "PRACTICAL must be supported");

    assert.equal(formatExamTypeName("HALF_YEARLY"), "Half-Yearly Examination");
    assert.equal(formatExamTypeName("MID_TERM"), "Mid-Term Assessment");
  });

  it("Exam Lifecycle State Machine: Valid and invalid transitions", () => {
    // Valid standard lifecycle
    assert.equal(validateExamStatusTransition("DRAFT", "SCHEDULED").valid, true);
    assert.equal(validateExamStatusTransition("SCHEDULED", "ONGOING").valid, true);
    assert.equal(validateExamStatusTransition("ONGOING", "COMPLETED").valid, true);
    assert.equal(validateExamStatusTransition("COMPLETED", "RESULTS_IN_PROGRESS").valid, true);
    assert.equal(validateExamStatusTransition("RESULTS_IN_PROGRESS", "RESULTS_VERIFIED").valid, true);
    assert.equal(validateExamStatusTransition("RESULTS_VERIFIED", "PUBLISHED").valid, true);

    // Reopening published exam
    assert.equal(validateExamStatusTransition("PUBLISHED", "RESULTS_VERIFIED").valid, true);

    // Postponement & rescheduling
    assert.equal(validateExamStatusTransition("SCHEDULED", "POSTPONED").valid, true);
    assert.equal(validateExamStatusTransition("POSTPONED", "SCHEDULED").valid, true);

    // Cancellation (Historical retention)
    assert.equal(validateExamStatusTransition("SCHEDULED", "CANCELLED").valid, true);
    assert.equal(validateExamStatusTransition("ONGOING", "CANCELLED").valid, true);

    // Invalid transitions
    assert.equal(validateExamStatusTransition("CANCELLED", "SCHEDULED").valid, false);
    assert.equal(validateExamStatusTransition("DRAFT", "PUBLISHED").valid, false);
    assert.equal(validateExamStatusTransition("SCHEDULED", "RESULTS_VERIFIED").valid, false);
  });

  it("Grading Logic: Accurate percentage thresholds and absent handling", () => {
    assert.equal(calculateGrade(95, 100), "A+");
    assert.equal(calculateGrade(90, 100), "A+");
    assert.equal(calculateGrade(85, 100), "A");
    assert.equal(calculateGrade(75, 100), "B+");
    assert.equal(calculateGrade(65, 100), "B");
    assert.equal(calculateGrade(55, 100), "C");
    assert.equal(calculateGrade(40, 100), "D");
    assert.equal(calculateGrade(35, 100), "F");
    assert.equal(calculateGrade(0, 100, true), "AB", "Absent returns AB");
  });

  it("Marks Boundary & Validation Logic", () => {
    const maxMarks = 100;
    const testMarks = [
      { score: 85, valid: true },
      { score: 0, valid: true },
      { score: 100, valid: true },
      { score: -5, valid: false },
      { score: 105, valid: false },
    ];

    testMarks.forEach(({ score, valid }) => {
      const isValid = score >= 0 && score <= maxMarks;
      assert.equal(isValid, valid);
    });
  });

  it("Teacher Responsibility Engine: Strict Subject Teacher vs Class Teacher Separation", () => {
    // Teacher Ananya: Class Teacher for 8-A; Teaches Math to 6-A, 7-A, 8-A.
    const userAnanya = { roleCode: "TEACHER", teacherId: "t-ananya" };
    const userOther = { roleCode: "TEACHER", teacherId: "t-other" };
    const adminUser = { roleCode: "ADMIN" };

    const mathPaper6A = { subjectId: "sub-math", classId: "class-6", assignedTeacherId: "t-ananya" };
    const mathPaper8A = { subjectId: "sub-math", classId: "class-8", assignedTeacherId: "t-ananya" };
    const englishPaper8A = { subjectId: "sub-english", classId: "class-8", assignedTeacherId: "t-other" };

    const canEnterSubjectMarks = (
      user: { roleCode: string; teacherId?: string },
      paper: { assignedTeacherId: string },
      examStatus = "ONGOING"
    ) => {
      if (examStatus === "PUBLISHED") return false; // Locked
      if (["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(user.roleCode)) return true;
      return user.teacherId === paper.assignedTeacherId;
    };

    // Ananya can enter Math marks for 6-A and 8-A
    assert.equal(canEnterSubjectMarks(userAnanya, mathPaper6A), true);
    assert.equal(canEnterSubjectMarks(userAnanya, mathPaper8A), true);

    // Ananya CANNOT enter English marks for 8-A even though she is Class Teacher of 8-A
    assert.equal(canEnterSubjectMarks(userAnanya, englishPaper8A), false);

    // The assigned English teacher can enter English marks
    assert.equal(canEnterSubjectMarks(userOther, englishPaper8A), true);

    // Admin has global access
    assert.equal(canEnterSubjectMarks(adminUser, englishPaper8A), true);

    // Once exam is PUBLISHED, marks editing is strictly locked for teachers
    assert.equal(canEnterSubjectMarks(userAnanya, mathPaper8A, "PUBLISHED"), false);
  });

  it("Class Teacher Scope: Result Readiness & Report Card Authorization", () => {
    const classTeacherId = "t-ananya";
    const section8A = { id: "sec-8a", classTeacherId: "t-ananya" };
    const section6A = { id: "sec-6a", classTeacherId: "t-other" };

    const canGenerateClassReportCard = (
      user: { roleCode: string; teacherId?: string },
      section: { classTeacherId: string }
    ) => {
      if (["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(user.roleCode)) return true;
      return user.teacherId === section.classTeacherId;
    };

    const userAnanya = { roleCode: "TEACHER", teacherId: "t-ananya" };

    // Ananya CAN generate report cards for 8-A (her assigned section)
    assert.equal(canGenerateClassReportCard(userAnanya, section8A), true);

    // Ananya CANNOT generate report cards for 6-A merely because she teaches Math there
    assert.equal(canGenerateClassReportCard(userAnanya, section6A), false);
  });

  it("Final Permission Matrix: Creator vs Non-Creator vs Institution Admin vs Super Admin", () => {
    const institutionId = "inst-northstar";

    const userCreatorTeacher = {
      id: "usr-ananya",
      institutionId,
      roleCode: "TEACHER",
      fullName: "Ananya Sharma",
      email: "ananya@test.nexora.edu",
    };

    const userNonCreatorTeacher = {
      id: "usr-rohit",
      institutionId,
      roleCode: "TEACHER",
      fullName: "Rohit Verma",
      email: "rohit@test.nexora.edu",
    };

    const userInstAdmin = {
      id: "usr-admin",
      institutionId,
      roleCode: "ADMIN",
      fullName: "Institution Principal",
      email: "principal@test.nexora.edu",
    };

    const userSuperAdmin = {
      id: "usr-super",
      institutionId,
      roleCode: "SUPER_ADMIN",
      fullName: "Super Administrator",
      email: "superadmin@test.nexora.edu",
    };

    const draftExam = {
      id: "exam-unit1",
      institutionId,
      createdById: "usr-ananya",
      status: "DRAFT",
    };

    const ongoingExam = {
      id: "exam-unit1",
      institutionId,
      createdById: "usr-ananya",
      status: "ONGOING",
    };

    const publishedExam = {
      id: "exam-unit1",
      institutionId,
      createdById: "usr-ananya",
      status: "PUBLISHED",
    };

    // Permission Matrix Checker (mirrors service.ts canUserPerformExamAction)
    const canUserPerform = (
      user: any,
      exam: any,
      action: string
    ): { allowed: boolean; reason?: string } => {
      if (exam.institutionId !== user.institutionId) {
        return { allowed: false, reason: "Different institution" };
      }
      const role = user.roleCode || "";
      const isSuper = role === "SUPER_ADMIN";
      const isInstAdm = isSuper || ["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "HOD", "EXAM_COORDINATOR"].includes(role);
      const isCreator = Boolean(exam.createdById && exam.createdById === user.id);

      if (isSuper) return { allowed: true };
      if (action === "DELETE") {
        return (isInstAdm || isCreator) ? { allowed: true } : { allowed: false, reason: "Unauthorized delete" };
      }
      if (action === "CANCEL") {
        return isInstAdm ? { allowed: true } : { allowed: false, reason: "Admin authority required" };
      }
      if (action === "VERIFY_RESULTS" || action === "PUBLISH_RESULTS" || action === "REOPEN_RESULTS") {
        return isInstAdm ? { allowed: true } : { allowed: false, reason: "Admin authority required" };
      }
      if (isInstAdm || isCreator) {
        if (action === "EDIT_CONFIG" && exam.status !== "DRAFT") {
          return { allowed: false, reason: "Only editable in DRAFT" };
        }
        return { allowed: true };
      }
      return { allowed: false, reason: "Not creator or admin" };
    };

    // 1. TEACHER / CREATOR (Ananya created the exam)
    assert.equal(canUserPerform(userCreatorTeacher, draftExam, "VIEW").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, draftExam, "EDIT_CONFIG").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, draftExam, "SCHEDULE").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "START").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "COMPLETE").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "POSTPONE").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "RESCHEDULE").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "START_RESULTS").allowed, true);
    assert.equal(canUserPerform(userCreatorTeacher, draftExam, "DELETE").allowed, true); // Creator can delete own exam (if safe)

    // Creator CANNOT Cancel, Verify, Publish, or Reopen results
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "CANCEL").allowed, false);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "VERIFY_RESULTS").allowed, false);
    assert.equal(canUserPerform(userCreatorTeacher, ongoingExam, "PUBLISH_RESULTS").allowed, false);
    assert.equal(canUserPerform(userCreatorTeacher, publishedExam, "REOPEN_RESULTS").allowed, false);

    // 2. NON-CREATOR TEACHER (Rohit Verma)
    assert.equal(canUserPerform(userNonCreatorTeacher, draftExam, "SCHEDULE").allowed, false);
    assert.equal(canUserPerform(userNonCreatorTeacher, ongoingExam, "COMPLETE").allowed, false);
    assert.equal(canUserPerform(userNonCreatorTeacher, ongoingExam, "CANCEL").allowed, false);
    assert.equal(canUserPerform(userNonCreatorTeacher, draftExam, "DELETE").allowed, false);

    // 3. INSTITUTION ADMIN
    assert.equal(canUserPerform(userInstAdmin, draftExam, "VIEW").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, draftExam, "SCHEDULE").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, ongoingExam, "COMPLETE").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, ongoingExam, "CANCEL").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, ongoingExam, "VERIFY_RESULTS").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, ongoingExam, "PUBLISH_RESULTS").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, publishedExam, "REOPEN_RESULTS").allowed, true);
    assert.equal(canUserPerform(userInstAdmin, draftExam, "DELETE").allowed, true);

    // 4. SUPER ADMIN
    assert.equal(canUserPerform(userSuperAdmin, draftExam, "VIEW").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, draftExam, "SCHEDULE").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, ongoingExam, "COMPLETE").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, ongoingExam, "CANCEL").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, ongoingExam, "VERIFY_RESULTS").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, ongoingExam, "PUBLISH_RESULTS").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, publishedExam, "REOPEN_RESULTS").allowed, true);
    assert.equal(canUserPerform(userSuperAdmin, draftExam, "DELETE").allowed, true);
  });

  it("Delete Eligibility & Real Dependency Safety: Evaluates actual marks and published records", () => {
    function checkDeleteSafety(exam: { status: string; totalEnteredMarks: number }) {
      if (exam.totalEnteredMarks > 0) {
        return {
          isSafe: false,
          reason: `Cannot delete this examination because marks have already been recorded for ${exam.totalEnteredMarks} student(s).`,
        };
      }
      if (exam.status === "PUBLISHED") {
        return {
          isSafe: false,
          reason: "Cannot permanently delete this examination because official results have already been published.",
        };
      }
      if (exam.status === "RESULTS_VERIFIED") {
        return {
          isSafe: false,
          reason: "Cannot permanently delete this examination because academic results have been verified and sealed.",
        };
      }
      return { isSafe: true };
    }

    // Case 1: Completed with 0 marks -> Safe to delete
    const emptyCompletedExam = { status: "COMPLETED", totalEnteredMarks: 0 };
    assert.equal(checkDeleteSafety(emptyCompletedExam).isSafe, true);

    // Case 2: Draft with 0 marks -> Safe to delete
    const draftExam = { status: "DRAFT", totalEnteredMarks: 0 };
    assert.equal(checkDeleteSafety(draftExam).isSafe, true);

    // Case 3: Scheduled with 0 marks -> Safe to delete
    const scheduledExam = { status: "SCHEDULED", totalEnteredMarks: 0 };
    assert.equal(checkDeleteSafety(scheduledExam).isSafe, true);

    // Case 4: Marks exist -> Blocked with exact candidate count
    const examWithMarks = { status: "ONGOING", totalEnteredMarks: 15 };
    const checkWithMarks = checkDeleteSafety(examWithMarks);
    assert.equal(checkWithMarks.isSafe, false);
    assert.match(checkWithMarks.reason!, /recorded for 15 student\(s\)/);

    // Case 5: Published exam -> Blocked with published reason
    const publishedExam = { status: "PUBLISHED", totalEnteredMarks: 0 };
    const checkPublished = checkDeleteSafety(publishedExam);
    assert.equal(checkPublished.isSafe, false);
    assert.match(checkPublished.reason!, /results have already been published/);

    // Case 6: Verified exam -> Blocked with verified reason
    const verifiedExam = { status: "RESULTS_VERIFIED", totalEnteredMarks: 0 };
    const checkVerified = checkDeleteSafety(verifiedExam);
    assert.equal(checkVerified.isSafe, false);
    assert.match(checkVerified.reason!, /results have been verified/);
  });
});

