import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentProfileClient } from "@/components/students/student-profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Authorization: Only staff and administrators may view students from the directory
  const authorizedRoles = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "TEACHER",
    "HOD",
    "ACCOUNTANT",
    "HR_ADMIN",
  ];

  if (!authorizedRoles.includes(user.roleCode || "")) {
    if (user.roleCode === "STUDENT") {
      redirect("/profile");
    }
    redirect("/dashboard");
  }

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id) {
    notFound();
  }

  // Enforce institution scoping (Super Admin can view across institutions)
  const whereClause: any = { id };
  if (user.roleCode !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      redirect("/login");
    }
    whereClause.institutionId = user.institutionId;
  }

  const student = await prisma.student.findFirst({
    where: whereClause,
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
      user: {
        select: {
          id: true,
          email: true,
          roleCode: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      guardians: {
        include: {
          guardian: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  isActive: true,
                  lastLoginAt: true,
                },
              },
            },
          },
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
  });

  if (!student) {
    notFound();
  }

  const institutionId = student.institutionId;

  const [customFields, classes, academicYears] = await Promise.all([
    prisma.studentCustomField.findMany({
      where: { institutionId, isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.class.findMany({
      where: { institutionId, isActive: true },
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
      where: { institutionId },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const parsedCustomFields = customFields.map((f) => {
    let options: string[] = [];
    if (f.options) {
      try {
        const parsed = JSON.parse(f.options);
        if (Array.isArray(parsed)) options = parsed;
      } catch {
        options = [];
      }
    }
    return {
      id: f.id,
      name: f.name,
      key: f.key,
      fieldType: f.fieldType,
      options,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      isVisibleToAdmin: f.isVisibleToAdmin,
      isVisibleToTeacher: f.isVisibleToTeacher,
      isVisibleToParent: f.isVisibleToParent,
      isVisibleToStudent: f.isVisibleToStudent,
    };
  });

  const formattedPrograms = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    level: c.level,
    durationYears: c.durationYears,
    department: c.department,
    sections: (c.sections || []).map((s) => ({ id: s.id, name: s.name, capacity: s.capacity })),
    feeStructures: (c.feeStructures || []).map((f) => ({
      id: f.id,
      amount: f.amount,
      frequency: f.frequency,
      dueDate: f.dueDate,
      feeCategory: { id: f.feeCategory?.id || "", name: f.feeCategory?.name || "General" },
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
