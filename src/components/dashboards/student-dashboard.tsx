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
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const firstName = student.fullName ? student.fullName.split(" ")[0] : "Student";

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary">
              {student.className} ({student.sectionName}) · Roll #{student.rollNumber || "—"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}.
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Class Teacher:{" "}
            <span className="font-semibold text-foreground">
              {student.classTeacherName || "Not assigned"}
            </span>
            . You have {todaySchedule.length} class{todaySchedule.length === 1 ? "" : "es"} scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/academics/timetable"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Timetable</span>
          </Link>
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Homework</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            01 / ATTENDANCE RATE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {attendanceSummary.percentage}%
          </div>
          <span className="text-[11px] text-success block font-bold">
            {attendanceSummary.presentCount} / {attendanceSummary.totalDays} Days Present
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            02 / PENDING HOMEWORK
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {pendingAssignments.length} Tasks
          </div>
          <span className="text-[11px] text-warning block font-bold">
            Due this academic week
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            03 / TODAY&apos;S SCHEDULE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            Room 104 • Secondary Block
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            04 / TERM 1 FEE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-success tracking-tight">
            {feeStatus.status}
          </div>
          <span className="text-[11px] text-muted-foreground block font-mono">
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
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  Today&apos;s Class Timetable
                </h2>
                <p className="text-xs text-muted-foreground">Scheduled lecture periods and subject teachers</p>
              </div>
              <Link href="/academics/timetable" className="text-[11px] font-mono font-bold text-primary hover:underline">
                Full Week →
              </Link>
            </div>

            <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No classes scheduled for today.</div>
              ) : (
                todaySchedule.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        P{slot.period}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{slot.subjectName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {slot.startTime} – {slot.endTime} · {slot.teacherName} · Room {slot.roomNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground font-medium">Lecture</span>
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
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Pending Homework
              </h2>
              <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-primary hover:underline">
                All Tasks →
              </Link>
            </div>

            <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
              {pendingAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No pending assignments in your queue.
                </div>
              ) : (
                pendingAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-1.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">{a.title}</p>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-warm/15 border border-warm/30 text-foreground">
                        {a.maxMarks} Marks
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
        </div>
      </div>
    </div>
  );
}
