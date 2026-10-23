import React from "react";
import { ShieldCheck, Lock, Database, EyeOff, FileText } from "lucide-react";

export function SecuritySection() {
  const securityPillars = [
    {
      title: "Multi-Tenant Isolation",
      desc: "Every institution operates in a strictly partitioned workspace. Database queries are systematically scoped by institution ID to prevent cross-tenant exposure.",
      icon: Database,
    },
    {
      title: "Granular Role Boundaries",
      desc: "Principals, teachers, bursars, students, and parents only receive authorized access tokens for their specific functional responsibilities.",
      icon: Lock,
    },
    {
      title: "Cryptographic Audit Trails",
      desc: "Sensitive administrative actions — fee receipts, grade entries, attendance amendments, and user onboarding — are immutably logged with timestamps.",
      icon: FileText,
    },
    {
      title: "Protected Records & Privacy",
      desc: "Guardian phone numbers, student contact records, and faculty compensation packages are shielded with stringent view-level authorization boundaries.",
      icon: EyeOff,
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent-subtle text-xs font-medium text-accent">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Institutional Governance & Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Your institution. Your records. Complete data isolation.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Educational data carries profound privacy obligations. Nexora enforces strict tenant isolation and role boundaries across every API endpoint and interface.
          </p>
        </div>

        {/* 4 Security Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-background space-y-3 hover:border-accent/40 shadow-2xs transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-foreground-secondary shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-foreground leading-snug">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
