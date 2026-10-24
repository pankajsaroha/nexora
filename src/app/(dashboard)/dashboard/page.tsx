import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PrincipalDashboard } from "@/components/dashboards/principal-dashboard";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { ParentDashboard } from "@/components/dashboards/parent-dashboard";
import { AccountantDashboard } from "@/components/dashboards/accountant-dashboard";
import { formatCurrency } from "@/lib/utils";
import { getEmployeeLeaveSummary } from "@/lib/leave/service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. TEACHER PORTAL
  if (user.roleCode === "TEACHER") {
    let teacher: any = null;
    let leaveSummary: any = null;
    let timetableSlots: any[] = [];
    let activeAssignments: any[] = [];
    let tasks: any[] = [];

    try {
      teacher = await prisma.teacher.findFirst({
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

      if (teacher) {
        try {
          leaveSummary = await getEmployeeLeaveSummary({
            institutionId: user.institutionId,
            teacherId: teacher.id,
          });
        } catch (err) {
          console.error("Failed to fetch teacher leave summary:", err);
        }
      }

      const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const currentDayName = dayNames[new Date().getDay()];
      const timetableDay = currentDayName === "SUNDAY" ? "MONDAY" : currentDayName;

      [timetableSlots, activeAssignments, tasks] = await Promise.all([
        prisma.timetableSlot.findMany({
          where: {
            teacherId: teacher?.id || undefined,
            dayOfWeek: timetableDay,
          },
          include: {
            subject: true,
            section: { include: { class: true } },
          },
          orderBy: { periodNumber: "asc" },
        }),
        prisma.assignment.findMany({
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
        }),
        prisma.task.findMany({
          where: {
            assigneeUserId: user.id,
          },
          take: 5,
        }),
      ]);
    } catch (err) {
      console.error("Teacher Dashboard fetch warning:", err);
    }

    const activeSection = teacher?.sectionsAsClassTeacher?.[0];

    return (
      <TeacherDashboard
        teacher={{
          fullName: teacher?.fullName || user.fullName,
          designation: teacher?.designation || "Faculty",
          classTeacherSection: activeSection
            ? {
                id: activeSection.id,
                className: activeSection.class.name,
                sectionName: activeSection.name,
                studentsCount: activeSection.students.length,
              }
            : null,
        }}
        leaveSummary={leaveSummary || undefined}
        todaySchedule={timetableSlots.map((s: any) => ({
          period: s.periodNumber,
          subjectName: s.subject?.name || "Subject",
          className: `${s.section?.class?.name || ""} ${s.section?.name || ""}`.trim(),
          startTime: s.startTime,
          endTime: s.endTime,
          roomNumber: s.roomNumber || "Room-104",
        }))}
        activeAssignments={activeAssignments.map((a: any) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject?.name || "Subject",
          className: `${a.section?.class?.name || ""} ${a.section?.name || ""}`.trim(),
          dueDate: a.dueDate,
          submissionsCount: a.submissions?.length || 0,
          totalStudents: a.section?.students?.length || 0,
        }))}
        assignedTasks={tasks.map((t: any) => ({
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
    let student: any = null;
    let timetableSlots: any[] = [];
    let assignments: any[] = [];

    try {
      student = await prisma.student.findFirst({
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
      const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const currentDayName = dayNames[new Date().getDay()];
      const timetableDay = currentDayName === "SUNDAY" ? "MONDAY" : currentDayName;

      [timetableSlots, assignments] = await Promise.all([
        fallbackSectionId
          ? prisma.timetableSlot.findMany({
              where: {
                sectionId: fallbackSectionId,
                dayOfWeek: timetableDay,
              },
              include: {
                subject: true,
                teacher: true,
              },
              orderBy: { periodNumber: "asc" },
            })
          : Promise.resolve([]),
        fallbackSectionId
          ? prisma.assignment.findMany({
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
            })
          : Promise.resolve([]),
      ]);
    } catch (err) {
      console.error("Student Dashboard fetch warning:", err);
    }

    const totalAttendanceDays = student?.attendance?.length || 0;
    const presentCount =
      student?.attendance?.filter((a: any) => a.status === "PRESENT").length || 0;
    const absentCount =
      student?.attendance?.filter((a: any) => a.status === "ABSENT").length || 0;
    const lateCount =
      student?.attendance?.filter((a: any) => a.status === "LATE").length || 0;
    const pct =
      totalAttendanceDays > 0
        ? Math.round((presentCount / totalAttendanceDays) * 100)
        : 100;

    const totalFee = student?.fees?.reduce((acc: number, f: any) => acc + (f.totalAmount || 0), 0) || 0;
    const paidFee = student?.fees?.reduce((acc: number, f: any) => acc + (f.paidAmount || 0), 0) || 0;
    const pendingFee = student?.fees?.reduce((acc: number, f: any) => acc + (f.pendingAmount || 0), 0) || 0;

    return (
      <StudentDashboard
        student={{
          fullName: student?.fullName || user.fullName,
          admissionNumber: student?.admissionNumber || "Not assigned",
          rollNumber: student?.rollNumber || "Not assigned",
          className: student?.currentClass?.name || "General",
          sectionName: student?.currentSection?.name || "A",
          classTeacherName: student?.currentSection?.classTeacher?.fullName || "Not assigned",
        }}
        attendanceSummary={{
          totalDays: totalAttendanceDays,
          presentCount,
          absentCount,
          lateCount,
          percentage: pct,
        }}
        todaySchedule={timetableSlots.map((s: any) => ({
          period: s.periodNumber,
          subjectName: s.subject?.name || "Subject",
          teacherName: s.teacher?.fullName || "Faculty",
          startTime: s.startTime,
          endTime: s.endTime,
          roomNumber: s.roomNumber || "Room-104",
        }))}
        pendingAssignments={assignments.map((a: any) => ({
          id: a.id,
          title: a.title,
          subjectName: a.subject?.name || "Subject",
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
    let childrenList: any[] = [];

    try {
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

      const rawChildren = guardian?.students?.map((sg: any) => sg.student) || [];

      childrenList = await Promise.all(
        rawChildren.map(async (child: any) => {
          const total = child.attendance?.length || 0;
          const present = child.attendance?.filter((a: any) => a.status === "PRESENT").length || 0;
          const absent = child.attendance?.filter((a: any) => a.status === "ABSENT").length || 0;
          const pct = total > 0 ? Math.round((present / total) * 100) : 100;

          let assignments: any[] = [];
          try {
            if (child.currentSectionId) {
              assignments = await prisma.assignment.findMany({
                where: { sectionId: child.currentSectionId, status: "PUBLISHED" },
                include: { subject: true },
                take: 3,
              });
            }
          } catch (e) {
            console.error("Failed to fetch child assignments:", e);
          }

          const feeRec = child.fees?.[0] || {
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            status: "PAID",
            dueDate: new Date(),
          };

          return {
            id: child.id,
            fullName: child.fullName,
            admissionNumber: child.admissionNumber,
            className: child.currentClass?.name || "Class",
            sectionName: child.currentSection?.name || "A",
            rollNumber: child.rollNumber || "—",
            classTeacherName: child.currentSection?.classTeacher?.fullName || "Class Teacher",
            classTeacherPhone: child.currentSection?.classTeacher?.phone || "+91 98100 00000",
            attendancePct: pct,
            totalClasses: total,
            presentCount: present,
            absentCount: absent,
            assignments: assignments.map((a: any) => ({
              id: a.id,
              title: a.title,
              subjectName: a.subject?.name || "Subject",
              dueDate: a.dueDate,
              status: "Assigned",
            })),
            fees: {
              total: feeRec.totalAmount || 0,
              paid: feeRec.paidAmount || 0,
              pending: feeRec.pendingAmount || 0,
              status: feeRec.status || "PAID",
              dueDate: feeRec.dueDate || new Date(),
            },
          };
        })
      );
    } catch (err) {
      console.error("Parent Dashboard fetch warning:", err);
    }

    return (
      <ParentDashboard
        parentName={user.fullName}
        childrenList={childrenList}
      />
    );
  }

  // 4. ACCOUNTANT PORTAL
  if (user.roleCode === "ACCOUNTANT") {
    let totalFees: any = { _sum: { paidAmount: 0, pendingAmount: 0 } };
    let recentPayments: any[] = [];
    let overdueAccounts: any[] = [];
    let payrollSum: any = { _sum: { netSalary: 0 } };

    try {
      [totalFees, recentPayments, overdueAccounts, payrollSum] = await Promise.all([
        prisma.studentFee.aggregate({
          where: { student: { institutionId: user.institutionId } },
          _sum: { paidAmount: true, pendingAmount: true },
        }),
        prisma.feePayment.findMany({
          where: { student: { institutionId: user.institutionId } },
          include: {
            student: { include: { currentClass: true } },
          },
          orderBy: { paymentDate: "desc" },
          take: 6,
        }),
        prisma.studentFee.findMany({
          where: {
            status: "OVERDUE",
            student: { institutionId: user.institutionId },
          },
          include: {
            student: {
              include: {
                currentClass: true,
                guardians: { include: { guardian: true } },
              },
            },
          },
          take: 6,
        }),
        prisma.payroll.aggregate({
          where: { institutionId: user.institutionId, month: 9, year: 2026 },
          _sum: { netSalary: true },
        }),
      ]);
    } catch (err) {
      console.error("Accountant Dashboard fetch warning:", err);
    }

    return (
      <AccountantDashboard
        stats={{
          totalCollected: totalFees._sum?.paidAmount || 0,
          totalPending: totalFees._sum?.pendingAmount || 0,
          todayCollections: 0,
          overdueInvoicesCount: overdueAccounts.length,
          monthlyPayrollTotal: payrollSum._sum?.netSalary || 0,
        }}
        recentPayments={recentPayments.map((p: any) => ({
          id: p.id,
          receiptNumber: p.receiptNumber,
          studentName: p.student?.fullName || "Student",
          className: p.student?.currentClass?.name || "Class",
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          paymentDate: p.paymentDate,
        }))}
        overdueAccounts={overdueAccounts.map((a: any) => ({
          id: a.id,
          studentName: a.student?.fullName || "Student",
          className: a.student?.currentClass?.name || "Class",
          pendingAmount: a.pendingAmount,
          dueDate: a.dueDate,
          parentPhone: a.student?.guardians?.[0]?.guardian?.phone,
        }))}
      />
    );
  }

  // 5. PRINCIPAL, SUPER ADMIN, EXECUTIVE MANAGEMENT (Daily Operations Command Desk)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const currentDayName = dayNames[new Date().getDay()];
  const timetableDay = currentDayName === "SUNDAY" ? "MONDAY" : currentDayName;

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalFees: any = { _sum: { paidAmount: 0, pendingAmount: 0 } };
  let recentAnnouncements: any[] = [];
  let overdueTasks: any[] = [];
  let pendingLeavesCount = 0;
  let timetableSlots: any[] = [];
  let recentPayments: any[] = [];
  let todayAttendanceRecords: any[] = [];
  let programs: any[] = [];
  let academicYears: any[] = [];
  let customFields: any[] = [];
  let classesCount = 0;

  try {
    const results = await Promise.all([
      prisma.student.count({
        where: { institutionId: user.institutionId },
      }),
      prisma.teacher.count({
        where: { institutionId: user.institutionId },
      }),
      prisma.studentFee.aggregate({
        where: { student: { institutionId: user.institutionId } },
        _sum: { paidAmount: true, pendingAmount: true },
      }),
      prisma.announcement.findMany({
        where: { institutionId: user.institutionId },
        select: {
          id: true,
          title: true,
          targetAudience: true,
          publishedAt: true,
          authorUser: { select: { fullName: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.task.findMany({
        where: {
          institutionId: user.institutionId,
          status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          assigneeUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.leaveRequest.count({
        where: {
          institutionId: user.institutionId,
          status: "PENDING",
        },
      }),
      prisma.timetableSlot.findMany({
        where: {
          dayOfWeek: timetableDay,
          section: { class: { institutionId: user.institutionId } },
        },
        select: {
          id: true,
          periodNumber: true,
          startTime: true,
          endTime: true,
          roomNumber: true,
          subject: { select: { name: true } },
          section: {
            select: {
              name: true,
              class: { select: { name: true } },
            },
          },
        },
        orderBy: { periodNumber: "asc" },
        take: 4,
      }),
      prisma.feePayment.findMany({
        where: { student: { institutionId: user.institutionId } },
        select: {
          id: true,
          amount: true,
          receiptNumber: true,
          paymentDate: true,
          student: { select: { fullName: true } },
        },
        orderBy: { paymentDate: "desc" },
        take: 4,
      }),
      prisma.studentAttendance.findMany({
        where: {
          student: { institutionId: user.institutionId },
          date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        select: { status: true },
      }),
      prisma.class.findMany({
        where: { institutionId: user.institutionId },
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
          durationYears: true,
          department: { select: { id: true, name: true, code: true } },
          sections: { select: { id: true, name: true, capacity: true } },
          feeStructures: {
            select: {
              id: true,
              amount: true,
              frequency: true,
              dueDate: true,
              feeCategory: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.academicYear.findMany({
        where: { institutionId: user.institutionId },
        select: {
          id: true,
          name: true,
          isCurrent: true,
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.studentCustomField.findMany({
        where: { institutionId: user.institutionId },
        select: {
          id: true,
          name: true,
          key: true,
          fieldType: true,
          options: true,
          placeholder: true,
          helpText: true,
          isRequired: true,
          isVisibleToAdmin: true,
        },
        orderBy: { orderIndex: "asc" },
      }),
    ]);

    totalStudents = results[0];
    totalTeachers = results[1];
    totalFees = results[2];
    recentAnnouncements = results[3];
    overdueTasks = results[4];
    pendingLeavesCount = results[5];
    timetableSlots = results[6];
    recentPayments = results[7];
    todayAttendanceRecords = results[8];
    programs = results[9];
    academicYears = results[10];
    customFields = results[11];
    classesCount = programs.length;
  } catch (err) {
    console.error("Principal Dashboard data fetch warning (intermittent DB connection issue):", err);
  }

  // Attendance calculation
  const totalRecordedAttendance = todayAttendanceRecords.length;
  const isAttendanceRecordedToday = totalRecordedAttendance > 0;
  const presentCount = todayAttendanceRecords.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const absentCount = todayAttendanceRecords.filter((a) => a.status === "ABSENT").length;
  const leaveCount = todayAttendanceRecords.filter((a) => a.status === "EXCUSED" || a.status === "HALF_DAY").length;
  const attendanceTodayPct = totalRecordedAttendance > 0
    ? +( (presentCount / totalRecordedAttendance) * 100 ).toFixed(1)
    : (totalStudents > 0 ? 0 : 0);

  // Attention Items
  const attentionItems: Array<{
    id: string;
    type: "ATTENDANCE" | "FEE" | "LEAVE" | "TASK" | "SETUP";
    title: string;
    subtitle: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    linkUrl: string;
  }> = [];

  if (absentCount > 0) {
    attentionItems.push({
      id: "att-absent",
      type: "ATTENDANCE",
      title: `${absentCount} student${absentCount > 1 ? "s" : ""} absent today`,
      subtitle: "Review attendance exceptions and contact primary guardians",
      severity: "MEDIUM",
      linkUrl: "/attendance",
    });
  } else if (totalStudents > 0 && !isAttendanceRecordedToday) {
    attentionItems.push({
      id: "att-att-pending",
      type: "ATTENDANCE",
      title: "Daily morning attendance roll not submitted",
      subtitle: "Awaiting teacher submission for today's active cohorts",
      severity: "MEDIUM",
      linkUrl: "/attendance",
    });
  }

  if (overdueTasks.length > 0) {
    attentionItems.push({
      id: "att-tasks",
      type: "TASK",
      title: `${overdueTasks.length} administrative task${overdueTasks.length > 1 ? "s" : ""} pending resolution`,
      subtitle: "Open workflow board to review urgent institutional tasks",
      severity: "HIGH",
      linkUrl: "/tasks",
    });
  }

  if (pendingLeavesCount > 0) {
    attentionItems.push({
      id: "att-leaves",
      type: "LEAVE",
      title: `${pendingLeavesCount} faculty leave request${pendingLeavesCount > 1 ? "s" : ""} awaiting approval`,
      subtitle: "Staff leave applications pending administrative review",
      severity: "LOW",
      linkUrl: "/attendance/leaves",
    });
  }

  const pendingFeeAmount = totalFees._sum.pendingAmount || 0;
  if (pendingFeeAmount > 0) {
    attentionItems.push({
      id: "att-fees",
      type: "FEE",
      title: `${formatCurrency(pendingFeeAmount)} pending fee reconciliation`,
      subtitle: "Student fee balances requiring ledger follow-up",
      severity: "LOW",
      linkUrl: "/finance/fees",
    });
  }

  // Construct recent operational activity
  const recentActivity: Array<{
    id: string;
    title: string;
    subtitle: string;
    timestamp: Date;
    type: "PAYMENT" | "ANNOUNCEMENT" | "TASK" | "ACADEMIC";
  }> = [];

  recentPayments.forEach((p) => {
    recentActivity.push({
      id: `act-pay-${p.id}`,
      title: `Fee payment received: ${formatCurrency(p.amount)}`,
      subtitle: `Recorded for ${p.student.fullName} (Ref: ${p.receiptNumber})`,
      timestamp: p.paymentDate,
      type: "PAYMENT",
    });
  });

  recentAnnouncements.forEach((a) => {
    recentActivity.push({
      id: `act-ann-${a.id}`,
      title: `Notice broadcasted: ${a.title}`,
      subtitle: `Published to ${a.targetAudience}`,
      timestamp: a.publishedAt,
      type: "ANNOUNCEMENT",
    });
  });

  return (
    <PrincipalDashboard
      userName={user.fullName}
      institutionName={user.institutionName}
      stats={{
        totalStudents,
        totalTeachers,
        attendanceTodayPct,
        attendancePresentCount: presentCount,
        attendanceAbsentCount: absentCount,
        attendanceLeaveCount: leaveCount,
        isAttendanceRecordedToday,
        totalFeeCollected: totalFees._sum.paidAmount || 0,
        totalFeePending: pendingFeeAmount,
        pendingTasksCount: overdueTasks.length,
        pendingLeaveRequests: pendingLeavesCount,
      }}
      attentionItems={attentionItems}
      todaySchedule={timetableSlots.map((s) => ({
        id: s.id,
        period: s.periodNumber,
        subjectName: s.subject.name,
        className: `${s.section.class.name} ${s.section.name}`,
        startTime: s.startTime,
        endTime: s.endTime,
        roomNumber: s.roomNumber || undefined,
      }))}
      priorityTasks={overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        priority: (t.priority as any) || "MEDIUM",
        assigneeName: t.assigneeUser?.fullName,
      }))}
      recentActivity={recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
      recentAnnouncements={recentAnnouncements.map((a) => ({
        id: a.id,
        title: a.title,
        targetAudience: a.targetAudience,
        publishedAt: a.publishedAt,
        authorName: a.authorUser?.fullName || "Principal's Office",
      }))}
      programs={programs as any}
      academicYears={academicYears as any}
      customFields={customFields as any}
      setupState={{
        hasClasses: classesCount > 0,
        hasStudents: totalStudents > 0,
        hasTeachers: totalTeachers > 0,
        hasTimetable: timetableSlots.length > 0,
        hasAcademicYear: academicYears.length > 0,
      }}
    />
  );
}
