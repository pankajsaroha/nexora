import React from "react";
import { ShieldCheck, Lock, Database, EyeOff, FileText, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  const securityPillars = [
    {
      title: "Strict Multi-Tenant Isolation",
      desc: "Every institution operates in a strictly isolated workspace. Database queries are automatically scoped by institution identifier to prevent cross-tenant exposure.",
      icon: Database,
    },
    {
      title: "Granular Role Permissions",
      desc: "Principals, teachers, bursars, students, and parents only receive authorized access tokens for their specific functional responsibilities.",
      icon: Lock,
    },
    {
      title: "Cryptographic Audit Trails",
      desc: "All sensitive administrative actions — fee receipts, grade entries, attendance amendments, and user onboarding — are immutably logged with timestamps.",
      icon: FileText,
    },
    {
      title: "Protected Records & Privacy",
      desc: "Guardian phone numbers, student contact records, and faculty compensation packages are shielded with stringent view-level authorization boundaries.",
      icon: EyeOff,
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 bg-white border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-[#FAF9F5] text-[10px] font-mono uppercase tracking-widest text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Governance & Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Your institution. Your records. Complete data isolation.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
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
                className="p-5 rounded-2xl border border-[#E8E7DF] bg-[#FAF9F5] space-y-3 hover:border-slate-900 transition-colors shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E7DF] flex items-center justify-center text-slate-900">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
