"use client";

import React, { useState } from "react";
import { UserCheck, BookOpen, Receipt, Shield, Megaphone, Sparkles } from "lucide-react";

export function TimelineTour() {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const events = [
    {
      time: "08:00 AM",
      title: "Faculty Check-In & Morning Roll Call",
      description: "35 teachers complete biometric attendance. Grade 8A tutor Mrs. Ananya Sharma marks 30/32 students present in 45 seconds.",
      role: "Faculty & Homeroom",
      tag: "Attendance Engine",
      icon: UserCheck,
      iconColor: "text-success bg-success/15 border-success/30",
      cardPreview: {
        heading: "Grade 8A Roll-Call Reconciled",
        sub: "30 Present • 2 Absent (Medical Leave)",
        badge: "08:15 AM Verified",
        badgeColor: "text-success",
      },
    },
    {
      time: "10:15 AM",
      title: "Coursework Published to Scholars & Parents",
      description: "Science department publishes 'Mechanics & Optics Problem Set'. Homework immediately syncs to student tablets and parent portals.",
      role: "Academics",
      tag: "Coursework",
      icon: BookOpen,
      iconColor: "text-primary bg-warm/15 border-warm/30",
      cardPreview: {
        heading: "Physics Problem Set #4",
        sub: "Grade 10 Science • Due Friday • 25 Marks",
        badge: "Synced to Portals",
        badgeColor: "text-primary",
      },
    },
    {
      time: "12:30 PM",
      title: "Fee Payment Recorded & Receipt Dispatched",
      description: "Accountant reconciles ₹38,000 Term 1 tuition invoice. Official 3-part printable receipt voucher REC-0891 is generated automatically.",
      role: "Finance",
      tag: "Bursar Ledger",
      icon: Receipt,
      iconColor: "text-primary bg-warm/15 border-warm/30",
      cardPreview: {
        heading: "Receipt REC-2026-0891",
        sub: "Mr. Rahul Sharma • ₹38,000 via UPI",
        badge: "Reconciled",
        badgeColor: "text-success",
      },
    },
    {
      time: "02:00 PM",
      title: "Principal Executive Health Audit",
      description: "Dr. Arvind Menon reviews campus-wide 94.2% attendance, verifies absence notifications, and approves 2 faculty leave petitions.",
      role: "Leadership",
      tag: "Executive Command",
      icon: Shield,
      iconColor: "text-success bg-success/15 border-success/30",
      cardPreview: {
        heading: "Campus Attendance: 94.2%",
        sub: "330 Present • 2 Leaves Approved",
        badge: "Audit Complete",
        badgeColor: "text-success",
      },
    },
    {
      time: "04:30 PM",
      title: "Task Resolution & Campus Circular Dispatch",
      description: "Science Lab Audit task resolved. Evening robotics competition circular sent to all 350 parents via instant WhatsApp dispatch.",
      role: "Operations",
      tag: "Dispatches",
      icon: Megaphone,
      iconColor: "text-destructive bg-warm/15 border-destructive/30",
      cardPreview: {
        heading: "Circular: Robotics Championship",
        sub: "Dispatched to 350 Parent WhatsApp feeds",
        badge: "100% Delivered",
        badgeColor: "text-destructive",
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/40 bg-warm/15 text-[11px] font-mono uppercase tracking-widest text-primary shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Operational Continuity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            A day in the life of a connected institution.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From the first morning bell to evening administrative reconciliation, Nexora coordinates every stakeholder across the school day.
          </p>
        </div>

        {/* 5-Step Visual Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {events.map((ev, idx) => {
            const Icon = ev.icon;
            const isSelected = selectedEventIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedEventIndex(idx)}
                className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-lg ${
                  isSelected
                    ? "border-primary bg-warm/15 translate-y-[-2px] ring-1 ring-[#B89B62]/30"
                    : "border-border bg-white hover:border-primary hover:bg-card"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground bg-card px-2 py-0.5 rounded-md border border-border shadow-2xs">
                      {ev.time}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">0{idx + 1}</span>
                  </div>

                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors shadow-2xs ${ev.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="font-bold text-sm text-foreground leading-snug">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
                </div>

                {/* Mini UI Snippet */}
                <div className="p-3 rounded-2xl bg-card border border-border space-y-1 text-left font-mono text-[10px] shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground truncate">{ev.cardPreview.heading}</span>
                  </div>
                  <div className="text-muted-foreground text-[9px] truncate">{ev.cardPreview.sub}</div>
                  <div className={`pt-1 font-bold text-[9px] ${ev.cardPreview.badgeColor}`}>{ev.cardPreview.badge}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
