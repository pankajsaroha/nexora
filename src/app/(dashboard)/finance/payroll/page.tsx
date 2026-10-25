import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { PayrollClient } from "@/components/payroll/payroll-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage({
  searchParams,
}: {
  searchParams?: { month?: string; year?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const selectedMonth = searchParams?.month ? parseInt(searchParams.month, 10) : 9;
  const selectedYear = searchParams?.year ? parseInt(searchParams.year, 10) : 2026;

  // Teacher sees only own payroll; Admin/Accountant/Principal sees all
  const payrollWhere: any = {
    institutionId: user.institutionId,
    month: selectedMonth,
    year: selectedYear,
  };

  const teacherWhere: any = {
    institutionId: user.institutionId,
    employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] },
  };

  if (user.roleCode === "TEACHER" && user.teacherId) {
    payrollWhere.teacherId = user.teacherId;
    teacherWhere.id = user.teacherId;
  }

  // Fetch all active staff and existing payroll records concurrently
  const [teachers, payrolls] = await Promise.all([
    prisma.teacher.findMany({
      where: teacherWhere,
      include: { department: true },
      orderBy: { employeeId: "asc" },
    }),
    prisma.payroll.findMany({
      where: payrollWhere,
      include: {
        teacher: {
          include: { department: true },
        },
      },
      orderBy: { teacher: { employeeId: "asc" } },
    }),
  ]);

  const canManage = hasPermission(user, PERMISSIONS.PAYROLL_PROCESS);

  // Map existing payroll records by teacher ID
  const payrollMap = new Map<string, (typeof payrolls)[0]>();
  for (const p of payrolls) {
    payrollMap.set(p.teacherId, p);
  }

  const formattedPayrolls: any[] = [];
  const processedTeacherIds = new Set<string>();

  // 1. Process all active teachers in the institution
  for (const t of teachers) {
    processedTeacherIds.add(t.id);
    const existing = payrollMap.get(t.id);

    if (existing) {
      formattedPayrolls.push({
        id: existing.id,
        teacherId: t.id,
        teacherName: existing.teacher.fullName,
        employeeId: existing.teacher.employeeId,
        designation: existing.teacher.designation,
        departmentName: existing.teacher.department?.name,
        month: existing.month,
        year: existing.year,
        basicSalary: existing.basicSalary,
        allowances: existing.allowances,
        deductions: existing.deductions,
        netSalary: existing.netSalary,
        status: existing.status as any,
        paymentDate: existing.paymentDate,
        paymentMethod: existing.paymentMethod,
        transactionRef: existing.transactionRef,
        bankAccountNumber: t.bankAccountNumber,
        bankIfsc: t.bankIfsc,
      });
    } else {
      // Staff member has not had payroll processed for this month yet:
      // Show draft/unprocessed status with contractual basic salary from their staff record
      formattedPayrolls.push({
        id: `draft-${t.id}`,
        teacherId: t.id,
        teacherName: t.fullName,
        employeeId: t.employeeId,
        designation: t.designation,
        departmentName: t.department?.name || "Academics",
        month: selectedMonth,
        year: selectedYear,
        basicSalary: t.basicSalary || 0,
        allowances: 0,
        deductions: 0,
        netSalary: t.basicSalary || 0,
        status: "DRAFT" as const,
        paymentDate: null,
        paymentMethod: t.bankAccountNumber ? "BANK_TRANSFER" : null,
        transactionRef: null,
        bankAccountNumber: t.bankAccountNumber,
        bankIfsc: t.bankIfsc,
      });
    }
  }

  // 2. Include any historical payroll records for teachers who may no longer be active
  for (const p of payrolls) {
    if (!processedTeacherIds.has(p.teacherId)) {
      formattedPayrolls.push({
        id: p.id,
        teacherId: p.teacherId,
        teacherName: p.teacher.fullName,
        employeeId: p.teacher.employeeId,
        designation: p.teacher.designation,
        departmentName: p.teacher.department?.name,
        month: p.month,
        year: p.year,
        basicSalary: p.basicSalary,
        allowances: p.allowances,
        deductions: p.deductions,
        netSalary: p.netSalary,
        status: p.status as any,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        transactionRef: p.transactionRef,
        bankAccountNumber: p.teacher.bankAccountNumber,
        bankIfsc: p.teacher.bankIfsc,
      });
    }
  }

  return (
    <PayrollClient
      payrolls={formattedPayrolls}
      canManage={canManage}
      selectedMonth={selectedMonth.toString()}
      selectedYear={selectedYear.toString()}
    />
  );
}
