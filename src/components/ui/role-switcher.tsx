"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
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
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-primary hover:bg-muted transition-all shadow-2xs"
      >
        <span className="text-[11px] text-muted-foreground">Viewing as:</span>
        <span className="font-bold text-foreground truncate max-w-[140px] sm:max-w-[180px]">
          {activeRole.name}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase hidden md:inline">
          · {activeRole.roleTitle}
        </span>
        {isSwitching ? (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Switcher Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                DEMO PERSONAS
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Northstar Academy</span>
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
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all",
                      isSelected
                        ? "bg-primary-subtle border border-primary/30 font-bold text-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <div>
                      <p className="font-bold text-foreground">{role.name}</p>
                      <p className="text-[11px] text-muted-foreground font-normal">{role.roleTitle}</p>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-primary" />}
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
