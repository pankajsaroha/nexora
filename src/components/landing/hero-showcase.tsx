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
  CheckSquare,
  Building2,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  Plus,
} from "lucide-react";
import { QuickTaskModal } from "@/components/landing/quick-task-modal";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "finance" | "timetable">("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <>
      <section className="pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden bg-[#F7F4ED] relative">
        {/* Subtle Ambient Champagne Warmth */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[380px] bg-gradient-to-tr from-[#C4AA76]/10 via-[#F7F4ED] to-[#7A8068]/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          {/* Hero Header & Value Proposition - Tight, Editorial & Direct */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#DCD7CB] bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-widest text-[#5C5850] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B89B62]" />
              <span>One platform. Your entire institution.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#171614] tracking-tight leading-[1.1] font-serif">
              Run your school or college <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#35322C]">from one connected platform.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5C5850] max-w-xl leading-relaxed font-normal">
              Attendance, academics, fees, staff, communication and daily operations — connected in one place.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 w-full sm:w-auto">
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#F7F4ED] border border-[#35322C] hover:bg-[#2A2722] hover:border-[#B89B62] transition-all shadow-sm"
              >
                <span>Try Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C4AA76]" />
              </a>

              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#B89B62]" />
                <span>Assign Demo Task</span>
              </button>

              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#5C5850] hover:text-[#171614] transition-colors"
              >
                <span>Onboard Institution</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#B89B62]" />
              </Link>
            </div>

            {/* Subtle Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 pt-1 text-[11px] font-mono text-[#7A756B]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#65705B]" />
                <span>PostgreSQL Cloud Persistence</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B89B62]" />
                <span>Multi-Tenant Role Isolation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#65705B]" />
                <span>Zero Clutter Architecture</span>
              </span>
            </div>
          </div>

          {/* Large Layered Product Visualization Composition - Starts Immediately */}
          <div className="mt-8 sm:mt-10 relative max-w-5xl mx-auto">
            {/* Top Right Contextual Pill: Placed Outside & Non-Obtrusive */}
            <div className="hidden xl:flex absolute -right-6 -top-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3]/95 backdrop-blur-md shadow-md text-left">
              <span className="w-2 h-2 rounded-full bg-[#65705B]" />
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Campus Roll-Call</div>
                <div className="text-xs font-bold text-[#171614]">330 / 350 Present (94.2%)</div>
              </div>
            </div>

            {/* Bottom Left Contextual Pill: Placed Outside & Non-Obtrusive */}
            <div className="hidden xl:flex absolute -left-6 -bottom-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3]/95 backdrop-blur-md shadow-md text-left">
              <span className="w-2 h-2 rounded-full bg-[#B89B62]" />
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Term 1 Realized</div>
                <div className="text-xs font-bold text-[#171614]">₹18,40,000 (85.2% Settled)</div>
              </div>
            </div>

            {/* Main Application Mockup Container */}
            <div className="rounded-3xl border border-[#DCD7CB] bg-white shadow-2xl overflow-hidden">
              {/* Browser / Shell Header in Deep Espresso */}
              <div className="px-5 py-3 border-b border-[#2A2722] bg-[#171614] flex flex-wrap items-center justify-between gap-3 text-[#F7F4ED]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#35322C] border border-[#48443B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#35322C] border border-[#48443B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#35322C] border border-[#48443B]" />
                  </div>
                  <div className="h-3.5 w-px bg-[#35322C]" />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#262420] border border-[#35322C] text-[11px] font-mono text-[#A8A398]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B89B62]" />
                    <span>app.nexora.cloud / northstar-academy</span>
                  </div>
                </div>

                {/* Interactive Mockup Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#262420] border border-[#35322C] text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "overview"
                        ? "bg-[#FAF8F3] text-[#171614] font-bold shadow-2xs"
                        : "text-[#A8A398] hover:text-[#F7F4ED]"
                    }`}
                  >
                    Executive Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("attendance")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "attendance"
                        ? "bg-[#FAF8F3] text-[#171614] font-bold shadow-2xs"
                        : "text-[#A8A398] hover:text-[#F7F4ED]"
                    }`}
                  >
                    Live Roll-Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("finance")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "finance"
                        ? "bg-[#FAF8F3] text-[#171614] font-bold shadow-2xs"
                        : "text-[#A8A398] hover:text-[#F7F4ED]"
                    }`}
                  >
                    Fee Realization
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("timetable")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "timetable"
                        ? "bg-[#FAF8F3] text-[#171614] font-bold shadow-2xs"
                        : "text-[#A8A398] hover:text-[#F7F4ED]"
                    }`}
                  >
                    Timetable
                  </button>
                </div>
              </div>

              {/* Dynamic View Body in Warm Parchment */}
              <div className="p-5 sm:p-7 space-y-5 bg-[#FAF8F3] min-h-[340px]">
                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    {/* Top KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-[#7A756B] block font-semibold">Enrolled Scholars</span>
                        <div className="text-2xl font-extrabold text-[#171614] mt-0.5">350</div>
                        <span className="text-[10px] font-medium text-[#65705B] mt-0.5 block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#65705B]" />
                          100% active roster
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#DCE2D7] shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-[#525E4B] block font-semibold">Today Attendance</span>
                        <div className="text-2xl font-extrabold text-[#171614] mt-0.5">94.2%</div>
                        <span className="text-[10px] font-medium text-[#65705B] mt-0.5 block">330 / 350 present</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#EDE4D0] shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-[#8A703E] block font-semibold">Term 1 Realization</span>
                        <div className="text-2xl font-extrabold text-[#171614] mt-0.5">₹18.4L</div>
                        <span className="text-[10px] font-medium text-[#B89B62] mt-0.5 block font-bold">85.2% reconciled</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-[#7A756B] block font-semibold">Pending Delegations</span>
                        <div className="text-2xl font-extrabold text-[#171614] mt-0.5">3 Tasks</div>
                        <span className="text-[10px] font-medium text-[#6F3D3A] mt-0.5 block font-semibold">2 due this week</span>
                      </div>
                    </div>

                    {/* Operational Feed Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Live Actions Feed */}
                      <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                          <span className="font-bold text-[#171614] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#65705B]" />
                            Priority Exception Stream
                          </span>
                          <span className="text-[10px] font-mono text-[#525E4B] font-bold bg-[#F4F6F1] px-2 py-0.5 rounded border border-[#DCE2D7]">
                            LIVE
                          </span>
                        </div>
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5E0D5]">
                            <span className="text-[#35322C]">Grade 8A Attendance Finalized</span>
                            <span className="text-[#65705B] font-bold">30/32 Present</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EDE4D0]">
                            <span className="text-[#35322C]">Tuition Receipt REC-0891</span>
                            <span className="text-[#8A703E] font-bold">₹38,000 Paid</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF4F4] border border-[#F3E3E3]">
                            <span className="text-[#35322C]">Leave Petition: Science Lead</span>
                            <span className="text-[#6F3D3A] font-bold">Awaiting Review</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Timetable Period */}
                      <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                          <span className="font-bold text-[#171614]">Active Academic Grid</span>
                          <span className="text-[10px] font-mono text-[#7A756B]">Period 02 (09:15 - 10:00)</span>
                        </div>
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EDE4D0] flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[#171614]">Grade 8A • Mathematics</div>
                              <div className="text-[10px] text-[#7A756B]">Mrs. Ananya Sharma • Room 104</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#F3EBD8] text-[#8A703E] font-bold text-[10px]">In Progress</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5E0D5] flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[#171614]">Grade 11 Science • Physics Lab</div>
                              <div className="text-[10px] text-[#7A756B]">Mr. Rajeshwar Kulkarni • Lab 2</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#EFECE3] text-[#5C5850] font-bold text-[10px]">Upcoming</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ATTENDANCE TAB */}
                {activeTab === "attendance" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F6F1] border border-[#DCE2D7]">
                      <div>
                        <span className="text-xs font-bold text-[#171614]">Morning Roll-Call Reconciled</span>
                        <div className="text-[11px] text-[#525E4B] mt-0.5">330 Present • 18 Absent • 2 Excused Medical</div>
                      </div>
                      <span className="text-2xl font-extrabold text-[#171614]">94.2%</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                      {[
                        { grade: "Grade 5A & 5B", present: "58 / 60", pct: "96.6%" },
                        { grade: "Grade 8A (Homeroom)", present: "30 / 32", pct: "93.7%" },
                        { grade: "Grade 11 Science", present: "42 / 45", pct: "93.3%" },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs">
                          <div className="font-bold text-[#171614]">{item.grade}</div>
                          <div className="flex justify-between text-[11px] text-[#5C5850]">
                            <span>Present: {item.present}</span>
                            <span className="font-bold text-[#65705B]">{item.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FINANCE TAB */}
                {activeTab === "finance" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#7A756B] font-semibold">Term 1 Realization</span>
                        <div className="text-xl font-extrabold text-[#171614] mt-0.5">₹18,40,000 of ₹21,60,000 Target</div>
                      </div>
                      <div className="space-y-1 w-full sm:w-52">
                        <div className="flex justify-between text-[10px] font-mono text-[#5C5850] font-bold">
                          <span>Realization</span>
                          <span className="text-[#8A703E]">85.2%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#EFECE3] overflow-hidden">
                          <div className="h-full bg-[#B89B62] rounded-full w-[85%]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-3 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                        <span>REC-2026-0891 • Aarav Sharma (Grade 8A)</span>
                        <span className="font-bold text-[#65705B]">₹38,000 Paid (UPI)</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                        <span>REC-2026-0892 • Meera Sharma (Grade 5B)</span>
                        <span className="font-bold text-[#65705B]">₹32,000 Paid (Net Banking)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. TIMETABLE TAB */}
                {activeTab === "timetable" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#171614]">Grade 8A Timetable Schedule (Monday)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      {[
                        { period: "P1 (08:30)", sub: "Mathematics", teacher: "Mrs. Ananya Sharma", room: "Room 104" },
                        { period: "P2 (09:15)", sub: "Science", teacher: "Mr. R. Kulkarni", room: "Room 104" },
                        { period: "P3 (10:15)", sub: "English Lit", teacher: "Ms. M. Sundaram", room: "Room 104" },
                        { period: "P4 (11:00)", sub: "Social Science", teacher: "Mr. D. Prasad", room: "Room 104" },
                      ].map((slot, i) => (
                        <div key={i} className="p-3.5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs">
                          <div className="text-[10px] font-bold text-[#B89B62]">{slot.period}</div>
                          <div className="font-bold text-[#171614] truncate">{slot.sub}</div>
                          <div className="text-[10px] text-[#7A756B] truncate">{slot.teacher}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </>
  );
}

