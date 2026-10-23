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
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface StudentSelfProfileProps {
  student: {
    id: string;
    admissionNumber: string;
    rollNumber?: string | null;
    loginId?: string | null;
    portalAccessStatus?: string | null;
    fullName: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    dateOfBirth: Date | string;
    gender: string;
    bloodGroup?: string | null;
    category?: string | null;
    nationality?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    admissionDate: Date | string;
    status: string;
    className: string;
    classCode: string;
    sectionName: string;
    academicYearName: string;
    classTeacherName?: string | null;
    classTeacherEmail?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    guardians: Array<{
      id: string;
      fullName: string;
      relation: string;
      phone: string;
      email?: string | null;
      isPrimary: boolean;
    }>;
    attendanceSummary: {
      total: number;
      present: number;
      percentage: number;
    };
    feeSummary: {
      total: number;
      paid: number;
      pending: number;
    };
  };
}

export function StudentSelfProfile({ student }: StudentSelfProfileProps) {
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
              {student.firstName[0]}
              {student.lastName[0]}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {student.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {student.status}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {student.className} ({student.sectionName}) • Academic Year: {student.academicYearName}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                {student.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {student.email}
                  </span>
                )}
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Student Login ID Card */}
          {student.loginId && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1 self-stretch sm:self-auto text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                Official Student Login ID
              </span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-mono font-extrabold text-sm text-foreground bg-background px-2.5 py-1 rounded-lg border border-border">
                  {student.loginId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(student.loginId!)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Login ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">Permanent authentication identity</span>
            </div>
          )}
        </div>
      </div>

      {/* Institutional Governance Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-bold">Verified Institutional Record.</span>
            <span className="text-muted-foreground ml-1">
              Academic placement, roll numbers, and admission identifiers are maintained and verified by school administration.
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Academic & Administrative Details (Locked) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <GraduationCap className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Academic Placement & Records</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Admission Number</span>
              <span className="font-mono font-bold text-foreground mt-0.5 block">{student.admissionNumber}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5" /> Institutional field
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Class Roll Number</span>
              <span className="font-mono font-bold text-foreground mt-0.5 block">{student.rollNumber || "Unassigned"}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5" /> Institutional field
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Enrolled Program</span>
              <span className="font-bold text-foreground mt-0.5 block">{student.className}</span>
              <span className="text-[10px] text-muted-foreground">Section {student.sectionName}</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Admission Date</span>
              <span className="font-bold text-foreground mt-0.5 block">{formatDate(student.admissionDate)}</span>
              <span className="text-[10px] text-muted-foreground">Regular admission</span>
            </div>

            <div className="col-span-2 p-3 rounded-lg bg-surface-subtle border border-border">
              <span className="text-muted-foreground text-[10px] font-mono uppercase block">Class Teacher</span>
              <span className="font-bold text-foreground mt-0.5 block">
                {student.classTeacherName || "Not assigned"}
              </span>
              {student.classTeacherEmail && (
                <span className="text-[11px] text-muted-foreground font-mono">{student.classTeacherEmail}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Demographics & Contact */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Demographics & Personal Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px]">Date of Birth:</span>
              <p className="font-bold text-foreground mt-0.5 font-mono">{formatDate(student.dateOfBirth)}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px]">Gender:</span>
              <p className="font-bold text-foreground mt-0.5">{student.gender}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px]">Blood Group:</span>
              <p className="font-bold text-foreground mt-0.5 font-mono">{student.bloodGroup || "—"}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px]">Category:</span>
              <p className="font-bold text-foreground mt-0.5">{student.category || "General"}</p>
            </div>

            <div className="col-span-2">
              <span className="text-muted-foreground text-[11px]">Registered Address:</span>
              <p className="font-medium text-foreground mt-0.5">
                {student.address || "No residential address provided"}
                {student.city ? `, ${student.city}` : ""}
                {student.state ? `, ${student.state}` : ""}
                {student.pincode ? ` - ${student.pincode}` : ""}
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          {(student.emergencyContactName || student.emergencyContactPhone) && (
            <div className="pt-3 border-t border-border text-xs">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block mb-1">
                Emergency Contact
              </span>
              <p className="font-bold text-foreground">
                {student.emergencyContactName} • {student.emergencyContactPhone}
              </p>
            </div>
          )}
        </div>

        {/* Linked Guardians */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Linked Family Guardians</h3>
          </div>

          {student.guardians.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground font-mono text-xs">
              No family guardians linked. Contact administration to register parents.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.guardians.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{g.fullName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                      {g.relation}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Phone: {g.phone} {g.email ? `• ${g.email}` : ""}
                  </p>
                  {g.isPrimary && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Primary Guardian
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
