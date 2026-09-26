import React from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import { ParentDashboard } from "@/components/dashboards/parent-dashboard";

export const dynamic = "force-dynamic";

export default function DemoParentDashboardPage() {
  const childrenList = [
    {
      id: "child-1",
      fullName: "Aarav Sharma",
      admissionNumber: "ADM-2026-0001",
      className: "Grade 8",
      sectionName: "A",
      rollNumber: "14",
      classTeacherName: "Mrs. Sunita Sharma",
      classTeacherPhone: "+91 98100 11002",
      attendancePct: 95.8,
      totalClasses: 24,
      presentCount: 23,
      absentCount: 0,
      assignments: [
        { id: "as-1", title: "Linear Equations Problem Set 4", subjectName: "Mathematics", dueDate: new Date("2026-09-30"), status: "Assigned" },
        { id: "as-2", title: "Optics & Reflection Practical Notes", subjectName: "Physics", dueDate: new Date("2026-10-02"), status: "Assigned" },
      ],
      fees: {
        total: 36000,
        paid: 36000,
        pending: 0,
        status: "PAID" as const,
        dueDate: new Date("2026-10-15"),
      },
    },
    {
      id: "child-2",
      fullName: "Meera Sharma",
      admissionNumber: "ADM-2026-0084",
      className: "Grade 5",
      sectionName: "B",
      rollNumber: "09",
      classTeacherName: "Mrs. Preeti Sen",
      classTeacherPhone: "+91 98100 22003",
      attendancePct: 91.6,
      totalClasses: 24,
      presentCount: 22,
      absentCount: 2,
      assignments: [
        { id: "as-3", title: "Ecosystems and Plant Life Chart", subjectName: "Environmental Science", dueDate: new Date("2026-10-01"), status: "Assigned" },
      ],
      fees: {
        total: 32000,
        paid: 32000,
        pending: 0,
        status: "PAID" as const,
        dueDate: new Date("2026-10-15"),
      },
    },
  ];

  return (
    <DemoShell
      roleCode="PARENT"
      userName="Mr. Rajesh Sharma"
      userEmail="parent@nexora.demo"
      institutionName="Northstar International Academy (Sandbox)"
    >
      <ParentDashboard
        parentName="Mr. Rajesh Sharma"
        childrenList={childrenList}
      />
    </DemoShell>
  );
}
