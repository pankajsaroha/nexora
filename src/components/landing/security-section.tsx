import React from "react";
import { ShieldCheck, Lock, Database, EyeOff, FileText, Sparkles } from "lucide-react";

export function SecuritySection() {
  const securityPillars = [
    {
      title: "Strict Multi-Tenant Isolation",
      desc: "Every institution operates in a strictly isolated workspace. Database queries are automatically scoped by institution identifier to prevent cross-tenant exposure.",
      icon: Database,
      iconColor: "text-[#1B1916] bg-[#FAF8F3] border-[#E5E0D5]",
    },
    {
      title: "Granular Role Permissions",
      desc: "Principals, teachers, bursars, students, and parents only receive authorized access tokens for their specific functional responsibilities.",
      icon: Lock,
      iconColor: "text-[#1B1916] bg-[#FAF8F3] border-[#E5E0D5]",
    },
    {
      title: "Cryptographic Audit Trails",
      desc: "All sensitive administrative actions — fee receipts, grade entries, attendance amendments, and user onboarding — are immutably logged with timestamps.",
      icon: FileText,
      iconColor: "text-[#1B1916] bg-[#FAF8F3] border-[#E5E0D5]",
    },
    {
      title: "Protected Records & Privacy",
      desc: "Guardian phone numbers, student contact records, and faculty compensation packages are shielded with stringent view-level authorization boundaries.",
      icon: EyeOff,
      iconColor: "text-[#1B1916] bg-[#FAF8F3] border-[#E5E0D5]",
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 bg-[#FAF8F3] border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B89B62]/40 bg-[#FAF6ED] text-[11px] font-mono uppercase tracking-widest text-[#856D3B] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B89B62]" />
            <span>Institutional Governance & Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171614] tracking-tight">
            Your institution. Your records. Complete data isolation.
          </h2>

          <p className="text-sm sm:text-base text-[#555047] leading-relaxed">
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
                className="p-6 rounded-3xl border border-[#E5E0D5] bg-white space-y-3 hover:border-[#B89B62] transition-all shadow-2xs"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${p.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#171614] leading-snug">{p.title}</h3>
                <p className="text-xs text-[#555047] leading-relaxed font-normal">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
