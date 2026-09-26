import React from "react";
import {
  GraduationCap,
  Users,
  CheckSquare,
  Receipt,
  BookOpen,
  Calendar,
  Bus,
  Building2,
  FileCheck2,
  Clock,
  Banknote,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export function ProductPillars() {
  const pillars = [
    {
      title: "ACADEMICS & EXAMINATIONS",
      tagline: "Curriculum, Timetables & Grading",
      description: "Complete scholastic governance from 7-period daily timetables to digital homework tracking and term grade transcripts.",
      previewSnippet: {
        badge: "CBSE & State Board Ready",
        metric: "86.4% Class Average",
        subtext: "Term 1 Final Grades Published",
      },
      items: [
        { label: "Classes & Sections", icon: GraduationCap, note: "Grade tiers, room capacity, homerooms" },
        { label: "Master Timetable Grid", icon: Clock, note: "Class & faculty period allocations" },
        { label: "Assignments & Homework", icon: BookOpen, note: "Digital coursework & automated deadlines" },
        { label: "Examinations & Grading", icon: FileCheck2, note: "Assessment blueprints & digital report cards" },
      ],
    },
    {
      title: "PEOPLE & MULTI-TENANT ROLES",
      tagline: "Student, Faculty & Family Directory",
      description: "Unified identity management ensuring every principal, teacher, scholar, and guardian accesses exactly what their role permits.",
      previewSnippet: {
        badge: "Unified Identity Ledger",
        metric: "350 Scholars • 35 Faculty",
        subtext: "Sibling Linking & Guardian Portals",
      },
      items: [
        { label: "Student Registry", icon: Users, note: "Admission #, guardian link, academic history" },
        { label: "Faculty & Staff Dossiers", icon: GraduationCap, note: "Department, designation, lecture rosters" },
        { label: "Family / Guardian Portals", icon: Users, note: "Multi-child switcher & instant updates" },
        { label: "Role-Based Access Control", icon: CheckCircle2, note: "Strict multi-tenant data isolation" },
      ],
    },
    {
      title: "DAILY CAMPUS OPERATIONS",
      tagline: "Attendance, Biometrics & Tasks",
      description: "Keep administrative machinery running smoothly with 45-second roll calls, structured Kanban task boards, and facility logistics.",
      previewSnippet: {
        badge: "Live Campus Pulse",
        metric: "94.2% Present Today",
        subtext: "3 Active Delegations Resolved",
      },
      items: [
        { label: "Attendance & Roll Call", icon: Clock, note: "Class roll call & staff punch-in logs" },
        { label: "Institutional Task Board", icon: CheckSquare, note: "4-column delegation & remarks thread" },
        { label: "Transport & Bus Fleet", icon: Bus, note: "GPS routes, pickup stops & drivers" },
        { label: "Hostel & Library Catalog", icon: Building2, note: "Room occupancy & ISBN book indices" },
      ],
    },
    {
      title: "FINANCE, FEES & PAYROLL",
      tagline: "Fee Ledgers & Staff Compensation",
      description: "A commercial financial engine that manages student term fees, automated 3-part receipts, and monthly staff payroll with PF/HRA.",
      previewSnippet: {
        badge: "Automated Reconciliation",
        metric: "₹18.4L Collected (Term 1)",
        subtext: "3-Part Official Receipts Generated",
      },
      items: [
        { label: "Student Fee Ledgers", icon: Receipt, note: "Tuition, transport & hostel fee heads" },
        { label: "3-Part Official Receipts", icon: Receipt, note: "Audited printable payment vouchers" },
        { label: "Staff Monthly Payroll", icon: Banknote, note: "Gross salary, PF, HRA & payslips" },
        { label: "Statutory Audit Reports", icon: TrendingUp, note: "Exportable collections & dues ledgers" },
      ],
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#F7F4ED] border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-14">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B89B62]/40 bg-[#FAF6ED] text-[11px] font-mono uppercase tracking-widest text-[#856D3B] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B89B62]" />
            <span>Core Product Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171614] tracking-tight">
            Everything your institution needs. Grouped with precision.
          </h2>

          <p className="text-sm sm:text-base text-[#555047] leading-relaxed">
            Instead of stitching together disconnected tools, Nexora delivers purpose-built modules designed specifically for school and college operations.
          </p>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-6 hover:border-[#B89B62] transition-all shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7A756B]">
                    0{idx + 1} / {p.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B]">
                    {p.previewSnippet.badge}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#171614]">{p.tagline}</h3>
                  <p className="text-xs text-[#555047] mt-1 leading-relaxed">{p.description}</p>
                </div>

                {/* Visual Metric Snippet Card */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-[#7A756B] font-semibold">Live Operational Status</span>
                    <div className="text-sm font-extrabold text-[#171614]">{p.previewSnippet.metric}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#525E4B] bg-[#F4F6F1] px-2.5 py-1 rounded-md border border-[#65705B]/30">
                      {p.previewSnippet.subtext}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Sub-Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {p.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIdx}
                      className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-1 hover:border-[#B89B62] hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-[#171614]">
                        <Icon className="w-3.5 h-3.5 text-[#1B1916] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <p className="text-[10px] font-mono text-[#7A756B] leading-tight">
                        {item.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
