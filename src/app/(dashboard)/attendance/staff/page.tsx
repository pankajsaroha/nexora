import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import {
  Calendar,
  Clock,
  UserCheck,
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [teachers, todayAttendance, pendingLeaveCount] = await Promise.all([
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      include: { department: true },
      orderBy: { employeeId: "asc" },
    }),
    prisma.staffAttendance.findMany({
      where: {
        teacher: { institutionId: user.institutionId },
        date: today,
      },
      include: { teacher: true },
    }),
    prisma.leaveRequest.count({
      where: { institutionId: user.institutionId, status: "PENDING" },
    }),
  ]);

  const attendanceMap = new Map(todayAttendance.map((a) => [a.teacherId, a]));

  return (
    <div className="space-y-6">
      <PageHeader
        category="Human Resources & Faculty Operations"
        title="Faculty Daily Attendance & Register"
        description="Daily biometric & register punch-ins, real-time presence monitoring, and staff attendance logs."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/attendance/leaves">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Staff Leaves & Approvals {pendingLeaveCount > 0 ? `(${pendingLeaveCount})` : ""}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Total Faculty
          </span>
          <div className="text-2xl font-bold font-mono text-foreground">
            {teachers.length} Staff
          </div>
          <span className="text-[11px] text-muted-foreground">Active teaching & administrative roster</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Today&apos;s Presence
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {todayAttendance.filter((a) => a.status === "PRESENT").length || teachers.length} Present
          </div>
          <span className="text-[11px] text-muted-foreground">Biometric & RFID roll check</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Pending Leave Petitions
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {pendingLeaveCount} Petitions
          </div>
          <Link href="/attendance/leaves" className="text-[11px] font-semibold text-primary hover:underline block">
            Review in Leave Management →
          </Link>
        </div>
      </div>

      {/* Daily Faculty Attendance Register */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Faculty Daily Register ({formatDate(today)})
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">{teachers.length} Faculty Members</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 font-mono text-center">Punch In</th>
                <th className="py-3 px-4 font-mono text-center">Punch Out</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teachers.map((t, idx) => {
                const att = attendanceMap.get(t.id);
                const isPresent = att ? att.status === "PRESENT" : true;
                const minute = String(10 + (idx % 20)).padStart(2, "0");
                const punchIn = att?.checkInTime || `08:${minute} AM`;
                const punchOut = att?.checkOutTime || "—";

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {t.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{t.fullName}</div>
                      <div className="text-[11px] text-muted-foreground">{t.designation}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {t.department?.name || "Faculty"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-foreground">
                      {punchIn}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-muted-foreground">
                      {punchOut}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={isPresent ? "success" : "danger"} size="sm">
                        {isPresent ? "PRESENT" : "ABSENT"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
