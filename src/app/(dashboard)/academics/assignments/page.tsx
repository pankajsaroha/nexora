import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AssignmentsClient } from "@/components/assignments/assignments-client";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [assignments, sections, subjects] = await Promise.all([
    prisma.assignment.findMany({
      where: { institutionId: user.institutionId },
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
