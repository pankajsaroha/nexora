import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import {
  ensureInstitutionLeavePolicy,
  getEmployeeLeaveSummary,
  getOrCreateCurrentLeaveYear,
} from "@/lib/leave/service";
import { AdminLeaveManagementClient } from "@/components/leaves/admin-leave-management-client";
import { FacultyLeavesClient } from "@/components/leaves/faculty-leaves-client";

export const dynamic = "force-dynamic";

export default async function AttendanceLeavesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const isAdminOrReviewer = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "HR_ADMIN",
    "DIRECTOR",
    "DEAN",
  ].includes(user.roleCode || "") || hasPermission(user, PERMISSIONS.LEAVE_APPROVE);

  // 1. ADMIN / SUPER ADMIN / PRINCIPAL VIEW: Institution-level Leave Management
  if (isAdminOrReviewer) {
    const [leaveYear, policy] = await Promise.all([
      getOrCreateCurrentLeaveYear(user.institutionId),
      ensureInstitutionLeavePolicy(user.institutionId),
    ]);

    const [teachers, leaveRequests, leaveTypes] = await Promise.all([
      prisma.teacher.findMany({
        where: { institutionId: user.institutionId },
        include: { department: true },
        orderBy: { employeeId: "asc" },
      }),
      prisma.leaveRequest.findMany({
        where: { institutionId: user.institutionId },
        include: { teacher: true, leaveTypeRel: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leaveType.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { code: "asc" },
      }),
    ]);

    const canApprove = hasPermission(user, PERMISSIONS.LEAVE_APPROVE) || isAdminOrReviewer;

    // Fetch summaries for all teachers across the institution
    const staffBalances = await Promise.all(
      teachers.map(async (t) => {
        try {
          const summary = await getEmployeeLeaveSummary({
            institutionId: user.institutionId,
            teacherId: t.id,
            leaveYearId: leaveYear.id,
          });

          return {
            teacherId: t.id,
            employeeId: t.employeeId,
            fullName: t.fullName,
            designation: t.designation || "Faculty",
            departmentName: t.department?.name || "Academics",
            totalEntitled: summary.totalEntitledDays,
            totalAccrued: summary.totalAccruedDays,
            totalUsed: summary.totalUsedDays,
            totalPending: summary.totalPendingDays,
            totalAvailable: summary.totalAvailableDays,
            categories: summary.categories.map((c) => ({
              leaveTypeId: c.leaveTypeId,
              code: c.leaveTypeCode,
              available: c.availableDays,
              entitled: c.entitledDays,
            })),
          };
        } catch (err) {
          return {
            teacherId: t.id,
            employeeId: t.employeeId,
            fullName: t.fullName,
            designation: t.designation || "Faculty",
            departmentName: t.department?.name || "Academics",
            totalEntitled: 0,
            totalAccrued: 0,
            totalUsed: 0,
            totalPending: 0,
            totalAvailable: 0,
            categories: [],
          };
        }
      })
    );

    const formattedRequests = leaveRequests.map((lr) => ({
      id: lr.id,
      teacherId: lr.teacherId,
      teacherName: lr.teacher.fullName,
      teacherEmployeeId: lr.teacher.employeeId,
      teacherDesignation: lr.teacher.designation || "Faculty",
      leaveType: lr.leaveTypeRel?.name || lr.leaveType,
      leaveTypeCode: lr.leaveTypeRel?.code || lr.leaveType,
      startDate: lr.startDate.toISOString(),
      endDate: lr.endDate.toISOString(),
      totalDays: lr.totalDays,
      reason: lr.reason,
      status: lr.status,
      rejectionReason: lr.rejectionReason,
      createdAt: lr.createdAt.toISOString(),
      appliedDate: lr.createdAt.toISOString(),
    }));

    const formattedPolicy = {
      id: policy.id,
      name: policy.name,
      staffType: policy.staffType,
      employmentType: policy.employmentType || "ALL",
      isActive: policy.isActive,
      leaveYearName: leaveYear.name,
      rules: policy.rules.map((r) => ({
        id: r.id,
        leaveTypeId: r.leaveTypeId,
        leaveTypeName: r.leaveType?.name || "Leave",
        leaveTypeCode: r.leaveType?.code || "LV",
        annualEntitlement: r.annualEntitlement,
        accrualFrequency: r.accrualFrequency,
        proRataEnabled: r.proRataEnabled,
        proRataBasis: r.proRataBasis,
        roundingRule: r.roundingRule,
        allowCarryForward: r.allowCarryForward,
        maxCarryForwardDays: r.maxCarryForwardDays,
        maxBalance: r.maxBalance || 0,
        requiresProof: r.requiresProof,
      })),
    };

    const formattedLeaveTypes = leaveTypes.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      isPaid: t.isPaid,
      description: t.description,
      isActive: t.isActive,
    }));

    return (
      <AdminLeaveManagementClient
        leaveRequests={formattedRequests}
        policy={formattedPolicy}
        leaveTypes={formattedLeaveTypes}
        leaveYear={{
          id: leaveYear.id,
          name: leaveYear.name,
          startDate: leaveYear.startDate.toISOString(),
          endDate: leaveYear.endDate.toISOString(),
          isCurrent: leaveYear.isCurrent,
        }}
        staffBalances={staffBalances}
        canApprove={canApprove}
      />
    );
  }

  // 2. TEACHER / FACULTY VIEW: Individual Leave Portal
  const teacher = await prisma.teacher.findFirst({
    where: {
      institutionId: user.institutionId,
      OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
    },
    include: {
      department: true,
      leaveRequests: {
        where: { institutionId: user.institutionId },
        include: { leaveTypeRel: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        Faculty record not found for your account in this institution. Please contact your administrator.
      </div>
    );
  }

  let leaveSummary = null;
  try {
    leaveSummary = await getEmployeeLeaveSummary({
      institutionId: user.institutionId,
      teacherId: teacher.id,
    });
  } catch (err) {
    console.error("Failed to load employee leave summary:", err);
  }

  const leaveRequests = (teacher.leaveRequests || []).map((lr) => ({
    id: lr.id,
    leaveType: lr.leaveTypeRel?.name || lr.leaveType,
    startDate: lr.startDate.toISOString(),
    endDate: lr.endDate.toISOString(),
    totalDays: lr.totalDays,
    reason: lr.reason,
    status: lr.status,
    rejectionReason: lr.rejectionReason,
    createdAt: lr.createdAt.toISOString(),
  }));

  return (
    <FacultyLeavesClient
      teacher={{
        id: teacher.id,
        fullName: teacher.fullName,
        designation: teacher.designation || "Faculty",
      }}
      leaveSummary={leaveSummary}
      leaveRequests={leaveRequests}
    />
  );
}
