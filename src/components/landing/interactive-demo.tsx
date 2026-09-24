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
} from "lucide-react";

export function InteractiveDemo() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<"principal" | "teacher" | "student" | "parent">("principal");
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
      description: "Today's classes, homework deadlines, term marks (86%), and timetable schedule.",
    },
    {
      id: "parent",
      title: "PARENT",
      persona: "Mr. Rahul Sharma",
      tagline: "Family Multi-Child Portal",
      email: "parent@nexora.demo",
      description: "Seamless sibling switching between Aarav (Grade 8A) and Meera (Grade 5B), fee receipts, and announcements.",
    },
  ];

  const handleLaunchSample = async (email: string) => {
    setIsSwitching(true);
    try {
      await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    } finally {
      setIsSwitching(false);
    }
  };

  const currentRole = roles.find((r) => r.id === activeRole)!;

  return (
    <section id="demo" className="py-20 sm:py-28 bg-[#FAF9F5] border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-white text-[10px] font-mono uppercase tracking-widest text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Interactive Role Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              One institution. Every persona. One connected experience.
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Explore how Nexora customizes every interaction for administrators, educators, learners, and families without duplicating records.
            </p>
          </div>

          <button
            onClick={() => handleLaunchSample(currentRole.email)}
            disabled={isSwitching}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white hover:bg-slate-800 transition-all shadow-xs disabled:opacity-70 shrink-0"
          >
            {isSwitching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Launching Portal...</span>
              </>
            ) : (
              <>
                <span>Launch Full {currentRole.title} Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id as any)}
              className={`p-4 rounded-xl text-left border transition-all space-y-1 shadow-2xs ${
                activeRole === r.id
                  ? "bg-white border-slate-900 ring-1 ring-slate-900"
                  : "bg-white/60 border-[#E8E7DF] hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {r.title}
                </span>
                {activeRole === r.id && (
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                )}
              </div>
              <div className="font-bold text-sm text-slate-900">{r.persona}</div>
              <div className="text-[11px] text-slate-500 truncate">{r.tagline}</div>
            </button>
          ))}
        </div>

        {/* Live Interactive UI Simulation Window */}
        <div className="rounded-2xl border border-[#E8E7DF] bg-white shadow-xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#E8E7DF] bg-[#FAF9F5]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="font-mono text-xs font-bold text-slate-900">
                {currentRole.persona} ({currentRole.title})
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Northstar International Academy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-white text-slate-600 px-2 py-0.5 rounded border border-[#E8E7DF]">
                Sample Demo Data
              </span>
              <button
                onClick={() => handleLaunchSample(currentRole.email)}
                className="text-xs font-mono font-semibold text-slate-900 hover:underline flex items-center gap-1"
              >
                <span>Full Screen Portal →</span>
              </button>
            </div>
          </div>

          {/* Persona View Switcher Content */}
          <div className="p-6 sm:p-8 bg-[#FAF9F5] min-h-[380px] flex flex-col justify-between">
            {/* 1. PRINCIPAL VIEW */}
            {activeRole === "principal" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Total Enrolled</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">350</div>
                    <div className="text-[11px] text-slate-500">19 grade sections</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Campus Attendance</div>
                    <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">94.2%</div>
                    <div className="text-[11px] text-slate-500">330 present today</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Fee Collections</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹18.4L</div>
                    <div className="text-[11px] text-slate-500">85.2% realization</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Faculty on Leave</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">1 / 35</div>
                    <div className="text-[11px] text-slate-500">97.1% staff present</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">Priority Institutional Directives</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex justify-between">
                        <span>Pre-Board Assessment Schedule</span>
                        <span className="font-mono text-amber-700">Due 30 Sep</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex justify-between">
                        <span>Science Laboratory Chemical Audit</span>
                        <span className="font-mono text-emerald-700">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">Campus Activity Ledger</div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        08:15 AM — Grade 8A morning roll-call submitted by Mrs. Ananya Sharma
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        09:40 AM — Term 1 fee payment of ₹25,000 recorded for Aarav Sharma
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TEACHER VIEW */}
            {activeRole === "teacher" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8E7DF] shadow-2xs">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Homeroom: Grade 8A (32 Scholars)</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Assigned Subject: Physics & Science</div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Roll-Call Complete (30/32 Present)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">Today&apos;s Lecture Schedule</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Period 1: Grade 8A</div>
                          <div className="text-[10px] text-slate-500">Mechanics & Optics — Room 204</div>
                        </div>
                        <span className="font-mono text-slate-500">08:30 - 09:15</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Period 3: Grade 10B</div>
                          <div className="text-[10px] text-slate-500">Electromagnetism Lab</div>
                        </div>
                        <span className="font-mono text-slate-500">10:15 - 11:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">Leave Balance Quotas</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        <div className="font-mono font-bold text-slate-900">12 / 12</div>
                        <div className="text-[10px] text-slate-400">Casual</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        <div className="font-mono font-bold text-slate-900">10 / 10</div>
                        <div className="text-[10px] text-slate-400">Medical</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        <div className="font-mono font-bold text-slate-900">15 / 15</div>
                        <div className="text-[10px] text-slate-400">Earned</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STUDENT VIEW */}
            {activeRole === "student" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Attendance Ratio</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">92.4%</div>
                    <div className="text-[11px] text-emerald-700">Eligible for Term Finals</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Scholastic Mean</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">86.0%</div>
                    <div className="text-[11px] text-slate-500">Grade: A+ (First Class)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Fee Balance</div>
                    <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">₹0.00</div>
                    <div className="text-[11px] text-slate-500">Term 1 Reconciled</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-3">
                  <div className="font-bold text-xs text-slate-900">Active Coursework Submissions</div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Mathematics: Linear Equations Problem Set</div>
                        <div className="text-[10px] font-mono text-slate-500">Due: 28 Sep 2026 • Mrs. Sunita Sharma</div>
                      </div>
                      <span className="font-mono text-[10px] uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        Submitted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PARENT VIEW */}
            {activeRole === "parent" && (
              <div className="space-y-6">
                {/* Sibling Switcher Bar */}
                <div className="flex items-center gap-2 border-b border-[#E8E7DF] pb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Ward:</span>
                  <button
                    onClick={() => setSelectedParentChild("aarav")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedParentChild === "aarav"
                        ? "bg-[#0F172A] text-white"
                        : "bg-white text-slate-700 border border-[#E8E7DF]"
                    }`}
                  >
                    Aarav Sharma (Grade 8A)
                  </button>
                  <button
                    onClick={() => setSelectedParentChild("meera")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedParentChild === "meera"
                        ? "bg-[#0F172A] text-white"
                        : "bg-white text-slate-700 border border-[#E8E7DF]"
                    }`}
                  >
                    Meera Sharma (Grade 5B)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">
                      {selectedParentChild === "aarav" ? "Aarav's" : "Meera's"} Academic & Attendance Ledger
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        <span>Cumulative Attendance</span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedParentChild === "aarav" ? "92.4%" : "96.8%"}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                        <span>Latest Examination Score</span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedParentChild === "aarav" ? "86.0% (A+)" : "91.5% (A+)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-2">
                    <div className="font-bold text-xs text-slate-900">Term 1 Fee Status</div>
                    <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Invoice:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedParentChild === "aarav" ? "₹25,000" : "₹22,000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-mono font-bold text-emerald-700">Paid In Full</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer Callout */}
            <div className="pt-4 border-t border-[#E8E7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Deterministic demonstration environment with coherent institutional data.
              </span>
              <button
                onClick={() => handleLaunchSample(currentRole.email)}
                className="font-bold text-[#0F172A] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Launch {currentRole.persona}&apos;s Live Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
