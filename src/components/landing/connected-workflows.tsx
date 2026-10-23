"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export function ConnectedWorkflows() {
  const steps = [
    {
      role: "01 · Principal",
      title: "Leadership Assigns Task",
      desc: "Principal delegates Assessment Blueprint preparation to faculty with automated tracking and calendar deadlines.",
      badge: "Delegated",
      badgeVariant: "accent",
      cardUI: {
        header: "Task: Assessment Blueprint",
        sub: "Assigned: Mrs. Ananya Sharma · High Priority",
        status: "Active",
        statusClass: "text-accent bg-accent-subtle border-accent/20",
      },
    },
    {
      role: "02 · Teacher",
      title: "Teacher Marks Roll-Call",
      desc: "Faculty accepts syllabus tasks, takes 45-second morning attendance, and publishes today's coursework.",
      badge: "Roll-Call Finalized",
      badgeVariant: "success",
      cardUI: {
        header: "Grade 8A Attendance: 30 / 32",
        sub: "Period 1 Maths · Timetable Active",
        status: "Synced",
        statusClass: "text-success bg-success-subtle border-success-border",
      },
    },
    {
      role: "03 · Student",
      title: "Student Receives Homework",
      desc: "Scholar accesses assignments on portal, tracks deadlines, and reviews live 92.4% term attendance integrity.",
      badge: "Homework Synced",
      badgeVariant: "info",
      cardUI: {
        header: "Assignment: Polynomials",
        sub: "Due in 3 Days · Max Marks: 25",
        status: "Submitted",
        statusClass: "text-foreground bg-muted border-border",
      },
    },
    {
      role: "04 · Parent",
      title: "Parent Receives Alert & Pays",
      desc: "Guardian receives real-time roll-call alerts, reviews report cards, and settles term tuition fees online.",
      badge: "Fee Settled",
      badgeVariant: "success",
      cardUI: {
        header: "Tuition Invoice Settled",
        sub: "Receipt REC-0891 · ₹38,000 via UPI",
        status: "Paid",
        statusClass: "text-success bg-success-subtle border-success-border",
      },
    },
  ];

  return (
    <section id="workflows" className="py-20 sm:py-28 bg-card text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent-subtle text-xs font-medium text-accent">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Integrated Workflows</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            See how Nexora connects the entire institution.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            When leadership delegates, teachers act, scholars learn, and parents stay informed — without data silos, paper slips, or manual reconciliations.
          </p>
        </div>

        {/* 4-Step Cascading Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-background flex flex-col justify-between shadow-2xs hover:border-accent/40 hover:shadow-card-hover transition-all duration-150 space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {step.role}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded border border-border">
                    Step {idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Mini UI Card Representation */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-border/60">
                  <span className="font-medium text-foreground truncate text-[11px]">{step.cardUI.header}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${step.cardUI.statusClass}`}>
                    {step.cardUI.status}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight pt-0.5">
                  {step.cardUI.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
