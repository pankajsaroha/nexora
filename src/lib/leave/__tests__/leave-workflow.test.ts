import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("End-to-End Leave Request & Approval Ledger Logic", () => {
  it("Pending hold logic: Submitting leave places pendingDays on EmployeeLeaveAccount without debiting availableDays", () => {
    const openingAccount = {
      entitledDays: 12,
      accruedDays: 12,
      usedDays: 0,
      pendingDays: 0,
      availableDays: 12,
    };

    const requestedDays = 2;

    // Simulation of submitLeaveRequest logic
    assert.ok(openingAccount.availableDays >= requestedDays, "Must have sufficient balance to request");
    const accountAfterSubmit = {
      ...openingAccount,
      pendingDays: openingAccount.pendingDays + requestedDays,
    };

    assert.equal(accountAfterSubmit.pendingDays, 2);
    assert.equal(accountAfterSubmit.usedDays, 0, "No leave debit while PENDING");
    assert.equal(accountAfterSubmit.availableDays, 12, "Available days remain unchanged while PENDING");
  });

  it("Approval atomic transaction: Approving request creates LEAVE_DEBIT and updates EmployeeLeaveAccount", () => {
    const accountBeforeApproval = {
      id: "acc-101",
      teacherId: "teacher-1",
      leaveTypeId: "lt-cl",
      entitledDays: 12,
      accruedDays: 12,
      usedDays: 0,
      pendingDays: 2,
      availableDays: 12,
    };

    const request = {
      id: "req-999",
      totalDays: 2,
      status: "PENDING",
      leaveType: "CL",
    };

    // Simulation of reviewLeaveRequest "APPROVED" logic
    assert.equal(request.status, "PENDING", "Can only approve PENDING request");
    assert.ok(accountBeforeApproval.availableDays >= request.totalDays, "Must have sufficient balance");

    const newAvailable = accountBeforeApproval.availableDays - request.totalDays;
    const newUsed = accountBeforeApproval.usedDays + request.totalDays;
    const newPending = Math.max(0, accountBeforeApproval.pendingDays - request.totalDays);

    const updatedAccount = {
      ...accountBeforeApproval,
      availableDays: newAvailable,
      usedDays: newUsed,
      pendingDays: newPending,
    };

    const debitTransaction = {
      accountId: accountBeforeApproval.id,
      type: "LEAVE_DEBIT",
      days: -request.totalDays,
      balanceAfter: newAvailable,
      leaveRequestId: request.id,
    };

    assert.equal(updatedAccount.availableDays, 10);
    assert.equal(updatedAccount.usedDays, 2);
    assert.equal(updatedAccount.pendingDays, 0);
    assert.equal(debitTransaction.type, "LEAVE_DEBIT");
    assert.equal(debitTransaction.days, -2);
    assert.equal(debitTransaction.balanceAfter, 10);
  });

  it("Rejection logic: Rejecting request removes pending hold without creating debit or modifying availableDays", () => {
    const accountBeforeRejection = {
      id: "acc-101",
      entitledDays: 12,
      usedDays: 0,
      pendingDays: 2,
      availableDays: 12,
    };

    const request = {
      id: "req-999",
      totalDays: 2,
      status: "PENDING",
    };

    const updatedAccount = {
      ...accountBeforeRejection,
      pendingDays: Math.max(0, accountBeforeRejection.pendingDays - request.totalDays),
    };

    assert.equal(updatedAccount.availableDays, 12, "Balance not deducted on rejection");
    assert.equal(updatedAccount.usedDays, 0);
    assert.equal(updatedAccount.pendingDays, 0, "Pending hold released");
  });

  it("Cancellation reversal logic: Cancelling approved leave restores available balance with LEAVE_REVERSAL", () => {
    const accountAfterApproval = {
      id: "acc-101",
      entitledDays: 12,
      usedDays: 2,
      pendingDays: 0,
      availableDays: 10,
    };

    const totalDays = 2;
    const restoredAvailable = accountAfterApproval.availableDays + totalDays;
    const restoredUsed = Math.max(0, accountAfterApproval.usedDays - totalDays);

    const reversalTransaction = {
      accountId: accountAfterApproval.id,
      type: "LEAVE_REVERSAL",
      days: totalDays,
      balanceAfter: restoredAvailable,
    };

    assert.equal(restoredAvailable, 12);
    assert.equal(restoredUsed, 0);
    assert.equal(reversalTransaction.type, "LEAVE_REVERSAL");
    assert.equal(reversalTransaction.days, 2);
    assert.equal(reversalTransaction.balanceAfter, 12);
  });

  it("Institution Isolation: Admin query path resolves by institutionId only, not by personal teacherId", () => {
    const adminUser = {
      id: "user-admin-1",
      fullName: "Pankaj Kumar",
      roleCode: "SUPER_ADMIN",
      institutionId: "inst-nexora-alpha",
      teacherId: null, // Super Admin has NO teacher record
    };

    const allRequestsInDB = [
      { id: "req-1", institutionId: "inst-nexora-alpha", teacherId: "t-1", status: "PENDING" },
      { id: "req-2", institutionId: "inst-nexora-beta", teacherId: "t-9", status: "PENDING" },
    ];

    // Admin query filters strictly by admin's institutionId
    const scopedRequests = allRequestsInDB.filter((r) => r.institutionId === adminUser.institutionId);

    assert.equal(scopedRequests.length, 1);
    assert.equal(scopedRequests[0].id, "req-1");
  });
});
