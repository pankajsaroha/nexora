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
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No linked student records discovered for this authorized parent account.
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header & Sibling Switcher */}
      <div className="space-y-6 border-b border-[#E8E7DF] pb-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
              AUTHORIZED FAMILY PORTAL
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Good morning, {parentName}.
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Stay connected with your child&apos;s daily attendance, academic submissions, and fee invoices.
            </p>
          </div>

          {/* Child Selector Tabs */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] border border-[#E8E7DF] rounded-xl self-start md:self-auto">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2">
                Child:
              </span>
              {childrenList.map((child, idx) => {
                const isSelected = selectedChildIndex === idx;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#0F172A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0F172A] hover:bg-white"
                    }`}
                  >
                    {child.fullName} ({child.className})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Child Sub-Dossier */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E7DF]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Viewing Record:</span>
            <span className="font-bold text-[#0F172A]">{currentChild.fullName}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">
              {currentChild.className} ({currentChild.sectionName}) · Roll #{currentChild.rollNumber} · Adm #{currentChild.admissionNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">Class Teacher:</span>
            <span className="font-semibold text-[#0F172A]">{currentChild.classTeacherName}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-500">{currentChild.classTeacherPhone}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Strip for Selected Child (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {currentChild.attendancePct}%
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {currentChild.presentCount} of {currentChild.totalClasses} Days Attended
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / ACTIVE HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {currentChild.assignments.length} Tasks
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Assigned for this week
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / FEE BALANCE
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {currentChild.fees.pending === 0 ? "₹0 Due" : formatCurrency(currentChild.fees.pending)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {currentChild.fees.pending === 0 ? "Term 1 Settled" : `Due ${formatDate(currentChild.fees.dueDate)}`}
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / ACADEMIC PROGRESS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Grade A
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Mid-Term Assessment
          </span>
        </div>
      </section>

      {/* Main Grid: Homework & Fee Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homework & Assignments */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                {currentChild.fullName}&apos;s Homework & Tasks
              </h2>
              <p className="text-xs text-slate-500">Upcoming submissions and classroom work</p>
            </div>
            <Link
              href="/academics/assignments"
              className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
            >
              Details →
            </Link>
          </div>

          <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
            {currentChild.assignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span>No active assignments pending for {currentChild.fullName}.</span>
              </div>
            ) : (
              currentChild.assignments.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">
                        {a.subjectName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Due {formatDate(a.dueDate, "dd MMM")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">{a.title}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Fee Payment & Invoices */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Fee Status & Invoices
              </h2>
              <p className="text-xs text-slate-500">Institutional tuition and transport ledger</p>
            </div>
            <Link
              href="/finance/fees"
              className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
            >
              Invoices →
            </Link>
          </div>

          <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-4 shadow-2xs">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-slate-600">Term 1 Tuition & Transport:</span>
                <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(currentChild.fees.total)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-slate-600">Disbursed / Paid Amount:</span>
                <span className="font-mono font-bold text-emerald-700">{formatCurrency(currentChild.fees.paid)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-slate-700 font-semibold">Net Outstanding Balance:</span>
                <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(currentChild.fees.pending)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E7DF] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Official receipts generated digitally with QR verification.
              </span>
              <Link
                href="/finance/fees"
                className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <span>View Receipts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

