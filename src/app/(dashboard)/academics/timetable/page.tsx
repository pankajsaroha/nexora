import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TimetableClient } from "@/components/timetable/timetable-client";

export const dynamic = "force-dynamic";

export default async function TimetablePage({
  searchParams,
}: {
  searchParams?: { sectionId?: string; childId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let defaultSectionId = searchParams?.sectionId;

  // 1. If Student, pin to student's assigned section
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }, { id: user.studentId }],
        institutionId: user.institutionId,
      },
    });
    if (student?.currentSectionId) {
      defaultSectionId = student.currentSectionId;
    }
  }

  // 2. If Parent, pin to selected or first linked child's section
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

    if (child?.currentSectionId) {
      defaultSectionId = child.currentSectionId;
    }
  }

  const [slots, sections, teachers] = await Promise.all([
    prisma.timetableSlot.findMany({
      where: { section: { class: { institutionId: user.institutionId } } },
      include: {
        subject: true,
        teacher: true,
        section: { include: { class: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),
    prisma.section.findMany({
      where: { class: { institutionId: user.institutionId } },
      include: { class: true },
      orderBy: [{ class: { orderIndex: "asc" } }, { name: "asc" }],
    }),
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const formattedSlots = slots.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek as any,
    periodNumber: s.periodNumber,
    startTime: s.startTime,
    endTime: s.endTime,
    subjectName: s.subject.name,
    teacherName: s.teacher.fullName,
    className: s.section.class.name,
    sectionName: s.section.name,
    roomNumber: s.roomNumber,
  }));

  const formattedSections = sections.map((sec) => ({
    id: sec.id,
    className: sec.class.name,
    sectionName: sec.name,
  }));

  return (
    <TimetableClient
      slots={formattedSlots}
      sections={formattedSections}
      teachers={teachers.map((t) => ({ id: t.id, fullName: t.fullName }))}
      initialSectionId={defaultSectionId || sections[0]?.id || ""}
    />
  );
}
