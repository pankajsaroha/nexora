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
    <section id="solutions" className="py-20 sm:py-24 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface-subtle text-xs font-medium text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Onboarding Blueprint</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              From zero to a fully connected institution workspace in minutes.
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              No protracted 6-month consulting deployments. Nexora provides an automated guided setup wizard with built-in CSV ingestion engines.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-hover border border-primary transition-all shadow-2xs shrink-0 self-start md:self-auto"
          >
            <span>Start Onboarding Wizard</span>
            <ArrowRight className="w-4 h-4 text-primary-foreground" />
          </Link>
        </div>

        {/* 5-Step Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-card space-y-3 hover:border-accent/40 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-md bg-surface-subtle border border-border flex items-center justify-center font-mono font-bold text-xs text-foreground">
                      {st.num}
                    </span>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <h3 className="font-semibold text-sm text-foreground leading-snug">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-normal">{st.desc}</p>
                </div>

                <div className="pt-3 border-t border-border text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                  <span>Step {idx + 1} of 5</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
