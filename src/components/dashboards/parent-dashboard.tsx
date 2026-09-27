"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  BookOpen,
  Receipt,
  FileCheck2,
  Phone,
  Sparkles,
  ChevronDown,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ChildData {
  id: string;
  fullName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  classTeacherName: string;
  classTeacherPhone: string;
  attendancePct: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  assignments: Array<{
    id: string;
    title: string;
    subjectName: string;
    dueDate: Date | string;
    status: string;
  }>;
  fees: {
    total: number;
    paid: number;
    pending: number;
    status: string;
    dueDate: Date | string;
  };
}

export interface ParentDashboardProps {
  parentName: string;
  childrenList: ChildData[];
}

export function ParentDashboard({ parentName, childrenList }: ParentDashboardProps) {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const currentChild = childrenList[selectedChildIndex] || childrenList[0];

  if (!currentChild) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-xs">
        No linked student records discovered for this authorized parent account.
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const firstName = parentName ? parentName.split(" ")[0] : "Parent";

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header & Child Switcher */}
      <div className="space-y-5 border-b border-border/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {firstName}.
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Stay connected with your child&apos;s daily attendance, academic homework, and fee ledger.
            </p>
          </div>

          {/* Child Selector Tabs */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-xl self-start sm:self-auto shadow-2xs">
              <span className="text-[11px] text-muted-foreground px-2">
                Child:
              </span>
              {childrenList.map((child, idx) => {
                const isSelected = selectedChildIndex === idx;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {child.fullName} ({child.className})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Child Summary Profile Box */}
      <div className="p-6 rounded-2xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-subtle border border-primary/20 flex items-center justify-center font-bold text-lg text-primary shadow-2xs">
            {currentChild.fullName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">{currentChild.fullName}</h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                {currentChild.className} - {currentChild.sectionName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Admission #{currentChild.admissionNumber} · Roll #{currentChild.rollNumber || "12"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Class Teacher</span>
            <p className="font-bold text-foreground mt-0.5">{currentChild.classTeacherName || "Mrs. Ananya Sharma"}</p>
            <p className="text-[10px] text-muted-foreground">{currentChild.classTeacherPhone || "+91 98100 11002"}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {currentChild.attendancePct}%
          </div>
          <span className="text-[11px] text-success block font-bold">
            {currentChild.presentCount} / {currentChild.totalClasses} Days Present
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            02 / ACTIVE HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {currentChild.assignments.length} Tasks
          </div>
          <span className="text-[11px] text-warning block font-bold">
            Synced with syllabus
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            03 / TERM 1 FEE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-success tracking-tight">
            {currentChild.fees.status}
          </div>
          <span className="text-[11px] text-muted-foreground block font-mono">
            {formatCurrency(currentChild.fees.paid || 38000)} paid
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            04 / ROLL-CALL TODAY
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-success tracking-tight">
            PRESENT
          </div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            08:15 AM Roll Call
          </span>
        </div>
      </section>

      {/* Main Grid: Homework Deadlines & Official Fee Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homework Queue */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Homework & Coursework
              </h2>
              <p className="text-xs text-muted-foreground">Assigned class assignments and due dates</p>
            </div>
            <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
            {currentChild.assignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No pending coursework for {currentChild.fullName}.
              </div>
            ) : (
              currentChild.assignments.map((a) => (
                <div key={a.id} className="p-4 space-y-1 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{a.title}</p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-warm/15 border border-warm/30 text-foreground">
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{a.subjectName}</span>
                    <span className="text-destructive font-bold">Due {formatDate(a.dueDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Fee Invoicing & Receipts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Fee Ledger & 3-Part Receipts
              </h2>
              <p className="text-xs text-muted-foreground">Printable vouchers and digital payment receipts</p>
            </div>
            <Link href="/finance/fees" className="text-[11px] font-mono font-bold text-primary hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="border border-border rounded-2xl bg-card p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-foreground">Term 1 Tuition Fee Voucher</span>
                <p className="text-[11px] font-mono text-muted-foreground">Receipt REC-2026-0891</p>
              </div>
              <span className="text-xs font-extrabold text-success bg-success/15 px-2.5 py-1 rounded-md border border-success/30 font-mono">
                PAID IN FULL
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground">Tuition & Academic Term 1:</span>
                <span className="font-bold text-foreground">{formatCurrency(38000)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-success">UPI Instant Settlement</span>
              </div>
            </div>

            <Link
              href="/finance/fees"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-border bg-card text-foreground hover:bg-muted transition-all shadow-2xs"
            >
              <span>Download Official 3-Part Voucher</span>
              <Receipt className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
