"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  Award,
} from "lucide-react";

export function RoleStrip() {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const roles = [
    {
      roleCode: "PRINCIPAL",
      title: "Principal & Leadership",
      persona: "Dr. Arvind Menon",
      tagline: "See the entire institution at a glance",
      email: "principal@nexora.demo",
      capabilities: ["Campus Roll-Call (94.2%)", "Revenue & Fee Ledgers", "Staff Absence & Leave Approvals"],
      metrics: "350 Students • 35 Faculty • 19 Cohorts",
      badgeVariant: "accent" as const,
      icon: Award,
      preview: {
        type: "stat",
        kpis: [
          { label: "Today Attendance", val: "94.2%", color: "text-success" },
          { label: "Term 1 Realized", val: "₹18.4L", color: "text-accent" },
          { label: "Pending Tasks", val: "3 Active", color: "text-warning" },
        ],
      },
    },
    {
      roleCode: "TEACHER",
      title: "Faculty & Tutors",
      persona: "Mrs. Ananya Sharma",
      tagline: "Manage your classroom effortlessly",
      email: "teacher@nexora.demo",
      capabilities: ["Grade 8A Roll-Call (45s)", "7-Period Timetable", "Assignment Dispatch & Marks"],
      metrics: "Maths Lead • Grade 8A Incharge • 32 Scholars",
      badgeVariant: "success" as const,
      icon: GraduationCap,
      preview: {
        type: "timetable",
        slots: [
          { period: "P1 (08:30)", sub: "Grade 8A Maths", room: "Room 104" },
          { period: "P2 (09:15)", sub: "Grade 10 Science", room: "Physics Lab" },
        ],
      },
    },
    {
      roleCode: "STUDENT",
      title: "Enrolled Scholars",
      persona: "Aarav Sharma",
      tagline: "Everything you need in one place",
      email: "student@nexora.demo",
      capabilities: ["Today's Class Schedule", "Homework Submission Queue", "CBSE Term Progress (86.4%)"],
      metrics: "Grade 8A • Roll #12 • 92.4% Attendance",
      badgeVariant: "default" as const,
      icon: BookOpen,
      preview: {
        type: "student",
        items: [
          { label: "Academic Standing", val: "Grade 8A (Roll #12)" },
          { label: "Upcoming Homework", val: "Polynomials (Due 30 Sep)" },
        ],
      },
    },
    {
      roleCode: "PARENT",
      title: "Families & Guardians",
      persona: "Mr. Rahul Sharma",
      tagline: "Stay connected with your child's progress",
      email: "parent@nexora.demo",
      capabilities: ["Multi-Child Sibling Switcher", "Instant WhatsApp Alerts", "Digital Fee Receipts & UPI"],
      metrics: "Aarav (Grade 8A) & Meera (Grade 5B)",
      badgeVariant: "info" as const,
      icon: HeartHandshake,
      preview: {
        type: "parent",
        children: [
          { name: "Aarav Sharma", grade: "Grade 8A", att: "94%", fee: "PAID" },
          { name: "Meera Sharma", grade: "Grade 5B", att: "92%", fee: "PAID" },
        ],
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-card text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>One Platform. Every Role.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Tailored workspaces for everyone in your institution.
            </h2>

            <p className="text-sm text-muted-foreground">
              Explore how Nexora delivers purpose-built workflows, permissions, and dashboards for every institutional stakeholder.
            </p>
          </div>

          <span className="text-xs text-muted-foreground font-medium bg-muted/60 px-3.5 py-2 rounded-xl border border-border shadow-2xs">
            Direct Role Portals · Secure Institutional Access
          </span>
        </div>

        {/* 4 Role Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r) => {
            const Icon = r.icon;

            return (
              <div
                key={r.roleCode}
                role="button"
                tabIndex={0}
                onClick={handleNavigateToLogin}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNavigateToLogin();
                  }
                }}
                className="group relative rounded-xl border border-border bg-background p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-card-hover hover:border-accent/40 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <div className="space-y-5">
                  {/* Top Badge & Role Name */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-border bg-muted text-foreground"
                    >
                      {r.title}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent shadow-2xs">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Headline & Persona */}
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors">
                      {r.persona}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {r.tagline}
                    </p>
                  </div>

                  {/* Visual UI Preview Snippet */}
                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 text-xs shadow-2xs">
                    {r.preview.type === "stat" && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {r.preview.kpis?.map((k, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className={`text-xs font-bold ${k.color}`}>{k.val}</div>
                            <div className="text-[9px] text-muted-foreground font-medium truncate">{k.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "timetable" && (
                      <div className="space-y-1.5 text-[10px]">
                        {r.preview.slots?.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-muted/50 p-1.5 rounded-lg border border-border">
                            <span className="font-semibold text-foreground">{s.period}</span>
                            <span className="text-muted-foreground truncate">{s.sub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "student" && (
                      <div className="space-y-1 text-[10px]">
                        {r.preview.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-muted-foreground">
                            <span>{item.label}:</span>
                            <span className="font-semibold text-foreground">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {r.preview.type === "parent" && (
                      <div className="space-y-1.5">
                        {r.preview.children?.map((c, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] bg-muted/50 p-1.5 rounded-lg border border-border">
                            <span className="font-semibold text-foreground">{c.name}</span>
                            <span className="text-success font-semibold">{c.att}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3 Capabilities */}
                  <div className="space-y-1.5 pt-1">
                    {r.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Sign In to Access</span>
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
