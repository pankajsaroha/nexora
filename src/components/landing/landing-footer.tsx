import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-[#0F172A] text-slate-300">
      {/* Final High-Impact CTA Block */}
      <div className="border-b border-slate-800/80 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-[11px] font-mono uppercase tracking-widest text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Modern Education Operating System</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Run your institution as one connected system.
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate fragmented spreadsheets, lost WhatsApp notices, and disconnected software. Step into complete institutional clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-[#0F172A] hover:bg-slate-100 transition-all shadow-md"
            >
              <span>Start your institution</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800 transition-all"
            >
              <span>Explore the demo</span>
              <span className="text-slate-400 font-mono text-[11px]">↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white text-[#0F172A] flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                NX
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                NEXORA
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              The complete cloud operating system for schools, colleges, and educational institutions.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Campus Operating System • AY 2026–27
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Platform
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#product" className="hover:text-white transition-colors">Academics & Grading</a></li>
              <li><a href="#workflows" className="hover:text-white transition-colors">Daily Attendance</a></li>
              <li><a href="#product" className="hover:text-white transition-colors">Fee Invoicing & Receipts</a></li>
              <li><a href="#product" className="hover:text-white transition-colors">Faculty Payroll</a></li>
              <li><a href="#product" className="hover:text-white transition-colors">Task Board & Workflows</a></li>
            </ul>
          </div>

          {/* Persona Demos */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Interactive Portals
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#demo" className="hover:text-white transition-colors">Principal Command</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Teacher Workspace</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Student Ledger</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Parent Family Portal</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In Portal</Link></li>
            </ul>
          </div>

          {/* Solutions & Security */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Security & Setup
            </div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#institutions" className="hover:text-white transition-colors">K-12 Schools</a></li>
              <li><a href="#institutions" className="hover:text-white transition-colors">Colleges & Campuses</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Multi-Tenant Isolation</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Audit Trail Logs</a></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Onboarding Wizard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} NEXORA Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Enterprise Privacy</span>
            <span>Security Architecture</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
