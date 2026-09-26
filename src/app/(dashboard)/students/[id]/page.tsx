import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentProfileClient } from "@/components/students/student-profile-client";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [student, customFields, classes, academicYears] = await Promise.all([
    prisma.student.findFirst({
      where: {
        id: params.id,
        institutionId: user.institutionId,
      },
      include: {
        currentClass: {
          include: {
            department: true,
          },
        },
        currentSection: {
          include: {
            classTeacher: true,
          },
        },
        academicYear: true,
        guardians: {
          include: {
            guardian: true,
          },
        },
        fees: {
          include: {
            feeStructure: {
              include: {
                feeCategory: true,
              },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 60,
        },
        customFieldValues: {
          include: {
            customField: true,
          },
        },
      },
    }),
    prisma.studentCustomField.findMany({
      where: { institutionId: user.institutionId, isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.class.findMany({
      where: { institutionId: user.institutionId, isActive: true },
      include: {
        department: true,
        sections: { orderBy: { name: "asc" } },
        feeStructures: {
          include: { feeCategory: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { startDate: "desc" },
    }),
  ]);

  if (!student) {
    notFound();
  }

  const parsedCustomFields = customFields.map((f) => ({
    id: f.id,
    name: f.name,
    key: f.key,
    fieldType: f.fieldType,
    options: f.options ? JSON.parse(f.options) : [],
    placeholder: f.placeholder,
    helpText: f.helpText,
    isRequired: f.isRequired,
    isVisibleToAdmin: f.isVisibleToAdmin,
    isVisibleToTeacher: f.isVisibleToTeacher,
    isVisibleToParent: f.isVisibleToParent,
    isVisibleToStudent: f.isVisibleToStudent,
  }));

  const formattedPrograms = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    level: c.level,
    durationYears: c.durationYears,
    department: c.department,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name, capacity: s.capacity })),
    feeStructures: c.feeStructures.map((f) => ({
      id: f.id,
      amount: f.amount,
      frequency: f.frequency,
      dueDate: f.dueDate,
      feeCategory: { id: f.feeCategory.id, name: f.feeCategory.name },
    })),
  }));

  const formattedYears = academicYears.map((y) => ({
    id: y.id,
    name: y.name,
    isCurrent: y.isCurrent,
  }));

  return (
    <StudentProfileClient
      student={student as any}
      customFields={parsedCustomFields}
      programs={formattedPrograms}
      academicYears={formattedYears}
      currentUserRole={user.roleCode}
    />
  );
}
