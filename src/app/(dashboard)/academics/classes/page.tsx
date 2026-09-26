import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassesClient } from "@/components/classes/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [classes, departments, academicYears, feeCategories] = await Promise.all([
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: {
        department: true,
        academicYear: true,
        sections: {
          include: {
            classTeacher: true,
            students: true,
          },
        },
        feeStructures: {
          include: {
            feeCategory: true,
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { startDate: "desc" },
    }),
    prisma.feeCategory.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    level: c.level,
    durationYears: c.durationYears,
    type: c.type,
    departmentName: c.department?.name,
    departmentId: c.departmentId,
    academicYearName: c.academicYear?.name,
    sections: c.sections.map((s) => ({
      id: s.id,
      name: s.name,
      roomNumber: s.roomNumber,
      capacity: s.capacity,
      classTeacherName: s.classTeacher?.fullName,
      studentsCount: s.students.length,
    })),
    feeStructures: c.feeStructures.map((fs) => ({
      id: fs.id,
      categoryName: fs.feeCategory.name,
      amount: fs.amount,
      frequency: fs.frequency,
    })),
    totalFee: c.feeStructures.reduce((acc, fs) => acc + fs.amount, 0),
  }));

  const formattedDepartments = departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));

  const formattedYears = academicYears.map((y) => ({
    id: y.id,
    name: y.name,
    isCurrent: y.isCurrent,
  }));

  return (
    <ClassesClient
      classes={formattedClasses}
      departments={formattedDepartments}
      academicYears={formattedYears}
    />
  );
}
