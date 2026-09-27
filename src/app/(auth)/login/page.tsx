"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your institutional email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error || "Unable to sign in. Please verify your email and password."
        );
      } else {
        // Force full window navigation to refresh server components and session cookies
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setErrorMessage("Network connection error. Please verify your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground border border-border flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:border-primary transition-colors">
              NX
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground block leading-none font-serif">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mt-0.5">
                Institutional OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-muted-foreground">New school or college?</span>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary-hover hover:border-primary border border-border transition-all shadow-2xs"
            >
              <span>Onboard Institution</span>
              <ArrowRight className="w-3 h-3 text-primary" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Two Columns on Desktop */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Brand & Security Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-mono font-semibold text-primary shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>ENTERPRISE IDENTITY & ACCESS CONTROL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-serif leading-[1.15]">
            One connected system for serious institutions.
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Sign in to access your institution&apos;s operational dossiers, student directories, academic timetables, fee collection ledgers, and executive governance tools.
          </p>

          <div className="pt-4 border-t border-border space-y-3">
            {[
              "Strict cryptographic tenant partitioning and isolated operational schemas.",
              "Granular role-based governance across administration, faculty, and families.",
              "Tamper-evident audit logging on every administrative transaction.",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Looking for interactive preview?{" "}
            <Link
              href="/#demo"
              className="font-bold text-foreground underline decoration-[#B89B62] underline-offset-4 hover:text-primary transition-colors"
            >
              Explore Public Sandbox Demos →
            </Link>
          </div>
        </div>

        {/* Right Column: Luxury Sign In Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-border bg-white p-8 sm:p-10 shadow-xl space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                SECURE AUTHENTICATION
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                Sign in to your institution
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your official institutional credentials to proceed.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-destructive/15 border border-[#ECCECE] text-xs text-destructive flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3.5 text-xs text-foreground placeholder-[#A8A398] focus:border-primary focus:bg-white focus:outline-none transition-colors"
                    placeholder="name@institution.edu"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-mono text-[11px]">
                    Security Password
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Case-sensitive
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-xs text-foreground placeholder-[#A8A398] focus:border-primary focus:bg-white focus:outline-none transition-colors font-mono"
                    placeholder="Enter institutional password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground border border-border font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN →</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Need administrative assistance?</span>
              <Link
                href="/onboarding"
                className="font-bold text-foreground hover:text-primary transition-colors"
              >
                Provision New Institution →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center text-[11px] text-muted-foreground font-mono">
        <p>© 2026 NEXORA Operating System • Multi-Tenant Institutional Infrastructure</p>
      </footer>
    </div>
  );
}
