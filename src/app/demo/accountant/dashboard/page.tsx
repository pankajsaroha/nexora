import React from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import { AccountantDashboard } from "@/components/dashboards/accountant-dashboard";

export const dynamic = "force-dynamic";

export default function DemoAccountantDashboardPage() {
  const stats = {
    totalCollected: 1840000,
    totalPending: 320000,
    todayCollections: 85000,
    overdueInvoicesCount: 4,
    monthlyPayrollTotal: 1925000,
  };

  const recentPayments = [
    { id: "p-1", receiptNumber: "REC-2026-089", studentName: "Aarav Sharma", className: "Grade 8", amount: 36000, paymentMethod: "UPI_ONLINE", paymentDate: new Date("2026-09-24") },
    { id: "p-2", receiptNumber: "REC-2026-088", studentName: "Rohan Varma", className: "Grade 10", amount: 42000, paymentMethod: "NET_BANKING", paymentDate: new Date("2026-09-23") },
    { id: "p-3", receiptNumber: "REC-2026-087", studentName: "Ananya Iyer", className: "Grade 6", amount: 32000, paymentMethod: "CARD", paymentDate: new Date("2026-09-22") },
  ];

  const overdueAccounts = [
    { id: "o-1", studentName: "Karan Johar", className: "Grade 9 B", pendingAmount: 28000, dueDate: new Date("2026-09-15"), parentPhone: "+91 98111 22334" },
    { id: "o-2", studentName: "Sneha Patel", className: "Grade 11 Science", pendingAmount: 35000, dueDate: new Date("2026-09-15"), parentPhone: "+91 98222 33445" },
  ];

  return (
    <DemoShell
      roleCode="ACCOUNTANT"
      userName="Mr. Vikram Malhotra"
      userEmail="accountant@nexora.demo"
      institutionName="Northstar International Academy (Sandbox)"
    >
      <AccountantDashboard
        stats={stats}
        recentPayments={recentPayments}
        overdueAccounts={overdueAccounts}
      />
    </DemoShell>
  );
}
