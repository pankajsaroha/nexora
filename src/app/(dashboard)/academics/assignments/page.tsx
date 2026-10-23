import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AssignmentsClient } from "@/components/assignments/assignments-client";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams?: { childId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let whereClause: any = {
    institutionId: user.institutionId,
  };

  // 1. STUDENT: Scope strictly to student's assigned section and published assignments
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }, { id: user.studentId }],
        institutionId: user.institutionId,
      },
    });

    if (!student || !student.currentSectionId) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Student section assignment not found.
        </div>
      );
    }

    whereClause = {
      institutionId: user.institutionId,
      sectionId: student.currentSectionId,
      status: "PUBLISHED",
    };
  }

  // 2. PARENT: Scope to selected linked child's section and published assignments
  if (user.roleCode === "PARENT") {
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
        institutionId: user.institutionId,
      },
      include: {
        students: {
          include: { student: true },
        },
      },
    });

    const linked = guardian?.students?.map((sg) => sg.student) || [];
    const child =
      (searchParams?.childId ? linked.find((c) => c.id === searchParams.childId) : null) ||
      linked[0];

    if (!child || !child.currentSectionId) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          No linked child found for this parent account.
        </div>
      );
    }

    whereClause = {
      institutionId: user.institutionId,
      sectionId: child.currentSectionId,
      status: "PUBLISHED",
    };
  }

  const [assignments, sections, subjects] = await Promise.all([
    prisma.assignment.findMany({
      where: whereClause,
      include: {
        subject: true,
        teacher: true,
        section: {
          include: { class: true, students: true },
        },
        submissions: true,
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.section.findMany({
      where: { class: { institutionId: user.institutionId } },
      include: { class: true },
      orderBy: [{ class: { orderIndex: "asc" } }, { name: "asc" }],
    }),
    prisma.subject.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE);

  const formattedAssignments = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    subjectName: a.subject.name,
    className: a.section.class.name,
    sectionName: a.section.name,
    teacherName: a.teacher.fullName,
    dueDate: a.dueDate,
    priority: a.priority as any,
    maxMarks: a.maxMarks,
    status: a.status,
    submissionsCount: a.submissions.length,
    totalStudents: a.section.students.length,
  }));

  return (
    <AssignmentsClient
      assignments={formattedAssignments}
      sections={sections.map((s) => ({ id: s.id, name: `${s.class.name} (${s.name})` }))}
      subjects={subjects.map((sub) => ({ id: sub.id, name: sub.name }))}
      canCreate={canCreate}
    />
  );
}
