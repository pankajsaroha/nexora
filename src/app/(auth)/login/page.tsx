"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  Calculator,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_PRESETS = [
  {
    role: "Principal",
    email: "principal@nexora.demo",
    name: "Dr. Arvind Menon",
    icon: GraduationCap,
    badge: "Executive Control",
  },
  {
    role: "Teacher",
    email: "teacher@nexora.demo",
    name: "Mrs. Sunita Sharma",
    icon: Users,
    badge: "Class 8A Incharge",
  },
  {
    role: "Accountant",
    email: "accountant@nexora.demo",
    name: "Mr. Vikram Malhotra",
    icon: Calculator,
    badge: "Fee & Payroll",
  },
  {
    role: "Student",
    email: "student@nexora.demo",
    name: "Aarav Sharma",
    icon: UserCheck,
    badge: "Grade 8A",
  },
  {
    role: "Parent",
    email: "parent@nexora.demo",
    name: "Mr. Rajesh Sharma",
    icon: Users,
    badge: "2 Children",
  },
  {
    role: "Super Admin",
    email: "admin@nexora.demo",
    name: "Administrator",
    icon: Shield,
    badge: "System Superuser",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("principal@nexora.demo");
  const [password, setPassword] = useState("demo123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Unable to sign in. Please verify your credentials.");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-600/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-600/10 border border-brand-500/20 px-3.5 py-1 text-xs font-semibold text-brand-300 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          The Operating System for Educational Institutions
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          NEXORA
        </h1>
        <p className="text-xs text-slate-400">
          Northstar International Academy • Multi-Tenant SaaS Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {errorMessage && (
            <div className="rounded-lg bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="name@institution.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Authenticate & Enter
            </Button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              One-Click Interactive Demo Personas:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => fillDemoAccount(p.email)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-brand-950/80 border-brand-500/50 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold truncate leading-none">
                        {p.role}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">
                        {p.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
