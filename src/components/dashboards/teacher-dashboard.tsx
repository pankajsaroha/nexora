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
  AlertCircle,
  ArrowRight,
  Send,
  Sparkles,
  CheckCircle2,
  FileText,
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
    casualLeaveBalance: number;
    sickLeaveBalance: number;
    earnedLeaveBalance: number;
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
  todaySchedule,
  activeAssignments,
  assignedTasks,
}: TeacherDashboardProps) {
  const pendingTasks = assignedTasks.filter((t) => t.status !== "COMPLETED");

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E8E7DF] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              FACULTY COMMAND DESK
            </span>
            {teacher.classTeacherSection && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">
                  Class Incharge: {teacher.classTeacherSection.className} {teacher.classTeacherSection.sectionName}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Good morning, {teacher.fullName}.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have {todaySchedule.length} lecture periods scheduled for today.{" "}
            {teacher.classTeacherSection
              ? `Daily roll-call for ${teacher.classTeacherSection.className} ${teacher.classTeacherSection.sectionName} is awaiting submission.`
              : "All academic parameters are up to date."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E8E7DF] bg-white text-slate-700 hover:bg-[#FAF9F5] hover:border-slate-400 transition-editorial"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Post Assignment</span>
          </Link>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-editorial shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Take Roll Call</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            01 / TODAY&apos;S LECTURES
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Next: {todaySchedule[0]?.subjectName || "Planning Period"}
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            02 / SECTION ROSTER
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {teacher.classTeacherSection?.studentsCount || 35} Students
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            {teacher.classTeacherSection?.className || "Grade 8"} ({teacher.classTeacherSection?.sectionName || "A"})
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            03 / PENDING TASKS
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {pendingTasks.length} Active
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Assigned by Principal
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            04 / LEAVE BALANCE
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {teacher.casualLeaveBalance + teacher.sickLeaveBalance} Days
          </div>
          <span className="text-[11px] text-slate-500 block font-medium">
            Casual: {teacher.casualLeaveBalance} · Sick: {teacher.sickLeaveBalance}
          </span>
        </div>
      </section>

      {/* Main Grid: Daily Lecture Schedule & Homework Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Lecture Matrix */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  Today&apos;s Lecture Schedule
                </h2>
                <p className="text-xs text-slate-500">Timetable slots and room allocations</p>
              </div>
              <Link
                href="/academics/timetable"
                className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
              >
                Full matrix →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No lecture slots scheduled for today.
                </div>
              ) : (
                todaySchedule.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] flex items-center justify-center font-mono font-bold text-xs text-[#0F172A] shrink-0">
                        P{slot.period}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#0F172A]">
                            {slot.subjectName}
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {slot.className}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {slot.startTime} – {slot.endTime} · {slot.roomNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 font-medium">
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  Administrative & Department Tasks
                </h2>
                <p className="text-xs text-slate-500">Institutional action items assigned to you</p>
              </div>
              <Link href="/tasks" className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]">
                View all tasks →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {assignedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No pending tasks assigned.
                </div>
              ) : (
                assignedTasks.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-[#FAF9F5] transition-editorial">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-500"
                            : t.priority === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">{t.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {t.dueDate ? `Due ${formatDate(t.dueDate)}` : "No strict deadline"} · Status: {t.status}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/tasks"
                      className="text-[11px] font-mono font-semibold text-slate-600 hover:text-[#0F172A]"
                    >
                      Update →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Active Assignments & Roster */}
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Assignments & Grading
              </h2>
              <Link
                href="/academics/assignments"
                className="text-[11px] font-semibold text-slate-600 hover:text-[#0F172A]"
              >
                Manage →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E7DF] border border-[#E8E7DF] rounded-xl bg-white overflow-hidden shadow-2xs">
              {activeAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active assignments awaiting grading.
                </div>
              ) : (
                activeAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-2 hover:bg-[#FAF9F5] transition-editorial">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">
                        {a.subjectName} · {a.className}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Due {formatDate(a.dueDate, "dd MMM")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#0F172A] leading-snug">{a.title}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8E7DF]/60">
                      <span className="text-slate-500">Submissions received</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {a.submissionsCount} / {a.totalStudents}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Quick Class Incharge Roster Overview */}
          {teacher.classTeacherSection && (
            <section className="p-5 rounded-xl border border-[#E8E7DF] bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">Class Incharge Overview</span>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  {teacher.classTeacherSection.className} ({teacher.classTeacherSection.sectionName})
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are assigned as the primary class tutor. All student remarks, biometric records, and parent inquiries for this cohort route directly to your desk.
              </p>
              <div className="pt-2 border-t border-[#E8E7DF] flex items-center justify-between">
                <Link
                  href="/attendance"
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
                >
                  <span>Open Roll-Call Matrix</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/students"
                  className="text-xs font-semibold text-slate-600 hover:text-[#0F172A]"
                >
                  View Students →
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

