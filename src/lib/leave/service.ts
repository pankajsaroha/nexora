import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export interface LeaveBalanceSummaryItem {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  entitledDays: number;
  carriedOverDays: number;
  accruedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  maxBalance?: number | null;
  requiresProof: boolean;
}

export interface EmployeeLeaveSummaryResult {
  leaveYear: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
  };
  teacher: {
    id: string;
    fullName: string;
    employeeId: string;
    designation: string;
    joiningDate: Date;
  };
  totalEntitledDays: number;
  totalAccruedDays: number;
  totalAvailableDays: number;
  totalUsedDays: number;
  totalPendingDays: number;
  accounts: LeaveBalanceSummaryItem[];
  categories: LeaveBalanceSummaryItem[];
}

/**
 * Ensures a valid LeaveYear exists for the institution, defaulting to an academic year or annual cycle.
 */
export async function getOrCreateCurrentLeaveYear(institutionId: string) {
  let leaveYear = await prisma.leaveYear.findFirst({
    where: { institutionId, isCurrent: true },
    orderBy: { startDate: "desc" },
  });

  if (!leaveYear) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 3, 1); // 1st April
    const endDate = new Date(currentYear + 1, 2, 31, 23, 59, 59); // 31st March

    leaveYear = await prisma.leaveYear.create({
      data: {
        institutionId,
        name: `${currentYear}-${currentYear + 1}`,
        startDate,
        endDate,
        isCurrent: true,
      },
    });
  }

  return leaveYear;
}

/**
 * Initializes default institution leave types and policy if none exist.
 */
export async function ensureInstitutionLeavePolicy(institutionId: string, leaveYearId?: string) {
  let leaveTypes = await prisma.leaveType.findMany({
    where: { institutionId, isActive: true },
  });

  if (leaveTypes.length === 0) {
    const cl = await prisma.leaveType.create({
      data: {
        institutionId,
        name: "Casual Leave",
        code: "CL",
        isPaid: true,
        description: "General short-term personal time-off",
      },
    });

    const sl = await prisma.leaveType.create({
      data: {
        institutionId,
        name: "Sick / Medical Leave",
        code: "SL",
        isPaid: true,
        description: "Medical recuperation and health appointments",
      },
    });

    const el = await prisma.leaveType.create({
      data: {
        institutionId,
        name: "Earned / Privilege Leave",
        code: "EL",
        isPaid: true,
        description: "Annual vacation and service-accrued quota",
      },
    });

    leaveTypes = [cl, sl, el];
  }

  let policy = await prisma.leavePolicy.findFirst({
    where: { institutionId, staffType: "TEACHING", isActive: true },
    include: { rules: { include: { leaveType: true } } },
  });

  if (!policy) {
    const createdPolicy = await prisma.leavePolicy.create({
      data: {
        institutionId,
        name: "Standard Academic Faculty Policy",
        staffType: "TEACHING",
        employmentType: "ALL",
        leaveYearId,
        isActive: true,
      },
    });

    // Create default policy rules for each leave type
    for (const lt of leaveTypes) {
      let annualEntitlement = 12;
      let allowCarryForward = false;
      let maxCarryForwardDays = 0;
      let requiresProof = false;

      if (lt.code === "SL") {
        annualEntitlement = 10;
        requiresProof = true;
      } else if (lt.code === "EL") {
        annualEntitlement = 15;
        allowCarryForward = true;
        maxCarryForwardDays = 15;
      }

      await prisma.leavePolicyRule.create({
        data: {
          policyId: createdPolicy.id,
          leaveTypeId: lt.id,
          annualEntitlement,
          accrualFrequency: "ANNUAL",
          proRataEnabled: true,
          proRataBasis: "JOINING_DATE",
          roundingRule: "NEAREST_HALF",
          eligibilityRule: "IMMEDIATE",
          allowCarryForward,
          maxCarryForwardDays,
          requiresProof,
        },
      });
    }

    policy = await prisma.leavePolicy.findFirst({
      where: { id: createdPolicy.id },
      include: { rules: { include: { leaveType: true } } },
    });
  }

  return policy!;
}

/**
 * Calculates pro-rated entitlement based on joining date and policy rules.
 */
