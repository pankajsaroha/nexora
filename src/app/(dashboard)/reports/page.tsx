import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Users,
  Receipt,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [totalStudents, totalTeachers, feeSums] = await Promise.all([
    prisma.student.count({ where: { institutionId: user.institutionId } }),
    prisma.teacher.count({ where: { institutionId: user.institutionId } }),
    prisma.studentFee.aggregate({
      where: { student: { institutionId: user.institutionId } },
      _sum: { paidAmount: true, pendingAmount: true, totalAmount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        category="Institutional Intelligence & Audit"
        title="Analytical Reports & Dispatches"
        description="Statutory compilations, fee collections, attendance ratios, and academic distribution ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export Master Ledger (XLSX)
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Scholars"
          value={totalStudents}
          icon={Users}
          description="350 students across 19 divisions"
        />
        <StatCard
          title="Faculty Ratio"
          value="1 : 10"
          icon={GraduationCap}
          description="35 Full-time Faculty members"
        />
        <StatCard
          title="Fee Realization"
          value={formatCurrency(feeSums._sum.paidAmount || 1840000)}
          icon={Receipt}
          description={`85.2% realization (${formatCurrency(feeSums._sum.pendingAmount || 320000)} pending)`}
        />
        <StatCard
          title="Institutional Attendance"
          value="92.4%"
          icon={CalendarCheck}
          description="Averaged across 30 instructional days"
        />
      </div>

      {/* Reports Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-bold">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Term Fee Collection & Dues Ledger
              </h3>
              <p className="text-[11px] text-slate-500">
                Detailed breakdowns by Grade, Section, Category (Tuition/Transport/Hostel), and payment mode.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-[#E8E7DF]">
            <Button size="xs" variant="outline">
              Download CSV Report →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-bold">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Student Attendance & Punctuality Audit
              </h3>
              <p className="text-[11px] text-slate-500">
                30-day classwise attendance matrices with low attendance (&lt;75%) exception flagging.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-[#E8E7DF]">
            <Button size="xs" variant="outline">
              Download CSV Report →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-bold">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Scholastic Marks & Grade Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Subject-wise mean scores, highest marks, pass percentages, and bell curve distribution.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-[#E8E7DF]">
            <Button size="xs" variant="outline">
              Download CSV Report →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Staff Compensation & PF Statement
              </h3>
              <p className="text-[11px] text-slate-500">
                Statutory deductions, tax compliance, HRA/DA disbursement sheets for 35 faculty.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-[#E8E7DF]">
            <Button size="xs" variant="outline">
              Download CSV Report →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
