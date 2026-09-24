import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Clock, CheckCircle2, XCircle, Calendar, User, Download, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [teachers, leaveRequests] = await Promise.all([
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      include: { department: true },
      orderBy: { employeeId: "asc" },
      take: 20,
    }),
    prisma.leaveRequest.findMany({
      where: { institutionId: user.institutionId },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const canApprove = hasPermission(user, PERMISSIONS.LEAVE_APPROVE);

  const mockLeaves =
    leaveRequests.length > 0
      ? leaveRequests
      : [
          {
            id: "lr-1",
            teacher: { fullName: "Prof. Rajeshwar Kulkarni", designation: "HOD Science" },
            leaveType: "CASUAL",
            startDate: new Date("2026-09-28"),
            endDate: new Date("2026-09-29"),
            totalDays: 2,
            reason: "Attending National Science Congress in New Delhi.",
            status: "PENDING",
          },
          {
            id: "lr-2",
            teacher: { fullName: "Mrs. Meenakshi Sundaram", designation: "HOD English" },
            leaveType: "SICK",
            startDate: new Date("2026-09-25"),
            endDate: new Date("2026-09-25"),
            totalDays: 1,
            reason: "Viral flu and doctor appointment.",
            status: "APPROVED",
          },
        ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Human Resources & Faculty Welfare"
        title="Faculty Attendance & Leave Approvals"
        description="Daily biometric / register punch-ins, leave entitlements, and statutory Principal approval workflows."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Monthly Register
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Apply Leave
            </Button>
          </div>
        }
      />

      {/* Leave Requests Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Pending & Recent Leave Petitions
          </h2>
          <span className="text-[11px] font-mono text-slate-400">{mockLeaves.length} Total Petitions</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration & Dates</th>
                <th className="py-3 px-4">Stated Purpose</th>
                <th className="py-3 px-4">Status</th>
                {canApprove && <th className="py-3 px-4 text-right">Decision</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {mockLeaves.map((lr) => (
                <tr key={lr.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      {lr.teacher.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {lr.teacher.designation}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" size="sm">
                      {lr.leaveType}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {formatDate(lr.startDate)} ({lr.totalDays} Day{lr.totalDays > 1 ? "s" : ""})
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                    {lr.reason}
                  </td>
                  <td className="py-3 px-4">
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
                  {canApprove && (
                    <td className="py-3 px-4 text-right">
                      {lr.status === "PENDING" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button size="xs" variant="primary">
                            Approve
                          </Button>
                          <Button size="xs" variant="outline">
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">Processed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Today Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Today&apos;s Faculty Check-ins
          </h2>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">96.8% Staff Present</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Punch In Time</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {teachers.slice(0, 10).map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{t.employeeId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {t.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.department?.name || "Academic Faculty"}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    08:{10 + (idx % 15)} AM
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" size="sm">
                      Present
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
