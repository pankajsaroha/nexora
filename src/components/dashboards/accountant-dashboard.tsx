"use client";

import React from "react";
import Link from "next/link";
import {
  Receipt,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Users,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  MessageCircle,
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
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E8E7DF] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
            FINANCIAL OPERATIONS & BURSAR DESK
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Financial Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(stats.todayCollections)} collected today. Total Term 1 fee realization stands at{" "}
            <span className="font-semibold text-[#0F172A]">
              {formatCurrency(stats.totalCollected)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 transition-editorial"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Reconciliation Report</span>
          </Link>
          <Link
            href="/finance/fees"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-editorial shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Financial Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / TOTAL COLLECTION
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(stats.totalCollected)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            85.4% Term 1 Realization
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / PENDING RECEIVABLES
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(stats.totalPending)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {overdueAccounts.length} Overdue Accounts
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / TODAY&apos;S INFLOW
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(stats.todayCollections)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            UPI & Direct Bank Transfers
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / MONTHLY PAYROLL
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(stats.monthlyPayrollTotal)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            35 Staff Vouchers Disbursed
          </span>
        </div>
      </section>

      {/* Main Grid: Recent Collections Ledger vs Overdue Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Fee Transactions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Recent Fee Receipts
              </h2>
              <p className="text-xs text-slate-500">Live payment reconciliations from parents</p>
            </div>
            <Link
              href="/finance/fees"
              className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
            >
              All Invoices →
            </Link>
          </div>

          <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No fee payment records found.
              </div>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">{p.studentName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {p.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receipt #{p.receiptNumber} · {p.paymentMethod} · {formatDate(p.paymentDate, "dd MMM yyyy")}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-emerald-700 block">
                      +{formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      Settled
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Overdue Accounts Follow-Up */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Overdue Accounts Pending Follow-Up
              </h2>
              <p className="text-xs text-slate-500">Accounts exceeding grace period</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-600">
              {overdueAccounts.length} Overdue
            </span>
          </div>

          <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
            {overdueAccounts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span>Zero overdue accounts. All fee payments are on schedule!</span>
              </div>
            ) : (
              overdueAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">{acc.studentName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {acc.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Due since {formatDate(acc.dueDate)} {acc.parentPhone ? `· Ph: ${acc.parentPhone}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-rose-600 block">
                        {formatCurrency(acc.pendingAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Outstanding
                      </span>
                    </div>
                    <Link
                      href="/finance/fees"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 transition-editorial"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>Alert</span>
                    </Link>
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

