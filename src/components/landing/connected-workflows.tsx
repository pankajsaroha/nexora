"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Send,
  Receipt,
  Users,
  CalendarCheck,
  CheckSquare,
  Sparkles,
  Smartphone,
  Shield,
  Layers,
} from "lucide-react";

export function ConnectedWorkflows() {
  const [activeWorkflow, setActiveWorkflow] = useState<number>(0);

  const workflows = [
    {
      id: "attendance",
      title: "Daily Attendance & Parent Dispatch",
      subtitle: "Instant synchronization from teacher roll-call to guardian phones",
      steps: [
        {
          role: "Teacher (Grade 8A)",
          action: "Marks Aarav absent on morning register (08:15 AM)",
          tag: "Roll-Call",
        },
        {
          role: "Nexora Core Engine",
          action: "Instantly updates attendance ledger to 93.7% & logs audit record",
          tag: "Ledger Update",
        },
        {
          role: "Parent (Rahul Sharma)",
          action: "Receives automated WhatsApp & App absence alert with reason request",
          tag: "Parent Alert",
        },
        {
          role: "Principal Dashboard",
          action: "Campus overview updates in real-time without paper tallying",
          tag: "Executive Audit",
        },
      ],
      previewSnippet: {
        title: "Dispatched WhatsApp Notice",
        recipient: "Mr. Rahul Sharma (+91 98110 00111)",
        content: "Dear Parent, Aarav Sharma (Grade 8A, Roll #12) has been recorded ABSENT for Morning Roll-Call on 23 Sep 2026. Please submit medical/leave reason via the Nexora Parent Portal.",
        status: "Delivered & Read",
      },
    },
    {
      id: "fees",
      title: "Term Fee Invoicing & Ledger Realization",
      subtitle: "From fee structure generation to official 3-part printable receipts",
      steps: [
        {
          role: "Accountant (Bursar)",
          action: "Publishes Term 1 Tuition & Transport Invoices (₹25,000)",
          tag: "Invoice Created",
        },
        {
          role: "Parent Portal",
          action: "Parent views itemized invoice breakdown & completes payment",
          tag: "Payment Settled",
        },
        {
          role: "Finance Ledger",
          action: "Real-time balance drops from ₹25,000 to ₹0.00; Outstanding decreases",
          tag: "Balance Zeroed",
        },
        {
          role: "Official Receipt",
          action: "3-Part Institutional Receipt (Original, Parent, Accounts) auto-generated",
          tag: "Printable Voucher",
        },
      ],
      previewSnippet: {
        title: "Official Receipt #REC-2026-0842",
        recipient: "Payer: Mr. Rahul Sharma (Student: Aarav Sharma - 8A)",
        content: "Amount Paid: ₹25,000 | Mode: Online UPI | Head: Term 1 Tuition + Lab + Transport | Balance Due: ₹0.00",
        status: "Settled & Reconciled",
      },
    },
    {
      id: "tasks",
      title: "Campus Task Delegation & Operational Accountability",
      subtitle: "Structured delegation without lost WhatsApp messages or verbal follow-ups",
      steps: [
        {
          role: "Principal (Dr. Menon)",
          action: "Creates 'Science Lab Audit' task with priority HIGH & due date 30 Sep",
          tag: "Task Created",
        },
        {
          role: "Faculty Incharge",
          action: "Mrs. Ananya Sharma receives task in teaching workspace & updates status",
          tag: "In Progress",
        },
        {
          role: "Collaborative Thread",
          action: "Tutor posts comment: 'Glassware audited. Chemical ledger attached.'",
          tag: "Remarks Thread",
        },
        {
          role: "Task Board",
          action: "Card automatically moves to Completed column; Principal notified",
          tag: "Resolved",
        },
      ],
      previewSnippet: {
        title: "Workflow Audit Log #TSK-409",
        recipient: "Assigned To: Mrs. Ananya Sharma | Approver: Dr. Arvind Menon",
        content: "Status: COMPLETED | Activity: 3 internal remarks, 1 chemical inventory sheet verified.",
        status: "Verified by Principal",
      },
    },
  ];

  const current = workflows[activeWorkflow];

  return (
    <section id="workflows" className="py-20 sm:py-28 bg-[#FAF9F5] border-b border-[#E8E7DF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#E8E7DF] bg-white text-[10px] font-mono uppercase tracking-widest text-slate-700">
            <span>Interconnected Institutional Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            How one action seamlessly ripples through your entire campus.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            In Nexora, data is never trapped in silos. When a teacher takes roll-call or an accountant logs a fee receipt, every relevant profile and dashboard updates instantaneously.
          </p>
        </div>

        {/* Workflow Switcher Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-[#E8E7DF] pb-4">
          {workflows.map((wf, idx) => (
            <button
              key={wf.id}
              onClick={() => setActiveWorkflow(idx)}
              className={`px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all ${
                activeWorkflow === idx
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-[#E8E7DF] hover:bg-slate-50"
              }`}
            >
              0{idx + 1}. {wf.title.split("&")[0].trim()}
            </button>
          ))}
        </div>

        {/* Active Workflow Visualization Box */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Step Sequence Column */}
          <div className="lg:col-span-7 rounded-2xl border border-[#E8E7DF] bg-white p-6 sm:p-8 shadow-2xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  {current.title}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Automated Relay
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-2">{current.subtitle}</p>
            </div>

            {/* Step Ladder */}
            <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E7DF]">
              {current.steps.map((step, sIdx) => (
                <div key={sIdx} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[9px] font-mono font-bold">
                    {sIdx + 1}
                  </div>
                  <div className="flex-1 p-3 rounded-xl border border-[#E8E7DF] bg-[#FAF9F5] hover:bg-white transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{step.role}</span>
                      <span className="font-mono text-[10px] uppercase text-slate-500 bg-white px-1.5 py-0.5 rounded border border-[#E8E7DF]">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E7DF] flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">Audit: Cryptographically Logged in Audit Trail</span>
              <span className="font-mono font-bold text-slate-900">100% Real-Time Sync</span>
            </div>
          </div>

          {/* Real Preview Snippet Column */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E8E7DF] bg-white p-6 sm:p-8 shadow-2xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  Live Dispatch Artifact
                </span>
                <span className="text-[10px] font-mono text-slate-400">Payload Preview</span>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E7DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    {current.previewSnippet.title}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                    {current.previewSnippet.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Target: {current.previewSnippet.recipient}
                </div>
                <p className="text-xs text-slate-700 font-mono leading-relaxed bg-white p-3 rounded-lg border border-[#E8E7DF]">
                  &quot;{current.previewSnippet.content}&quot;
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero manual copy-pasting or paper transit</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-normal">
                Every department operates from the exact same institutional database without redundant spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
