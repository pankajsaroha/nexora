"use client";

import React, { useState } from "react";
import { UserCheck, Shield, GraduationCap, Users, Calculator, Briefcase, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface DemoRole {
  roleCode: string;
  name: string;
  roleTitle: string;
  email: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    roleCode: "PRINCIPAL",
    name: "Dr. Arvind Menon",
    roleTitle: "Principal",
    email: "principal@nexora.demo",
  },
  {
    roleCode: "TEACHER",
    name: "Mrs. Ananya Sharma",
    roleTitle: "Teacher (Grade 8A)",
    email: "teacher@nexora.demo",
  },
  {
    roleCode: "STUDENT",
    name: "Aarav Sharma",
    roleTitle: "Student (Grade 8A)",
    email: "student@nexora.demo",
  },
  {
    roleCode: "PARENT",
    name: "Mr. Rahul Sharma",
    roleTitle: "Parent",
    email: "parent@nexora.demo",
  },
  {
    roleCode: "ACCOUNTANT",
    name: "Mrs. Neha Kapoor",
    roleTitle: "Chief Accountant",
    email: "accountant@nexora.demo",
  },
  {
    roleCode: "SUPER_ADMIN",
    name: "System Administrator",
    roleTitle: "Super Admin",
    email: "admin@nexora.demo",
  },
];

export function RoleSwitcher({ currentRoleCode }: { currentRoleCode?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  const activeRole =
    DEMO_ROLES.find((r) => r.roleCode === currentRoleCode) || DEMO_ROLES[0];

  const handleSwitch = async (email: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative">
      {/* Subtle Persona Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 rounded-lg border border-[#E8E7DF] bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-400 hover:bg-[#FAF9F5] transition-editorial"
      >
        <span className="text-[11px] text-slate-400">Viewing as:</span>
        <span className="font-semibold text-[#0F172A] truncate max-w-[140px] sm:max-w-[180px]">
          {activeRole.name}
        </span>
        <span className="text-[10px] font-mono text-slate-400 uppercase hidden md:inline">
          · {activeRole.roleTitle}
        </span>
        {isSwitching ? (
          <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {/* Switcher Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-[#E8E7DF] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
            <div className="px-3 py-2 border-b border-[#F4F3ED] flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                DEMO PERSONAS
              </span>
              <span className="text-[10px] text-slate-400">Northstar Academy</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-0.5 pt-1">
              {DEMO_ROLES.map((role) => {
                const isSelected = role.roleCode === activeRole.roleCode;
                return (
                  <button
                    key={role.email}
                    type="button"
                    onClick={() => handleSwitch(role.email)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-editorial",
                      isSelected
                        ? "bg-[#FAF9F5] border border-[#E8E7DF] font-bold text-[#0F172A]"
                        : "hover:bg-[#FAF9F5] text-slate-600 hover:text-slate-900 border border-transparent"
                    )}
                  >
                    <div>
                      <p className="font-bold text-[#0F172A]">{role.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{role.roleTitle}</p>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-[#0F172A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
