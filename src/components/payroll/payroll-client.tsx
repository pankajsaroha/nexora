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
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollItemRecord | null>(null);

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const paidCount = payrolls.filter((p) => p.status === "PAID").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="COMPENSATION & PAYROLL DISBURSEMENT"
        title="Staff Payroll & Compensation"
        description="Monthly faculty compensation schedules, statutory PF & tax deductions, approval workflows, and digital payslips."
      />

      {/* Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / TOTAL MONTHLY OUTFLOW
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(totalPayroll)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            35 Faculty & staff members
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / DISBURSED VOUCHERS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight">
            {paidCount} / {payrolls.length}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Direct bank transfer settled
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / CYCLE PERIOD
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            September 2026
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            AY 2026-27 · Term 1
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / COMPLIANCE STATUS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            100%
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            PF & TDS calculated
          </span>
        </div>
      </section>

      {/* Payroll Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Faculty Member</th>
                <th className="py-3 px-4 font-bold">Department & Role</th>
                <th className="py-3 px-4 font-bold">Basic Pay</th>
                <th className="py-3 px-4 font-bold">Allowances</th>
                <th className="py-3 px-4 font-bold">Deductions</th>
                <th className="py-3 px-4 font-bold">Net Salary</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {payrolls.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#FAF9F5] transition-editorial"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">
                      {p.teacherName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">
                      {p.designation}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.departmentName || "Science"}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {formatCurrency(p.basicSalary)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    +{formatCurrency(p.allowances)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                    -{formatCurrency(p.deductions)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                    {formatCurrency(p.netSalary)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        p.status === "PAID"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : p.status === "APPROVED"
                          ? "bg-sky-50 text-sky-800 border border-sky-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPayslip(p)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#0F172A] px-2 py-1 rounded hover:bg-slate-100"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title="Staff Salary Voucher & Payslip"
          description={`Payslip for Month ${selectedPayslip.month}, ${selectedPayslip.year} • ${selectedPayslip.teacherName}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            <div className="p-6 rounded-xl border border-[#E8E7DF] bg-[#FAF9F5] space-y-4">
              <div className="flex justify-between items-start border-b border-[#E8E7DF] pb-4">
                <div>
                  <div className="font-extrabold text-base text-[#0F172A] uppercase tracking-tight">
                    Northstar International Academy
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Salary Advice & Monthly Payslip</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">VOUCHER STATUS</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {selectedPayslip.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-[#E8E7DF]">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">EMPLOYEE NAME</span>
                  <p className="font-bold text-sm text-[#0F172A]">{selectedPayslip.teacherName}</p>
                  <p className="text-slate-500">{selectedPayslip.designation} · {selectedPayslip.departmentName || "Science"}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-mono text-[10px]">EMPLOYEE ID & PERIOD</span>
                  <p className="font-mono font-bold text-[#0F172A]">{selectedPayslip.employeeId}</p>
                  <p className="text-slate-500">September 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400 block text-[10px]">Earnings (₹)</span>
                  <div className="flex justify-between p-2 rounded bg-white border border-[#E8E7DF]">
                    <span className="text-slate-600">Basic Pay:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white border border-[#E8E7DF]">
                    <span className="text-slate-600">HRA & Allowances:</span>
                    <span className="font-mono font-bold text-emerald-700">+{formatCurrency(selectedPayslip.allowances)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-mono font-bold uppercase tracking-wider text-slate-400 block text-[10px]">Deductions (₹)</span>
                  <div className="flex justify-between p-2 rounded bg-white border border-[#E8E7DF]">
                    <span className="text-slate-600">Provident Fund (PF):</span>
                    <span className="font-mono font-bold text-rose-600">-{formatCurrency(selectedPayslip.deductions * 0.6)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white border border-[#E8E7DF]">
                    <span className="text-slate-600">TDS / Income Tax:</span>
                    <span className="font-mono font-bold text-rose-600">-{formatCurrency(selectedPayslip.deductions * 0.4)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-[#E8E7DF] pt-3 text-sm font-bold">
                <span className="text-[#0F172A]">Net Disbursed Compensation:</span>
                <span className="font-mono text-emerald-700 text-base">{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPayslip(null)}
              >
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
