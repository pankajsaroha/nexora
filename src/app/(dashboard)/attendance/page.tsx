import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { StudentAttendanceClient } from "@/components/attendance/student-attendance-client";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { sectionId?: string; date?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch sections in institution
  const sections = await prisma.section.findMany({
    where: { class: { institutionId: user.institutionId } },
    include: { class: true },
    orderBy: [{ class: { orderIndex: "asc" } }, { name: "asc" }],
  });

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No class sections found. Please seed or create classes first.
      </div>
    );
  }

  const activeSectionId = searchParams?.sectionId || sections[0].id;
  const targetDate = searchParams?.date ? new Date(searchParams.date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const dateStr = targetDate.toISOString().split("T")[0];

  // Fetch students in this section
  const students = await prisma.student.findMany({
    where: { currentSectionId: activeSectionId },
    include: {
      attendance: {
        where: { date: targetDate },
      },
    },
    orderBy: { rollNumber: "asc" },
  });

  const canMark = hasPermission(user, PERMISSIONS.ATTENDANCE_MARK);

  const attendanceItems = students.map((st) => {
    const existing = st.attendance[0];
    return {
      id: st.id,
      fullName: st.fullName,
      admissionNumber: st.admissionNumber,
      rollNumber: st.rollNumber,
      status: (existing?.status as any) || "PRESENT",
      remarks: existing?.remarks || null,
    };
  });

  return (
    <StudentAttendanceClient
      sections={sections.map((s) => ({
        id: s.id,
        className: s.class.name,
        sectionName: s.name,
      }))}
      initialSectionId={activeSectionId}
      students={attendanceItems}
      selectedDateStr={dateStr}
      canMark={canMark}
    />
  );
}
