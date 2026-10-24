"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent repeated submission if already authenticating
    if (isLoading) return;

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
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Top Header - Compact Brand Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-8 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0"
            aria-label="NEXORA Home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:opacity-90 transition-opacity shrink-0">
              NX
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground block leading-none">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mt-0.5">
                Institutional OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <span className="hidden sm:inline text-muted-foreground">New institution?</span>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover border border-primary/20 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Onboard</span>
              <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Mobile-First Prioritized Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start lg:items-center">
        {/* Sign In Card: order-1 on mobile (first!), order-2 on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none min-w-0">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 lg:p-10 shadow-card">
            {/* Card Header & Brand Context */}
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>Secure Authentication</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Sign in to your institution
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your official institutional credentials to proceed.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="leading-snug break-words flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate autoComplete="off">
              {/* Institutional Email or Student Login ID */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-foreground tracking-wide mb-1.5"
                >
                  Institutional Email or Student Login ID
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  />
                  <input
                    id="login-email"
                    name="username"
                    type="text"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
                    placeholder="Email or login ID"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* Security Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-foreground tracking-wide"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Case-sensitive
                  </span>
                </div>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background py-2.5 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors font-mono"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] absolute right-0 top-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors p-0 focus:outline-none focus:ring-1 focus:ring-accent rounded-r-lg"
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
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium py-1"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Prominent Full-Width Sign In Button - Fixed Height, Stable Flex Row, Zero Layout Shift */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full h-11 min-h-[44px] max-h-11 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.99] text-primary-foreground border border-primary/20 font-semibold text-sm tracking-wide shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex flex-row items-center justify-center gap-2 select-none overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-foreground" aria-hidden="true" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="whitespace-nowrap">Sign In</span>
                  )}
                </button>
              </div>
            </form>

            {/* Institutional Access / Assistance */}
            <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs text-muted-foreground">
              <span>Need administrative assistance?</span>
              <Link
                href="/onboarding"
                className="font-semibold text-foreground hover:text-accent transition-colors py-1 inline-flex items-center gap-1"
              >
                <span>Provision New Institution</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Public Sandbox Product Link - Non-wrapping Clean Responsive Layout */}
          <div className="text-center mt-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2">
            <span>Evaluating NEXORA for your campus?</span>
            <Link
              href="/#demo"
              className="font-medium text-foreground underline decoration-accent underline-offset-4 hover:text-accent transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <span>Explore Sandbox Demos</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Brand & Security Narrative: order-2 on mobile (below form), order-1 on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-6 space-y-6 pt-6 lg:pt-0 border-t border-border/70 lg:border-t-0 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-[11px] font-mono font-semibold text-accent shadow-2xs max-w-full">
            <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate sm:whitespace-normal">ENTERPRISE IDENTITY & ACCESS CONTROL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] break-words">
            One connected system for serious institutions.
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg break-words">
            {"Sign in to access your institution's operational records, student directories, academic timetables, fee collection ledgers, and executive governance tools."}
          </p>

          <div className="pt-4 border-t border-border/70 space-y-3">
            {[
              "Strict cryptographic tenant partitioning and isolated operational schemas.",
              "Granular role-based governance across administration, faculty, and families.",
              "Tamper-evident audit logging on every administrative transaction.",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="leading-snug break-words">{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-muted-foreground hidden lg:block">
            <span>Looking for interactive preview? </span>
            <Link
              href="/#demo"
              className="font-medium text-foreground underline decoration-accent underline-offset-4 hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              <span>Explore Public Sandbox Demos</span>
              <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 sm:py-6 px-4 sm:px-6 text-center text-[11px] text-muted-foreground font-mono">
        <p suppressHydrationWarning>© 2026 NEXORA Operating System • Multi-Tenant Institutional Infrastructure</p>
      </footer>
    </div>
  );
}
