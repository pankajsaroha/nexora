import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamsClient } from "@/components/exams/exams-client";
import { getInstitutionExams } from "@/lib/exams/service";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch real institution exams and prerequisite filter data in parallel
  const [{ exams, stats }, classes, subjects, academicYears, students] = await Promise.all([
    getInstitutionExams(user.institutionId, user),
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: {
        sections: {
          include: { classTeacher: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.subject.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      include: { terms: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.student.findMany({
      where: { institutionId: user.institutionId, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        admissionNumber: true,
        rollNumber: true,
        currentClassId: true,
        currentSectionId: true,
      },
      orderBy: [{ rollNumber: "asc" }, { fullName: "asc" }],
      take: 100,
    }),
  ]);

  const formattedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    sections: c.sections.map((s) => ({
      id: s.id,
      name: s.name,
      classTeacherName: s.classTeacher?.fullName || undefined,
    })),
  }));

  const formattedSubjects = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    type: s.type,
  }));

  const formattedAcademicYears = academicYears.map((ay) => ({
    id: ay.id,
    name: ay.name,
    isCurrent: ay.isCurrent,
    terms: ay.terms.map((t) => ({
      id: t.id,
      name: t.name,
      isCurrent: t.isCurrent,
    })),
  }));

  return (
    <ExamsClient
      exams={exams}
      stats={stats}
      classes={formattedClasses}
      subjects={formattedSubjects}
      academicYears={formattedAcademicYears}
      students={students}
      currentUser={{
        id: user.id,
        fullName: user.fullName,
        roleCode: user.roleCode || "TEACHER",
        teacherId: user.teacherId || undefined,
      }}
    />
  );
}

