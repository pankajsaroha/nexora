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
    <div className="min-h-screen bg-[#F7F4ED] text-[#171614] font-sans flex flex-col justify-between selection:bg-[#171614] selection:text-[#F7F4ED]">
      {/* Top Header */}
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
                Institutional OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#171614] hover:bg-[#EAE4D7] border border-[#DCD7CB] transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3 h-3 text-[#7A756B]" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Brand & Security Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#DCD7CB] text-[11px] font-mono font-semibold text-[#856D3B] shadow-2xs">
            <KeyRound className="w-3.5 h-3.5 text-[#856D3B]" />
            <span>CREDENTIAL RECOVERY PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171614] font-serif leading-[1.15]">
            Recover access to your institution.
          </h1>

          <p className="text-xs sm:text-sm text-[#555047] leading-relaxed max-w-lg">
            Institutional credentials can be restored through encrypted, time-bound recovery links dispatched to verified institutional mailboxes.
          </p>

          <div className="pt-4 border-t border-[#E5E0D5] space-y-3">
            {[
              "Time-bound cryptographically signed recovery tokens.",
              "Automatic revocation of stale recovery sessions upon issuance.",
              "Audit log registration of all credential recovery events.",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#555047]">
                <CheckCircle2 className="w-4 h-4 text-[#525E4B] shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-8 sm:p-10 shadow-xl space-y-6">
            {!isSubmitted ? (
              <>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A756B] font-bold block mb-1">
                    PASSWORD RECOVERY
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#171614] font-serif">
                    Forgot your password?
                  </h2>
                  <p className="text-xs text-[#7A756B] mt-1">
                    Enter your institutional email and we&apos;ll send you a secure password reset link.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#FBF4F4] border border-[#ECCECE] text-xs text-[#6F3D3A] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#6F3D3A] shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171614] uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A756B]" />
                      <input
                        type="email"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2.5 pl-10 pr-3.5 text-xs text-[#171614] placeholder-[#A8A398] focus:border-[#B89B62] focus:bg-white focus:outline-none transition-colors font-mono"
                        placeholder="admin@institution.edu"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-[#1B1916] hover:bg-[#2A2722] text-[#F7F4ED] border border-[#35322C] font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4B87C]" />
                          <span>SENDING RESET LINK...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND RESET LINK</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#D4B87C]" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-xs text-[#7A756B] hover:text-[#171614] font-medium transition-colors"
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
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#525E4B] font-bold block mb-1">
                    EMAIL DISPATCHED
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#171614] font-serif">
                    Check your email
                  </h2>
                  <p className="text-xs text-[#555047] mt-1.5 leading-relaxed">
                    If an account exists for <strong className="text-[#171614] font-mono">{email}</strong>, we have sent instructions to reset your password. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E0D5] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#7A756B]">
                    <span>Didn&apos;t receive the email?</span>
                    {cooldown > 0 ? (
                      <span className="font-mono text-[11px] text-[#A8A398]">
                        Resend available in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                        className="font-bold text-[#171614] hover:text-[#856D3B] hover:underline flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend reset link</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="block w-full text-center py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#EAE4D7] text-[#171614] border border-[#DCD7CB] font-bold text-xs uppercase tracking-wider transition-all"
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
      <footer className="border-t border-[#E5E0D5] px-6 sm:px-10 py-6 text-center text-xs text-[#7A756B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} NEXORA Institutional OS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#171614] transition-colors">Platform Overview</Link>
            <Link href="/login" className="hover:text-[#171614] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
