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

  const handleRoleClick = (roleKey: string) => {
    setNavigatingRole(roleKey);
    router.push(`/demo/${roleKey}/dashboard`);
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground antialiased flex flex-col justify-between">
      {/* Editorial Top Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-tighter shadow-2xs">
              NX
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground block leading-none">
                NEXORA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1 block">
                The Operating System for Education
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-subtle text-[11px] font-semibold text-muted-foreground">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Connected Institutional Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] sm:leading-[1.08]">
            Every person. Every class. Every decision. One connected institution.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Nexora unifies leadership, faculty, students, families, operations, and finance into an intelligent, calm platform designed for serious educational institutions.
          </p>
        </section>

        {/* Minimalist Live Metric Strip */}
        <section className="border-y border-border py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-semibold">
              01 / Students
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1 tracking-tight">
              {stats.studentCount || 350}+
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">
              Enrolled across Grades 5-12
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-semibold">
              02 / Faculty & Staff
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1 tracking-tight">
              {stats.teacherCount || 35}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">
              Verified teaching faculty
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-semibold">
              03 / Synchronized Cohorts
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-foreground mt-1 tracking-tight">
              {stats.cohortCount || 19}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">
              7-Period timetable grids
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-semibold">
              04 / Attendance Integrity
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-accent mt-1 tracking-tight">
              92.4%
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">
              Biometric & daily roll-call
            </span>
          </div>
        </section>

        {/* Persona Entry Gateways (Structured Selection Rows) */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-bold block">
                ENTER NEXORA
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Choose your workspace
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm sm:text-right font-medium">
              Interconnected demo records for <strong>Northstar International Academy</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((p) => {
              const isNavigating = navigatingRole === p.key;
              return (
                <div
                  key={p.key}
                  onClick={() => handleRoleClick(p.key)}
                  className="group relative cursor-pointer p-7 rounded-xl border border-border bg-card hover:border-accent/40 transition-all flex flex-col justify-between shadow-2xs hover:shadow-card-hover"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-accent transition-colors">
                        {p.num}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {p.tagline}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-accent transition-colors">
                          {p.role}
                        </h3>
                        <span className="text-xs text-muted-foreground font-medium">
                          — {p.persona}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border text-[11px] font-medium text-muted-foreground">
                      {p.metrics}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-foreground">
                    <span>
                      {isNavigating ? "Opening Workspace..." : `Enter ${p.role.charAt(0) + p.role.slice(1).toLowerCase()} Workspace`}
                    </span>
                    {isNavigating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-accent" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Editorial Institutional CTA Section */}
        <section className="p-8 sm:p-12 rounded-xl bg-card border border-border text-foreground shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-2.5 max-w-xl z-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-bold block">
              FOR INSTITUTIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to bring your institution together?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
              Set up your school or college in a few guided steps. Provision dedicated terms, grade cohorts, and master administrator credentials in under 3 minutes.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="z-10 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm shrink-0"
          >
            <span>Start Institution Setup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-border py-8 px-6 sm:px-8 text-center text-xs text-muted-foreground font-medium">
        <p>© 2026 NEXORA • The Operating System for Modern Education</p>
      </footer>
    </div>
  );
}
