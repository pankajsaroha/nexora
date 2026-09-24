"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Shield, Sparkles, ChevronRight, School } from "lucide-react";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "Solutions", href: "#solutions" },
    { label: "Workflows", href: "#workflows" },
    { label: "Explore Demo", href: "#demo" },
    { label: "Institutions", href: "#institutions" },
    { label: "Security", href: "#security" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "border-b border-[#E8E7DF] bg-[#FAF9F5]/95 backdrop-blur-md shadow-2xs py-3.5"
            : "border-b border-transparent bg-[#FAF9F5] py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-2xs group-hover:bg-slate-800 transition-colors">
              NX
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-none">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-medium mt-0.5 block">
                The Education OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-slate-950 transition-colors py-1 relative"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-all shadow-xs"
            >
              <span>Start your institution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-black/5"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FAF9F5] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#E8E7DF] animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E7DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                    NX
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">
                    NEXORA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-black/5 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E7DF] space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs font-semibold border border-[#E8E7DF] bg-white text-slate-800 hover:bg-slate-50"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800"
              >
                <span>Start your institution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
