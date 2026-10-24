"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Copy,
  Check,
  KeyRound,
  FileText,
  Briefcase,
  Building,
  CalendarCheck,
  LogOut,
  Shield,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ChangePasswordCard } from "./change-password-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TeacherSelfProfileProps {
  teacher: {
    id: string;
    employeeId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    departmentName: string;
    employmentStatus: string;
    joiningDate: Date | string;
    institutionName: string;
    classTeacherOf: Array<{
      id: string;
      name: string;
      section: string;
      roomNumber?: string | null;
    }>;
    assignments: Array<{
      id: string;
      subjectName: string;
      className: string;
      sectionName: string;
    }>;
    leaveBalances: {
      casual: number;
      sick: number;
      earned: number;
      totalAvailable: number;
    };
  };
}

export function TeacherSelfProfile({ teacher }: TeacherSelfProfileProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Top Banner Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-xs">
              {teacher.firstName[0]}
              {teacher.lastName?.[0] || ""}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {teacher.fullName}
                </h1>
                <Badge variant="outline" className="bg-success-subtle text-success border-success/30 text-xs">
                  {teacher.employmentStatus}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {teacher.designation} • {teacher.departmentName}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                {teacher.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {teacher.email}
                  </span>
                )}
                {teacher.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {teacher.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Employee ID Card */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1 self-stretch sm:self-auto text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
              Official Employee Code
            </span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-mono font-extrabold text-sm text-foreground bg-background px-2.5 py-1 rounded-lg border border-border">
                {teacher.employeeId}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(teacher.employeeId)}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy Employee Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground">{teacher.institutionName}</span>
          </div>
        </div>
      </div>

      {/* Institutional Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-bold">Verified Faculty Member Record.</span>
            <span className="text-muted-foreground ml-1">
              Your official designation, departmental assignment, and payroll classification are maintained by institution administration.
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Employment & Designation Details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Briefcase className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Employment & Academic Role</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Designation</span>
              <span className="font-bold text-foreground mt-0.5 block">{teacher.designation}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5" /> Institutional placement
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Department</span>
              <span className="font-bold text-foreground mt-0.5 block">{teacher.departmentName}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5" /> Verified unit
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Date Joined</span>
              <span className="font-mono font-bold text-foreground mt-0.5 block">
                {formatDate(teacher.joiningDate)}
              </span>
              <span className="text-[10px] text-muted-foreground">Permanent faculty</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Homeroom Mentorship</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {teacher.classTeacherOf.length > 0
                  ? teacher.classTeacherOf.map((c) => `${c.name} (${c.section})`).join(", ")
                  : "None assigned"}
              </span>
              <span className="text-[10px] text-muted-foreground">Class In-Charge</span>
            </div>
          </div>

          {/* Assigned Courses / Subjects */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
              Assigned Subjects & Sections ({teacher.assignments.length})
            </span>
            {teacher.assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No specific subject periods assigned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teacher.assignments.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs text-foreground font-mono"
                  >
                    <BookOpen className="w-3 h-3 text-primary" />
                    <span>{a.subjectName}</span>
                    <span className="text-muted-foreground">({a.className} {a.sectionName})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Leave Summary */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <CalendarCheck className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Leave Quota & Balances</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Casual Leave</span>
              <span className="text-lg font-bold font-mono text-foreground block">{teacher.leaveBalances.casual}</span>
              <span className="text-[10px] text-muted-foreground">Days Available</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Sick Leave</span>
              <span className="text-lg font-bold font-mono text-foreground block">{teacher.leaveBalances.sick}</span>
              <span className="text-[10px] text-muted-foreground">Days Available</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Earned Leave</span>
              <span className="text-lg font-bold font-mono text-foreground block">{teacher.leaveBalances.earned}</span>
              <span className="text-[10px] text-muted-foreground">Days Available</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-foreground block">Total Available Balance</span>
              <span className="text-[11px] text-muted-foreground font-mono">Current academic cycle</span>
            </div>
            <span className="text-xl font-bold font-mono text-primary">
              {teacher.leaveBalances.totalAvailable} Days
            </span>
          </div>
        </div>

        {/* Account Security & Password Management */}
        <div className="md:col-span-2">
          <ChangePasswordCard />
        </div>

        {/* Active Session & Sign Out */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Active Faculty Session</h4>
              <p className="text-[11px] text-muted-foreground">
                Signed in with Teacher account ({teacher.email}). Sign out to end your session.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } finally {
                window.location.href = "/login";
              }
            }}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-semibold gap-2 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Nexora</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
