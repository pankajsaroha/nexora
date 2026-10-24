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
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Financial Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(stats.todayCollections)} collected today. Total fee realization stands at{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(stats.totalCollected)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Audit Report</span>
          </Link>
          <Link
            href="/finance/fees"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Financial Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all min-w-0">
          <span className="text-kpi-label block truncate">
            Total Collection
          </span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {formatCurrency(stats.totalCollected)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-success block font-semibold line-clamp-1 leading-snug">
            85.2% realization rate
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all min-w-0">
          <span className="text-kpi-label block truncate">
            Today&apos;s Receivables
          </span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {formatCurrency(stats.todayCollections)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium line-clamp-1 leading-snug">
            UPI &amp; Net Banking reconciliations
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all min-w-0">
          <span className="text-kpi-label block truncate">
            Outstanding Dues
          </span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-destructive tabular-nums truncate">
            {formatCurrency(stats.totalPending)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-destructive block font-semibold line-clamp-1 leading-snug">
            {stats.overdueInvoicesCount} Overdue accounts
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all min-w-0">
          <span className="text-kpi-label block truncate">
            Monthly Payroll
          </span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {formatCurrency(stats.monthlyPayrollTotal || 1925000)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium line-clamp-1 leading-snug">
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
              <h2 className="heading-section">
                Recent 3-Part Official Receipts
              </h2>
              <p className="text-xs text-muted-foreground">Settled tuition &amp; transport fees</p>
            </div>
            <Link href="/finance/fees" className="text-xs font-semibold text-primary hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs text-xs">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No payment records logged today.</div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">
                      <span className="font-mono text-xs">{p.receiptNumber}</span> • {p.studentName}
                    </p>
                    <p className="text-caption text-muted-foreground">{p.className} · {p.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-success">{formatCurrency(p.amount)}</span>
                    <span className="text-caption text-muted-foreground block">{formatDate(p.paymentDate)}</span>
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
              <h2 className="heading-section">
                Overdue Student Dues
              </h2>
              <p className="text-xs text-muted-foreground">Term accounts requiring reminder dispatch</p>
            </div>
            <span className="text-xs font-semibold text-destructive">
              {overdueAccounts.length} Pending
            </span>
          </div>

          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs text-xs">
            {overdueAccounts.length === 0 ? (
              <div className="p-6 text-center text-xs text-success">
                <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
                <span>All tuition accounts are fully reconciled.</span>
              </div>
            ) : (
              overdueAccounts.map((acc) => (
                <div key={acc.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{acc.studentName}</p>
                    <p className="text-caption text-muted-foreground">{acc.className} · Tel: {acc.parentPhone || "—"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-destructive">{formatCurrency(acc.pendingAmount)}</span>
                    <span className="text-caption text-destructive block">Due {formatDate(acc.dueDate)}</span>
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
