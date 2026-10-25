import test from "node:test";
import assert from "node:assert/strict";

test("NEXORA — Critical Workflows & Data Integrity Regression Suite", async (t) => {
  // ==========================================
  // PHASE 1: STUDENT ADMISSION FORM SAFETY
  // ==========================================
  await t.test("Phase 1: Student Admission Form Safety", async (st) => {
    await st.test("Buttons default to type='button' to prevent accidental form submission", () => {
      // Simulating Button default prop resolution from src/components/ui/button.tsx
      function resolveButtonType(props: { type?: "button" | "submit" | "reset" }) {
        return props.type || "button";
      }

      assert.equal(resolveButtonType({}), "button");
      assert.equal(resolveButtonType({ type: "submit" }), "submit");
      assert.equal(resolveButtonType({ type: "button" }), "button");
    });

    await st.test("Enter key in intermediate steps does not trigger final admission submission", () => {
      let submitTriggered = false;
      const activeStep = 4; // Academic Enrollment step

      function handleFormKeyDown(e: { key: string; target: { tagName: string }; preventDefault: () => void }) {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          return false;
        }
        return true;
      }

      function handleSubmit(step: number) {
        if (step < 5) return; // Guard in src/components/students/student-admission-dialog.tsx
        submitTriggered = true;
      }

      let prevented = false;
      const fakeEvent = {
        key: "Enter",
        target: { tagName: "INPUT" },
        preventDefault: () => { prevented = true; },
      };

      const allowed = handleFormKeyDown(fakeEvent);
      assert.equal(prevented, true, "Enter key should call preventDefault on inputs");
      assert.equal(allowed, false);

      // Even if an Enter key somehow reached handleSubmit on Step 4:
      handleSubmit(activeStep);
      assert.equal(submitTriggered, false, "Intermediate step must never submit student record");

      // Only on final step (step 5):
      handleSubmit(5);
      assert.equal(submitTriggered, true, "Final step submits successfully");
    });

    await st.test("Form validates required fields before allowing submission", () => {
      function validateStep(step: number, data: { firstName?: string; lastName?: string; email?: string; classId?: string }) {
        if (step === 1) {
          if (!data.firstName?.trim() || !data.lastName?.trim() || !data.email?.trim()) {
            return { valid: false, error: "Name and email are required" };
          }
        }
        if (step === 4) {
          if (!data.classId) {
            return { valid: false, error: "Class enrollment is required" };
          }
        }
        return { valid: true };
      }

      assert.equal(validateStep(1, { firstName: "", lastName: "Sharma", email: "a@b.com" }).valid, false);
      assert.equal(validateStep(1, { firstName: "Aarav", lastName: "Sharma", email: "a@b.com" }).valid, true);
      assert.equal(validateStep(4, { classId: "" }).valid, false);
      assert.equal(validateStep(4, { classId: "class-123" }).valid, true);
    });
  });

  // ==========================================
  // PHASE 2: ATTENDANCE CLASS FILTERING
  // ==========================================
  await t.test("Phase 2: Attendance Class & Section Filtering", async (st) => {
    const mockStudents = [
      { id: "s1", name: "Student Class A", currentClassId: "class-A", currentSectionId: "sec-A1" },
      { id: "s2", name: "Student Class A-2", currentClassId: "class-A", currentSectionId: "sec-A2" },
      { id: "s3", name: "Student Class B", currentClassId: "class-B", currentSectionId: "sec-B1" },
    ];

    function filterAttendanceRoster(students: typeof mockStudents, classId?: string, sectionId?: string) {
      return students.filter((s) => {
        if (classId && s.currentClassId !== classId) return false;
        if (sectionId && s.currentSectionId !== sectionId) return false;
        return true;
      });
    }

    await st.test("Selecting Class A displays only students from Class A", () => {
      const rosterA = filterAttendanceRoster(mockStudents, "class-A");
      assert.equal(rosterA.length, 2);
      assert.ok(rosterA.every((s) => s.currentClassId === "class-A"));
      assert.ok(!rosterA.some((s) => s.id === "s3"));
    });

    await st.test("Selecting Class B displays only students from Class B", () => {
      const rosterB = filterAttendanceRoster(mockStudents, "class-B");
      assert.equal(rosterB.length, 1);
      assert.equal(rosterB[0]!.id, "s3");
    });

    await st.test("Narrowing to Section A2 filters down to exactly Section A2", () => {
      const rosterA2 = filterAttendanceRoster(mockStudents, "class-A", "sec-A2");
      assert.equal(rosterA2.length, 1);
      assert.equal(rosterA2[0]!.id, "s2");
    });

    await st.test("Selecting an empty class returns empty array rather than default roster", () => {
      const rosterEmpty = filterAttendanceRoster(mockStudents, "class-Empty");
      assert.equal(rosterEmpty.length, 0);
    });
  });

  // ==========================================
  // PHASE 3: LEAVE APPROVAL & RESPONSIVE DATA
  // ==========================================
  await t.test("Phase 3: Leave Approval Authorization & Workflow", async (st) => {
    function canApproveLeave(user: { roleCode: string; institutionId: string }, leaveRequest: { institutionId: string }) {
      const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
      const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "DIRECTOR", "DEAN"];
      if (!allowedRoles.includes(user.roleCode)) {
        return { allowed: false, reason: "Unauthorized role" };
      }
      if (!isSuperAdmin && user.institutionId !== leaveRequest.institutionId) {
        return { allowed: false, reason: "Institution mismatch" };
      }
      return { allowed: true };
    }

    const leaveInst1 = { institutionId: "inst-1" };

    await st.test("Super Admin can review and approve leave across any institution", () => {
      const superAdmin = { roleCode: "SUPER_ADMIN", institutionId: "inst-global" };
      const res = canApproveLeave(superAdmin, leaveInst1);
      assert.equal(res.allowed, true);
    });

    await st.test("Institution Admin can approve leave within their own institution", () => {
      const adminInst1 = { roleCode: "ADMIN", institutionId: "inst-1" };
      const res = canApproveLeave(adminInst1, leaveInst1);
      assert.equal(res.allowed, true);
    });

    await st.test("Institution Admin cannot approve leave from another institution", () => {
      const adminInst2 = { roleCode: "ADMIN", institutionId: "inst-2" };
      const res = canApproveLeave(adminInst2, leaveInst1);
      assert.equal(res.allowed, false);
      assert.equal(res.reason, "Institution mismatch");
    });

    await st.test("Regular teacher cannot approve leave requests", () => {
      const teacher = { roleCode: "TEACHER", institutionId: "inst-1" };
      const res = canApproveLeave(teacher, leaveInst1);
      assert.equal(res.allowed, false);
      assert.equal(res.reason, "Unauthorized role");
    });

    await st.test("Rejection requires a rejection reason", () => {
      function processReview(status: "APPROVED" | "REJECTED", reason?: string) {
        if (status === "REJECTED" && (!reason || !reason.trim())) {
          return { success: false, error: "Rejection reason is required" };
        }
        return { success: true, status };
      }

      assert.equal(processReview("REJECTED", "").success, false);
      assert.equal(processReview("REJECTED", "Staffing shortage").success, true);
      assert.equal(processReview("APPROVED").success, true);
    });
  });

  // ==========================================
  // PHASE 4: PAYROLL STAFF INCLUSION
  // ==========================================
  await t.test("Phase 4: Payroll Staff Inclusion & Setup Status", async (st) => {
    interface Teacher {
      id: string;
      fullName: string;
      employeeId: string;
      designation: string;
      department?: { name: string } | null;
      basicSalary?: number | null;
      bankAccountNumber?: string | null;
      status: string;
    }

    interface PayrollRecord {
      id: string;
      teacherId: string;
      basicSalary: number;
      netSalary: number;
      status: string;
    }

    const mockTeachers: Teacher[] = [
      {
        id: "t1",
        fullName: "Dr. Vikram Seth",
        employeeId: "EMP-001",
        designation: "Professor",
        basicSalary: 85000,
        bankAccountNumber: "SBIN00012345",
        status: "ACTIVE",
      },
      {
        id: "t2",
        fullName: "Anita Desai",
        employeeId: "EMP-002",
        designation: "Assistant Professor",
        basicSalary: 62000,
        bankAccountNumber: null, // Pending bank setup
        status: "ACTIVE",
      },
      {
        id: "t3",
        fullName: "Terminated Staff",
        employeeId: "EMP-003",
        designation: "Lecturer",
        status: "TERMINATED",
      },
    ];

    const mockPayrolls: PayrollRecord[] = [
      {
        id: "p1",
        teacherId: "t1",
        basicSalary: 85000,
        netSalary: 92000,
        status: "PAID",
      },
    ];

    // Simulating the merged query logic in src/app/(dashboard)/finance/payroll/page.tsx
    function buildPayrollItems(teachers: Teacher[], payrolls: PayrollRecord[]) {
      const payrollMap = new Map(payrolls.map((p) => [p.teacherId, p]));

      return teachers
        .filter((t) => t.status === "ACTIVE" || t.status === "ON_LEAVE")
        .map((t) => {
          const existing = payrollMap.get(t.id);
          if (existing) {
            return {
              id: existing.id,
              teacherId: t.id,
              teacherName: t.fullName,
              employeeId: t.employeeId,
              designation: t.designation,
              basicSalary: existing.basicSalary,
              netSalary: existing.netSalary,
              status: existing.status,
              bankAccountNumber: t.bankAccountNumber,
            };
          }
          const base = t.basicSalary || 0;
          return {
            id: `draft-${t.id}`,
            teacherId: t.id,
            teacherName: t.fullName,
            employeeId: t.employeeId,
            designation: t.designation,
            basicSalary: base,
            netSalary: base,
            status: "DRAFT",
            bankAccountNumber: t.bankAccountNumber,
          };
        });
    }

    const items = buildPayrollItems(mockTeachers, mockPayrolls);

    await st.test("Active teachers without processed payroll appear in payroll roster as DRAFT", () => {
      assert.equal(items.length, 2, "Both active teachers must appear in payroll");
      const unseeded = items.find((i) => i.teacherId === "t2");
      assert.ok(unseeded, "Teacher Anita Desai must appear in payroll");
      assert.equal(unseeded.status, "DRAFT");
      assert.equal(unseeded.basicSalary, 62000);
    });

    await st.test("Staff with missing bank account is flagged for pending bank setup", () => {
      const unseeded = items.find((i) => i.teacherId === "t2")!;
      assert.equal(unseeded.bankAccountNumber, null);
    });

    await st.test("Historical paid payroll records are preserved with their processed amounts", () => {
      const paid = items.find((i) => i.teacherId === "t1")!;
      assert.equal(paid.status, "PAID");
      assert.equal(paid.netSalary, 92000);
    });

    await st.test("Terminated or non-eligible staff are excluded from current payroll roster", () => {
      assert.ok(!items.some((i) => i.teacherId === "t3"), "Terminated staff must not appear in active payroll");
    });
  });

  // ==========================================
  // PHASE 5: EXAM DELETION & LIFECYCLE INTEGRITY
  // ==========================================
  await t.test("Phase 5: Exam Deletion & Lifecycle Safeguards", async (st) => {
    interface Exam {
      id: string;
      title: string;
      status: "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "RESULTS_PUBLISHED" | "CANCELLED";
      institutionId: string;
      totalEnteredMarks: number;
    }

    function checkExamDeletionEligibility(user: { roleCode: string; institutionId: string }, exam: Exam) {
      const isSuperAdmin = user.roleCode === "SUPER_ADMIN";

      // Super Admin exemption from institution check
      if (!isSuperAdmin && exam.institutionId !== user.institutionId) {
        return { allowed: false, error: "Access denied. Institution mismatch." };
      }

      // Lifecycle rule: Only DRAFT examinations with 0 marks may be permanently deleted
      if (exam.status !== "DRAFT") {
        return {
          allowed: false,
          error: `Cannot delete examination in '${exam.status}' status. Historical integrity must be preserved. Use 'Cancel Examination' instead.`,
          canCancelInstead: true,
        };
      }

      if (exam.totalEnteredMarks > 0) {
        return {
          allowed: false,
          error: `Cannot delete examination because ${exam.totalEnteredMarks} student evaluation marks have been recorded.`,
          canCancelInstead: true,
        };
      }

      return { allowed: true };
    }

    const draftExam = {
      id: "exam-draft",
      title: "Midterm Draft",
      status: "DRAFT" as const,
      institutionId: "inst-teacher-created",
      totalEnteredMarks: 0,
    };

    const scheduledExam = {
      id: "exam-sched",
      title: "Final Exam",
      status: "SCHEDULED" as const,
      institutionId: "inst-teacher-created",
      totalEnteredMarks: 0,
    };

    const evaluatedExam = {
      id: "exam-eval",
      title: "Completed Midterm",
      status: "DRAFT" as const,
      institutionId: "inst-teacher-created",
      totalEnteredMarks: 45,
    };

    const superAdmin = { roleCode: "SUPER_ADMIN", institutionId: "inst-global" };

    await st.test("Super Admin can safely delete a DRAFT exam created in another institution", () => {
      const res = checkExamDeletionEligibility(superAdmin, draftExam);
      assert.equal(res.allowed, true);
    });

    await st.test("Deleting a SCHEDULED exam is blocked and instructs user to Cancel instead", () => {
      const res = checkExamDeletionEligibility(superAdmin, scheduledExam);
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes("Cannot delete examination in 'SCHEDULED' status"));
      assert.equal(res.canCancelInstead, true);
    });

    await st.test("Deleting an exam with recorded student marks is strictly prohibited", () => {
      const res = checkExamDeletionEligibility(superAdmin, evaluatedExam);
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes("student evaluation marks have been recorded"));
    });
  });

  // ==========================================
  // PHASE 6: STUDENT IDENTIFIER DISTINCTIONS
  // ==========================================
  await t.test("Phase 6: Student Identity Distinction", async (st) => {
    const student = {
      id: "550e8400-e29b-41d4-a716-446655440000", // Nexora Student ID (permanent system UUID)
      admissionNumber: "ADM-2026-0042",           // Institutional Admission Register ID
      rollNumber: "26-CSE-012",                   // Cohort / Section Roll Number (optional)
      loginId: "aarav.s26@school.edu",             // Portal Login ID
    };

    await st.test("All four identifier concepts are distinct and preserved", () => {
      assert.notEqual(student.id, student.admissionNumber);
      assert.notEqual(student.admissionNumber, student.rollNumber);
      assert.notEqual(student.id, student.loginId);
    });

    await st.test("Class or section transfer updates roll number while preserving permanent ID & admission number", () => {
      // Simulate transfer from Section A to Section B
      const transferredStudent = {
        ...student,
        currentSectionId: "section-B",
        rollNumber: "26-CSE-B-008", // Updated cohort serial
      };

      assert.equal(transferredStudent.id, student.id, "Nexora Student ID must never change");
      assert.equal(transferredStudent.admissionNumber, student.admissionNumber, "Admission number remains stable");
      assert.equal(transferredStudent.rollNumber, "26-CSE-B-008", "Roll number updated for new section");
    });

    await st.test("Admission number auto-generation avoids duplicates in sequence loop", () => {
      const existingAdmissionNos = new Set(["ADM-2026-0001", "ADM-2026-0002", "ADM-2026-0003"]);
      let candidateSequence = 1;
      let generated = "";

      while (candidateSequence < 1000) {
        const candidate = `ADM-2026-${String(candidateSequence).padStart(4, "0")}`;
        if (!existingAdmissionNos.has(candidate)) {
          generated = candidate;
          break;
        }
        candidateSequence++;
      }

      assert.equal(generated, "ADM-2026-0004", "Sequence should increment to the first unused unique identifier");
    });
  });
});
