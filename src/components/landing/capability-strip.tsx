import React from "react";
import { Users, GraduationCap, CalendarCheck, Receipt, Megaphone, CheckSquare } from "lucide-react";

export function CapabilityStrip() {
  const capabilities = [
    {
      label: "People & Directory",
      detail: "Scholars, Faculty & Guardians",
      icon: Users,
    },
    {
      label: "Academics & Grading",
      detail: "Timetables, Coursework & CBSE",
      icon: GraduationCap,
    },
    {
      label: "Attendance Matrix",
      detail: "Live Roll Call & Biometrics",
      icon: CalendarCheck,
    },
    {
      label: "Institutional Finance",
      detail: "Term Invoices & Staff Payroll",
      icon: Receipt,
    },
    {
      label: "Parent Communication",
      detail: "WhatsApp Alerts & Circulars",
      icon: Megaphone,
    },
    {
      label: "Campus Operations",
      detail: "Tasks, Bus Fleet, Hostel & Library",
      icon: CheckSquare,
    },
  ];

  return (
    <div className="border-y border-[#E8E7DF] bg-white py-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            One Connected Architecture Across All Departments
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-[#E8E7DF] bg-[#FAF9F5] hover:bg-white hover:border-slate-400 transition-all text-left space-y-1.5 shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E7DF] flex items-center justify-center text-slate-900 group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 leading-tight">{c.label}</div>
                  <div className="text-[10px] font-mono text-slate-500 leading-tight mt-0.5">{c.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
