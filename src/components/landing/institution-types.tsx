import React from "react";
import { School, Building, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function InstitutionTypes() {
  return (
    <section id="institutions" className="py-20 sm:py-28 bg-[#FAF9F5] border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-white text-[10px] font-mono uppercase tracking-widest text-slate-700">
            <span>Tailored Academic Tiers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Engineered for both K-12 Schools and Higher Education Colleges.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Colleges are not simply &quot;bigger schools.&quot; Nexora dynamically adapts its academic nomenclature, scheduling structures, and grading systems based on your institution tier.
          </p>
        </div>

        {/* 2 Path Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. K-12 SCHOOLS */}
          <div className="rounded-2xl border border-[#E8E7DF] bg-white p-6 sm:p-8 space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-slate-900 font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">K-12 Schools & Academies</h3>
                    <div className="text-[11px] font-mono text-slate-400">Primary, Middle & High Schools</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Grade Tiers
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                {[
                  "Standardized Grade & Division Cohorts (e.g. Grade 8A, 8B)",
                  "Dedicated Homeroom Class Teacher & Roll-Call Registry",
                  "Parent / Guardian Real-Time Attendance & Bus Route Tracking",
                  "Official CBSE / ICSE Term Examination Progress Cards",
                  "Structured Term Tuition, Lab & Annual Fee Installments",
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E7DF]">
              <Link
                href="/onboarding"
                className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Onboard a K-12 School</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. HIGHER EDUCATION COLLEGES */}
          <div className="rounded-2xl border border-[#E8E7DF] bg-white p-6 sm:p-8 space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center text-slate-900 font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Colleges & University Campuses</h3>
                    <div className="text-[11px] font-mono text-slate-400">Undergraduate & Postgraduate Institutions</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Faculty Tiers
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                {[
                  "Multi-Faculty Academic Departments & Program Specializations",
                  "Semester Cycles, Elective Course Modules & Credit Systems",
                  "Lecture-Wise Period Attendance & Minimum Threshold Audits",
                  "HOD Executive Portals & Faculty Workload Management",
                  "Hostel Dormitory Bed Allocations & Campus Resource Centers",
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E7DF]">
              <Link
                href="/onboarding"
                className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Onboard a College or Campus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
