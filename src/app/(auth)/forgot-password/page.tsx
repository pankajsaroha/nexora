"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid institutional email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error || "Unable to send password reset link. Please try again."
        );
      } else {
        setIsSubmitted(true);
        setCooldown(30); // 30-second rate limiting cooldown
      }
    } catch (err) {
      setErrorMessage(
        "Network connection error. Please verify your internet connection and try again."
      );
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
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground hover:bg-[#EAE4D7] border border-border transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3 h-3 text-muted-foreground" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Brand & Security Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-mono font-semibold text-primary shadow-2xs">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>CREDENTIAL RECOVERY PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-serif leading-[1.15]">
            Recover access to your institution.
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Institutional credentials can be restored through encrypted, time-bound recovery links dispatched to verified institutional mailboxes.
          </p>

          <div className="pt-4 border-t border-border space-y-3">
            {[
              "Time-bound cryptographically signed recovery tokens.",
              "Automatic revocation of stale recovery sessions upon issuance.",
              "Audit log registration of all credential recovery events.",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-border bg-white p-8 sm:p-10 shadow-xl space-y-6">
            {!isSubmitted ? (
              <>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                    PASSWORD RECOVERY
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                    Forgot your password?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your institutional email and we&apos;ll send you a secure password reset link.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-destructive/15 border border-[#ECCECE] text-xs text-destructive flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3.5 text-xs text-foreground placeholder-[#A8A398] focus:border-primary focus:bg-white focus:outline-none transition-colors font-mono"
                        placeholder="admin@institution.edu"
                        autoComplete="email"
                      />
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
                          <span>SENDING RESET LINK...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND RESET LINK</span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    ← Return to Sign In
                  </Link>
                </div>
              </>
            ) : (
              /* Success / Dispatched State */
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F6EE] border border-[#C6DFC2] text-[#3B6634] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success font-bold block mb-1">
                    EMAIL DISPATCHED
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                    Check your email
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    If an account exists for <strong className="text-foreground font-mono">{email}</strong>, we have sent instructions to reset your password. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Didn&apos;t receive the email?</span>
                    {cooldown > 0 ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Resend available in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                        className="font-bold text-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend reset link</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="block w-full text-center py-2.5 rounded-xl bg-card hover:bg-[#EAE4D7] text-foreground border border-border font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 sm:px-10 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} NEXORA Institutional OS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Platform Overview</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
