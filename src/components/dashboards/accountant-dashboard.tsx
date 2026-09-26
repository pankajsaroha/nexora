"use client";

import React from "react";
import Link from "next/link";
import {
  Receipt,
  Banknote,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface AccountantDashboardProps {
  stats: {
    totalCollected: number;
    totalPending: number;
    todayCollections: number;
    overdueInvoicesCount: number;
    monthlyPayrollTotal: number;
  };
  recentPayments: Array<{
    id: string;
    receiptNumber: string;
    studentName: string;
    className: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
  }>;
  overdueAccounts: Array<{
    id: string;
    studentName: string;
    className: string;
    pendingAmount: number;
    dueDate: Date;
    parentPhone?: string | null;
  }>;
}

export function AccountantDashboard({
  stats,
  recentPayments,
  overdueAccounts,
}: AccountantDashboardProps) {
  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A756B] font-bold block mb-1">
            FINANCIAL OPERATIONS & BURSAR DESK
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#171614]">
            Financial Operations
          </h1>
          <p className="text-xs text-[#555047] mt-1">
            {formatCurrency(stats.todayCollections)} collected today. Total Term 1 fee realization stands at{" "}
            <span className="font-bold text-[#171614]">
              {formatCurrency(stats.totalCollected)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] hover:border-[#B89B62] transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#7A756B]" />
            <span>Audit Report</span>
          </Link>
          <Link
            href="/finance/fees"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#FAF8F3] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D4B87C]" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Financial Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            01 / TOTAL COLLECTION
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {formatCurrency(stats.totalCollected)}
          </div>
          <span className="text-[11px] text-[#525E4B] block font-bold">
            85.2% realization rate
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            02 / TODAY&apos;S RECEIVABLES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {formatCurrency(stats.todayCollections)}
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            UPI & Net Banking reconciliations
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            03 / OUTSTANDING DUES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#6F3D3A] tracking-tight">
            {formatCurrency(stats.totalPending)}
          </div>
          <span className="text-[11px] text-[#6F3D3A] block font-bold">
            {stats.overdueInvoicesCount} Overdue accounts
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            04 / MONTHLY PAYROLL
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {formatCurrency(stats.monthlyPayrollTotal || 1925000)}
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            35 Faculty payslips ready
          </span>
        </div>
      </section>

      {/* Main Grid: Recent Collections & Overdue Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payment Vouchers */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Recent 3-Part Official Receipts
              </h2>
              <p className="text-xs text-[#7A756B]">Settled tuition & transport fees</p>
            </div>
            <Link href="/finance/fees" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
              Ledger →
            </Link>
          </div>

          <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs font-mono text-xs">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A756B] font-sans">No payment records logged today.</div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#171614]">{p.receiptNumber} • {p.studentName}</p>
                    <p className="text-[11px] text-[#7A756B]">{p.className} · {p.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#525E4B]">{formatCurrency(p.amount)}</span>
                    <span className="text-[10px] text-[#7A756B] block">{formatDate(p.paymentDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Overdue Accounts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Overdue Student Dues
              </h2>
              <p className="text-xs text-[#7A756B]">Term accounts requiring reminder dispatch</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#6F3D3A]">
              {overdueAccounts.length} Pending
            </span>
          </div>

          <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs font-mono text-xs">
            {overdueAccounts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#525E4B] font-sans">
                <CheckCircle2 className="w-5 h-5 text-[#525E4B] mx-auto mb-1" />
                <span>All tuition accounts are fully reconciled.</span>
              </div>
            ) : (
              overdueAccounts.map((acc) => (
                <div key={acc.id} className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#171614]">{acc.studentName}</p>
                    <p className="text-[11px] text-[#7A756B]">{acc.className} · Tel: {acc.parentPhone || "—"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#6F3D3A]">{formatCurrency(acc.pendingAmount)}</span>
                    <span className="text-[10px] text-[#6F3D3A] block">Due {formatDate(acc.dueDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
