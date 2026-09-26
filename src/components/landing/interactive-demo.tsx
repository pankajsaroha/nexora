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
    setIsSwitching(true);
    router.push(`/demo/${activeRole}/dashboard`);
  };

  const currentRole = roles.find((r) => r.id === activeRole)!;

  return (
    <section id="demo" className="py-20 sm:py-28 bg-[#FAF8F3] border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B89B62]/40 bg-[#FAF6ED] text-[11px] font-mono uppercase tracking-widest text-[#856D3B] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B89B62] animate-pulse" />
              <span>Interactive Role Showcase</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171614] tracking-tight">
              Test drive every workspace in real time.
            </h2>

            <p className="text-sm text-[#555047] leading-relaxed">
              Select a persona below to preview their live operational workspace, then click &ldquo;Enter Live Portal&rdquo; to test with full database capabilities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleLaunchSample()}
            disabled={isSwitching}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#F7F4ED] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-sm hover:translate-y-[-1px] disabled:opacity-70 shrink-0"
          >
            {isSwitching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4B87C]" />
                <span>Launching Portal...</span>
              </>
            ) : (
              <>
                <span>Enter {currentRole.title} Portal (1-Click)</span>
                <ArrowRight className="w-4 h-4 text-[#D4B87C]" />
              </>
            )}
          </button>
        </div>

        {/* 5 Persona Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-1.5 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id as any)}
                className={`p-3.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-[#1B1916] text-[#F7F4ED] shadow-sm border border-[#1B1916]"
                    : "text-[#555047] hover:text-[#171614] hover:bg-[#FAF8F3]"
                }`}
              >
                <div className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isSelected ? "text-[#D4B87C]" : "text-[#7A756B]"}`}>
                  {r.title}
                </div>
                <div className={`font-extrabold text-xs truncate mt-0.5 ${isSelected ? "text-white" : "text-[#171614]"}`}>
                  {r.persona}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-[#C5C0B6]" : "text-[#7A756B]"}`}>
                  {r.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Role Preview Card */}
        <div className="rounded-3xl border border-[#E5E0D5] bg-white p-6 sm:p-8 shadow-xl space-y-6">
          {/* Active Persona Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFECE3] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50">
                  {currentRole.title} WORKSPACE
                </span>
                <span className="text-xs text-[#7A756B] font-mono font-medium">
                  {currentRole.persona} • Northstar Academy
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#171614] mt-1">
                {currentRole.tagline}
              </h3>
              <p className="text-xs text-[#555047] mt-0.5">
                {currentRole.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSample()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF8F3] border border-[#DCD7CB] text-[#171614] hover:bg-[#1B1916] hover:text-[#FAF8F3] hover:border-[#1B1916] transition-colors shrink-0"
            >
              <span>Launch {currentRole.persona}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. PRINCIPAL VIEW */}
          {activeRole === "principal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#7A756B] uppercase font-semibold">Scholars</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">350 Enrolled</div>
                  <div className="text-[10px] text-[#65705B] mt-0.5 font-bold">94.2% Attendance today</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#7A756B] uppercase font-semibold">Faculty</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">35 Teachers</div>
                  <div className="text-[10px] text-[#7A756B] mt-0.5 font-medium">1 on approved leave</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#D4B87C]/50 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#856D3B] uppercase font-semibold">Revenue</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">₹18,40,000</div>
                  <div className="text-[10px] text-[#856D3B] mt-0.5 font-bold">85% realized</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#DCD7CB] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#6F3D3A] uppercase font-semibold">Pending Tasks</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">3 Exceptions</div>
                  <div className="text-[10px] text-[#6F3D3A] mt-0.5 font-bold">CBSE blueprint review</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-2">
                <div className="text-xs font-bold text-[#171614]">Executive Attention Stream</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <span className="text-[#35322C]">Grade 9B attendance below 75% threshold</span>
                    <span className="text-[#6F3D3A] font-bold bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#8C4A47]/30">Urgent Review</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <span className="text-[#35322C]">3 Faculty leave petitions submitted</span>
                    <span className="text-[#856D3B] font-bold bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#D4B87C]/40">Pending Approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TEACHER VIEW */}
          {activeRole === "teacher" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#65705B]/30 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#65705B]/20">
                    <span className="font-bold text-xs text-[#171614]">Class 8A Morning Roll-Call</span>
                    <span className="text-[10px] font-mono text-[#525E4B] font-bold bg-white px-2 py-0.5 rounded border border-[#65705B]/30">
                      SUBMITTED (08:15 AM)
                    </span>
                  </div>
                  <div className="text-xs text-[#555047] space-y-1">
                    <div className="font-semibold text-[#171614]">30 Present • 2 Absent (Aarav on medical leave)</div>
                    <div className="text-[11px] font-mono text-[#7A756B]">Automated WhatsApp alert dispatched to parents.</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EFECE3]">
                    <span className="font-bold text-xs text-[#171614]">Today&apos;s 7-Period Lecture Grid</span>
                    <span className="text-[10px] font-mono text-[#7A756B]">Monday Schedule</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between bg-[#FAF8F3] p-2 rounded-lg border border-[#E5E0D5]">
                      <span className="font-bold text-[#171614]">P1 (08:30): Grade 8A Maths</span>
                      <span className="text-[#7A756B]">Room 104</span>
                    </div>
                    <div className="flex justify-between bg-[#FAF8F3] p-2 rounded-lg border border-[#E5E0D5]">
                      <span className="font-bold text-[#171614]">P2 (09:15): Grade 10 Science</span>
                      <span className="text-[#7A756B]">Physics Lab</span>
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
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#7A756B] uppercase font-semibold">Cohort</div>
                  <div className="text-xl font-extrabold text-[#171614] mt-1">Grade 8A</div>
                  <div className="text-[10px] text-[#7A756B] font-medium">Roll Number: 12</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#65705B]/30 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#525E4B] uppercase font-semibold">Attendance</div>
                  <div className="text-xl font-extrabold text-[#525E4B] mt-1">92.4%</div>
                  <div className="text-[10px] text-[#65705B] font-bold">14/15 Days Present</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#D4B87C]/50 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#856D3B] uppercase font-semibold">Term Marks</div>
                  <div className="text-xl font-extrabold text-[#171614] mt-1">86.4%</div>
                  <div className="text-[10px] text-[#856D3B] font-bold">Rank 3 in Section</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#65705B]/30 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#525E4B] uppercase font-semibold">Term 1 Fee</div>
                  <div className="text-xl font-extrabold text-[#525E4B] mt-1">PAID</div>
                  <div className="text-[10px] text-[#7A756B] font-medium">Receipt REC-0891</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-2">
                <div className="text-xs font-bold text-[#171614]">Upcoming Assignments & Homework</div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-[#E5E0D5] text-xs font-mono shadow-2xs">
                  <span className="text-[#35322C]">Polynomial Factorization Practice Set (Maths)</span>
                  <span className="font-bold text-[#856D3B] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#D4B87C]/40">Due in 3 Days</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. PARENT VIEW */}
          {activeRole === "parent" && (
            <div className="space-y-6">
              {/* Sibling Switcher Tabs */}
              <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE3]">
                <button
                  type="button"
                  onClick={() => setSelectedParentChild("aarav")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedParentChild === "aarav"
                      ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                      : "bg-[#FAF8F3] border border-[#DCD7CB] text-[#35322C] hover:bg-[#EFECE3]"
                  }`}
                >
                  Aarav Sharma (Grade 8A)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedParentChild("meera")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedParentChild === "meera"
                      ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                      : "bg-[#FAF8F3] border border-[#DCD7CB] text-[#35322C] hover:bg-[#EFECE3]"
                  }`}
                >
                  Meera Sharma (Grade 5B)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="text-[10px] text-[#7A756B] uppercase font-semibold">Roll-Call Status</div>
                  <div className="text-lg font-extrabold text-[#171614]">
                    {selectedParentChild === "aarav" ? "94.2% (Grade 8A)" : "92.0% (Grade 5B)"}
                  </div>
                  <div className="text-[10px] text-[#65705B] font-bold">Present in class today</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] space-y-1 shadow-2xs">
                  <div className="text-[10px] text-[#7A756B] uppercase font-semibold">Class Teacher</div>
                  <div className="text-lg font-extrabold text-[#171614]">
                    {selectedParentChild === "aarav" ? "Mrs. Ananya Sharma" : "Mrs. Sunita Verma"}
                  </div>
                  <div className="text-[10px] text-[#7A756B]">+91 98100 11002</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#65705B]/40 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-[#7A756B] uppercase font-semibold">Term 1 Invoice</div>
                  <div className="text-lg font-extrabold text-[#525E4B]">PAID IN FULL</div>
                  <div className="text-[10px] text-[#7A756B] font-medium">
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
                <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#65705B]/30 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#525E4B] uppercase font-semibold">Total Collected</div>
                  <div className="text-2xl font-extrabold text-[#525E4B] mt-1">₹18,40,000</div>
                  <div className="text-[10px] text-[#65705B] font-bold">85.2% realization</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#D4B87C]/50 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#856D3B] uppercase font-semibold">Outstanding</div>
                  <div className="text-2xl font-extrabold text-[#856D3B] mt-1">₹3,20,000</div>
                  <div className="text-[10px] text-[#856D3B] font-medium">12 overdue accounts</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#7A756B] uppercase font-semibold">Today Collections</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">₹85,000</div>
                  <div className="text-[10px] text-[#65705B] font-bold">UPI & Net Banking</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#7A756B] uppercase font-semibold">Staff Payroll</div>
                  <div className="text-2xl font-extrabold text-[#171614] mt-1">₹19.25L</div>
                  <div className="text-[10px] text-[#7A756B] font-medium">35 payslips generated</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-2 font-mono text-xs">
                <div className="text-xs font-bold text-[#171614] font-sans">Recent 3-Part Official Receipts</div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                  <span className="text-[#35322C]">REC-2026-0891 • Aarav Sharma (Grade 8A)</span>
                  <span className="text-[#525E4B] font-bold">₹38,000 Paid (UPI)</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E5E0D5] shadow-2xs">
                  <span className="text-[#35322C]">REC-2026-0892 • Meera Sharma (Grade 5B)</span>
                  <span className="text-[#525E4B] font-bold">₹32,000 Paid (Net Banking)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
