"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Receipt,
  GraduationCap,
  CalendarCheck,
  Clock,
  Layers,
  Building2,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "finance">("overview");

  return (
    <section className="pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Editorial Brand Tag */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8E7DF] bg-white text-[11px] font-mono uppercase tracking-widest text-slate-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>The Operating System for Modern Education</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.08]">
            One connected platform for your entire school or college.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
            Run your institution from one unified workspace — connecting daily attendance, academics, and examinations with fee ledgers, payroll, messaging, and operational workflows.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white hover:bg-slate-800 transition-all shadow-sm hover:translate-y-[-1px]"
            >
              <span>Start your institution</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#E8E7DF] bg-white text-slate-800 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <span>Explore live demo</span>
              <span className="text-slate-400 font-mono text-[11px]">↓</span>
            </a>
          </div>

          {/* Subtle Trust & Deployment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tenant Data Isolation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Card Overload</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Role-Based Workspaces</span>
            </span>
          </div>
        </div>

        {/* Hero Product Visual / Live UI Preview Showcase */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Ambient Contextual Floating Badges */}
          <div className="hidden lg:flex absolute -left-8 top-16 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#E8E7DF] bg-white/95 backdrop-blur-xs shadow-lg animate-in fade-in slide-in-from-bottom duration-700">
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-emerald-700 font-mono font-bold text-xs">
              94%
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Campus Attendance</div>
              <div className="text-xs font-bold text-slate-900">330 / 350 Present</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -right-8 top-28 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#E8E7DF] bg-white/95 backdrop-blur-xs shadow-lg animate-in fade-in slide-in-from-bottom duration-700">
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-slate-900 font-mono font-bold text-xs">
              ₹
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Term 1 Realization</div>
              <div className="text-xs font-bold text-slate-900">₹18.4L Collected (85%)</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -left-6 bottom-16 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#E8E7DF] bg-white/95 backdrop-blur-xs shadow-lg">
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-slate-900 font-mono font-bold text-xs">
              28
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Active Coursework</div>
              <div className="text-xs font-bold text-slate-900">Grade 8A Science Due Today</div>
            </div>
          </div>

          {/* Main Dashboard Window */}
          <div className="rounded-2xl border border-[#E8E7DF] bg-white shadow-xl overflow-hidden">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E7DF] bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="ml-2 font-mono text-[11px] text-slate-400 truncate">
                  northstar.nexora.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-[#E8E7DF]">
                  AY 2026–27 · Term 1
                </span>
                <span className="font-mono text-[10px] uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Command
                </span>
              </div>
            </div>

            {/* Dashboard Inner Canvas */}
            <div className="p-5 sm:p-6 bg-[#FAF9F5] space-y-5">
              {/* Institution Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8E7DF] shadow-2xs">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Institutional Command Center
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Northstar International Academy
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Affiliation: CBSE-9021 • 350 Enrolled Scholars • 35 Faculty
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#E8E7DF]">
                    Principal: Dr. Arvind Menon
                  </span>
                </div>
              </div>

              {/* 4 Crisp Key Metric Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E7DF] shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Student Roll</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">350</div>
                  <div className="text-[11px] text-slate-500">19 divisions configured</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E7DF] shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Daily Attendance</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">94.2%</div>
                  <div className="text-[11px] text-slate-500">330 present on campus</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E7DF] shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Fee Realization</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹18,40,000</div>
                  <div className="text-[11px] text-slate-500">85.2% collected (Term 1)</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E7DF] shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Action Items</div>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-1">4 Items</div>
                  <div className="text-[11px] text-slate-500">2 leaves, 2 tasks pending</div>
                </div>
              </div>

              {/* Two Column Split: Roll Call Matrix + Operational Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Roll Call Overview */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E7DF] p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                      Live Cohort Attendance Overview
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Period 3 Active</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { grade: "Grade 8A", tutor: "Mrs. Ananya Sharma", present: 30, total: 32, status: "93.7%" },
                      { grade: "Grade 10B", tutor: "Prof. Rajeshwar Kulkarni", present: 29, total: 30, status: "96.6%" },
                      { grade: "Grade 12A", tutor: "Dr. Sunita Rao", present: 27, total: 28, status: "96.4%" },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{row.grade}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Tutor: {row.tutor}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">
                            {row.present} / {row.total}
                          </span>
                          <span className="ml-2 font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Operational Action Feed */}
                <div className="bg-white rounded-xl border border-[#E8E7DF] p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                      Executive Actions
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Queue</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Science Lab Audit</span>
                        <span className="font-mono text-[9px] uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded">
                          Medium
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Assigned: Mrs. Ananya Sharma</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Leave Approval (2 Days)</span>
                        <span className="font-mono text-[9px] uppercase bg-rose-50 text-rose-800 border border-rose-200 px-1 rounded">
                          Pending
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Applicant: Prof. Rajeshwar Kulkarni</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
