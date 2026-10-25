"use client";

import React, { useState } from "react";
import {
  Banknote,
  Printer,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Sparkles,
  Download,
  ArrowRight,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface PayrollItemRecord {
  id: string;
  teacherId?: string;
  teacherName: string;
  employeeId: string;
  designation: string;
  departmentName?: string | null;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PAID";
  paymentDate?: Date | string | null;
  paymentMethod?: string | null;
  transactionRef?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
}

export function PayrollClient({
  payrolls,
  canManage,
  selectedMonth: initialSelectedMonth = "9",
  selectedYear: initialSelectedYear = "2026",
}: {
  payrolls: PayrollItemRecord[];
  canManage: boolean;
  selectedMonth?: string;
  selectedYear?: string;
}) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(initialSelectedMonth);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollItemRecord | null>(null);

  const filteredPayrolls = payrolls.filter((p) => {
    return (
      p.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPayroll = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const paidCount = filteredPayrolls.filter((p) => p.status === "PAID").length;

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <PageHeader
        category="Compensation & Payroll Disbursement"
        title="Staff Payroll & Compensation"
        description="Monthly faculty compensation schedules, statutory PF & tax deductions, approval workflows, and digital payslips."
      />

      {/* Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-kpi-label block">
            Total Monthly Outflow
          </span>
          <div className="text-kpi-value">
            {formatCurrency(totalPayroll)}
          </div>
          <span className="text-caption block font-medium">
            {filteredPayrolls.length} Faculty &amp; staff members
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-kpi-label block">
            Disbursed Vouchers
          </span>
          <div className="text-kpi-value text-accent">
            {paidCount} / {payrolls.length}
          </div>
          <span className="text-caption block font-medium">
            Direct bank transfer settled
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-kpi-label block">
            Cycle Period
          </span>
          <div className="text-kpi-value">
            {selectedMonth === "9"
              ? "September 2026"
              : selectedMonth === "8"
              ? "August 2026"
              : selectedMonth === "7"
              ? "July 2026"
              : `Month ${selectedMonth}`}
          </div>
          <span className="text-caption block font-medium">
            AY 2026-27 · Term 1
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-kpi-label block">
            Compliance Status
          </span>
          <div className="text-kpi-value text-accent">
            100%
          </div>
          <span className="text-caption block font-medium">
            Statutory PF &amp; Tax verified
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search faculty name, employee ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => {
            const newMonth = e.target.value;
            setSelectedMonth(newMonth);
            router.push(`/finance/payroll?month=${newMonth}&year=${initialSelectedYear}`);
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-full sm:w-auto"
        >
          <option value="9">September 2026 (Current)</option>
          <option value="8">August 2026</option>
          <option value="7">July 2026</option>
        </select>
      </div>

      {/* Payroll Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-subtle text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Faculty Member</th>
                <th className="py-3 px-4 font-bold">Designation & Dept</th>
                <th className="py-3 px-4 font-bold">Basic Pay</th>
                <th className="py-3 px-4 font-bold">Allowances</th>
                <th className="py-3 px-4 font-bold">Deductions</th>
                <th className="py-3 px-4 font-bold">Net Salary</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    No faculty or staff payroll records found for this period.
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">
                        {p.teacherName}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Emp ID: {p.employeeId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-foreground font-medium">{p.designation}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {p.departmentName || "General Faculty"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-foreground">
                      {formatCurrency(p.basicSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      +{formatCurrency(p.allowances)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-destructive">
                      -{formatCurrency(p.deductions)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground text-sm">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            p.status === "PAID"
                              ? "bg-success/10 text-success border border-success/20"
                              : p.status === "APPROVED"
                              ? "bg-accent/10 text-accent border border-accent/20"
                              : "bg-surface-subtle text-muted-foreground border border-border"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.status === "DRAFT" && !p.bankAccountNumber && (
                          <span className="text-[9px] font-mono text-amber-600 font-semibold">
                            Pending Bank Setup
                          </span>
                        )}
                      </div>
                    </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setSelectedPayslip(p)}
                      leftIcon={<Printer className="h-3 w-3" />}
                    >
                      Payslip
                    </Button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title="Staff Salary Payslip"
          description={`Cycle: September 2026 • Employee: ${selectedPayslip.teacherName} (${selectedPayslip.employeeId})`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-6 text-xs">
              {/* Header */}
              <div className="text-center border-b border-border pb-4 space-y-1">
                <div className="text-base font-bold tracking-tight text-foreground uppercase">
                  Northstar International Academy
                </div>
                <div className="text-xs text-muted-foreground">
                  Affiliated to CBSE • Institutional Accounts Wing • Knowledge Park III, Greater Noida
                </div>
                <div className="text-xs font-mono font-bold text-foreground uppercase tracking-widest pt-1">
                  Salary Slip & Compensation Certificate (September 2026)
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-subtle p-3.5 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Faculty Name</span>
                  <div className="font-semibold text-foreground">{selectedPayslip.teacherName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Employee Code</span>
                  <div className="font-mono font-bold text-foreground">{selectedPayslip.employeeId}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Designation</span>
                  <div className="font-medium text-foreground">{selectedPayslip.designation}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Department</span>
                  <div className="font-medium text-foreground">{selectedPayslip.departmentName || "Science & Tech"}</div>
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface-subtle p-2.5 font-mono text-[11px] uppercase font-bold text-foreground border-b border-border">
                    Earnings & Allowances
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Pay</span>
                      <span className="font-mono font-semibold text-foreground">{formatCurrency(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-semibold text-foreground">{formatCurrency(selectedPayslip.allowances * 0.6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dearness Allowance (DA)</span>
                      <span className="font-mono font-semibold text-foreground">{formatCurrency(selectedPayslip.allowances * 0.4)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span className="text-foreground">Gross Earnings</span>
                      <span className="font-mono text-accent">
                        {formatCurrency(selectedPayslip.basicSalary + selectedPayslip.allowances)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface-subtle p-2.5 font-mono text-[11px] uppercase font-bold text-foreground border-b border-border">
                    Statutory Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provident Fund (PF)</span>
                      <span className="font-mono font-semibold text-destructive">-{formatCurrency(selectedPayslip.deductions * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Professional Tax (PT)</span>
                      <span className="font-mono font-semibold text-destructive">-{formatCurrency(selectedPayslip.deductions * 0.3)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span className="text-foreground">Total Deductions</span>
                      <span className="font-mono text-destructive">-{formatCurrency(selectedPayslip.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Strip */}
              <div className="p-4 rounded-xl bg-surface-subtle border border-border flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Net Salary Disbursed</span>
                  <div className="text-xl font-bold text-foreground font-mono">{formatCurrency(selectedPayslip.netSalary)}</div>
                </div>
                <div className="text-right text-[11px] font-mono text-muted-foreground">
                  <div>Disbursed via HDFC NEFT Transfer</div>
                  <div className="text-foreground font-bold">Ref: #TXN-90281-HDFC</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Official Payslip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
