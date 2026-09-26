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
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A756B] font-bold">
              STUDENT ACADEMIC DESK
            </span>
            <span className="text-[#DCD7CB]">·</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#856D3B] font-bold">
              {student.className} ({student.sectionName}) · Roll #{student.rollNumber || "12"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#171614]">
            Good morning, {student.fullName}.
          </h1>
          <p className="text-xs text-[#555047] mt-1">
            Class Teacher:{" "}
            <span className="font-semibold text-[#171614]">
              {student.classTeacherName || "Mrs. Ananya Sharma"}
            </span>
            . You have {todaySchedule.length} classes scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/academics/timetable"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] hover:border-[#B89B62] transition-all shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#7A756B]" />
            <span>Timetable</span>
          </Link>
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#FAF8F3] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4B87C]" />
            <span>My Homework</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {attendanceSummary.percentage}%
          </div>
          <span className="text-[11px] text-[#525E4B] block font-bold">
            {attendanceSummary.presentCount} / {attendanceSummary.totalDays} Days Present
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            02 / PENDING HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {pendingAssignments.length} Tasks
          </div>
          <span className="text-[11px] text-[#856D3B] block font-bold">
            Due this academic week
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            03 / TODAY&apos;S SCHEDULE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            Room 104 • Secondary Block
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            04 / TERM 1 FEE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#525E4B] tracking-tight">
            {feeStatus.status}
          </div>
          <span className="text-[11px] text-[#7A756B] block font-mono">
            Receipt: REC-2026-0891
          </span>
        </div>
      </section>

      {/* Main Grid: Today's Timetable & Pending Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Lecture Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                  Today&apos;s Class Timetable
                </h2>
                <p className="text-xs text-[#7A756B]">Scheduled lecture periods and subject teachers</p>
              </div>
              <Link href="/academics/timetable" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
                Full Week →
              </Link>
            </div>

            <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7A756B]">No classes scheduled for today.</div>
              ) : (
                todaySchedule.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-center font-mono font-bold text-xs text-[#171614] shrink-0">
                        P{slot.period}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#171614]">{slot.subjectName}</p>
                        <p className="text-[11px] text-[#7A756B] mt-0.5 font-mono">
                          {slot.startTime} – {slot.endTime} · {slot.teacherName} · Room {slot.roomNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-[#7A756B] font-medium">Lecture</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Col: Homework Queue */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Pending Homework
              </h2>
              <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
                All Tasks →
              </Link>
            </div>

            <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
              {pendingAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7A756B]">
                  No pending assignments in your queue.
                </div>
              ) : (
                pendingAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-1.5 hover:bg-[#FAF8F3] transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#171614]">{a.title}</p>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B]">
                        {a.maxMarks} Marks
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
        </div>
      </div>
    </div>
  );
}
