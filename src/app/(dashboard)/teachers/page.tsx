import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { TeacherListClient } from "@/components/teachers/teacher-list-client";
import { parseStaffMetadata } from "@/lib/staff";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [rawTeachers, departments, academicYears, leaveRequestsCount] = await Promise.all([
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      include: {
        department: true,
        user: {
          select: { id: true, email: true, roleCode: true, isActive: true },
        },
        sectionsAsClassTeacher: {
          include: { class: true },
        },
        teacherAssignments: {
          include: { subject: true, section: { include: { class: true } } },
        },
        attendanceRecords: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          take: 1,
        },
      },
      orderBy: [{ employmentStatus: "asc" }, { employeeId: "asc" }],
    }),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { startDate: "desc" },
    }),
    prisma.leaveRequest.count({
      where: { institutionId: user.institutionId, status: "PENDING" },
    }),
  ]);

  const canManage = hasPermission(user, PERMISSIONS.TEACHERS_CREATE);
  const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
  const canViewSalary = [
    "SUPER_ADMIN",
    "PRINCIPAL",
    "ADMIN",
    "ACCOUNTANT",
    "HR_ADMIN",
  ].includes(user.roleCode || "");

  let teachingCount = 0;
  let nonTeachingCount = 0;
  let activeCount = 0;
  let onLeaveCount = 0;

  const formattedTeachers = rawTeachers.map((t) => {
    const meta = parseStaffMetadata(t.qualification);
    const isTeaching = meta.staffType !== "NON_TEACHING";

    if (isTeaching) teachingCount++;
    else nonTeachingCount++;

    if (t.employmentStatus === "ACTIVE") activeCount++;
    if (t.employmentStatus === "ON_LEAVE") onLeaveCount++;

    const todayAttendance = t.attendanceRecords[0]?.status || "NOT_MARKED";

    return {
      id: t.id,
      employeeId: t.employeeId,
      fullName: t.fullName,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone,
      designation: t.designation,
      departmentId: t.departmentId,
      departmentName: t.department?.name || "General Department",
      departmentCode: t.department?.code,
      joiningDate: t.joiningDate,
      employmentStatus: t.employmentStatus,
      basicSalary: t.basicSalary,
      staffType: meta.staffType || "TEACHING",
      employmentType: meta.employmentType || "PERMANENT",
      photoUrl: t.photoUrl,
      hasPortalAccess: !!t.userId && !!t.user?.isActive,
      portalRole: t.user?.roleCode || null,
      classTeacherOf: t.sectionsAsClassTeacher[0]
        ? `${t.sectionsAsClassTeacher[0].class.name} (${t.sectionsAsClassTeacher[0].name})`
        : null,
      assignmentsCount: t.teacherAssignments.length,
      todayAttendance,
      casualLeaveBalance: t.casualLeaveBalance,
      sickLeaveBalance: t.sickLeaveBalance,
      earnedLeaveBalance: t.earnedLeaveBalance,
      rawMetadata: meta,
      userAccount: t.user,
    };
  });

  const hrStats = {
    totalStaff: rawTeachers.length,
    teachingCount,
    nonTeachingCount,
    activeCount,
    onLeaveCount,
    pendingLeaves: leaveRequestsCount,
  };

  return (
    <TeacherListClient
      teachers={formattedTeachers}
      departments={departments.map((d) => ({ id: d.id, name: d.name, code: d.code }))}
      academicYears={academicYears.map((ay) => ({ id: ay.id, name: ay.name, isCurrent: ay.isCurrent }))}
      hrStats={hrStats}
      canManage={canManage}
      canViewSalary={canViewSalary}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
