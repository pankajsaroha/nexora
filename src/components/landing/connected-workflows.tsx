"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function ConnectedWorkflows() {
  const workflows = [
    {
      id: "workflow-core",
      title: "Task Delegation to Class Roll-Call & Parent Dispatch",
      subtitle: "See how a single leadership decision cascades across all 4 stakeholders in real time",
      steps: [
        {
          role: "01 / PRINCIPAL",
          title: "Principal Assigns Task",
          desc: "Dr. Arvind Menon creates task 'Prepare Grade 8A Assessment Blueprint' assigned to Mrs. Ananya Sharma with a 3-day deadline.",
          tag: "Task Delegated",
          badgeColor: "bg-[#2E281F] text-[#D4B87C] border-[#B89B62]/40",
          cardBorder: "border-[#35322C] hover:border-[#B89B62]",
          cardGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(184,155,98,0.2)]",
          cardUI: {
            header: "Task: Assessment Blueprint",
            sub: "Assigned: Mrs. Ananya Sharma • High Priority",
            status: "Delegated",
            statusColor: "text-[#D4B87C] bg-[#2E281F] border-[#B89B62]/40",
          },
        },
        {
          role: "02 / TEACHER",
          title: "Teacher Marks Roll-Call",
          desc: "Mrs. Sharma accepts the task, publishes the polynomial problem set, and takes 45-second morning attendance for Grade 8A.",
          tag: "Roll-Call Finalized",
          badgeColor: "bg-[#232B22] text-[#A3B19B] border-[#65705B]/40",
          cardBorder: "border-[#35322C] hover:border-[#7A8068]",
          cardGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(101,112,91,0.2)]",
          cardUI: {
            header: "Grade 8A Roll-Call: 30 / 32",
            sub: "Period 1 Maths • Timetable Grid Active",
            status: "Synced",
            statusColor: "text-[#A3B19B] bg-[#232B22] border-[#65705B]/40",
          },
        },
        {
          role: "03 / STUDENT",
          title: "Student Receives Homework",
          desc: "Aarav Sharma receives homework alert on tablet, submits lab report, and sees updated 92.4% term attendance.",
          tag: "Homework Synced",
          badgeColor: "bg-[#2B2925] text-[#DCD7CB] border-[#7A756B]/40",
          cardBorder: "border-[#35322C] hover:border-[#9A958A]",
          cardGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(154,149,138,0.2)]",
          cardUI: {
            header: "Assignment: Polynomials",
            sub: "Due in 3 Days • Max Marks: 25",
            status: "Active",
            statusColor: "text-[#DCD7CB] bg-[#2B2925] border-[#7A756B]/40",
          },
        },
        {
          role: "04 / PARENT",
          title: "Parent Receives Alert & Pays",
          desc: "Mr. Rahul Sharma gets WhatsApp absence confirmation and pays the Term 1 tuition invoice via UPI with 1-click receipt.",
          tag: "Parent Dispatched",
          badgeColor: "bg-[#2C1F1F] text-[#E0A8A5] border-[#8C4A47]/40",
          cardBorder: "border-[#35322C] hover:border-[#8C4A47]",
          cardGlow: "group-hover:shadow-[0_0_30px_-5px_rgba(140,74,71,0.2)]",
          cardUI: {
            header: "WhatsApp Notice: Attendance & Fee",
            sub: "Receipt REC-0891 (₹38,000 Paid)",
            status: "Delivered",
            statusColor: "text-[#A3B19B] bg-[#232B22] border-[#65705B]/40",
          },
        },
      ],
    },
  ];

  const currentWf = workflows[0];

  return (
    <section id="workflows" className="py-20 sm:py-28 bg-[#171614] text-[#F7F4ED] border-b border-[#2A2722] relative overflow-hidden">
      {/* Subtle Warm Amber / Olive Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B89B62]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#65705B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-14 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B89B62]/30 bg-[#201E1A] text-[11px] font-mono uppercase tracking-widest text-[#C4AA76] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B89B62]" />
            <span>Everything Connected</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            See how Nexora connects the entire institution.
          </h2>

          <p className="text-sm sm:text-base text-[#C5C0B6] leading-relaxed max-w-2xl font-normal">
            When leadership delegates, teachers act, scholars learn, and parents stay informed — without data silos, paper slips, or manual reconciliations.
          </p>
        </div>

        {/* 4-Step Cascading Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {currentWf.steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border ${step.cardBorder} bg-[#201E1A] backdrop-blur-md transition-all duration-200 flex flex-col justify-between shadow-lg space-y-6 group hover:translate-y-[-3px] ${step.cardGlow}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${step.badgeColor}`}>
                    {step.role}
                  </span>
                  <span className="text-[11px] font-mono text-[#7A756B] font-bold">
                    STEP 0{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#FAF8F3] group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#A6A095] mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Mini UI Card Representation */}
              <div className="p-3.5 rounded-2xl bg-[#171614] border border-[#2F2C26] space-y-1.5 shadow-inner font-mono text-[11px]">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#2A2722]">
                  <span className="font-bold text-[#FAF8F3] truncate">{step.cardUI.header}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${step.cardUI.statusColor}`}>
                    {step.cardUI.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#8C877D] leading-snug">
                  {step.cardUI.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
