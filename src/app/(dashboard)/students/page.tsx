import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { StudentListClient } from "@/components/students/student-list-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Strict Tenant and Role Scoping:
  // If Parent: only fetch authorized children
  // If Student: only fetch self
  // If Teacher/Principal/Admin: fetch institution students

  let whereClause: any = {
    institutionId: user.institutionId,
  };

  if (user.roleCode === "PARENT" && user.guardianId) {
    whereClause = {
      institutionId: user.institutionId,
      guardians: {
        some: { guardianId: user.guardianId },
      },
    };
  } else if (user.roleCode === "STUDENT" && user.studentId) {
    whereClause = {
      institutionId: user.institutionId,
      id: user.studentId,
    };
  }

  if (searchParams?.search) {
    whereClause.OR = [
      { fullName: { contains: searchParams.search } },
      { admissionNumber: { contains: searchParams.search } },
    ];
  }

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where: whereClause,
      include: {
        currentClass: true,
        currentSection: {
          include: { classTeacher: true },
        },
        guardians: {
          include: { guardian: true },
        },
      },
      orderBy: { admissionNumber: "asc" },
      take: 200,
    }),
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: { sections: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.STUDENTS_CREATE);

  const formattedStudents = students.map((st) => ({
    id: st.id,
    admissionNumber: st.admissionNumber,
    rollNumber: st.rollNumber,
    firstName: st.firstName,
    lastName: st.lastName,
    fullName: st.fullName,
    email: st.email,
    phone: st.phone,
    gender: st.gender,
    dateOfBirth: st.dateOfBirth,
    bloodGroup: st.bloodGroup,
    address: st.address,
    className: st.currentClass.name,
    sectionName: st.currentSection.name,
    classTeacherName: st.currentSection.classTeacher?.fullName,
    guardianName: st.guardians[0]?.guardian?.fullName,
    guardianPhone: st.guardians[0]?.guardian?.phone,
    guardianRelation: st.guardians[0]?.guardian?.relation,
    status: st.status,
  }));

  const formattedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name })),
  }));

  return (
    <StudentListClient
      students={formattedStudents}
      classes={formattedClasses}
      canCreate={canCreate}
    />
  );
}