export function calculateProRataDays({
  annualEntitlement,
  leaveYearStart,
  leaveYearEnd,
  joiningDate,
  roundingRule = "NEAREST_HALF",
  proRataEnabled = true,
}: {
  annualEntitlement: number;
  leaveYearStart: Date;
  leaveYearEnd: Date;
  joiningDate: Date;
  roundingRule?: string;
  proRataEnabled?: boolean;
}): number {
  if (!proRataEnabled) return annualEntitlement;

  const joinTime = new Date(joiningDate).getTime();
  const startTime = new Date(leaveYearStart).getTime();
  const endTime = new Date(leaveYearEnd).getTime();

  // If joined on or before start of leave year, grant full entitlement
  if (joinTime <= startTime) {
    return annualEntitlement;
  }

  // If joined after leave year ended, 0 entitlement
  if (joinTime >= endTime) {
    return 0;
  }

  const totalYearDays = Math.max(1, Math.round((endTime - startTime) / (1000 * 60 * 60 * 24)));
  const activeDays = Math.max(0, Math.round((endTime - joinTime) / (1000 * 60 * 60 * 24)));
  const rawEntitlement = (activeDays / totalYearDays) * annualEntitlement;

  // Apply configurable rounding
  switch (roundingRule) {
    case "FLOOR":
      return Math.floor(rawEntitlement);
    case "CEILING":
      return Math.ceil(rawEntitlement);
    case "NEAREST_ONE":
      return Math.round(rawEntitlement);
    case "NEAREST_HALF":
      return Math.round(rawEntitlement * 2) / 2;
    case "EXACT":
    default:
      return Math.round(rawEntitlement * 100) / 100;
  }
}

/**
 * Initializes or reconciles an employee's leave accounts for the specified leave year.
 */
export async function initializeEmployeeLeaveAccounts({
  institutionId,
  teacherId,
  leaveYearId,
}: {
  institutionId: string;
  teacherId: string;
  leaveYearId?: string;
}) {
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, institutionId },
  });

  if (!teacher) {
    throw new Error("Teacher record not found for this institution.");
  }

  const leaveYear = leaveYearId
    ? await prisma.leaveYear.findFirst({ where: { id: leaveYearId, institutionId } })
    : await getOrCreateCurrentLeaveYear(institutionId);

  if (!leaveYear) {
    throw new Error("Valid leave year could not be found or created.");
  }

  await ensureInstitutionLeavePolicy(institutionId, leaveYear.id);

  // Find applicable policy rules
  const policy = await prisma.leavePolicy.findFirst({
    where: { institutionId, staffType: "TEACHING", isActive: true },
    include: {
      rules: {
        include: { leaveType: true },
      },
    },
  });

  if (!policy || policy.rules.length === 0) {
    return [];
  }

  const accounts = [];

  for (const rule of policy.rules) {
    let account = await prisma.employeeLeaveAccount.findUnique({
      where: {
        teacherId_leaveTypeId_leaveYearId: {
          teacherId,
          leaveTypeId: rule.leaveTypeId,
          leaveYearId: leaveYear.id,
        },
      },
    });

    if (!account) {
      const calculatedEntitlement = calculateProRataDays({
        annualEntitlement: rule.annualEntitlement,
        leaveYearStart: leaveYear.startDate,
        leaveYearEnd: leaveYear.endDate,
        joiningDate: teacher.joiningDate || new Date(),
        roundingRule: rule.roundingRule,
        proRataEnabled: rule.proRataEnabled,
      });

      account = await prisma.$transaction(async (tx) => {
        const createdAccount = await tx.employeeLeaveAccount.create({
          data: {
            institutionId,
            teacherId,
            leaveTypeId: rule.leaveTypeId,
            leaveYearId: leaveYear.id,
            entitledDays: calculatedEntitlement,
            carriedOverDays: 0,
            accruedDays: calculatedEntitlement,
            usedDays: 0,
            pendingDays: 0,
            availableDays: calculatedEntitlement,
          },
        });

        await tx.leaveTransaction.create({
          data: {
            accountId: createdAccount.id,
            type: teacher.joiningDate > leaveYear.startDate ? "PRORATA_GRANT" : "OPENING_BALANCE",
            days: calculatedEntitlement,
            balanceAfter: calculatedEntitlement,
            remarks: `Initial entitlement grant (${calculatedEntitlement} days) under ${policy.name}.`,
          },
        });

        return createdAccount;
      });
    }

    accounts.push(account);
  }

  return accounts;
}

