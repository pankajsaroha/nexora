import React from "react";
import { Users, GraduationCap, CalendarCheck, Receipt, Megaphone, CheckSquare } from "lucide-react";

export function CapabilityStrip() {
  const capabilities = [
    {
      label: "People & Directory",
      detail: "Scholars, Faculty & Guardians",
      icon: Users,
    },
    {
      label: "Academics & Grading",
      detail: "Timetables, Coursework & CBSE",
      icon: GraduationCap,
    },
    {
      label: "Attendance Matrix",
      detail: "Live Roll Call & Biometrics",
      icon: CalendarCheck,
    },
    {
      label: "Institutional Finance",
      detail: "Term Invoices & Staff Payroll",
      icon: Receipt,
    },
    {
      label: "Parent Communication",
      detail: "WhatsApp Alerts & Circulars",
      icon: Megaphone,
    },
    {
      label: "Campus Operations",
      detail: "Tasks, Bus Fleet, Hostel & Library",
      icon: CheckSquare,
    },
  ];

  return (
    <div className="border-y border-border bg-card py-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            One Connected Architecture Across All Departments
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border bg-surface-subtle hover:bg-card hover:border-accent/40 transition-all text-left space-y-1.5 shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground leading-tight">{c.label}</div>
                  <div className="text-[10px] font-mono text-muted-foreground leading-tight mt-0.5">{c.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
