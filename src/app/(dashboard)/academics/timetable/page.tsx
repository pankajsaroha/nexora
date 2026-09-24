import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TimetableClient } from "@/components/timetable/timetable-client";

export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [slots, sections, teachers] = await Promise.all([
    prisma.timetableSlot.findMany({
      include: {
        subject: true,
        teacher: true,
        section: { include: { class: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),
    prisma.section.findMany({
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
      initialSectionId={sections[0]?.id || ""}
    />
  );
}
