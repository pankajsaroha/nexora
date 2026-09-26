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
      <div className="p-8 text-center text-[#7A756B] font-mono text-xs">
        No linked student records discovered for this authorized parent account.
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header & Sibling Switcher */}
      <div className="space-y-6 border-b border-[#E5E0D5] pb-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A756B] font-bold block mb-1">
              FAMILY PORTAL
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#171614]">
              Good morning, {parentName}.
            </h1>
            <p className="text-xs text-[#555047] mt-1">
              Stay connected with your child&apos;s daily attendance, academic submissions, and fee invoices.
            </p>
          </div>

          {/* Child Selector Tabs */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F3] border border-[#DCD7CB] rounded-2xl self-start md:self-auto shadow-2xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold px-2">
                Child:
              </span>
              {childrenList.map((child, idx) => {
                const isSelected = selectedChildIndex === idx;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isSelected
                        ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                        : "text-[#555047] hover:text-[#171614] hover:bg-white"
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
      <div className="p-6 rounded-2xl border border-[#E5E0D5] bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6ED] border border-[#D4B87C]/50 flex items-center justify-center font-bold text-lg text-[#856D3B] shadow-2xs">
            {currentChild.fullName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#171614]">{currentChild.fullName}</h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF8F3] border border-[#DCD7CB] text-[#171614]">
                {currentChild.className} - {currentChild.sectionName}
              </span>
            </div>
            <p className="text-xs text-[#7A756B] mt-0.5 font-mono">
              Admission #{currentChild.admissionNumber} · Roll #{currentChild.rollNumber || "12"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#EFECE3] pt-4 md:pt-0 md:pl-6 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#7A756B] uppercase font-bold block">Class Teacher</span>
            <p className="font-bold text-[#171614] mt-0.5">{currentChild.classTeacherName || "Mrs. Ananya Sharma"}</p>
            <p className="text-[10px] text-[#7A756B]">{currentChild.classTeacherPhone || "+91 98100 11002"}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {currentChild.attendancePct}%
          </div>
          <span className="text-[11px] text-[#525E4B] block font-bold">
            {currentChild.presentCount} / {currentChild.totalClasses} Days Present
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            02 / ACTIVE HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {currentChild.assignments.length} Tasks
          </div>
          <span className="text-[11px] text-[#856D3B] block font-bold">
            Synced with syllabus
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            03 / TERM 1 FEE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#525E4B] tracking-tight">
            {currentChild.fees.status}
          </div>
          <span className="text-[11px] text-[#7A756B] block font-mono">
            {formatCurrency(currentChild.fees.paid || 38000)} paid
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            04 / ROLL-CALL TODAY
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#525E4B] tracking-tight">
            PRESENT
          </div>
          <span className="text-[11px] text-[#7A756B] block font-medium">
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
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Homework & Coursework
              </h2>
              <p className="text-xs text-[#7A756B]">Assigned class assignments and due dates</p>
            </div>
            <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
            {currentChild.assignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A756B]">
                No pending coursework for {currentChild.fullName}.
              </div>
            ) : (
              currentChild.assignments.map((a) => (
                <div key={a.id} className="p-4 space-y-1 hover:bg-[#FAF8F3] transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#171614]">{a.title}</p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B]">
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#7A756B]">
                    <span>{a.subjectName}</span>
                    <span className="text-[#6F3D3A] font-bold">Due {formatDate(a.dueDate)}</span>
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
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Fee Ledger & 3-Part Receipts
              </h2>
              <p className="text-xs text-[#7A756B]">Printable vouchers and digital payment receipts</p>
            </div>
            <Link href="/finance/fees" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
              Ledger →
            </Link>
          </div>

          <div className="border border-[#E5E0D5] rounded-2xl bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE3]">
              <div>
                <span className="text-xs font-bold text-[#171614]">Term 1 Tuition Fee Voucher</span>
                <p className="text-[11px] font-mono text-[#7A756B]">Receipt REC-2026-0891</p>
              </div>
              <span className="text-xs font-extrabold text-[#525E4B] bg-[#F4F6F1] px-2.5 py-1 rounded-md border border-[#65705B]/30 font-mono">
                PAID IN FULL
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]">
                <span className="text-[#7A756B]">Tuition & Academic Term 1:</span>
                <span className="font-bold text-[#171614]">{formatCurrency(38000)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]">
                <span className="text-[#7A756B]">Payment Method:</span>
                <span className="font-bold text-[#525E4B]">UPI Instant Settlement</span>
              </div>
            </div>

            <Link
              href="/finance/fees"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] transition-all shadow-2xs"
            >
              <span>Download Official 3-Part Voucher</span>
              <Receipt className="w-3.5 h-3.5 text-[#856D3B]" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
