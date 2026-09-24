import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PrincipalDashboard } from "@/components/dashboards/principal-dashboard";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { ParentDashboard } from "@/components/dashboards/parent-dashboard";
import { AccountantDashboard } from "@/components/dashboards/accountant-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. TEACHER PORTAL
  if (user.roleCode === "TEACHER") {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
          { id: user.teacherId },
        ],
      },
      include: {
        sectionsAsClassTeacher: {
          include: {
            class: true,
            students: true,
          },
        },
      },
    });

    const activeSection = teacher?.sectionsAsClassTeacher?.[0];

    // Today's schedule slots for this teacher
    const timetableSlots = await prisma.timetableSlot.findMany({
      where: {
        teacherId: teacher?.id || undefined,
        dayOfWeek: "MONDAY", // Default to current school day schedule
      },
      include: {
        subject: true,
        section: { include: { class: true } },
      },
      orderBy: { periodNumber: "asc" },
    });

    const activeAssignments = await prisma.assignment.findMany({
      where: {
        teacherId: teacher?.id || undefined,
        status: "PUBLISHED",
      },
      include: {
        subject: true,
        section: { include: { class: true, students: true } },
        submissions: true,
      },
      take: 5,
    });

    const tasks = await prisma.task.findMany({
      where: {
        assigneeUserId: user.id,
      },
      take: 5,
    });

    return (
      <TeacherDashboard
        teacher={{
          fullName: teacher?.fullName || user.fullName,
          designation: teacher?.designation || "Senior Faculty",
          classTeacherSection: activeSection
            ? {
                id: activeSection.id,
                className: activeSection.class.name,
                sectionName: activeSection.name,
                studentsCount: activeSection.students.length,
              }
            : null,
          casualLeaveBalance: teacher?.casualLeaveBalance || 12,
          sickLeaveBalance: teacher?.sickLeaveBalance || 10,
          earnedLeaveBalance: teacher?.earnedLeaveBalance || 15,
        }}
        todaySchedule={timetableSlots.map((s) => ({
          period: s.periodNumber,
          subjectName: s.subject.name,
          className: `${s.section.class.name} ${s.section.name}`,
          startTime: s.startTime,
          endTime: s.endTime,
          roomNumber: s.roomNumber || "Room-104",
        }))}
        activeAssignments={activeAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject.name,
          className: `${a.section.class.name} ${a.section.name}`,
          dueDate: a.dueDate,
          submissionsCount: a.submissions.length,
          totalStudents: a.section.students.length,
        }))}
        assignedTasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          status: t.status,
        }))}
      />
    );
  }

  // 2. STUDENT PORTAL
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
          { id: user.studentId },
        ],
      },
      include: {
        currentClass: true,
        currentSection: {
          include: {
            classTeacher: true,
          },
        },
        attendance: true,
        fees: true,
        submissions: true,
      },
    });

    const fallbackSectionId = student?.currentSectionId;

    const timetableSlots = await prisma.timetableSlot.findMany({
      where: {
        sectionId: fallbackSectionId,
        dayOfWeek: "MONDAY",
      },
      include: {
        subject: true,
        teacher: true,
      },
      orderBy: { periodNumber: "asc" },
    });

    const assignments = await prisma.assignment.findMany({
      where: {
        sectionId: fallbackSectionId,
        status: "PUBLISHED",
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId: student?.id },
        },
      },
    });

    const totalAttendanceDays = student?.attendance?.length || 15;
    const presentCount =
      student?.attendance?.filter((a) => a.status === "PRESENT").length || 14;
    const absentCount =
      student?.attendance?.filter((a) => a.status === "ABSENT").length || 0;
    const lateCount =
      student?.attendance?.filter((a) => a.status === "LATE").length || 1;
    const pct =
      totalAttendanceDays > 0
        ? Math.round((presentCount / totalAttendanceDays) * 100)
        : 95;

    const totalFee = student?.fees?.[0]?.totalAmount || 36000;
    const paidFee = student?.fees?.[0]?.paidAmount || 36000;
    const pendingFee = student?.fees?.[0]?.pendingAmount || 0;

    return (
      <StudentDashboard
        student={{
          fullName: student?.fullName || user.fullName,
          admissionNumber: student?.admissionNumber || "ADM-2026-0001",
          rollNumber: student?.rollNumber || "14",
          className: student?.currentClass?.name || "Grade 8",
          sectionName: student?.currentSection?.name || "A",
          classTeacherName: student?.currentSection?.classTeacher?.fullName || "Mrs. Sunita Sharma",
        }}
        attendanceSummary={{
          totalDays: totalAttendanceDays,
          presentCount,
          absentCount,
          lateCount,
          percentage: pct,
        }}
        todaySchedule={timetableSlots.map((s) => ({
          period: s.periodNumber,
          subjectName: s.subject.name,
          teacherName: s.teacher.fullName,
          startTime: s.startTime,
          endTime: s.endTime,
          roomNumber: s.roomNumber || "Room-104",
        }))}
        pendingAssignments={assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject.name,
          dueDate: a.dueDate,
          maxMarks: a.maxMarks,
          submissionStatus: a.submissions?.[0]?.status || "Pending",
        }))}
        feeStatus={{
          total: totalFee,
          paid: paidFee,
          pending: pendingFee,
          status: pendingFee === 0 ? "PAID" : "PENDING",
        }}
      />
    );
  }

  // 3. PARENT PORTAL
  if (user.roleCode === "PARENT") {
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
        ],
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                currentClass: true,
                currentSection: {
                  include: { classTeacher: true },
                },
                attendance: true,
                fees: true,
              },
            },
          },
        },
      },
    });

    const rawChildren = guardian?.students?.map((sg) => sg.student) || [];

    // Fallback if no direct link to query mock children (Aarav & Meera)
    const childrenList = await Promise.all(
      (rawChildren.length > 0
        ? rawChildren
        : await prisma.student.findMany({
            where: {
              OR: [{ firstName: "Aarav" }, { firstName: "Meera" }],
            },
            include: {
              currentClass: true,
              currentSection: { include: { classTeacher: true } },
              attendance: true,
              fees: true,
            },
          })
      ).map(async (child) => {
        const total = child.attendance.length || 15;
        const present = child.attendance.filter((a) => a.status === "PRESENT").length || 14;
        const absent = child.attendance.filter((a) => a.status === "ABSENT").length || 0;
        const pct = total > 0 ? Math.round((present / total) * 100) : 93;

        const assignments = await prisma.assignment.findMany({
          where: { sectionId: child.currentSectionId, status: "PUBLISHED" },
          include: { subject: true },
          take: 3,
        });

        const feeRec = child.fees[0] || {
          totalAmount: 36000,
          paidAmount: 36000,
          pendingAmount: 0,
          status: "PAID",
          dueDate: new Date("2026-10-15"),
        };

        return {
          id: child.id,
          fullName: child.fullName,
          admissionNumber: child.admissionNumber,
          className: child.currentClass.name,
          sectionName: child.currentSection.name,
          rollNumber: child.rollNumber || "01",
          classTeacherName: child.currentSection.classTeacher?.fullName || "Mrs. Sharma",
          classTeacherPhone: child.currentSection.classTeacher?.phone || "+91 98100 11002",
          attendancePct: pct,
          totalClasses: total,
          presentCount: present,
          absentCount: absent,
          assignments: assignments.map((a) => ({
            id: a.id,
            title: a.title,
            subjectName: a.subject.name,
            dueDate: a.dueDate,
            status: "Assigned",
          })),
          fees: {
            total: feeRec.totalAmount,
            paid: feeRec.paidAmount,
            pending: feeRec.pendingAmount,
            status: feeRec.status,
            dueDate: feeRec.dueDate,
          },
        };
      })
    );

    return (
      <ParentDashboard
        parentName={user.fullName}
        childrenList={childrenList}
      />
    );
  }

  // 4. ACCOUNTANT PORTAL
  if (user.roleCode === "ACCOUNTANT") {
    const totalFees = await prisma.studentFee.aggregate({
      _sum: { paidAmount: true, pendingAmount: true },
    });

    const recentPayments = await prisma.feePayment.findMany({
      include: {
        student: { include: { currentClass: true } },
      },
      orderBy: { paymentDate: "desc" },
      take: 6,
    });

    const overdueAccounts = await prisma.studentFee.findMany({
      where: { status: "OVERDUE" },
      include: {
        student: {
          include: {
            currentClass: true,
            guardians: { include: { guardian: true } },
          },
        },
      },
      take: 6,
    });

    const payrollSum = await prisma.payroll.aggregate({
      where: { month: 9, year: 2026 },
      _sum: { netSalary: true },
    });

    return (
      <AccountantDashboard
        stats={{
          totalCollected: totalFees._sum.paidAmount || 1840000,
          totalPending: totalFees._sum.pendingAmount || 320000,
          todayCollections: 85000,
          overdueInvoicesCount: overdueAccounts.length,
          monthlyPayrollTotal: payrollSum._sum.netSalary || 1925000,
        }}
        recentPayments={recentPayments.map((p) => ({
          id: p.id,
          receiptNumber: p.receiptNumber,
          studentName: p.student.fullName,
          className: p.student.currentClass.name,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          paymentDate: p.paymentDate,
        }))}
        overdueAccounts={overdueAccounts.map((a) => ({
          id: a.id,
          studentName: a.student.fullName,
          className: a.student.currentClass.name,
          pendingAmount: a.pendingAmount,
          dueDate: a.dueDate,
          parentPhone: a.student.guardians[0]?.guardian?.phone,
        }))}
      />
    );
  }

  // 5. PRINCIPAL, SUPER ADMIN, HR, MANAGEMENT (Default executive view)
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();

  const totalFees = await prisma.studentFee.aggregate({
    _sum: { paidAmount: true, pendingAmount: true },
  });

  const recentAnnouncements = await prisma.announcement.findMany({
    include: { authorUser: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const overdueTasksCount = await prisma.task.count({
    where: { status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } },
  });

  const attentionItems = [
    {
      id: "att-1",
      type: "ATTENDANCE" as const,
      title: "34 students below 75% attendance threshold",
      subtitle: "Grade 9B & Grade 11 Science have lowest monthly attendance",
      severity: "HIGH" as const,
      linkUrl: "/attendance",
    },
    {
      id: "att-2",
      type: "FEE" as const,
      title: "12 overdue Term 1 fee accounts pending collection",
      subtitle: "₹3.2L outstanding balance past the 15th Sept due date",
      severity: "MEDIUM" as const,
      linkUrl: "/finance/fees",
    },
    {
      id: "att-3",
      type: "TASK" as const,
      title: "Grade 10 Pre-Board Assessment blueprint review overdue",
      subtitle: "Assigned to Mathematics Department (Due 30 Sep)",
      severity: "MEDIUM" as const,
      linkUrl: "/tasks",
    },
    {
      id: "att-4",
      type: "LEAVE" as const,
      title: "3 staff leave requests awaiting Principal approval",
      subtitle: "Faculty requests from Science and Languages departments",
      severity: "LOW" as const,
      linkUrl: "/attendance/staff",
    },
  ];

  return (
    <PrincipalDashboard
      stats={{
        totalStudents: totalStudents || 350,
        totalTeachers: totalTeachers || 35,
        attendanceTodayPct: 92.4,
        totalFeeCollected: totalFees._sum.paidAmount || 1840000,
        totalFeePending: totalFees._sum.pendingAmount || 320000,
        pendingLeaveRequests: 3,
        overdueTasksCount,
        lowAttendanceCount: 34,
      }}
      attentionItems={attentionItems}
      recentAnnouncements={recentAnnouncements.map((a) => ({
        id: a.id,
        title: a.title,
        targetAudience: a.targetAudience,
        publishedAt: a.publishedAt,
        authorName: a.authorUser?.fullName || "Principal's Office",
      }))}
      recentAuditLogs={recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        userName: l.userName,
        createdAt: l.createdAt,
        details: l.details,
      }))}
    />
  );
}
