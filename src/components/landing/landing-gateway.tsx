"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  School,
  FileCheck,
  CreditCard,
  Lock,
  ArrowUpRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LandingGatewayProps {
  stats: {
    studentCount: number;
    teacherCount: number;
    cohortCount: number;
    institutionName: string;
  };
}

export function LandingGateway({ stats }: LandingGatewayProps) {
  const router = useRouter();
  const [navigatingRole, setNavigatingRole] = useState<string | null>(null);

  const handleRoleClick = async (roleKey: string, targetPath: string, email: string) => {
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

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0C0E14] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 antialiased">
      {/* Editorial Top Ambient Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-200/70 dark:border-stone-800/80 bg-[#FBFBF9]/90 dark:bg-[#0C0E14]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm tracking-tighter">
              NX
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                NEXORA
              </span>
              <span className="hidden sm:inline text-[11px] uppercase tracking-widest text-stone-600 dark:text-stone-300 font-semibold">
                Enterprise OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Tenancy: <strong className="text-stone-900 dark:text-stone-200">{stats.institutionName}</strong></span>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-all shadow-xs"
            >
              <span>Onboard Institution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Editorial Hero Statement */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>The Operating System for Modern Institutions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Manage your institution, academics, operations and finances from one intelligent platform.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Nexora unifies institutional leadership, faculty workflows, student achievements, and parental communication into a calm, interconnected enterprise system.
          </p>
        </section>

        {/* Live Relational Metric Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { label: "Active Students", value: `${stats.studentCount || 350}+`, meta: "Enrolled across Grades 5-12" },
            { label: "Faculty & Staff", value: `${stats.teacherCount || 35}`, meta: "Verified teaching dossiers" },
            { label: "Academic Cohorts", value: `${stats.cohortCount || 19}`, meta: "Timetable periods synced" },
            { label: "Attendance Integrity", value: "92.4%", meta: "Daily biometrics & roll call" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/50 shadow-2xs backdrop-blur-xs"
            >
              <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                {item.value}
              </div>
              <span className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 block font-medium">
                {item.meta}
              </span>
            </div>
          ))}
        </section>

        {/* Primary Role Entry Gateways */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Enter Nexora Workspace
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Select an interconnected institutional persona to experience tailored operations, permissions, and dashboards.
              </p>
            </div>
            <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Northstar International Academy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. PRINCIPAL GATEWAY */}
            <div
              onClick={() => handleRoleClick("principal", "/principal", "principal@nexora.demo")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-indigo-600/50 dark:hover:border-indigo-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Principal
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        Dr. Arvind Menon • Head of Institution
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-stone-300 dark:border-stone-700">
                    Governance
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  Lead your institution with clarity. View live student and faculty attendance, revenue collection, academic term health, and actionable exception feeds.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    350 Students Overview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Fee Collection Ledger
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <span>
                  {navigatingRole === "principal" ? "Opening Principal Workspace..." : "Explore Principal Workspace"}
                </span>
                {navigatingRole === "principal" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>

            {/* 2. TEACHER GATEWAY */}
            <div
              onClick={() => handleRoleClick("teacher", "/teacher", "teacher@nexora.demo")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-emerald-600/50 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Teacher
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        Mrs. Ananya Sharma • Class Teacher (Grade 8A)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-stone-300 dark:border-stone-700">
                    Classroom
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  Everything you need for your classes and curriculum. Today&apos;s 7-period lecture timetable, Grade 8A roll-call register, assignment publishing, and leave quotas.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Grade 8A Class Teacher
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Daily Roll Call & Homework
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <span>
                  {navigatingRole === "teacher" ? "Opening Teacher Workspace..." : "Explore Teacher Workspace"}
                </span>
                {navigatingRole === "teacher" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>

            {/* 3. STUDENT GATEWAY */}
            <div
              onClick={() => handleRoleClick("student", "/student", "student@nexora.demo")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-sky-600/50 dark:hover:border-sky-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        Student
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        Aarav Sharma • Grade 8A (Roll #12)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-stone-300 dark:border-stone-700">
                    Academic
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  Your academic world in one place. Daily class timetable, upcoming assignment deadlines, term marks, attendance rate (92.4%), and outstanding fee balance.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    86.0% Term 1 Average
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Pending Homework & Marks
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <span>
                  {navigatingRole === "student" ? "Opening Student Portal..." : "Enter Student Workspace"}
                </span>
                {navigatingRole === "student" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>

            {/* 4. PARENT GATEWAY */}
            <div
              onClick={() => handleRoleClick("parent", "/parent", "parent@nexora.demo")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-amber-600/50 dark:hover:border-amber-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Parent
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        Mr. Rahul Sharma • Guardian of Aarav & Meera
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-stone-300 dark:border-stone-700">
                    Family
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  Stay closely connected to your children&apos;s progress. Seamlessly switch between Aarav (Grade 8A) and Meera (Grade 5B), review attendance records, and pay term fees.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Multi-Sibling Dynamic Switch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ₹12,500 Fee Invoice Tracker
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <span>
                  {navigatingRole === "parent" ? "Opening Parent Portal..." : "Enter Parent Workspace"}
                </span>
                {navigatingRole === "parent" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Institution Onboarding Banner */}
        <section className="p-8 sm:p-10 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <Badge variant="outline" className="text-[10px] text-stone-300 border-stone-700">
              Institution Setup
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Onboard your School or College
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Configure your institution in under 3 minutes. Define academic sessions, grade cohorts, and master executive credentials with automated multi-tenant database provisioning.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="z-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-stone-900 text-xs font-bold hover:bg-stone-100 transition-all shadow-sm shrink-0"
          >
            <span>Launch Onboarding Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 py-8 px-6 text-center text-xs text-stone-600 dark:text-stone-300 font-medium">
        <p>© 2026 NEXORA Operating System • Built for Serious Educational Institutions</p>
      </footer>
    </div>
  );
}
