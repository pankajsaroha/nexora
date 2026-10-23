import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { StudentAttendanceClient } from "@/components/attendance/student-attendance-client";
import { StudentAttendanceView } from "@/components/attendance/student-attendance-view";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { sectionId?: string; date?: string; childId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. STUDENT WORKSPACE ATTENDANCE
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
          { id: user.studentId },
        ],
        institutionId: user.institutionId,
      },
      include: {
        currentClass: true,
        currentSection: true,
        attendance: {
          orderBy: { date: "desc" },
          take: 120,
        },
      },
    });

    if (!student) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Student academic profile not found.
        </div>
      );
    }

    const records = student.attendance.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status as any,
      remarks: a.remarks,
    }));

    return (
      <StudentAttendanceView
        studentName={student.fullName}
        className={student.currentClass?.name || "Class"}
        sectionName={student.currentSection?.name || "A"}
        rollNumber={student.rollNumber}
        admissionNumber={student.admissionNumber}
        records={records}
      />
    );
  }

  // 2. PARENT WORKSPACE ATTENDANCE (Multi-child support)
  if (user.roleCode === "PARENT") {
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
        institutionId: user.institutionId,
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                currentClass: true,
                currentSection: true,
                attendance: {
                  orderBy: { date: "desc" },
                  take: 120,
                },
              },
            },
          },
        },
      },
    });

    const linkedStudents = guardian?.students?.map((sg) => sg.student) || [];

    if (linkedStudents.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          No linked children found for this verified parent account.
        </div>
      );
    }

    // Determine target child: from query params or first child
    const targetChild =
      (searchParams?.childId
        ? linkedStudents.find((s) => s.id === searchParams.childId)
        : null) || linkedStudents[0];

    const records = targetChild.attendance.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status as any,
      remarks: a.remarks,
    }));

    const childrenList = linkedStudents.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      className: s.currentClass?.name || "Class",
      sectionName: s.currentSection?.name || "A",
    }));

    return (
      <StudentAttendanceView
        studentName={targetChild.fullName}
        className={targetChild.currentClass?.name || "Class"}
        sectionName={targetChild.currentSection?.name || "A"}
        rollNumber={targetChild.rollNumber}
        admissionNumber={targetChild.admissionNumber}
        records={records}
        isParentView
        childrenList={childrenList}
        selectedChildId={targetChild.id}
      />
    );
  }

  // 3. FACULTY / ADMIN ATTENDANCE (Roll-call Marking)
  const sections = await prisma.section.findMany({
    where: { class: { institutionId: user.institutionId } },
    include: { class: true },
    orderBy: [{ class: { orderIndex: "asc" } }, { name: "asc" }],
  });

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-xs">
        No class sections found. Please seed or create classes first.
      </div>
    );
  }

  const activeSectionId = searchParams?.sectionId || sections[0].id;
  const targetDate = searchParams?.date ? new Date(searchParams.date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const dateStr = targetDate.toISOString().split("T")[0];

  const students = await prisma.student.findMany({
    where: { currentSectionId: activeSectionId, status: "ACTIVE" },
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
