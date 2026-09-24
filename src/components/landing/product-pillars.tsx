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
  Library,
  FileCheck2,
  Clock,
  Banknote,
  Megaphone,
  ShieldAlert,
} from "lucide-react";

export function ProductPillars() {
  const pillars = [
    {
      title: "ACADEMICS",
      tagline: "Curriculum, Timetables & Grading",
      description: "Complete scholastic governance from period-by-period class timetables to coursework deadlines and official term progress reports.",
      items: [
        { label: "Classes & Sections", icon: GraduationCap, note: "Grade tiers, room capacity, homerooms" },
        { label: "Master Timetable Grid", icon: Clock, note: "Class & faculty period allocations" },
        { label: "Assignments & Coursework", icon: BookOpen, note: "Digital homework tracking & deadlines" },
        { label: "Examinations & Grading", icon: FileCheck2, note: "Assessment blueprints & CBSE report cards" },
      ],
    },
    {
      title: "PEOPLE & ROLES",
      tagline: "Student & Faculty Directory",
      description: "Unified identity management ensuring every principal, teacher, scholar, and guardian accesses exactly what their role permits.",
      items: [
        { label: "Student Registry", icon: Users, note: "Admission #, guardian link, academic history" },
        { label: "Faculty & Staff Dossiers", icon: GraduationCap, note: "Department, designation, lecture rosters" },
        { label: "Family / Guardian Portals", icon: Users, note: "Multi-child switcher & direct messaging" },
        { label: "Role-Based Access Control", icon: ShieldAlert, note: "Strict tenant isolation & permission flags" },
      ],
    },
    {
      title: "CAMPUS OPERATIONS",
      tagline: "Daily Action & Facility Logistics",
      description: "Keep administrative machinery running smoothly with structured task boards, transport tracking, library stock, and dormitory beds.",
      items: [
        { label: "Attendance & Biometrics", icon: Clock, note: "Class roll call & staff punch-in logs" },
        { label: "Institutional Task Board", icon: CheckSquare, note: "4-column delegation & remarks thread" },
        { label: "Transport & Bus Fleet", icon: Bus, note: "GPS-enabled routes, stops & drivers" },
        { label: "Hostel & Library Catalog", icon: Building2, note: "Room occupancy & ISBN book indices" },
      ],
    },
    {
      title: "FINANCE & PAYROLL",
      tagline: "Fee Ledgers & Staff Compensation",
      description: "A commercial financial engine that manages student term fees, invoice reconciliations, and staff monthly payroll.",
      items: [
        { label: "Student Fee Ledgers", icon: Receipt, note: "Tuition, transport & hostel fee heads" },
        { label: "3-Part Official Receipts", icon: Receipt, note: "Printable audited payment vouchers" },
        { label: "Staff Monthly Payroll", icon: Banknote, note: "Gross salary, PF, HRA & printed payslips" },
        { label: "Statutory Audit Reports", icon: Receipt, note: "Exportable collections & dues ledgers" },
      ],
    },
  ];

  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-14">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-[#FAF9F5] text-[10px] font-mono uppercase tracking-widest text-slate-700">
            <span>Modular Product Breadth</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Everything your institution needs. Grouped with precision.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Instead of stitching together half a dozen fragmented tools, Nexora delivers purpose-built modules designed specifically for education leadership.
          </p>
        </div>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E8E7DF] bg-[#FAF9F5] p-6 sm:p-8 space-y-6 hover:border-slate-400 transition-colors shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    0{idx + 1} / {p.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Core Engine</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{p.tagline}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              </div>

              {/* Module Sub-Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {p.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIdx}
                      className="p-3 rounded-xl bg-white border border-[#E8E7DF] space-y-1 hover:border-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 leading-tight">
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
