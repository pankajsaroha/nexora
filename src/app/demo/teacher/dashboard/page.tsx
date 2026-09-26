import React from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";

export const dynamic = "force-dynamic";

export default function DemoTeacherDashboardPage() {
  const teacher = {
    fullName: "Mrs. Sunita Sharma",
    designation: "Senior Faculty & Class Teacher",
    classTeacherSection: {
      id: "sec-8a",
      className: "Grade 8",
      sectionName: "A",
      studentsCount: 38,
    },
    casualLeaveBalance: 12,
    sickLeaveBalance: 10,
    earnedLeaveBalance: 15,
  };

  const todaySchedule = [
    { period: 1, subjectName: "Mathematics", className: "Grade 8 A", startTime: "08:30", endTime: "09:15", roomNumber: "Room-104" },
    { period: 2, subjectName: "Mathematics", className: "Grade 9 B", startTime: "09:20", endTime: "10:05", roomNumber: "Room-202" },
    { period: 4, subjectName: "Applied Algebra", className: "Grade 11 Science", startTime: "11:15", endTime: "12:00", roomNumber: "Lecture Hall 2" },
    { period: 6, subjectName: "Remedial Math", className: "Grade 8 A", startTime: "13:30", endTime: "14:15", roomNumber: "Room-104" },
  ];

  const activeAssignments = [
    { id: "as-1", title: "Linear Equations Problem Set 4", subjectName: "Mathematics", className: "Grade 8 A", dueDate: new Date("2026-09-30"), submissionsCount: 29, totalStudents: 38 },
    { id: "as-2", title: "Trigonometric Identities Worksheet", subjectName: "Mathematics", className: "Grade 9 B", dueDate: new Date("2026-10-02"), submissionsCount: 14, totalStudents: 36 },
  ];

  const assignedTasks = [
    { id: "t-1", title: "Review Term 1 Pre-Board Question Blueprint", priority: "HIGH", dueDate: new Date("2026-09-28"), status: "IN_PROGRESS" },
    { id: "t-2", title: "Submit Grade 8A Attendance Ledger", priority: "MEDIUM", dueDate: new Date("2026-09-30"), status: "TODO" },
  ];

  return (
    <DemoShell
      roleCode="TEACHER"
      userName="Mrs. Sunita Sharma"
      userEmail="teacher@nexora.demo"
      institutionName="Northstar International Academy (Sandbox)"
    >
      <TeacherDashboard
        teacher={teacher}
        todaySchedule={todaySchedule}
        activeAssignments={activeAssignments}
        assignedTasks={assignedTasks}
      />
    </DemoShell>
  );
}
