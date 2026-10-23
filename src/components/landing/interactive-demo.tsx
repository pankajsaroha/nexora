"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  ArrowRight,
  Clock,
  BookOpen,
  CheckSquare,
  Sparkles,
  Award,
  Send,
  Building2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Calculator,
  HeartHandshake,
} from "lucide-react";

export function InteractiveDemo() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<"principal" | "teacher" | "student" | "parent" | "accountant">("principal");
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedParentChild, setSelectedParentChild] = useState<"aarav" | "meera">("aarav");

  const roles = [
    {
      id: "principal",
      title: "PRINCIPAL",
      persona: "Dr. Arvind Menon",
      tagline: "Total Institutional Clarity",
      email: "principal@nexora.demo",
      description: "Executive oversight of attendance, finances, staff exceptions, and academic performance.",
    },
    {
      id: "teacher",
      title: "TEACHER",
      persona: "Mrs. Ananya Sharma",
      tagline: "Classroom & Timetable Hub",
      email: "teacher@nexora.demo",
      description: "Classroom management, period schedule, instant roll-call, and coursework publishing.",
    },
    {
      id: "student",
      title: "STUDENT",
      persona: "Aarav Sharma",
      tagline: "Personal Academic Journey",
      email: "student@nexora.demo",
      description: "Today's classes, homework deadlines, term marks (86.4%), and timetable schedule.",
    },
    {
      id: "parent",
      title: "PARENT",
      persona: "Mr. Rahul Sharma",
      tagline: "Family Multi-Child Portal",
      email: "parent@nexora.demo",
      description: "Seamless sibling switching between Aarav (Grade 8A) and Meera (Grade 5B), fee receipts, and announcements.",
    },
    {
      id: "accountant",
      title: "ACCOUNTANT",
      persona: "Mrs. Neha Kapoor",
      tagline: "Bursar & Ledger Reconciliation",
      email: "accountant@nexora.demo",
      description: "Fee collections, official 3-part receipt vouchers, staff payroll disbursement, and balance sheets.",
    },
  ];

  const handleLaunchSample = () => {
    router.push("/login");
  };

  const currentRole = roles.find((r) => r.id === activeRole)!;

  return (
    <section id="demo" className="py-20 sm:py-28 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent-subtle text-[11px] uppercase tracking-wider text-accent shadow-2xs font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Interactive Role Showcase</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Test drive every workspace in real time.
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Select a persona below to inspect how Nexora tailors dedicated tools, telemetry, and access boundaries for every stakeholder.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleLaunchSample()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover border border-primary/20 transition-all shadow-sm hover:translate-y-[-1px] shrink-0"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {/* 5 Persona Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-1.5 rounded-xl bg-muted/60 border border-border shadow-2xs">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id as any)}
                className={`p-3.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm border border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <div className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  {r.title}
                </div>
                <div className={`font-bold text-xs truncate mt-0.5 ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                  {r.persona}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  {r.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Role Preview Card */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          {/* Active Persona Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-semibold bg-accent-subtle text-accent border border-accent/20">
                  {currentRole.title} WORKSPACE
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentRole.persona} • Institutional Stakeholder
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {currentRole.tagline}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentRole.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSample()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shrink-0"
            >
              <span>Access {currentRole.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. PRINCIPAL VIEW */}
          {activeRole === "principal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Scholars</div>
                  <div className="text-2xl font-bold text-foreground mt-1">350 Enrolled</div>
                  <div className="text-[10px] text-success mt-0.5 font-semibold">94.2% Attendance today</div>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Faculty</div>
                  <div className="text-2xl font-bold text-foreground mt-1">35 Teachers</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">1 on approved leave</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">Revenue</div>
                  <div className="text-2xl font-bold text-foreground mt-1">₹18,40,000</div>
                  <div className="text-[10px] text-accent mt-0.5 font-semibold">85% realized</div>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border shadow-2xs">
                  <div className="text-[10px] text-destructive uppercase font-medium">Pending Tasks</div>
                  <div className="text-2xl font-bold text-foreground mt-1">3 Exceptions</div>
                  <div className="text-[10px] text-destructive mt-0.5 font-semibold">CBSE blueprint review</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <div className="text-xs font-bold text-foreground">Executive Attention Stream</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-card border border-border shadow-2xs">
                    <span className="text-foreground">Grade 9B attendance below 75% threshold</span>
                    <span className="text-destructive font-semibold bg-destructive-subtle px-2 py-0.5 rounded border border-destructive-border">Urgent Review</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-card border border-border shadow-2xs">
                    <span className="text-foreground">3 Faculty leave petitions submitted</span>
                    <span className="text-accent font-semibold bg-accent-subtle px-2 py-0.5 rounded border border-accent/20">Pending Approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TEACHER VIEW */}
          {activeRole === "teacher" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-success-subtle border border-success/20 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-success/20">
                    <span className="font-semibold text-xs text-foreground">Class 8A Morning Roll-Call</span>
                    <span className="text-[10px] font-mono text-success font-bold bg-card px-2 py-0.5 rounded border border-success/20">
                      SUBMITTED (08:15 AM)
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="font-medium text-foreground">30 Present • 2 Absent (Aarav on medical leave)</div>
                    <div className="text-[11px] font-mono text-muted-foreground">Automated WhatsApp alert dispatched to parents.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="font-semibold text-xs text-foreground">Today&apos;s 7-Period Lecture Grid</span>
                    <span className="text-[10px] font-mono text-muted-foreground">Monday Schedule</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between bg-background p-2.5 rounded-lg border border-border">
                      <span className="font-medium text-foreground">P1 (08:30): Grade 8A Maths</span>
                      <span className="text-muted-foreground">Room 104</span>
                    </div>
                    <div className="flex justify-between bg-background p-2.5 rounded-lg border border-border">
                      <span className="font-medium text-foreground">P2 (09:15): Grade 10 Science</span>
                      <span className="text-muted-foreground">Physics Lab</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. STUDENT VIEW */}
          {activeRole === "student" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">Cohort</div>
                  <div className="text-xl font-bold text-foreground mt-1">Grade 8A</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Roll Number: 12</div>
                </div>
                <div className="p-4 rounded-xl bg-success-subtle border border-success/20 shadow-2xs">
                  <div className="text-[10px] font-mono text-success uppercase tracking-wider font-semibold">Attendance</div>
                  <div className="text-xl font-bold text-success mt-1">92.4%</div>
                  <div className="text-[10px] text-success/80 font-medium">14/15 Days Present</div>
                </div>
                <div className="p-4 rounded-xl bg-accent-subtle border border-accent/20 shadow-2xs">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider font-semibold">Term Marks</div>
                  <div className="text-xl font-bold text-foreground mt-1">86.4%</div>
                  <div className="text-[10px] text-accent font-medium">Rank 3 in Section</div>
                </div>
                <div className="p-4 rounded-xl bg-success-subtle border border-success/20 shadow-2xs">
                  <div className="text-[10px] font-mono text-success uppercase tracking-wider font-semibold">Term 1 Fee</div>
                  <div className="text-xl font-bold text-success mt-1">PAID</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Receipt REC-0891</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground">Upcoming Assignments & Homework</div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-background border border-border text-xs font-mono shadow-2xs">
                  <span className="text-foreground">Polynomial Factorization Practice Set (Maths)</span>
                  <span className="font-medium text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/20">Due in 3 Days</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. PARENT VIEW */}
          {activeRole === "parent" && (
            <div className="space-y-6">
              {/* Sibling Switcher Tabs */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <button
                  type="button"
                  onClick={() => setSelectedParentChild("aarav")}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedParentChild === "aarav"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Aarav Sharma (Grade 8A)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedParentChild("meera")}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedParentChild === "meera"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Meera Sharma (Grade 5B)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-mono">Roll-Call Status</div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedParentChild === "aarav" ? "94.2% (Grade 8A)" : "92.0% (Grade 5B)"}
                  </div>
                  <div className="text-[11px] text-success font-medium">Present in class today</div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-mono">Class Teacher</div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedParentChild === "aarav" ? "Mrs. Ananya Sharma" : "Mrs. Sunita Verma"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">+91 98100 11002</div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-mono">Term 1 Invoice</div>
                  <div className="text-lg font-bold text-success">PAID IN FULL</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {selectedParentChild === "aarav" ? "REC-0891 (₹38,000)" : "REC-0892 (₹32,000)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. ACCOUNTANT VIEW */}
          {activeRole === "accountant" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-success-subtle border border-success/20 shadow-2xs">
                  <div className="text-[10px] font-mono text-success uppercase tracking-wider font-semibold">Total Collected</div>
                  <div className="text-2xl font-bold text-success mt-1">₹18,40,000</div>
                  <div className="text-[10px] text-success/80 font-medium">85.2% realization</div>
                </div>
                <div className="p-4 rounded-xl bg-warning-subtle border border-warning/20 shadow-2xs">
                  <div className="text-[10px] font-mono text-warning uppercase tracking-wider font-semibold">Outstanding</div>
                  <div className="text-2xl font-bold text-warning mt-1">₹3,20,000</div>
                  <div className="text-[10px] text-warning font-medium">12 overdue accounts</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">Today Collections</div>
                  <div className="text-2xl font-bold text-foreground mt-1">₹85,000</div>
                  <div className="text-[10px] text-muted-foreground font-medium">UPI & Net Banking</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-2xs">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">Staff Payroll</div>
                  <div className="text-2xl font-bold text-foreground mt-1">₹19.25L</div>
                  <div className="text-[10px] text-muted-foreground font-medium">35 payslips generated</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
                <div className="text-xs font-semibold text-foreground">Recent 3-Part Official Receipts</div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-background border border-border shadow-2xs font-mono">
                  <span className="text-foreground">REC-2026-0891 • Aarav Sharma (Grade 8A)</span>
                  <span className="text-success font-semibold">₹38,000 Paid (UPI)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-background border border-border shadow-2xs font-mono">
                  <span className="text-foreground">REC-2026-0892 • Meera Sharma (Grade 5B)</span>
                  <span className="text-success font-semibold">₹32,000 Paid (Net Banking)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