/**
 * Single Source of Truth Service: Returns the authoritative leave summary for any staff member.
 */
export async function getEmployeeLeaveSummary({
  institutionId,
  teacherId,
  leaveYearId,
}: {
  institutionId: string;
  teacherId: string;
  leaveYearId?: string;
}): Promise<EmployeeLeaveSummaryResult> {
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, institutionId },
    select: {
      id: true,
      fullName: true,
      employeeId: true,
      designation: true,
      joiningDate: true,
    },
  });

  if (!teacher) {
    throw new Error("Teacher record not found.");
  }

  const leaveYear = leaveYearId
    ? await prisma.leaveYear.findFirst({ where: { id: leaveYearId, institutionId } })
    : await getOrCreateCurrentLeaveYear(institutionId);

  if (!leaveYear) {
    throw new Error("No active leave year found.");
  }

  // Ensure accounts are provisioned
  await initializeEmployeeLeaveAccounts({
    institutionId,
    teacherId,
    leaveYearId: leaveYear.id,
  });

  const accounts = await prisma.employeeLeaveAccount.findMany({
    where: {
      institutionId,
      teacherId,
      leaveYearId: leaveYear.id,
    },
    include: {
      leaveType: true,
    },
    orderBy: { leaveType: { name: "asc" } },
  });

  const formattedAccounts: LeaveBalanceSummaryItem[] = accounts.map((acc) => ({
    leaveTypeId: acc.leaveTypeId,
    leaveTypeName: acc.leaveType.name,
    leaveTypeCode: acc.leaveType.code,
    isPaid: acc.leaveType.isPaid,
    entitledDays: acc.entitledDays,
    carriedOverDays: acc.carriedOverDays,
    accruedDays: acc.accruedDays,
    usedDays: acc.usedDays,
    pendingDays: acc.pendingDays,
    availableDays: acc.availableDays,
    requiresProof: acc.leaveType.code === "SL",
  }));

  const totalEntitledDays = formattedAccounts.reduce((acc, item) => acc + item.entitledDays, 0);
  const totalAccruedDays = formattedAccounts.reduce((acc, item) => acc + item.accruedDays, 0);
  const totalAvailableDays = formattedAccounts.reduce((acc, item) => acc + item.availableDays, 0);
  const totalUsedDays = formattedAccounts.reduce((acc, item) => acc + item.usedDays, 0);
  const totalPendingDays = formattedAccounts.reduce((acc, item) => acc + item.pendingDays, 0);

  return {
    leaveYear: {
      id: leaveYear.id,
      name: leaveYear.name,
      startDate: leaveYear.startDate,
      endDate: leaveYear.endDate,
      isCurrent: leaveYear.isCurrent,
    },
    teacher: {
      id: teacher.id,
      fullName: teacher.fullName,
      employeeId: teacher.employeeId,
      designation: teacher.designation,
      joiningDate: teacher.joiningDate,
    },
    totalEntitledDays,
    totalAccruedDays,
    totalAvailableDays,
    totalUsedDays,
    totalPendingDays,
    accounts: formattedAccounts,
    categories: formattedAccounts,
  };
}

/**
 * Submits a new LeaveRequest with validation against the employee's active leave account.
 */
export async function submitLeaveRequest({
  institutionId,
  teacherId,
  leaveTypeId,
  startDate,
  endDate,
  totalDays,
  reason,
}: {
  institutionId: string;
  teacherId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
}) {
  if (totalDays <= 0) {
    throw new Error("Total leave duration must be at least 1 day.");
  }

  const leaveYear = await getOrCreateCurrentLeaveYear(institutionId);

  // Ensure accounts are initialized
  await initializeEmployeeLeaveAccounts({ institutionId, teacherId, leaveYearId: leaveYear.id });

  const account = await prisma.employeeLeaveAccount.findUnique({
    where: {
      teacherId_leaveTypeId_leaveYearId: {
        teacherId,
        leaveTypeId,
        leaveYearId: leaveYear.id,
      },
    },
    include: { leaveType: true },
  });

  if (!account) {
    throw new Error("No leave account found for this category.");
  }

  if (account.availableDays < totalDays) {
    throw new Error(
      `Insufficient leave balance. You have ${account.availableDays} ${account.leaveType.name} days available, but requested ${totalDays} days.`
    );
  }

  return await prisma.$transaction(async (tx) => {
    const leaveRequest = await tx.leaveRequest.create({
      data: {
        institutionId,
        teacherId,
        leaveTypeId,
        leaveYearId: leaveYear.id,
        employeeLeaveAccountId: account.id,
        leaveType: account.leaveType.code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason: reason.trim(),
        status: "PENDING",
      },
      include: {
        leaveTypeRel: true,
        teacher: true,
      },
    });

    // Mark as pending on account
    await tx.employeeLeaveAccount.update({
      where: { id: account.id },
      data: {
        pendingDays: { increment: totalDays },
      },
    });

    return leaveRequest;
  });
}

