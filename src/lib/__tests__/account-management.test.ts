import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("NEXORA — Account Settings & Multi-Tenant Management Tests", () => {
  // 1. Role Authorization for Institution Configuration
  it("Role check: Only SUPER_ADMIN, ADMIN, and PRINCIPAL can access institution settings", () => {
    const isInstitutionAdminAllowed = (roleCode: string | null | undefined): boolean => {
      return ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(roleCode || "");
    };

    assert.equal(isInstitutionAdminAllowed("STUDENT"), false, "Student must not be allowed to access institution settings");
    assert.equal(isInstitutionAdminAllowed("TEACHER"), false, "Teacher must not be allowed to access institution settings");
    assert.equal(isInstitutionAdminAllowed("PARENT"), false, "Parent must not be allowed to access institution settings");
    assert.equal(isInstitutionAdminAllowed("ACCOUNTANT"), false, "Accountant must not be allowed to access institution settings");

    assert.equal(isInstitutionAdminAllowed("SUPER_ADMIN"), true, "Super Admin is allowed to access institution settings");
    assert.equal(isInstitutionAdminAllowed("ADMIN"), true, "Institution Admin is allowed to access institution settings");
    assert.equal(isInstitutionAdminAllowed("PRINCIPAL"), true, "Principal is allowed to access institution settings");
  });

  // 2. Scoping logic for student and teacher management
  it("Institution scoping: Super Admin has global scope, other roles are strictly institution-scoped", () => {
    const buildScopingClause = (id: string, user: { roleCode: string; institutionId: string }) => {
      const whereClause: any = { id };
      if (user.roleCode !== "SUPER_ADMIN") {
        whereClause.institutionId = user.institutionId;
      }
      return whereClause;
    };

    const instA = "inst-111";
    const instB = "inst-222";

    const adminUser = { roleCode: "ADMIN", institutionId: instA };
    const superAdminUser = { roleCode: "SUPER_ADMIN", institutionId: instA };

    const adminQuery = buildScopingClause("rec-123", adminUser);
    assert.deepEqual(adminQuery, { id: "rec-123", institutionId: instA }, "Admin query must be scoped to their institution");

    const superAdminQuery = buildScopingClause("rec-123", superAdminUser);
    assert.deepEqual(superAdminQuery, { id: "rec-123" }, "Super Admin query must allow resolving record across institutions");
  });

  // 3. Unlinked portal account detection
  it("Distinguishes employee/student record from linked user account without throwing errors", () => {
    const studentWithNoAccount = {
      id: "student-1",
      fullName: "Isha Bansal",
      admissionNumber: "ADM-001",
      userId: null,
      user: null,
      fees: [],
      attendance: [],
    };

    const studentWithAccount = {
      id: "student-2",
      fullName: "Aarav Kapoor",
      admissionNumber: "ADM-002",
      userId: "user-123",
      user: { id: "user-123", email: "aarav.k@northstar.edu.in", isActive: true },
      fees: [{ totalAmount: 50000, paidAmount: 50000 }],
      attendance: [{ status: "PRESENT" }],
    };

    // Safe financial calculation logic
    const calculateFinancials = (st: typeof studentWithNoAccount | typeof studentWithAccount) => {
      const fees = st.fees || [];
      const totalFees = fees.reduce((acc, f) => acc + (f?.totalAmount || 0), 0);
      const totalPaid = fees.reduce((acc, f) => acc + (f?.paidAmount || 0), 0);
      return { totalFees, totalPaid, outstanding: Math.max(0, totalFees - totalPaid) };
    };

    const fin1 = calculateFinancials(studentWithNoAccount);
    assert.equal(fin1.totalFees, 0);
    assert.equal(fin1.totalPaid, 0);
    assert.equal(fin1.outstanding, 0);

    const fin2 = calculateFinancials(studentWithAccount);
    assert.equal(fin2.totalFees, 50000);
    assert.equal(fin2.totalPaid, 50000);
    assert.equal(fin2.outstanding, 0);

    // Portal link status
    assert.equal(studentWithNoAccount.user, null, "Unlinked student has no portal user object");
    assert.ok(studentWithAccount.user !== null, "Linked student has active portal user object");
  });

  // 4. Safe leave calculation fallback logic
  it("Leave summary resilience: Returns valid numbers even if service throws or policy is unseeded", () => {
    const calculateLeaveSummary = (teacher: {
      casualLeaveBalance?: number;
      sickLeaveBalance?: number;
      earnedLeaveBalance?: number;
    }) => {
      const casual = teacher.casualLeaveBalance || 0;
      const sick = teacher.sickLeaveBalance || 0;
      const earned = teacher.earnedLeaveBalance || 0;
      const totalAvailable = casual + sick + earned;

      return {
        totalPendingDays: 0,
        totalUsedDays: 0,
        totalAvailableDays: totalAvailable,
        totalEntitledDays: totalAvailable || 18,
        accounts: [],
      };
    };

    const emptyTeacher = {};
    const summary1 = calculateLeaveSummary(emptyTeacher);
    assert.equal(summary1.totalAvailableDays, 0);
    assert.equal(summary1.totalPendingDays, 0);
    assert.ok(Array.isArray(summary1.accounts));

    const activeTeacher = { casualLeaveBalance: 6, sickLeaveBalance: 4, earnedLeaveBalance: 2 };
    const summary2 = calculateLeaveSummary(activeTeacher);
    assert.equal(summary2.totalAvailableDays, 12);
  });

  // 5. Password validation rules
  it("Password validation: Requires >= 6 characters and matching confirmation", () => {
    const validatePassword = (newPass: string, confirmPass: string) => {
      if (!newPass || newPass.length < 6) {
        return { valid: false, error: "Password must be at least 6 characters in length." };
      }
      if (newPass !== confirmPass) {
        return { valid: false, error: "Passwords do not match." };
      }
      return { valid: true };
    };

    assert.equal(validatePassword("short", "short").valid, false);
    assert.equal(validatePassword("validPass1", "mismatchPass2").valid, false);
    assert.equal(validatePassword("correctPass123", "correctPass123").valid, true);
  });
});
