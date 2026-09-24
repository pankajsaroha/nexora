import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { PayrollClient } from "@/components/payroll/payroll-client";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Teacher sees only own payroll; Admin/Accountant/Principal sees all
  let whereClause: any = {
    institutionId: user.institutionId,
  };

  if (user.roleCode === "TEACHER" && user.teacherId) {
    whereClause.teacherId = user.teacherId;
  }

  const payrolls = await prisma.payroll.findMany({
    where: whereClause,
    include: {
      teacher: {
        include: { department: true },
      },
    },
    orderBy: { teacher: { employeeId: "asc" } },
  });

  const canManage = hasPermission(user, PERMISSIONS.PAYROLL_PROCESS);

  const formattedPayrolls = payrolls.map((p) => ({
    id: p.id,
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
  }));

  return <PayrollClient payrolls={formattedPayrolls} canManage={canManage} />;
}
