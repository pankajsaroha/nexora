import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { TeacherListClient } from "@/components/teachers/teacher-list-client";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [teachers, departments] = await Promise.all([
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      include: {
        department: true,
        sectionsAsClassTeacher: {
          include: { class: true },
        },
      },
      orderBy: { employeeId: "asc" },
    }),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canManage = hasPermission(user, PERMISSIONS.TEACHERS_CREATE);
  const canViewSalary =
    user.roleCode === "SUPER_ADMIN" ||
    user.roleCode === "PRINCIPAL" ||
    user.roleCode === "ACCOUNTANT" ||
    user.roleCode === "HR_ADMIN";

  const formattedTeachers = teachers.map((t) => ({
    id: t.id,
    employeeId: t.employeeId,
    fullName: t.fullName,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    phone: t.phone,
    designation: t.designation,
    departmentName: t.department?.name,
    joiningDate: t.joiningDate,
    employmentStatus: t.employmentStatus,
    basicSalary: t.basicSalary,
    casualLeaveBalance: t.casualLeaveBalance,
    sickLeaveBalance: t.sickLeaveBalance,
    earnedLeaveBalance: t.earnedLeaveBalance,
    classTeacherOf: t.sectionsAsClassTeacher[0]
      ? `${t.sectionsAsClassTeacher[0].class.name} (${t.sectionsAsClassTeacher[0].name})`
      : null,
  }));

  return (
    <TeacherListClient
      teachers={formattedTeachers}
      departments={departments.map((d) => ({ id: d.id, name: d.name, code: d.code }))}
      canManage={canManage}
      canViewSalary={canViewSalary}
    />
  );
}
