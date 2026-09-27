import React from "react";
import { ShieldCheck, Lock, Database, EyeOff, FileText, Sparkles } from "lucide-react";

export function SecuritySection() {
  const securityPillars = [
    {
      title: "Strict Multi-Tenant Isolation",
      desc: "Every institution operates in a strictly isolated workspace. Database queries are automatically scoped by institution identifier to prevent cross-tenant exposure.",
      icon: Database,
      iconColor: "text-[#1B1916] bg-card border-border",
    },
    {
      title: "Granular Role Permissions",
      desc: "Principals, teachers, bursars, students, and parents only receive authorized access tokens for their specific functional responsibilities.",
      icon: Lock,
      iconColor: "text-[#1B1916] bg-card border-border",
    },
    {
      title: "Cryptographic Audit Trails",
      desc: "All sensitive administrative actions — fee receipts, grade entries, attendance amendments, and user onboarding — are immutably logged with timestamps.",
      icon: FileText,
      iconColor: "text-[#1B1916] bg-card border-border",
    },
    {
      title: "Protected Records & Privacy",
      desc: "Guardian phone numbers, student contact records, and faculty compensation packages are shielded with stringent view-level authorization boundaries.",
      icon: EyeOff,
      iconColor: "text-[#1B1916] bg-card border-border",
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/40 bg-warm/15 text-[11px] font-mono uppercase tracking-widest text-primary shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Institutional Governance & Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Your institution. Your records. Complete data isolation.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Educational data carries profound privacy obligations. Nexora enforces strict tenant isolation and role boundaries across every API endpoint and interface.
          </p>
        </div>

        {/* 4 Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-border bg-white space-y-3 hover:border-primary transition-all shadow-2xs"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${p.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground leading-snug">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
