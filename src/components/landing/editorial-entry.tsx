"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Loader2,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";

interface EditorialEntryProps {
  stats: {
    studentCount: number;
    teacherCount: number;
    cohortCount: number;
    institutionName: string;
  };
}

export function EditorialEntry({ stats }: EditorialEntryProps) {
  const router = useRouter();
  const [navigatingRole, setNavigatingRole] = useState<string | null>(null);

  const handleRoleClick = async (roleKey: string, email: string) => {
    setNavigatingRole(roleKey);
    try {
      await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      console.error("Navigation error:", e);
      router.push("/dashboard");
    }
  };

  const personas = [
    {
      num: "01",
      role: "PRINCIPAL",
      persona: "Dr. Arvind Menon",
      tagline: "Institution Leadership & Governance",
      desc: "Lead your school with absolute operational clarity. View live student and faculty attendance, revenue ledgers, and priority exception feeds.",
      email: "principal@nexora.demo",
      key: "principal",
      metrics: "350 Students • Fee Ledgers • Staff Absence",
    },
    {
      num: "02",
      role: "TEACHER",
      persona: "Mrs. Ananya Sharma",
      tagline: "Classroom & Curriculum Management",
      desc: "Everything you need for your daily classes. Grade 8A roll-call register, 7-period lecture timetable, assignment publishing, and leave quotas.",
      email: "teacher@nexora.demo",
      key: "teacher",
      metrics: "Grade 8A Incharge • Daily Roll Call • Timetable",
    },
    {
      num: "03",
      role: "STUDENT",
      persona: "Aarav Sharma",
      tagline: "Academic Journey & Performance",
      desc: "Your academic world in one place. Today's class timetable, homework submission deadlines, term marks (86%), and outstanding fee balance.",
      email: "student@nexora.demo",
      key: "student",
      metrics: "Grade 8A • Roll #12 • 92.4% Attendance",
    },
    {
      num: "04",
      role: "PARENT",
      persona: "Mr. Rahul Sharma",
      tagline: "Family Connection & Student Progress",
      desc: "Stay closely connected to your children's progress. Dynamically switch between Aarav (Grade 8A) and Meera (Grade 5B), view attendance, and pay term fees.",
      email: "parent@nexora.demo",
      key: "parent",
      metrics: "Multi-Child Switcher • Fee Invoices • Reports",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-slate-900 selection:text-white antialiased flex flex-col justify-between">
      {/* Editorial Top Navigation */}
      <header className="border-b border-[#E8E7DF] bg-[#FAF9F5]/95 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-2xs">
              NX
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-none">
                NEXORA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold mt-1 block">
                The Operating System for Education
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-editorial shadow-xs"
            >
              <span>Onboard Institution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Editorial Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-14 sm:py-20 space-y-20 w-full">
        {/* Editorial Statement */}
        <section className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E0DFD5] bg-[#F4F3ED] text-[11px] font-semibold text-slate-700">
            <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
            <span>Connected Institutional Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.1] sm:leading-[1.08]">
            Every person. Every class. Every decision. One connected institution.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            Nexora unifies leadership, faculty, students, families, operations, and finance into an intelligent, calm platform designed for serious educational institutions.
          </p>
        </section>

        {/* Minimalist Live Metric Strip */}
        <section className="border-y border-[#E8E7DF] py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 block font-semibold">
              01 / Students
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
              {stats.studentCount || 350}+
            </div>
            <span className="text-xs text-slate-700 mt-0.5 block font-medium">
              Enrolled across Grades 5-12
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 block font-semibold">
              02 / Faculty & Staff
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
              {stats.teacherCount || 35}
            </div>
            <span className="text-xs text-slate-700 mt-0.5 block font-medium">
              Verified teaching dossiers
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 block font-semibold">
              03 / Synchronized Cohorts
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
              {stats.cohortCount || 19}
            </div>
            <span className="text-xs text-slate-700 mt-0.5 block font-medium">
              7-Period timetable grids
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 block font-semibold">
              04 / Attendance Integrity
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
              92.4%
            </div>
            <span className="text-xs text-slate-700 mt-0.5 block font-medium">
              Biometric & daily roll-call
            </span>
          </div>
        </section>

        {/* Persona Entry Gateways (Structured Selection Rows) */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-700 font-bold block">
                ENTER NEXORA
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-1">
                Choose your workspace
              </h2>
            </div>
            <p className="text-xs text-slate-700 max-w-sm sm:text-right font-medium">
              Interconnected demo records for <strong>Northstar International Academy</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((p) => {
              const isNavigating = navigatingRole === p.key;
              return (
                <div
                  key={p.key}
                  onClick={() => handleRoleClick(p.key, p.email)}
                  className="group relative cursor-pointer p-7 rounded-xl border border-[#E8E7DF] bg-white hover:border-[#0F172A] transition-editorial flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-700 group-hover:text-[#0F172A] transition-colors">
                        {p.num}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        {p.tagline}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight group-hover:text-[#1E3A8A] transition-colors">
                          {p.role}
                        </h3>
                        <span className="text-xs text-slate-700 font-medium">
                          — {p.persona}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F4F3ED] text-[11px] font-medium text-slate-700">
                      {p.metrics}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#F4F3ED] flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span>
                      {isNavigating ? "Opening Workspace..." : `Enter ${p.role.charAt(0) + p.role.slice(1).toLowerCase()} Workspace`}
                    </span>
                    {isNavigating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F172A]" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-[#0F172A]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Editorial Institutional CTA Section */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#0F172A] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-2.5 max-w-xl z-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              FOR INSTITUTIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to bring your institution together?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Set up your school or college in a few guided steps. Provision dedicated terms, grade cohorts, and master administrator credentials in under 3 minutes.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="z-10 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#0F172A] text-xs font-bold hover:bg-slate-100 transition-editorial shadow-sm shrink-0"
          >
            <span>Start Institution Setup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-[#E8E7DF] py-8 px-6 sm:px-8 text-center text-xs text-slate-700 font-medium">
        <p>© 2026 NEXORA • The Operating System for Modern Education</p>
      </footer>
    </div>
  );
}
