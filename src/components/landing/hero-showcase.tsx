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
      <section className="pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden bg-background relative">
        {/* Subtle Ambient Indigo Nordic Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[380px] bg-gradient-to-tr from-accent/8 via-transparent to-accent/4 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          {/* Hero Header & Value Proposition - Clean, Nordic & Direct */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-card text-[10px] uppercase tracking-wider text-muted-foreground shadow-2xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>One platform. Your entire institution.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] font-sans">
              Run your school or college <br className="hidden sm:inline" />
              <span className="text-foreground">from one connected platform.</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed font-normal">
              Attendance, academics, fees, staff, communication and daily operations — connected in one place.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 w-full sm:w-auto">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-primary text-primary-foreground border border-primary/20 hover:bg-primary-hover transition-all shadow-sm"
              >
                <span>Start your institution</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
              </Link>

              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-all shadow-2xs"
              >
                <span>Try Interactive Demo</span>
              </a>

              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-accent" />
                <span>Assign Demo Task</span>
              </button>
            </div>

            {/* Subtle Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 pt-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>PostgreSQL Cloud Persistence</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Multi-Tenant Role Isolation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Zero Clutter Architecture</span>
              </span>
            </div>
          </div>

          {/* Large Layered Product Visualization Composition - Starts Immediately */}
          <div className="mt-8 sm:mt-10 relative max-w-5xl mx-auto">
            {/* Top Right Contextual Pill: Placed Outside & Non-Obtrusive */}
            <div className="hidden xl:flex absolute -right-6 -top-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-md text-left">
              <span className="w-2 h-2 rounded-full bg-success" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Campus Roll-Call</div>
                <div className="text-xs font-bold text-foreground">330 / 350 Present (94.2%)</div>
              </div>
            </div>

            {/* Bottom Left Contextual Pill: Placed Outside & Non-Obtrusive */}
            <div className="hidden xl:flex absolute -left-6 -bottom-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-md text-left">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Term 1 Realized</div>
                <div className="text-xs font-bold text-foreground">₹18,40,000 (85.2% Settled)</div>
              </div>
            </div>

            {/* Main Application Mockup Container */}
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Browser / Shell Header in Obsidian Secondary */}
              <div className="px-5 py-3 border-b border-border bg-secondary flex flex-wrap items-center justify-between gap-3 text-secondary-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-border" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-border" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-border" />
                  </div>
                  <div className="h-3.5 w-px bg-border" />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted border border-border text-[11px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>app.nexora.cloud / campus-portal</span>
                  </div>
                </div>

                {/* Interactive Mockup Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/80 border border-border text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "overview"
                        ? "bg-card text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Executive Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("attendance")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "attendance"
                        ? "bg-card text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-primary-foreground"
                    }`}
                  >
                    Live Roll-Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("finance")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "finance"
                        ? "bg-card text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-primary-foreground"
                    }`}
                  >
                    Fee Realization
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("timetable")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === "timetable"
                        ? "bg-card text-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-primary-foreground"
                    }`}
                  >
                    Timetable
                  </button>
                </div>
              </div>

              {/* Dynamic View Body in Warm Parchment */}
              <div className="p-5 sm:p-7 space-y-5 bg-card min-h-[340px]">
                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    {/* Top KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Enrolled Scholars</span>
                        <div className="text-2xl font-bold text-foreground mt-0.5">350</div>
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5 block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          100% active roster
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-success-subtle border border-success-border shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider text-success block font-medium">Today Attendance</span>
                        <div className="text-2xl font-bold text-foreground mt-0.5">94.2%</div>
                        <span className="text-[10px] font-medium text-success mt-0.5 block">330 / 350 present</span>
                      </div>
                      <div className="p-4 rounded-xl bg-accent-subtle border border-accent/20 shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider text-accent block font-medium">Term 1 Realization</span>
                        <div className="text-2xl font-bold text-foreground mt-0.5">₹18.4L</div>
                        <span className="text-[10px] font-medium text-accent mt-0.5 block font-semibold">85.2% reconciled</span>
                      </div>
                      <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Pending Delegations</span>
                        <div className="text-2xl font-bold text-foreground mt-0.5">3 Tasks</div>
                        <span className="text-[10px] font-medium text-destructive mt-0.5 block font-semibold">2 due this week</span>
                      </div>
                    </div>

                    {/* Operational Feed Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Live Actions Feed */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            Priority Exception Stream
                          </span>
                          <span className="text-[10px] text-success font-semibold bg-success-subtle px-2 py-0.5 rounded border border-success-border">
                            LIVE
                          </span>
                        </div>
                        <div className="space-y-2 text-[11px]">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                            <span className="text-foreground">Grade 8A Attendance Finalized</span>
                            <span className="text-success font-semibold">30/32 Present</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent-subtle border border-accent/20">
                            <span className="text-foreground">Tuition Receipt REC-0891</span>
                            <span className="text-accent font-semibold">₹38,000 Paid</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-destructive-subtle border border-destructive-border">
                            <span className="text-foreground">Leave Petition: Science Lead</span>
                            <span className="text-destructive font-semibold">Awaiting Review</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Timetable Period */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <span className="font-semibold text-foreground">Active Academic Grid</span>
                          <span className="text-[10px] text-muted-foreground">Period 02 (09:15 - 10:00)</span>
                        </div>
                        <div className="space-y-2 text-[11px]">
                          <div className="p-2.5 rounded-xl bg-accent-subtle border border-accent/20 flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-foreground">Grade 8A • Mathematics</div>
                              <div className="text-[10px] text-muted-foreground">Mrs. Ananya Sharma • Room 104</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-card text-accent font-semibold text-[10px] border border-border">In Progress</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-background border border-border flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-foreground">Grade 11 Science • Physics Lab</div>
                              <div className="text-[10px] text-muted-foreground">Mr. Rajeshwar Kulkarni • Lab 2</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold text-[10px]">Upcoming</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ATTENDANCE TAB */}
                {activeTab === "attendance" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-success-subtle border border-success-border">
                      <div>
                        <span className="text-xs font-semibold text-foreground">Morning Roll-Call Reconciled</span>
                        <div className="text-[11px] text-success mt-0.5">330 Present • 18 Absent • 2 Excused Medical</div>
                      </div>
                      <span className="text-2xl font-bold text-foreground">94.2%</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { grade: "Grade 5A & 5B", present: "58 / 60", pct: "96.6%" },
                        { grade: "Grade 8A (Homeroom)", present: "30 / 32", pct: "93.7%" },
                        { grade: "Grade 11 Science", present: "42 / 45", pct: "93.3%" },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
                          <div className="font-semibold text-foreground">{item.grade}</div>
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Present: {item.present}</span>
                            <span className="font-semibold text-success">{item.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FINANCE TAB */}
                {activeTab === "finance" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Term 1 Realization</span>
                        <div className="text-xl font-bold text-foreground mt-0.5">₹18,40,000 of ₹21,60,000 Target</div>
                      </div>
                      <div className="space-y-1 w-full sm:w-52">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span>Realization</span>
                          <span className="text-accent font-semibold">85.2%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-accent rounded-full w-[85%]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-3 rounded-xl bg-card border border-border shadow-2xs">
                        <span>REC-2026-0891 • Aarav Sharma (Grade 8A)</span>
                        <span className="font-semibold text-success">₹38,000 Paid (UPI)</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-card border border-border shadow-2xs">
                        <span>REC-2026-0892 • Meera Sharma (Grade 5B)</span>
                        <span className="font-semibold text-success">₹32,000 Paid (Net Banking)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. TIMETABLE TAB */}
                {activeTab === "timetable" && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-foreground">Grade 8A Timetable Schedule (Monday)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                      {[
                        { period: "P1 (08:30)", sub: "Mathematics", teacher: "Mrs. Ananya Sharma", room: "Room 104" },
                        { period: "P2 (09:15)", sub: "Science", teacher: "Mr. R. Kulkarni", room: "Room 104" },
                        { period: "P3 (10:15)", sub: "English Lit", teacher: "Ms. M. Sundaram", room: "Room 104" },
                        { period: "P4 (11:00)", sub: "Social Science", teacher: "Mr. D. Prasad", room: "Room 104" },
                      ].map((slot, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
                          <div className="text-[10px] font-semibold text-accent">{slot.period}</div>
                          <div className="font-semibold text-foreground truncate">{slot.sub}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{slot.teacher}</div>
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

