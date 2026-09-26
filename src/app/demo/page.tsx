import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  UserCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  Building2,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DEMO_PERSONAS = [
  {
    role: "Principal",
    name: "Dr. Arvind Menon",
    title: "Executive Command Desk",
    desc: "Overall institutional governance, live student & faculty attendance, fee collection ledgers, and operational exceptions.",
    href: "/demo/principal/dashboard",
    icon: GraduationCap,
    badge: "Executive Leadership",
  },
  {
    role: "Teacher",
    name: "Mrs. Sunita Sharma",
    title: "Classroom & Teaching Hub",
    desc: "Grade 8A roll-call register, timetable schedules, homework publishing, and faculty leave balances.",
    href: "/demo/teacher/dashboard",
    icon: Users,
    badge: "Class Teacher (8A)",
  },
  {
    role: "Student",
    name: "Aarav Sharma",
    title: "Academic Scholar Portal",
    desc: "Daily timetable grid, homework assignments, report cards, attendance rates, and term fee clearance.",
    href: "/demo/student/dashboard",
    icon: UserCheck,
    badge: "Grade 8A",
  },
  {
    role: "Parent",
    name: "Mr. Rajesh Sharma",
    title: "Family & Guardian Portal",
    desc: "Multi-sibling academic overview (Aarav & Meera), attendance records, and direct digital fee receipts.",
    href: "/demo/parent/dashboard",
    icon: Users,
    badge: "Guardian (2 Scholars)",
  },
  {
    role: "Accountant",
    name: "Mr. Vikram Malhotra",
    title: "Financial Ledger & Payroll",
    desc: "Fee collection counter, outstanding invoice trackers, and monthly staff salary disbursements.",
    href: "/demo/accountant/dashboard",
    icon: Calculator,
    badge: "Finance & Accounts",
  },
];

export default function DemoHubPage() {
  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#171614] font-sans flex flex-col justify-between selection:bg-[#171614] selection:text-[#F7F4ED]">
      {/* Header */}
      <header className="border-b border-[#E5E0D5] bg-[#F7F4ED]/90 backdrop-blur-md px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#171614] text-[#F7F4ED] border border-[#35322C] flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:border-[#B89B62] transition-colors">
              NX
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#171614] block leading-none font-serif">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A756B] block mt-0.5">
                Interactive Sandbox Demos
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#35322C] hover:text-[#171614] px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#F7F4ED] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#35322C] transition-all shadow-2xs"
            >
              <span>Start Real Institution</span>
              <ArrowRight className="w-3 h-3 text-[#D4B87C]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#DCD7CB] text-[11px] font-mono font-semibold text-[#856D3B] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#856D3B]" />
            <span>INTERACTIVE PRODUCT SANDBOX</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171614] font-serif">
            Experience Nexora by Persona
          </h1>

          <p className="text-xs sm:text-sm text-[#555047] leading-relaxed">
            Select any simulated role below to explore live workflows in Northstar International Academy without creating an account or affecting real institutional databases.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.role}
                href={p.href}
                className="group rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#B89B62] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-center text-[#171614] group-hover:border-[#B89B62] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] bg-[#FAF8F3] px-2 py-0.5 rounded-md border border-[#E5E0D5]">
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#171614] font-serif group-hover:text-[#856D3B] transition-colors">
                      {p.role}
                    </h2>
                    <p className="text-xs font-semibold text-[#555047] mt-0.5">{p.name}</p>
                    <p className="text-xs text-[#7A756B] mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-[#EFECE3] flex items-center justify-between text-xs font-bold text-[#171614] group-hover:text-[#856D3B]">
                  <span>Launch {p.role} Sandbox</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D5] py-6 px-6 text-center text-[11px] text-[#7A756B] font-mono">
        <p>© 2026 NEXORA Operating System • Dedicated Sandbox Environment</p>
      </footer>
    </div>
  );
}
