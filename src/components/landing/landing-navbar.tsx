"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, ChevronRight } from "lucide-react";

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
    { label: "Product", href: "#features" },
    { label: "Solutions", href: "#solutions" },
    { label: "Workflows", href: "#workflows" },
    { label: "Portals Demo", href: "#demo" },
    { label: "Institutions", href: "#institutions" },
    { label: "Security", href: "#security" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "border-b border-[#E5E0D5] bg-[#F7F4ED]/95 backdrop-blur-md shadow-xs py-3.5"
            : "border-b border-transparent bg-[#F7F4ED] py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#171614] border border-[#35322C] text-[#F7F4ED] flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:border-[#B89B62] transition-colors">
              NX
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#171614] block leading-none font-serif">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A756B] font-medium mt-0.5 block">
                Institutional OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-[#5C5850]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[#171614] transition-colors py-1 relative tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#35322C] hover:text-[#171614] px-3.5 py-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#F7F4ED] border border-[#35322C] hover:bg-[#2A2722] hover:border-[#B89B62] transition-all shadow-xs"
            >
              <span>Start your institution</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C4AA76]" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#171614] hover:bg-black/5"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-sm bg-[#F7F4ED] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#E5E0D5] animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E0D5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#171614] text-[#F7F4ED] flex items-center justify-center font-bold text-xs border border-[#35322C]">
                    NX
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-[#171614] font-serif">
                    NEXORA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#5C5850] hover:bg-black/5"
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
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-[#171614] hover:bg-black/5 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#A8A398]" />
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E0D5] space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold border border-[#E5E0D5] bg-white text-[#171614] hover:bg-[#FAF8F3]"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#F7F4ED] hover:bg-[#2A2722] border border-[#35322C]"
              >
                <span>Start your institution</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C4AA76]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


