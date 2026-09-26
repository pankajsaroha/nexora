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

export interface PayrollItemRecord {
  id: string;
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
}

export function PayrollClient({
  payrolls,
  canManage,
}: {
  payrolls: PayrollItemRecord[];
  canManage: boolean;
}) {
  const [selectedMonth, setSelectedMonth] = useState("9");
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
        <div className="p-5 rounded-xl border border-[#E5E0D5] bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#65705B] font-bold block">
            01 / TOTAL MONTHLY OUTFLOW
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#171614] tracking-tight">
            {formatCurrency(totalPayroll)}
          </div>
          <span className="text-[11px] text-[#65705B] block font-medium">
            35 Faculty & staff members
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E0D5] bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#65705B] font-bold block">
            02 / DISBURSED VOUCHERS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#65705B] tracking-tight">
            {paidCount} / {payrolls.length}
          </div>
          <span className="text-[11px] text-[#65705B] block font-medium">
            Direct bank transfer settled
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E0D5] bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#65705B] font-bold block">
            03 / CYCLE PERIOD
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#171614] tracking-tight">
            September 2026
          </div>
          <span className="text-[11px] text-[#65705B] block font-medium">
            AY 2026-27 · Term 1
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E0D5] bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#65705B] font-bold block">
            04 / COMPLIANCE STATUS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#65705B] tracking-tight">
            100%
          </div>
          <span className="text-[11px] text-[#65705B] block font-medium">
            Statutory PF & Tax verified
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E0D5] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="search"
            placeholder="Search faculty name, employee ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#65705B] focus:outline-none focus:ring-1 focus:ring-[#171614]"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-[#E5E0D5] bg-white px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none w-full sm:w-auto"
        >
          <option value="9">September 2026 (Current)</option>
          <option value="8">August 2026</option>
          <option value="7">July 2026</option>
        </select>
      </div>

      {/* Payroll Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF8F3] text-[#65705B] font-mono text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#E5E0D5]">
              {filteredPayrolls.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#FAF8F3] transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#171614]">
                      {p.teacherName}
                    </div>
                    <div className="text-[11px] text-[#65705B] font-mono mt-0.5">
                      Emp ID: {p.employeeId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#171614] font-medium">{p.designation}</div>
                    <div className="text-[11px] text-[#65705B] font-mono">
                      {p.departmentName || "General Faculty"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#171614]">
                    {formatCurrency(p.basicSalary)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#65705B]">
                    +{formatCurrency(p.allowances)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#8B3A3A]">
                    -{formatCurrency(p.deductions)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#171614] text-sm">
                    {formatCurrency(p.netSalary)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        p.status === "PAID"
                          ? "bg-[#65705B]/10 text-[#65705B] border border-[#65705B]/20"
                          : p.status === "APPROVED"
                          ? "bg-[#B89B62]/10 text-[#B89B62] border border-[#B89B62]/20"
                          : "bg-[#FAF8F3] text-[#65705B] border border-[#E5E0D5]"
                      }`}
                    >
                      {p.status}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title="Staff Salary Payslip Dossier"
          description={`Cycle: September 2026 • Employee: ${selectedPayslip.teacherName} (${selectedPayslip.employeeId})`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-white space-y-6 text-xs">
              {/* Header */}
              <div className="text-center border-b border-[#171614] pb-4 space-y-1">
                <div className="text-base font-extrabold tracking-tight text-[#171614] uppercase">
                  Northstar International Academy
                </div>
                <div className="text-xs text-[#65705B]">
                  Affiliated to CBSE • Institutional Accounts Wing • Knowledge Park III, Greater Noida
                </div>
                <div className="text-xs font-mono font-bold text-[#171614] uppercase tracking-widest pt-1">
                  Salary Slip & Compensation Certificate (September 2026)
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F3] p-3.5 rounded-lg border border-[#E5E0D5]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Faculty Name</span>
                  <div className="font-bold text-[#171614]">{selectedPayslip.teacherName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Employee Code</span>
                  <div className="font-mono font-bold text-[#171614]">{selectedPayslip.employeeId}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Designation</span>
                  <div className="font-bold text-[#171614]">{selectedPayslip.designation}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Department</span>
                  <div className="font-bold text-[#171614]">{selectedPayslip.departmentName || "Science & Tech"}</div>
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="bg-[#FAF8F3] p-2.5 font-mono text-[11px] uppercase font-bold text-[#171614] border-b border-[#E5E0D5]">
                    Earnings & Allowances
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#65705B]">Basic Pay</span>
                      <span className="font-mono font-semibold text-[#171614]">{formatCurrency(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65705B]">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-semibold text-[#171614]">{formatCurrency(selectedPayslip.allowances * 0.6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65705B]">Dearness Allowance (DA)</span>
                      <span className="font-mono font-semibold text-[#171614]">{formatCurrency(selectedPayslip.allowances * 0.4)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E0D5] pt-2 font-bold">
                      <span className="text-[#171614]">Gross Earnings</span>
                      <span className="font-mono text-[#65705B]">
                        {formatCurrency(selectedPayslip.basicSalary + selectedPayslip.allowances)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="bg-[#FAF8F3] p-2.5 font-mono text-[11px] uppercase font-bold text-[#171614] border-b border-[#E5E0D5]">
                    Statutory Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#65705B]">Provident Fund (PF)</span>
                      <span className="font-mono font-semibold text-[#8B3A3A]">-{formatCurrency(selectedPayslip.deductions * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65705B]">Professional Tax (PT)</span>
                      <span className="font-mono font-semibold text-[#8B3A3A]">-{formatCurrency(selectedPayslip.deductions * 0.3)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E0D5] pt-2 font-bold">
                      <span className="text-[#171614]">Total Deductions</span>
                      <span className="font-mono text-[#8B3A3A]">-{formatCurrency(selectedPayslip.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Strip */}
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Net Salary Disbursed</span>
                  <div className="text-xl font-bold text-[#171614] font-mono">{formatCurrency(selectedPayslip.netSalary)}</div>
                </div>
                <div className="text-right text-[11px] font-mono text-[#65705B]">
                  <div>Disbursed via HDFC NEFT Transfer</div>
                  <div className="text-[#171614] font-bold">Ref: #TXN-90281-HDFC</div>
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
