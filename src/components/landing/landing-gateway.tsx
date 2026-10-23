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

  const handleRoleClick = (roleKey: string) => {
    setNavigatingRole(roleKey);
    router.push(`/demo/${roleKey}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground antialiased">
      {/* Editorial Top Ambient Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
              NX
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base tracking-tight text-foreground">
                NEXORA
              </span>
              <span className="hidden sm:inline text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                Enterprise OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span>Active Tenancy: <strong className="text-foreground">{stats.institutionName}</strong></span>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-xs"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>The Operating System for Modern Institutions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Manage your institution, academics, operations and finances from one intelligent platform.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Nexora unifies institutional leadership, faculty workflows, student achievements, and parental communication into a calm, interconnected enterprise system.
          </p>
        </section>

        {/* Live Relational Metric Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { label: "Active Students", value: `${stats.studentCount || 350}+`, meta: "Enrolled across Grades 5-12" },
            { label: "Faculty & Staff", value: `${stats.teacherCount || 35}`, meta: "Verified faculty & staff" },
            { label: "Academic Cohorts", value: `${stats.cohortCount || 19}`, meta: "Timetable periods synced" },
            { label: "Attendance Integrity", value: "92.4%", meta: "Daily biometrics & roll call" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-border bg-card shadow-2xs backdrop-blur-xs"
            >
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {item.value}
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block font-medium">
                {item.meta}
              </span>
            </div>
          ))}
        </section>

        {/* Primary Role Entry Gateways */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Enter Nexora Workspace
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select an interconnected institutional persona to experience tailored operations, permissions, and dashboards.
              </p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Northstar International Academy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. PRINCIPAL GATEWAY */}
            <div
              onClick={() => handleRoleClick("principal")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-xl border border-border bg-card hover:border-accent/40 transition-all duration-200 shadow-xs hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent/20 text-accent flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        Principal
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Dr. Arvind Menon • Head of Institution
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-border">
                    Governance
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Lead your institution with clarity. View live student and faculty attendance, revenue collection, academic term health, and actionable exception feeds.
                </p>

                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    350 Students Overview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Fee Collection Ledger
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-medium text-accent pt-3 border-t border-border">
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
              onClick={() => handleRoleClick("teacher")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-xl border border-border bg-card hover:border-accent/40 transition-all duration-200 shadow-xs hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent/20 text-accent flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        Teacher
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Mrs. Ananya Sharma • Class Teacher (Grade 8A)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-border">
                    Classroom
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Everything you need for your classes and curriculum. Today&apos;s 7-period lecture timetable, Grade 8A roll-call register, assignment publishing, and leave quotas.
                </p>

                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Grade 8A Class Teacher
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Daily Roll Call & Homework
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-medium text-accent pt-3 border-t border-border">
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
              onClick={() => handleRoleClick("student")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-xl border border-border bg-card hover:border-accent/40 transition-all duration-200 shadow-xs hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent/20 text-accent flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        Student
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Aarav Sharma • Grade 8A (Roll #12)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-border">
                    Academic
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Your academic world in one place. Daily class timetable, upcoming assignment deadlines, term marks, attendance rate (92.4%), and outstanding fee balance.
                </p>

                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    86.0% Term 1 Average
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Pending Homework & Marks
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-medium text-accent pt-3 border-t border-border">
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
              onClick={() => handleRoleClick("parent")}
              className="group relative cursor-pointer p-6 sm:p-7 rounded-xl border border-border bg-card hover:border-accent/40 transition-all duration-200 shadow-xs hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent/20 text-accent flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        Parent
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Mr. Rahul Sharma • Guardian of Aarav & Meera
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium border-border">
                    Family
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Stay closely connected to your children&apos;s progress. Seamlessly switch between Aarav (Grade 8A) and Meera (Grade 5B), review attendance records, and pay term fees.
                </p>

                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Multi-Sibling Dynamic Switch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ₹12,500 Fee Invoice Tracker
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-medium text-accent pt-3 border-t border-border">
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
        <section className="p-8 sm:p-10 rounded-xl border border-border bg-card shadow-card-hover relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <Badge variant="accent" className="text-[10px]">
              Institution Setup
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Onboard your School or College
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Configure your institution in under 3 minutes. Define academic sessions, grade cohorts, and master executive credentials with automated multi-tenant database provisioning.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="z-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-all shadow-sm shrink-0"
          >
            <span>Launch Onboarding Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Subtle background luxury glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground font-medium">
        <p>© 2026 NEXORA Operating System • Built for Serious Educational Institutions</p>
      </footer>
    </div>
  );
}