/**
 * Approves, rejects, or cancels a LeaveRequest atomically, ensuring accurate ledger transactions.
 */
export async function reviewLeaveRequest({
  institutionId,
  requestId,
  reviewerUserId,
  reviewerName,
  reviewerEmail,
  status,
  rejectionReason,
}: {
  institutionId: string;
  requestId: string;
  reviewerUserId: string;
  reviewerName?: string;
  reviewerEmail?: string;
  status: "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
}) {
  const request = await prisma.leaveRequest.findFirst({
    where: { id: requestId, institutionId },
    include: {
      employeeLeaveAccount: {
        include: { leaveType: true },
      },
      teacher: true,
    },
  });

  if (!request) {
    throw new Error("Leave request not found.");
  }

  if (request.status !== "PENDING" && status !== "CANCELLED") {
    throw new Error(`This leave request has already been processed as ${request.status}.`);
  }

  const accountId = request.employeeLeaveAccountId;
  const totalDays = request.totalDays;

  return await prisma.$transaction(async (tx) => {
    let updatedAccount = null;

    if (status === "APPROVED") {
      if (!accountId) {
        throw new Error("No linked leave account found for this request.");
      }

      const currentAcc = await tx.employeeLeaveAccount.findUnique({
        where: { id: accountId },
      });

      if (!currentAcc || currentAcc.availableDays < totalDays) {
        throw new Error("Cannot approve request: Insufficient available balance on employee account.");
      }

      const newAvailable = currentAcc.availableDays - totalDays;
      const newUsed = currentAcc.usedDays + totalDays;
      const newPending = Math.max(0, currentAcc.pendingDays - totalDays);

      updatedAccount = await tx.employeeLeaveAccount.update({
        where: { id: accountId },
        data: {
          availableDays: newAvailable,
          usedDays: newUsed,
          pendingDays: newPending,
        },
      });

      // Create Immutable Ledger Debit
      await tx.leaveTransaction.create({
        data: {
          accountId,
          type: "LEAVE_DEBIT",
          days: -totalDays,
          balanceAfter: newAvailable,
          leaveRequestId: request.id,
          remarks: `Approved ${totalDays} day(s) ${request.leaveType} leave (${new Date(
            request.startDate
          ).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}).`,
          createdByUserId: reviewerUserId,
        },
      });
    } else if (status === "REJECTED") {
      if (accountId) {
        const currentAcc = await tx.employeeLeaveAccount.findUnique({ where: { id: accountId } });
        if (currentAcc) {
          updatedAccount = await tx.employeeLeaveAccount.update({
            where: { id: accountId },
            data: {
              pendingDays: Math.max(0, currentAcc.pendingDays - totalDays),
            },
          });
        }
      }
    } else if (status === "CANCELLED") {
      // If was previously APPROVED, reverse the debit
      if (request.status === "APPROVED" && accountId) {
        const currentAcc = await tx.employeeLeaveAccount.findUnique({ where: { id: accountId } });
        if (currentAcc) {
          const newAvailable = currentAcc.availableDays + totalDays;
          const newUsed = Math.max(0, currentAcc.usedDays - totalDays);

          updatedAccount = await tx.employeeLeaveAccount.update({
            where: { id: accountId },
            data: {
              availableDays: newAvailable,
              usedDays: newUsed,
            },
          });

          await tx.leaveTransaction.create({
            data: {
              accountId,
              type: "LEAVE_REVERSAL",
              days: totalDays,
              balanceAfter: newAvailable,
              leaveRequestId: request.id,
              remarks: `Reversed ${totalDays} day(s) ${request.leaveType} leave due to cancellation.`,
              createdByUserId: reviewerUserId,
            },
          });
        }
      } else if (request.status === "PENDING" && accountId) {
        const currentAcc = await tx.employeeLeaveAccount.findUnique({ where: { id: accountId } });
        if (currentAcc) {
          updatedAccount = await tx.employeeLeaveAccount.update({
            where: { id: accountId },
            data: {
              pendingDays: Math.max(0, currentAcc.pendingDays - totalDays),
            },
          });
        }
      }
    }

    const updatedRequest = await tx.leaveRequest.update({
      where: { id: request.id },
      data: {
        status,
        approvedByUserId: reviewerUserId,
        rejectionReason: status === "REJECTED" ? rejectionReason?.trim() || "Rejected by administrator" : null,
      },
      include: {
        leaveTypeRel: true,
        teacher: true,
      },
    });

    await logAuditEvent({
      institutionId,
      userId: reviewerUserId,
      userName: reviewerName || "Admin",
      userEmail: reviewerEmail || "admin@institution.edu",
      action: status === "APPROVED" ? "LEAVE_APPROVED" : status === "REJECTED" ? "LEAVE_REJECTED" : "LEAVE_CANCELLED",
      entity: "LeaveRequest",
      entityId: request.id,
      details: {
        teacher: request.teacher.fullName,
        days: totalDays,
        leaveType: request.leaveType,
        status,
      },
    });

    return { request: updatedRequest, account: updatedAccount };
  });
}

