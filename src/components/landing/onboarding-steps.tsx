import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Building2, UploadCloud, Users, Shield } from "lucide-react";

export function OnboardingSteps() {
  const steps = [
    {
      num: "01",
      title: "Institution Profile",
      desc: "Provide school name, affiliation code, operational hours, and contact credentials.",
      icon: Building2,
    },
    {
      num: "02",
      title: "Academic Hierarchy",
      desc: "Configure grades or departments, divisions, subject allocations, and period timings.",
      icon: Shield,
    },
    {
      num: "03",
      title: "Administrator Setup",
      desc: "Establish primary Principal / Admin security credentials and access permissions.",
      icon: Users,
    },
    {
      num: "04",
      title: "Universal CSV Import",
      desc: "Bulk ingest student rosters and faculty directories with automatic collision validation.",
      icon: UploadCloud,
    },
    {
      num: "05",
      title: "Live Operations",
      desc: "Dispatch instant portal invites to teachers and parents to begin daily institutional workflows.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="solutions" className="py-20 sm:py-28 bg-[#FAF9F5] border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-white text-[10px] font-mono uppercase tracking-widest text-slate-700">
              <span>Onboarding Blueprint</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              From zero to a fully connected institution workspace in minutes.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              No protracted 6-month consulting deployments. Nexora provides an automated guided setup wizard with built-in CSV ingestion engines.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0F172A] text-white hover:bg-slate-800 transition-all shadow-xs shrink-0 self-start md:self-auto"
          >
            <span>Start Onboarding Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5-Step Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#E8E7DF] bg-white space-y-3 hover:border-slate-900 transition-colors shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center font-mono font-bold text-xs text-slate-900">
                      {st.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{st.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#E8E7DF] text-[10px] font-mono text-emerald-700 font-semibold">
                  Step {idx + 1} of 5
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
