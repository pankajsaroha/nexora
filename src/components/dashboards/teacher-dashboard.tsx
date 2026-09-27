"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  CalendarCheck,
  BookOpen,
  CheckSquare,
  Users,
  PlusCircle,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface TeacherDashboardProps {
  teacher: {
    fullName: string;
    designation: string;
    classTeacherSection?: {
      id: string;
      className: string;
      sectionName: string;
      studentsCount: number;
    } | null;
    casualLeaveBalance?: number;
    sickLeaveBalance?: number;
    earnedLeaveBalance?: number;
  };
  leaveSummary?: {
    totalEntitledDays: number;
    totalAccruedDays: number;
    totalUsedDays: number;
    totalPendingDays: number;
    totalAvailableDays: number;
    categories: Array<{
      leaveTypeId: string;
      leaveTypeName: string;
      leaveTypeCode: string;
      isPaid: boolean;
      entitledDays: number;
      accruedDays: number;
      usedDays: number;
      pendingDays: number;
      availableDays: number;
    }>;
  };
  todaySchedule: Array<{
    period: number;
    subjectName: string;
    className: string;
    startTime: string;
    endTime: string;
    roomNumber: string;
  }>;
  activeAssignments: Array<{
    id: string;
    title: string;
    subjectName: string;
    className: string;
    dueDate: Date;
    submissionsCount: number;
    totalStudents: number;
  }>;
  assignedTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate: Date | null;
    status: string;
  }>;
}

export function TeacherDashboard({
  teacher,
  leaveSummary,
  todaySchedule,
  activeAssignments,
  assignedTasks,
}: TeacherDashboardProps) {
  const pendingTasks = assignedTasks.filter((t) => t.status !== "COMPLETED");

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const firstName = teacher.fullName ? teacher.fullName.split(" ")[0] : "Faculty";

  // Derive leave numbers from single source of truth (leaveSummary)
  const totalAvailable = leaveSummary
    ? leaveSummary.totalAvailableDays
    : (teacher.casualLeaveBalance || 0) + (teacher.sickLeaveBalance || 0);

  const categoriesBreakdown = leaveSummary?.categories && leaveSummary.categories.length > 0
    ? leaveSummary.categories.slice(0, 3).map((c) => `${c.leaveTypeCode}: ${c.availableDays}`).join(" · ")
    : "No policy allocated";

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          {teacher.classTeacherSection && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">
                Class Teacher: {teacher.classTeacherSection.className} {teacher.classTeacherSection.sectionName}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}.
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            You have {todaySchedule.length} lecture period{todaySchedule.length === 1 ? "" : "s"} scheduled for today.{" "}
            {teacher.classTeacherSection
              ? `Daily roll-call for ${teacher.classTeacherSection.className} ${teacher.classTeacherSection.sectionName} is awaiting submission.`
              : "All academic records are up to date."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Post Assignment</span>
          </Link>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Take Roll Call</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            01 / TODAY&apos;S LECTURES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            Next: {todaySchedule[0]?.subjectName || "Planning Period"}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            02 / SECTION ROSTER
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {teacher.classTeacherSection?.studentsCount || 35} Students
          </div>
          <span className="text-[11px] text-muted-foreground block font-medium">
            {teacher.classTeacherSection?.className || "Grade 8"} ({teacher.classTeacherSection?.sectionName || "A"})
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            03 / PENDING TASKS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {pendingTasks.length} Active
          </div>
          <span className="text-[11px] text-warning block font-bold">
            Assigned by Principal
          </span>
        </div>

        <Link
          href="/attendance/leaves"
          className="p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all group block"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            04 / LEAVE BALANCE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {totalAvailable} Days
          </div>
          <span className="text-[11px] text-emerald-600 block font-bold truncate">
            {categoriesBreakdown}
          </span>
        </Link>
      </section>

      {/* Main Grid: Daily Lecture Schedule & Homework Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Lecture Matrix */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  Today&apos;s Lecture Schedule
                </h2>
                <p className="text-xs text-muted-foreground">Timetable slots and room allocations</p>
              </div>
              <Link
                href="/academics/timetable"
                className="text-[11px] font-bold font-mono text-primary hover:underline"
              >
                Full Matrix →
              </Link>
            </div>

            <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No lecture slots scheduled for today.
                </div>
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">
                            {slot.subjectName}
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-subtle border border-accent/30 text-accent font-bold">
                            {slot.className}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {slot.startTime} – {slot.endTime} · Room {slot.roomNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground font-medium">
                      Lecture
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Assigned Faculty Tasks */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                  Administrative & Department Tasks
                </h2>
                <p className="text-xs text-muted-foreground">Institutional action items assigned to you</p>
              </div>
              <Link href="/tasks" className="text-[11px] font-mono font-bold text-primary hover:underline">
                View All Tasks →
              </Link>
            </div>

            <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
              {assignedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No pending tasks assigned.
                </div>
              ) : (
                assignedTasks.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-destructive"
                            : "bg-warning"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Due: {t.dueDate ? formatDate(t.dueDate) : "No deadline"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Col: Coursework & Assignment Submissions */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                Coursework Submissions
              </h2>
              <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-primary hover:underline">
                All HW →
              </Link>
            </div>

            <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
              {activeAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No active assignments currently awaiting grading.
                </div>
              ) : (
                activeAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">{a.title}</p>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {a.submissionsCount} / {a.totalStudents} Turned In
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>{a.className} • {a.subjectName}</span>
                      <span>Due {formatDate(a.dueDate)}</span>
                    </div>

                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((a.submissionsCount / (a.totalStudents || 1)) * 100))}%`,
                        }}
                      />
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