/**
 * Creates an audited manual balance adjustment on an employee's leave account.
 */
export async function createLeaveAdjustment({
  institutionId,
  teacherId,
  leaveTypeId,
  leaveYearId,
  days,
  remarks,
  actorUserId,
  actorName,
  actorEmail,
}: {
  institutionId: string;
  teacherId: string;
  leaveTypeId: string;
  leaveYearId?: string;
  days: number;
  remarks: string;
  actorUserId: string;
  actorName?: string;
  actorEmail?: string;
}) {
  if (days === 0) {
    throw new Error("Adjustment days cannot be zero.");
  }
  if (!remarks.trim()) {
    throw new Error("Adjustment reason/remarks are mandatory for audit compliance.");
  }

  const leaveYear = leaveYearId
    ? await prisma.leaveYear.findFirst({ where: { id: leaveYearId, institutionId } })
    : await getOrCreateCurrentLeaveYear(institutionId);

  if (!leaveYear) {
    throw new Error("Active leave year not found.");
  }

  await initializeEmployeeLeaveAccounts({ institutionId, teacherId, leaveYearId: leaveYear.id });

  const account = await prisma.employeeLeaveAccount.findUnique({
    where: {
      teacherId_leaveTypeId_leaveYearId: {
        teacherId,
        leaveTypeId,
        leaveYearId: leaveYear.id,
      },
    },
    include: { leaveType: true, teacher: true },
  });

  if (!account) {
    throw new Error("Employee leave account not found.");
  }

  const newAvailable = account.availableDays + days;
  if (newAvailable < 0) {
    throw new Error(`Adjustment of ${days} days would result in a negative balance (${newAvailable}).`);
  }

  return await prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.employeeLeaveAccount.update({
      where: { id: account.id },
      data: {
        availableDays: newAvailable,
        entitledDays: { increment: days },
      },
    });

    const transaction = await tx.leaveTransaction.create({
      data: {
        accountId: account.id,
        type: "ADJUSTMENT",
        days,
        balanceAfter: newAvailable,
        remarks: remarks.trim(),
        createdByUserId: actorUserId,
      },
    });

    await logAuditEvent({
      institutionId,
      userId: actorUserId,
      userName: actorName || "Admin",
      userEmail: actorEmail || "admin@institution.edu",
      action: "LEAVE_ADJUSTMENT",
      entity: "EmployeeLeaveAccount",
      entityId: account.id,
      details: {
        teacher: account.teacher.fullName,
        leaveType: account.leaveType.name,
        adjustmentDays: days,
        balanceAfter: newAvailable,
        reason: remarks,
      },
    });

    return { account: updatedAccount, transaction };
  });
}
