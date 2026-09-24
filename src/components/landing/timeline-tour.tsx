import React from "react";
import { Clock, CheckCircle2, UserCheck, BookOpen, Receipt, Shield, Megaphone } from "lucide-react";

export function TimelineTour() {
  const events = [
    {
      time: "08:00 AM",
      title: "Faculty Check-In & Morning Roll Call",
      description: "35 teachers complete biometric attendance. Grade 8A tutor Mrs. Ananya Sharma marks 30/32 students present in 45 seconds.",
      role: "Faculty & Homeroom",
      tag: "Attendance Engine",
      icon: UserCheck,
    },
    {
      time: "10:15 AM",
      title: "Coursework Published to Scholars & Parents",
      description: "Science department publishes 'Mechanics & Optics Problem Set'. Homework immediately syncs to student tablets and parent portals.",
      role: "Academics",
      tag: "Coursework",
      icon: BookOpen,
    },
    {
      time: "12:30 PM",
      title: "Fee Payment Recorded & Receipt Dispatched",
      description: "Accountant reconciles ₹25,000 Term 1 tuition invoice. Official 3-part printable receipt voucher is generated automatically.",
      role: "Finance",
      tag: "Bursar Ledger",
      icon: Receipt,
    },
    {
      time: "02:00 PM",
      title: "Principal Executive Health Audit",
      description: "Dr. Arvind Menon reviews campus-wide 94.2% attendance, verifies absence notifications, and approves 2 faculty leave petitions.",
      role: "Leadership",
      tag: "Executive Command",
      icon: Shield,
    },
    {
      time: "04:30 PM",
      title: "Task Resolution & Campus Circular Dispatch",
      description: "Science Lab Audit task resolved with chemical stock sheet attached. Evening robotics competition circular sent to all parents.",
      role: "Operations",
      tag: "Dispatches",
      icon: Megaphone,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-[#FAF9F5] text-[10px] font-mono uppercase tracking-widest text-slate-700">
            <span>Operational Continuity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            A day in the life of a connected institution.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From the first morning bell to evening administrative reconciliation, Nexora coordinates every stakeholder across the school day.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {events.map((ev, idx) => {
            const Icon = ev.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#E8E7DF] bg-[#FAF9F5] hover:bg-white hover:border-slate-900 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-[#E8E7DF]">
                      {ev.time}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E7DF] flex items-center justify-center text-slate-900 group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{ev.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E8E7DF] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{ev.role}</span>
                  <span className="text-slate-700 font-semibold">{ev.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
