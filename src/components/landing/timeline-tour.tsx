"use client";

import React, { useState } from "react";
import { UserCheck, BookOpen, Receipt, Shield, Megaphone, Sparkles } from "lucide-react";

export function TimelineTour() {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const events = [
    {
      time: "08:00 AM",
      title: "Faculty Check-In & Morning Roll Call",
      description: "35 teachers complete biometric attendance. Grade 8A tutor marks 30/32 students present in 45 seconds.",
      role: "Faculty & Homeroom",
      icon: UserCheck,
      cardPreview: {
        heading: "Grade 8A Roll-Call Reconciled",
        sub: "30 Present · 2 Absent (Medical Leave)",
        badge: "08:15 AM Verified",
        badgeColor: "text-success",
      },
    },
    {
      time: "10:15 AM",
      title: "Coursework Published to Scholars & Parents",
      description: "Science department publishes Mechanics Problem Set. Homework immediately syncs to student tablets and parent portals.",
      role: "Academics",
      icon: BookOpen,
      cardPreview: {
        heading: "Physics Problem Set #4",
        sub: "Grade 10 Science · Due Friday · 25 Marks",
        badge: "Synced to Portals",
        badgeColor: "text-accent",
      },
    },
    {
      time: "12:30 PM",
      title: "Fee Payment Recorded & Receipt Dispatched",
      description: "Accountant reconciles ₹38,000 Term 1 tuition invoice. Official 3-part printable receipt voucher REC-0891 is generated automatically.",
      role: "Finance",
      icon: Receipt,
      cardPreview: {
        heading: "Receipt REC-2026-0891",
        sub: "Mr. Rahul Sharma · ₹38,000 via UPI",
        badge: "Reconciled",
        badgeColor: "text-success",
      },
    },
    {
      time: "02:00 PM",
      title: "Principal Executive Health Audit",
      description: "Leadership reviews campus-wide 94.2% attendance, verifies absence notifications, and approves 2 faculty leave petitions.",
      role: "Leadership",
      icon: Shield,
      cardPreview: {
        heading: "Campus Attendance: 94.2%",
        sub: "330 Present · 2 Leaves Approved",
        badge: "Audit Complete",
        badgeColor: "text-success",
      },
    },
    {
      time: "04:30 PM",
      title: "Task Resolution & Circular Dispatch",
      description: "Science Lab Audit task resolved. Evening competition notice sent to parents via instant WhatsApp dispatch.",
      role: "Operations",
      icon: Megaphone,
      cardPreview: {
        heading: "Circular: Robotics Championship",
        sub: "Dispatched to 350 Parent feeds",
        badge: "100% Delivered",
        badgeColor: "text-accent",
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent-subtle text-xs font-medium text-accent">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Operational Continuity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            A day in the life of a connected institution.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From the first morning bell to evening administrative reconciliation, Nexora coordinates every stakeholder across the school day.
          </p>
        </div>

        {/* 5-Step Visual Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {events.map((ev, idx) => {
            const Icon = ev.icon;
            const isSelected = selectedEventIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedEventIndex(idx)}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs ${
                  isSelected
                    ? "border-accent bg-accent-subtle/25 dark:bg-accent-subtle/15 ring-1 ring-accent/30"
                    : "border-border bg-card hover:border-border-strong hover:bg-surface-subtle/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground bg-surface-subtle px-2 py-0.5 rounded border border-border">
                      {ev.time}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">0{idx + 1}</span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-foreground-secondary shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="font-semibold text-sm text-foreground leading-snug">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
                </div>

                {/* Mini UI Snippet */}
                <div className="p-2.5 rounded-lg bg-surface-subtle border border-border space-y-1 text-left text-xs">
                  <div className="font-medium text-foreground truncate text-[11px]">{ev.cardPreview.heading}</div>
                  <div className="text-muted-foreground text-[10px] truncate">{ev.cardPreview.sub}</div>
                  <div className={`pt-0.5 font-semibold text-[10px] ${ev.cardPreview.badgeColor}`}>{ev.cardPreview.badge}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
