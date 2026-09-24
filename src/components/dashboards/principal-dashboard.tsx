"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CheckSquare,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface PrincipalDashboardProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    attendanceTodayPct: number;
    totalFeeCollected: number;
    totalFeePending: number;
    pendingLeaveRequests: number;
    overdueTasksCount: number;
    lowAttendanceCount: number;
  };
  attentionItems: Array<{
    id: string;
    type: "ATTENDANCE" | "FEE" | "LEAVE" | "TASK";
    title: string;
    subtitle: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    linkUrl: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    targetAudience: string;
    publishedAt: Date;
    authorName: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    userName?: string | null;
    createdAt: Date;
    details?: string | null;
  }>;
}

export function PrincipalDashboard({
  stats,
  attentionItems,
  recentAnnouncements,
  recentAuditLogs,
}: PrincipalDashboardProps) {
  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E8E7DF] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
            EXECUTIVE COMMAND OVERVIEW
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Good afternoon, Dr. Menon.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here is the institutional operational and financial picture for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 transition-editorial"
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Broadcast Notice</span>
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-editorial shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Assign Task</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Clean Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / TOTAL ENROLLMENT
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {stats.totalStudents || 350}+
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            19 Synchronized cohorts
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / ACTIVE FACULTY
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {stats.totalTeachers || 35}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            6 Academic departments
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {stats.attendanceTodayPct}%
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Biometric verification active
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / REVENUE COLLECTED
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(stats.totalFeeCollected || 1840000)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {formatCurrency(stats.totalFeePending || 320000)} pending
          </span>
        </div>
      </section>

      {/* Main Grid: Needs Attention & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Needs Attention & Operations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Needs Attention Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  Operational Exceptions
                </h2>
                <p className="text-xs text-slate-500">Items requiring administrative or faculty attention</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {attentionItems.length} Issues Detected
              </span>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {attentionItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <span>All institutional parameters are operating within normal thresholds.</span>
                </div>
              ) : (
                attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.linkUrl}
                    className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial group"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.severity === "HIGH"
                            ? "bg-rose-500"
                            : item.severity === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 group-hover:text-[#0F172A]">
                      <span className="text-[11px] uppercase tracking-wider font-mono">Resolve</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-[#0F172A]" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Academic & Revenue Analytics (Clean Minimalist Dossier) */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              Academic Health & Fee Collections
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">Attendance Distribution</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">92.4% Avg</span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { grade: "Primary (Grades 5-7)", pct: 95.1, status: "Excellent" },
                    { grade: "Middle School (Grades 8-9)", pct: 92.4, status: "Normal" },
                    { grade: "Secondary (Grades 10-12)", pct: 89.8, status: "Review" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                      <span className="font-medium text-slate-700">{row.grade}</span>
                      <span className="font-mono font-bold text-[#0F172A]">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">Fee Invoicing Status</span>
                  <span className="text-[11px] font-mono text-[#0F172A] font-bold">AY 2026-27</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                    <span className="text-slate-600">Total Billed:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(2160000)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                    <span className="text-slate-600">Disbursed / Paid:</span>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(stats.totalFeeCollected || 1840000)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                    <span className="text-slate-600">Net Outstanding:</span>
                    <span className="font-mono font-bold text-amber-700">{formatCurrency(stats.totalFeePending || 320000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Col: Timeline Activity & Notices */}
        <div className="space-y-8">
          {/* Institutional Notices */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Recent Bulletins
              </h2>
              <Link href="/announcements" className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]">
                View all →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {recentAnnouncements.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center">No active bulletins published.</p>
              ) : (
                recentAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {ann.targetAudience}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(ann.publishedAt)}</span>
                    </div>
                    <p className="text-xs font-bold text-[#0F172A] leading-snug">{ann.title}</p>
                    <p className="text-[10px] text-slate-500">By {ann.authorName}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Real-Time Security Audit Stream */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Live Activity Log
              </h2>
              <Link href="/audit-logs" className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]">
                Audit log →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden text-xs shadow-2xs">
              {recentAuditLogs.length === 0 ? (
                <p className="p-4 text-slate-400 text-center text-xs">No audit trails recorded yet.</p>
              ) : (
                recentAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      {log.entity}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Initiated by {log.userName || "System"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
