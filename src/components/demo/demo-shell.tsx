"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  LogOut,
  Building2,
  Users,
  GraduationCap,
  Calculator,
  UserCheck,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export interface DemoShellProps {
  roleCode: "PRINCIPAL" | "TEACHER" | "STUDENT" | "PARENT" | "ACCOUNTANT" | "SUPER_ADMIN";
  userName: string;
  userEmail: string;
  institutionName?: string;
  children: React.ReactNode;
}

const DEMO_PERSONAS = [
  { roleCode: "PRINCIPAL", label: "Principal", name: "Dr. Arvind Menon", href: "/demo/principal/dashboard", icon: GraduationCap },
  { roleCode: "TEACHER", label: "Teacher", name: "Mrs. Sunita Sharma", href: "/demo/teacher/dashboard", icon: Users },
  { roleCode: "STUDENT", label: "Student", name: "Aarav Sharma", href: "/demo/student/dashboard", icon: UserCheck },
  { roleCode: "PARENT", label: "Parent", name: "Mr. Rajesh Sharma", href: "/demo/parent/dashboard", icon: Users },
  { roleCode: "ACCOUNTANT", label: "Accountant", name: "Mr. Vikram Malhotra", href: "/demo/accountant/dashboard", icon: Calculator },
];

export function DemoShell({
  roleCode,
  userName,
  userEmail,
  institutionName = "Northstar International Academy (Sandbox)",
  children,
}: DemoShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Top Demo Mode Banner */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground border-b border-[#2C2924] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-primary text-[10px] font-mono font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-primary" />
            DEMO MODE
          </span>
          <span className="text-xs text-[#C5C0B6] font-medium hidden sm:inline">
            Simulated Sandbox: <strong className="text-white font-semibold">{institutionName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Quick Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-[#35322C] border border-border text-xs font-semibold text-white transition-colors"
            >
              <span>Switch Demo: <strong className="text-primary">{userName}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {isPersonaMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPersonaMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-primary p-2 shadow-2xl z-50 space-y-1 text-xs text-[#C5C0B6]">
                  <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-b border-[#2C2924]">
                    Select Demo Persona
                  </div>
                  {DEMO_PERSONAS.map((p) => (
                    <Link
                      key={p.roleCode}
                      href={p.href}
                      onClick={() => setIsPersonaMenuOpen(false)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                        roleCode === p.roleCode
                          ? "bg-muted text-white font-bold border border-border"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="leading-none text-white">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{p.label}</p>
                      </div>
                      {roleCode === p.roleCode && (
                        <span className="text-[10px] font-mono text-primary font-bold">ACTIVE</span>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Call to Actions */}
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card text-foreground hover:bg-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <span>Create Real Institution</span>
            <ArrowRight className="w-3 h-3 text-primary" />
          </Link>

          <Link
            href="/"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            title="Exit Demo to Homepage"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          roleCode={roleCode}
          userName={userName}
          institutionName={institutionName}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Body */}
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar
            user={{
              id: "demo-user-id",
              fullName: userName,
              email: userEmail,
              roleCode: roleCode,
              institutionName: institutionName,
            }}
            notifications={[
              {
                id: "notif-1",
                title: "Mid-Term Grade Review",
                message: "Grade 8 and Grade 10 marksheets have been submitted for principal review.",
                type: "ACADEMIC",
                isRead: false,
                createdAt: new Date(),
              },
            ]}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
