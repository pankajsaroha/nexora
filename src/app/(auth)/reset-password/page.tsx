"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function verifyRecoverySession() {
      setIsVerifyingSession(true);
      try {
        if (typeof window === "undefined") return;

        const supabase = createClient();

        // 1. Check existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setTargetEmail(sessionData.session.user.email || null);
          setAccessToken(sessionData.session.access_token || null);
          setIsVerifyingSession(false);
          return;
        }

        // 2. Parse hash fragment from Supabase recovery redirect (#access_token=...&type=recovery)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const token = hashParams.get("access_token");
          const type = hashParams.get("type");

          if (token && (type === "recovery" || type === "invite" || type === "signup")) {
            setAccessToken(token);
            const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
            if (!userErr && userRes.user?.email) {
              setTargetEmail(userRes.user.email);
              setIsVerifyingSession(false);
              return;
            }
          }
        }

        // 3. Parse PKCE code if present (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        if (code) {
          const { data: exchangeData, error: exchangeErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr && exchangeData.user?.email) {
            setTargetEmail(exchangeData.user.email);
            setAccessToken(exchangeData.session?.access_token || null);
            setIsVerifyingSession(false);
            return;
          }
        }

        // If no valid session or recovery token exists
        setIsInvalidLink(true);
      } catch (err) {
        console.error("Error verifying recovery session:", err);
        setIsInvalidLink(true);
      } finally {
        setIsVerifyingSession(false);
      }
    }

    verifyRecoverySession();
  }, []);

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-[#E5E0D5]" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-[#C45B5B]" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-[#D4A359]" };
      case 3:
        return { score: 75, label: "Good", color: "bg-[#856D3B]" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-success" };
      default:
        return { score: 0, label: "Weak", color: "bg-[#C45B5B]" };
    }
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The two passwords entered do not match. Please re-type.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      // 1. Update password in Supabase Auth directly with user recovery session
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      // 2. Synchronize database password hash securely
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
          email: targetEmail,
          accessToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to update password. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
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
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-mono font-semibold text-primary shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>CREDENTIAL ROTATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-serif leading-[1.15]">
            Set your new master password.
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Choose a strong, confidential password to protect your institutional databases, student dossiers, fee collection records, and administrative controls.
          </p>

          <div className="pt-4 border-t border-border space-y-3">
            {[
              "Encrypted with standard bcrypt key-derivation algorithms.",
              "Instantly synchronizes across Supabase Auth and database clusters.",
              "Requires clean re-authentication on all active sessions upon update.",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-border bg-white p-8 sm:p-10 shadow-xl space-y-6">
            {isVerifyingSession ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-xs font-mono text-muted-foreground">
                  Verifying recovery session...
                </p>
              </div>
            ) : isInvalidLink ? (
              /* Invalid or Expired State */
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/15 border border-[#ECCECE] text-destructive flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold block">
                    LINK EXPIRED OR INVALID
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                    Reset link expired
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    This password reset link is no longer valid or has already been used. Please request a new link.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href="/forgot-password"
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground border border-border font-bold text-xs uppercase tracking-wider shadow-sm transition-all text-center"
                  >
                    Request a New Link
                  </Link>
                  <Link
                    href="/login"
                    className="w-full py-2.5 rounded-xl bg-card hover:bg-[#EAE4D7] text-foreground border border-border font-bold text-xs uppercase tracking-wider transition-all text-center"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              /* Success State */
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F0F6EE] border border-[#C6DFC2] text-[#3B6634] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success font-bold block">
                    PASSWORD UPDATED
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                    Password updated successfully
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Your password has been changed. Please continue to sign in with your new password.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground border border-border font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>CONTINUE TO SIGN IN</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                    NEW PASSWORD
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                    Reset your password
                  </h2>
                  {targetEmail && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Account: <strong className="text-foreground">{targetEmail}</strong>
                    </p>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-destructive/15 border border-[#ECCECE] text-xs text-destructive flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={isLoading}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-xs text-foreground placeholder-[#A8A398] focus:border-primary focus:bg-white focus:outline-none transition-colors font-mono"
                        placeholder="Enter new password (min 6 characters)"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground">Strength</span>
                          <span className="font-bold text-foreground">{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E0D5] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 font-mono text-[11px]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-xs text-foreground placeholder-[#A8A398] focus:border-primary focus:bg-white focus:outline-none transition-colors font-mono"
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
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
                          <span>UPDATING PASSWORD...</span>
                        </>
                      ) : (
                        <>
                          <span>UPDATE PASSWORD</span>
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
                    ← Back to Sign In
                  </Link>
                </div>
              </>
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
