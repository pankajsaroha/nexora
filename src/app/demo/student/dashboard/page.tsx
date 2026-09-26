import React from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";

export const dynamic = "force-dynamic";

export default function DemoStudentDashboardPage() {
  const student = {
    fullName: "Aarav Sharma",
    admissionNumber: "ADM-2026-0001",
    rollNumber: "14",
    className: "Grade 8",
    sectionName: "A",
    classTeacherName: "Mrs. Sunita Sharma",
  };

  const attendanceSummary = {
    totalDays: 24,
    presentCount: 23,
    absentCount: 0,
    lateCount: 1,
    percentage: 95.8,
  };

  const todaySchedule = [
    { period: 1, subjectName: "Mathematics", teacherName: "Mrs. Sunita Sharma", startTime: "08:30", endTime: "09:15", roomNumber: "Room-104" },
    { period: 2, subjectName: "Physics & Chemistry", teacherName: "Dr. Alok Verma", startTime: "09:20", endTime: "10:05", roomNumber: "Science Lab 1" },
    { period: 3, subjectName: "English Literature", teacherName: "Mrs. Meenakshi Sundaram", startTime: "10:20", endTime: "11:05", roomNumber: "Room-104" },
    { period: 4, subjectName: "Computer Science & AI", teacherName: "Mr. Rohan Joshi", startTime: "11:15", endTime: "12:00", roomNumber: "Computer Lab A" },
  ];

  const pendingAssignments = [
    { id: "a-1", title: "Linear Equations Problem Set 4", subjectName: "Mathematics", dueDate: new Date("2026-09-30"), maxMarks: 25, submissionStatus: "Pending" },
    { id: "a-2", title: "Optics & Ray Diagram Reflection Experiment", subjectName: "Physics", dueDate: new Date("2026-10-02"), maxMarks: 30, submissionStatus: "Submitted" },
  ];

  const feeStatus = {
    total: 36000,
    paid: 36000,
    pending: 0,
    status: "PAID" as const,
  };

  return (
    <DemoShell
      roleCode="STUDENT"
      userName="Aarav Sharma"
      userEmail="student@nexora.demo"
      institutionName="Northstar International Academy (Sandbox)"
    >
      <StudentDashboard
        student={student}
        attendanceSummary={attendanceSummary}
        todaySchedule={todaySchedule}
        pendingAssignments={pendingAssignments}
        feeStatus={feeStatus}
      />
    </DemoShell>
  );
}
