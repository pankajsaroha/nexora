"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  CalendarCheck,
  BookOpen,
  FileCheck2,
  Receipt,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface StudentDashboardProps {
  student: {
    fullName: string;
    admissionNumber: string;
    rollNumber?: string | null;
    className: string;
    sectionName: string;
    classTeacherName?: string | null;
  };
  attendanceSummary: {
    totalDays: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    percentage: number;
  };
  todaySchedule: Array<{
    period: number;
    subjectName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    roomNumber: string;
  }>;
  pendingAssignments: Array<{
    id: string;
    title: string;
    subjectName: string;
    dueDate: Date;
    maxMarks: number;
    submissionStatus?: string;
  }>;
  feeStatus: {
    total: number;
    paid: number;
    pending: number;
    status: string;
  };
}

export function StudentDashboard({
  student,
  attendanceSummary,
  todaySchedule,
  pendingAssignments,
  feeStatus,
}: StudentDashboardProps) {
  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E8E7DF] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              STUDENT ACADEMIC DESK
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">
              {student.className} ({student.sectionName}) · Roll #{student.rollNumber || "14"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Good morning, {student.fullName}.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Class Teacher:{" "}
            <span className="font-semibold text-slate-700">
              {student.classTeacherName || "Mrs. Sunita Sharma"}
            </span>
            . You have {todaySchedule.length} classes scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/academics/timetable"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 transition-editorial"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timetable</span>
          </Link>
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-editorial shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Homework</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {attendanceSummary.percentage}%
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {attendanceSummary.presentCount} of {attendanceSummary.totalDays} Days Present
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / TODAY&apos;S CLASSES
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            First: {todaySchedule[0]?.subjectName || "Assembly"} (08:30 AM)
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / ACTIVE HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {pendingAssignments.length} Due
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Due in next 7 days
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / FEE INVOICE STATUS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {feeStatus.pending === 0 ? "Fully Paid" : formatCurrency(feeStatus.pending)}
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {feeStatus.pending === 0 ? "Term 1 Cleared" : "Outstanding Dues"}
          </span>
        </div>
      </section>

      {/* Main Grid: Today's Classes & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Today's Classes */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  Today&apos;s Class Schedule
                </h2>
                <p className="text-xs text-slate-500">Class periods, teachers, and assigned rooms</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {student.className} {student.sectionName}
              </span>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No classes scheduled for today.
                </div>
              ) : (
                todaySchedule.map((s) => (
                  <div
                    key={s.period}
                    className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center font-mono font-bold text-xs text-[#0F172A] shrink-0">
                        P{s.period}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">{s.subjectName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {s.startTime} – {s.endTime} · Taught by {s.teacherName}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-600 font-semibold px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E8E7DF]">
                      {s.roomNumber}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Academic Snapshot & Continuous Evaluation */}
          <section className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">Term 1 Academic Overview</span>
              <span className="text-[11px] font-mono font-bold text-emerald-700">Grade A (86%)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your overall attendance is {attendanceSummary.percentage}%, exceeding the required 75% CBSE/ICSE benchmark. Keep up consistent participation in classroom assignments.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8E7DF] text-center">
              <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-[10px] text-slate-400 block">Present</span>
                <span className="text-xs font-bold text-[#0F172A]">{attendanceSummary.presentCount} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-[10px] text-slate-400 block">Absent</span>
                <span className="text-xs font-bold text-slate-600">{attendanceSummary.absentCount} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]">
                <span className="text-[10px] text-slate-400 block">Late</span>
                <span className="text-xs font-bold text-slate-600">{attendanceSummary.lateCount} Days</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Homework & Deadlines */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Assignments Due
              </h2>
              <Link
                href="/academics/assignments"
                className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {pendingAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <span>No homework tasks pending. Great work!</span>
                </div>
              ) : (
                pendingAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-2 hover:bg-[#FAF9F5] transition-editorial">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">
                        {a.subjectName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Due {formatDate(a.dueDate, "dd MMM")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#0F172A] leading-snug">{a.title}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8E7DF]/60">
                      <span className="text-slate-500">Max Marks: {a.maxMarks}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        {a.submissionStatus || "Submitted"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Student Identity Card */}
          <section className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-2 shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              INSTITUTIONAL RECORD
            </span>
            <p className="text-xs font-bold text-[#0F172A]">{student.fullName}</p>
            <p className="text-[11px] text-slate-500">
              Admission #{student.admissionNumber} · Roll #{student.rollNumber || "14"}
            </p>
            <p className="text-[11px] text-slate-500">
              Class {student.className} - Section {student.sectionName}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

