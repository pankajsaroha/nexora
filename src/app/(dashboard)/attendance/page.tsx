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
  searchParams: { sectionId?: string; classId?: string; date?: string; childId?: string };
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
  // 3. FACULTY / ADMIN ATTENDANCE (Roll-call Marking)
  const classes = await prisma.class.findMany({
    where: { institutionId: user.institutionId },
    include: {
      sections: { orderBy: { name: "asc" } },
    },
    orderBy: { orderIndex: "asc" },
  });

  if (classes.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-xs">
        No class sections found. Please seed or create classes first.
      </div>
    );
  }

  // Flatten all sections for backward compatibility
  const allSections: Array<{ id: string; className: string; sectionName: string }> = [];
  classes.forEach((cls) => {
    cls.sections.forEach((sec) => {
      allSections.push({
        id: sec.id,
        className: cls.name,
        sectionName: sec.name,
      });
    });
  });

  // Resolve target class and section from search parameters
  const activeClass =
    (searchParams?.classId ? classes.find((c) => c.id === searchParams.classId) : null) ||
    (searchParams?.sectionId
      ? classes.find((c) => c.sections.some((s) => s.id === searchParams.sectionId))
      : null) ||
    classes[0];

  const activeClassId = activeClass.id;
  const availableSections = activeClass.sections || [];
  const activeSectionId =
    (searchParams?.sectionId && availableSections.some((s) => s.id === searchParams.sectionId)
      ? searchParams.sectionId
      : availableSections[0]?.id) || "";

  const targetDate = searchParams?.date ? new Date(searchParams.date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const dateStr = targetDate.toISOString().split("T")[0];

  const studentWhere: any = {
    institutionId: user.institutionId,
    currentClassId: activeClassId,
    status: "ACTIVE",
  };
  if (activeSectionId) {
    studentWhere.currentSectionId = activeSectionId;
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      attendance: {
        where: { date: targetDate },
      },
    },
    orderBy: [{ rollNumber: "asc" }, { fullName: "asc" }],
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
      classes={classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        sections: c.sections.map((s) => ({ id: s.id, name: s.name })),
      }))}
      sections={allSections}
      initialClassId={activeClassId}
      initialSectionId={activeSectionId}
      students={attendanceItems}
      selectedDateStr={dateStr}
      canMark={canMark}
    />
  );
}
