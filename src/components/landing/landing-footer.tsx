import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-primary text-[#C5C0B6] relative overflow-hidden">
      {/* Subtle Ambient Champagne Gold Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-[#B89B62]/10 via-[#65705B]/10 to-[#B89B62]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Final High-Impact CTA Block */}
      <div className="border-b border-border py-24 sm:py-32 relative z-10">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-muted text-[11px] font-mono uppercase tracking-widest text-[#C4AA76] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#B89B62] animate-pulse" />
            <span>Modern Education Operating System</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            Bring your entire institution together.
          </h2>

          <p className="text-base sm:text-lg text-[#C5C0B6] max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate fragmented spreadsheets, lost WhatsApp notices, and disconnected software. Step into complete institutional clarity with Nexora.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-card text-foreground hover:bg-white transition-all shadow-lg hover:translate-y-[-1px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-foreground" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-border bg-muted text-primary-foreground hover:bg-primary-hover transition-all"
            >
              <span>Explore Demo Portals</span>
              <span className="text-primary font-mono text-[11px]">↓</span>
            </a>
          </div>

          {/* Quick Stats Trust Indicator */}
          <div className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7A8068]" />
              <span>Free 14-Day Trial</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Instant 3-Min Onboarding</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7A8068]" />
              <span>Zero Credit Card Required</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border text-primary-foreground flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                NX
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                NEXORA
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-normal">
              The complete cloud operating system for schools, colleges, and modern educational institutions.
            </p>
            <div className="text-[11px] font-mono text-muted-foreground">
              Campus Operating System • AY 2026–27
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-primary-foreground text-[10px]">
              Platform
            </div>
            <ul className="space-y-2 text-muted-foreground font-normal">
              <li><a href="#features" className="hover:text-primary transition-colors">Academics & Grading</a></li>
              <li><a href="#workflows" className="hover:text-primary transition-colors">Daily Attendance</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Fee Invoicing & Receipts</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Faculty Payroll</a></li>
              <li><a href="#workflows" className="hover:text-primary transition-colors">Task Board & Workflows</a></li>
            </ul>
          </div>

          {/* Persona Demos */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-primary-foreground text-[10px]">
              Portals Demo
            </div>
            <ul className="space-y-2 text-muted-foreground font-normal">
              <li><a href="#demo" className="hover:text-primary transition-colors">Principal Command</a></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Teacher Workspace</a></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Student Ledger</a></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Parent Family Portal</a></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In Portal</Link></li>
            </ul>
          </div>

          {/* Solutions & Security */}
          <div className="space-y-3 text-xs">
            <div className="font-mono font-bold uppercase tracking-widest text-primary-foreground text-[10px]">
              Security & Setup
            </div>
            <ul className="space-y-2 text-muted-foreground font-normal">
              <li><a href="#institutions" className="hover:text-primary transition-colors">K-12 Schools</a></li>
              <li><a href="#institutions" className="hover:text-primary transition-colors">Colleges & Campuses</a></li>
              <li><a href="#security" className="hover:text-primary transition-colors">Multi-Tenant Isolation</a></li>
              <li><a href="#security" className="hover:text-primary transition-colors">Audit Trail Logs</a></li>
              <li><Link href="/onboarding" className="hover:text-primary transition-colors">Onboarding Wizard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted-foreground">
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
