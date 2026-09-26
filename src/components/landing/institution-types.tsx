"use client";

import React, { useState } from "react";
import { School, Building2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function InstitutionTypes() {
  const [selectedTier, setSelectedTier] = useState<"school" | "college">("school");

  return (
    <section id="institutions" className="py-20 sm:py-28 bg-[#FAF8F3] border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B89B62]/40 bg-[#FAF6ED] text-[11px] font-mono uppercase tracking-widest text-[#856D3B] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B89B62]" />
              <span>Tailored Academic Tiers</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171614] tracking-tight">
              Engineered for both K-12 Schools and Higher Education Colleges.
            </h2>

            <p className="text-sm sm:text-base text-[#555047] leading-relaxed">
              Colleges are not simply &ldquo;bigger schools.&rdquo; Nexora dynamically adapts its academic nomenclature, scheduling structures, and grading systems based on your institution tier.
            </p>
          </div>

          {/* Interactive Tier Toggle */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#E5E0D5] shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setSelectedTier("school")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedTier === "school"
                  ? "bg-[#1B1916] text-[#F7F4ED] shadow-xs"
                  : "text-[#555047] hover:text-[#171614]"
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>K-12 Schools</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier("college")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedTier === "college"
                  ? "bg-[#1B1916] text-[#F7F4ED] shadow-xs"
                  : "text-[#555047] hover:text-[#171614]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Colleges & Universities</span>
            </button>
          </div>
        </div>

        {/* Dynamic Architectural Comparison View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Interactive Tier Card */}
          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-7 sm:p-9 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#EFECE3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#D4B87C]/50 flex items-center justify-center text-[#856D3B] font-bold shadow-2xs">
                    {selectedTier === "school" ? <School className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#171614]">
                      {selectedTier === "school" ? "K-12 Schools & Academies" : "Colleges & Higher Education"}
                    </h3>
                    <div className="text-[11px] font-mono text-[#7A756B]">
                      {selectedTier === "school" ? "Primary, Middle & High Schools" : "Undergraduate, Postgraduate & Autonomous"}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase font-bold text-[#525E4B] bg-[#F4F6F1] px-2.5 py-1 rounded-md border border-[#65705B]/30">
                  {selectedTier === "school" ? "Grade-Division Model" : "Semester-Credit Model"}
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#555047] font-medium">
                {(selectedTier === "school"
                  ? [
                      "Standardized Grade & Division Cohorts (Grade 8A, Grade 8B)",
                      "Dedicated Homeroom Class Teacher & 45-Second Daily Roll-Call",
                      "Parent / Guardian Multi-Child Switcher & WhatsApp Absence Alerts",
                      "Official CBSE / ICSE Term Examination Progress Cards & Marks",
                      "Structured Term Tuition, Lab & Annual Fee Installment Schedules",
                    ]
                  : [
                      "Departmental Faculties (Computer Science, Science, Commerce)",
                      "Degree Programs & Semester Cohorts (BCA Sem 1, B.Tech Sem 3)",
                      "Credit-Hour Course Mapping & Semester Grade Point Average (GPA)",
                      "Faculty Research Portfolios, Lecture Theatres & Lab Allocations",
                      "Semester Tuition Ledgers, Examination Hall Tickets & Convocation",
                    ]
                ).map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65705B] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-[#EFECE3] flex items-center justify-between">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B1916] text-[#F7F4ED] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs"
              >
                <span>Onboard {selectedTier === "school" ? "School" : "College"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4B87C]" />
              </Link>
              <span className="text-[11px] font-mono text-[#7A756B]">Takes ~3 minutes</span>
            </div>
          </div>

          {/* Visual Architecture Preview Box */}
          <div className="rounded-3xl border border-[#E5E0D5] bg-[#FAF8F3] p-7 sm:p-9 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
                <span className="text-xs font-bold text-[#171614] font-mono uppercase tracking-wider">
                  Live System Hierarchy
                </span>
                <span className="text-[10px] font-mono text-[#856D3B] font-bold bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#D4B87C]/50">
                  {selectedTier === "school" ? "K-12 SCHEME" : "COLLEGIATE SCHEME"}
                </span>
              </div>

              {selectedTier === "school" ? (
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <div className="font-bold text-[#171614]">Institution: Northstar International Academy</div>
                    <div className="text-[10px] text-[#7A756B] mt-0.5">Academic Year: 2026-2027 (Term 1 & Term 2)</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] ml-4 shadow-2xs">
                    <div className="font-bold text-[#171614]">Class: Grade 8 (Secondary Level)</div>
                    <div className="text-[10px] text-[#7A756B] mt-0.5">Section A • 32 Students • Homeroom Tutor: Mrs. Ananya Sharma</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] ml-8 shadow-2xs">
                    <div className="font-bold text-[#171614]">Scholar: Aarav Sharma (Roll #12)</div>
                    <div className="text-[10px] text-[#525E4B] font-bold mt-0.5">Parent: Mr. Rahul Sharma (Linked) • 94.2% Attendance</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <div className="font-bold text-[#171614]">Institution: Riverside College of Arts & Science</div>
                    <div className="text-[10px] text-[#7A756B] mt-0.5">Faculty of Computer Science & Engineering</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] ml-4 shadow-2xs">
                    <div className="font-bold text-[#171614]">Program: Bachelor of Computer Applications (BCA)</div>
                    <div className="text-[10px] text-[#7A756B] mt-0.5">Semester 1 • 60 Students • 24 Course Credits</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] ml-8 shadow-2xs">
                    <div className="font-bold text-[#171614]">Course: CS-101 Data Structures & Algorithms</div>
                    <div className="text-[10px] text-[#856D3B] font-bold mt-0.5">HOD: Dr. K. Ramanujan • Theory & Lab Included</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] text-[11px] text-[#555047] flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#65705B] shrink-0" />
              <span>Database schema automatically structures tables to match chosen tier.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
