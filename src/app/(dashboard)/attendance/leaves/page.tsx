import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Clock, Calendar, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeacherLeavesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const teacher = await prisma.teacher.findFirst({
    where: {
      OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
    },
    include: {
      department: true,
      leaveRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const leaveRequests = teacher?.leaveRequests || [];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Faculty Services & Entitlements"
        title="Leave Entitlement & Applications"
        description="Submit time-off requests, view approval decisions, and monitor statutory leave allowances."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Apply Leave
            </Button>
          </div>
        }
      />

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Casual Leave (CL)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {teacher?.casualLeaveBalance || 12}{" "}
            <span className="text-xs font-normal text-slate-400">/ 12 Days</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Available for general personal time-off</p>
        </div>

        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Medical Leave (SL)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {teacher?.sickLeaveBalance || 10}{" "}
            <span className="text-xs font-normal text-slate-400">/ 10 Days</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">Medical certificates required for &gt;2 days</p>
        </div>

        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Annual / Earned Leave (EL)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {teacher?.earnedLeaveBalance || 15}{" "}
            <span className="text-xs font-normal text-slate-400">/ 15 Days</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">Accumulated vacation & term-break quota</p>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Leave Application History
          </h2>
          <span className="text-[11px] font-mono text-slate-400">{leaveRequests.length} Total Petitions</span>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-[#E8E7DF]">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Scheduled Dates</th>
                <th className="py-3 px-4">Total Days</th>
                <th className="py-3 px-4">Stated Reason</th>
                <th className="py-3 px-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No active or past leave applications on record.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((lr) => (
                  <tr key={lr.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <Badge variant="outline" size="sm">
                        {lr.leaveType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                      {formatDate(lr.startDate)} to {formatDate(lr.endDate)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {lr.totalDays} Day{lr.totalDays > 1 ? "s" : ""}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate text-[11px]">{lr.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          lr.status === "APPROVED"
                            ? "success"
                            : lr.status === "PENDING"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {lr.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
