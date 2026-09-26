import React from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import { PrincipalDashboard } from "@/components/dashboards/principal-dashboard";

export const dynamic = "force-dynamic";

export default function DemoPrincipalDashboardPage() {
  const attentionItems = [
    {
      id: "att-1",
      type: "ATTENDANCE" as const,
      title: "34 students below 75% attendance threshold",
      subtitle: "Grade 9B & Grade 11 Science have lowest monthly attendance",
      severity: "HIGH" as const,
      linkUrl: "/demo/principal/dashboard",
    },
    {
      id: "att-2",
      type: "FEE" as const,
      title: "12 overdue Term 1 fee accounts pending collection",
      subtitle: "₹3.2L outstanding balance past the 15th Sept due date",
      severity: "MEDIUM" as const,
      linkUrl: "/demo/principal/dashboard",
    },
    {
      id: "att-3",
      type: "TASK" as const,
      title: "Grade 10 Pre-Board Assessment blueprint review overdue",
      subtitle: "Assigned to Mathematics Department (Due 30 Sep)",
      severity: "MEDIUM" as const,
      linkUrl: "/demo/principal/dashboard",
    },
  ];

  const todaySchedule = [
    {
      id: "demo-s-1",
      period: 1,
      subjectName: "Advanced Mathematics",
      className: "Grade 10A",
      startTime: "08:30",
      endTime: "09:15",
      roomNumber: "Room 102",
    },
    {
      id: "demo-s-2",
      period: 2,
      subjectName: "Physics & Mechanics",
      className: "Grade 11 Science",
      startTime: "09:20",
      endTime: "10:05",
      roomNumber: "Physics Lab A",
    },
    {
      id: "demo-s-3",
      period: 3,
      subjectName: "English Literature",
      className: "Grade 8B",
      startTime: "10:20",
      endTime: "11:05",
      roomNumber: "Room 204",
    },
    {
      id: "demo-s-4",
      period: 4,
      subjectName: "Chemistry Lab",
      className: "Grade 12 Science",
      startTime: "11:10",
      endTime: "11:55",
      roomNumber: "Chemistry Lab",
    },
  ];

  const priorityTasks = [
    {
      id: "t-1",
      title: "Finalize Term 1 Examination Roster",
      dueDate: new Date("2026-09-30"),
      priority: "HIGH" as const,
      assigneeName: "Examination Board",
    },
    {
      id: "t-2",
      title: "Staff Faculty Appraisals Review",
      dueDate: new Date("2026-10-05"),
      priority: "MEDIUM" as const,
      assigneeName: "Vice Principal",
    },
    {
      id: "t-3",
      title: "Audit Science Laboratory Safety Supplies",
      dueDate: new Date("2026-10-10"),
      priority: "LOW" as const,
      assigneeName: "Lab In-charge",
    },
  ];

  const recentActivity = [
    {
      id: "act-1",
      title: "Fee payment received: ₹36,000",
      subtitle: "Recorded for Aarav Sharma (Receipt #REC-2026-0041)",
      timestamp: new Date(),
      type: "PAYMENT" as const,
    },
    {
      id: "act-2",
      title: "Notice broadcasted: Annual Science Congress",
      subtitle: "Dispatched to all scholars and faculty",
      timestamp: new Date(Date.now() - 3600000 * 2),
      type: "ANNOUNCEMENT" as const,
    },
    {
      id: "act-3",
      title: "Timetable updated: Senior Science Block",
      subtitle: "Finalized by Academic Council",
      timestamp: new Date(Date.now() - 3600000 * 5),
      type: "ACADEMIC" as const,
    },
  ];

  const recentAnnouncements = [
    {
      id: "ann-1",
      title: "Annual Science Congress & Project Exhibition 2026",
      targetAudience: "ALL_INSTITUTION",
      publishedAt: new Date("2026-09-24"),
      authorName: "Dr. Arvind Menon",
    },
    {
      id: "ann-2",
      title: "Term 1 Pre-Board Examination Schedule Released",
      targetAudience: "STUDENTS",
      publishedAt: new Date("2026-09-22"),
      authorName: "Office of the Principal",
    },
    {
      id: "ann-3",
      title: "Parent-Teacher Leadership Conference AY 2026-27",
      targetAudience: "PARENTS",
      publishedAt: new Date("2026-09-20"),
      authorName: "Dean of Academics",
    },
  ];

  return (
    <DemoShell
      roleCode="PRINCIPAL"
      userName="Dr. Arvind Menon"
      userEmail="principal@nexora.demo"
      institutionName="Northstar International Academy (Sandbox)"
    >
      <PrincipalDashboard
        userName="Dr. Arvind Menon"
        institutionName="Northstar International Academy"
        stats={{
          totalStudents: 350,
          totalTeachers: 35,
          attendanceTodayPct: 94.2,
          totalFeeCollected: 1840000,
          totalFeePending: 320000,
          pendingTasksCount: 3,
          pendingLeaveRequests: 2,
        }}
        attentionItems={attentionItems}
        todaySchedule={todaySchedule}
        priorityTasks={priorityTasks}
        recentActivity={recentActivity}
        recentAnnouncements={recentAnnouncements}
      />
    </DemoShell>
  );
}
