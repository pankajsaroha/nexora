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
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A756B] font-bold">
              FACULTY WORKSPACE
            </span>
            {teacher.classTeacherSection && (
              <>
                <span className="text-[#DCD7CB]">·</span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#856D3B] font-bold">
                  Class Incharge: {teacher.classTeacherSection.className} {teacher.classTeacherSection.sectionName}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#171614]">
            Good morning, {teacher.fullName}.
          </h1>
          <p className="text-xs text-[#555047] mt-1">
            You have {todaySchedule.length} lecture periods scheduled for today.{" "}
            {teacher.classTeacherSection
              ? `Daily roll-call for ${teacher.classTeacherSection.className} ${teacher.classTeacherSection.sectionName} is awaiting submission.`
              : "All academic parameters are up to date."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/academics/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] hover:border-[#B89B62] transition-all shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#7A756B]" />
            <span>Post Assignment</span>
          </Link>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#FAF8F3] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#D4B87C]" />
            <span>Take Roll Call</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Strip (Hairline Blocks) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            01 / TODAY&apos;S LECTURES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {todaySchedule.length} Periods
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            Next: {todaySchedule[0]?.subjectName || "Planning Period"}
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            02 / SECTION ROSTER
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {teacher.classTeacherSection?.studentsCount || 35} Students
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            {teacher.classTeacherSection?.className || "Grade 8"} ({teacher.classTeacherSection?.sectionName || "A"})
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            03 / PENDING TASKS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {pendingTasks.length} Active
          </div>
          <span className="text-[11px] text-[#856D3B] block font-bold">
            Assigned by Principal
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            04 / LEAVE BALANCE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">
            {teacher.casualLeaveBalance + teacher.sickLeaveBalance} Days
          </div>
          <span className="text-[11px] text-[#525E4B] block font-bold">
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
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                  Today&apos;s Lecture Schedule
                </h2>
                <p className="text-xs text-[#7A756B]">Timetable slots and room allocations</p>
              </div>
              <Link
                href="/academics/timetable"
                className="text-[11px] font-bold font-mono text-[#856D3B] hover:text-[#171614]"
              >
                Full Matrix →
              </Link>
            </div>

            <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7A756B]">
                  No lecture slots scheduled for today.
                </div>
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#171614]">
                            {slot.subjectName}
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF6ED] border border-[#D4B87C]/40 text-[#856D3B] font-bold">
                            {slot.className}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A756B] mt-0.5 font-mono">
                          {slot.startTime} – {slot.endTime} · Room {slot.roomNumber}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-[#7A756B] font-medium">
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
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                  Administrative & Department Tasks
                </h2>
                <p className="text-xs text-[#7A756B]">Institutional action items assigned to you</p>
              </div>
              <Link href="/tasks" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
                View All Tasks →
              </Link>
            </div>

            <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
              {assignedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7A756B]">
                  No pending tasks assigned.
                </div>
              ) : (
                assignedTasks.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-[#6F3D3A]"
                            : "bg-[#B89B62]"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-[#171614]">{t.title}</p>
                        <p className="text-[11px] text-[#7A756B] font-mono">
                          Due: {t.dueDate ? formatDate(t.dueDate) : "No deadline"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614]">
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
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#171614]">
                Coursework Submissions
              </h2>
              <Link href="/academics/assignments" className="text-[11px] font-mono font-bold text-[#856D3B] hover:text-[#171614]">
                All HW →
              </Link>
            </div>

            <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
              {activeAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7A756B]">
                  No active assignments currently awaiting grading.
                </div>
              ) : (
                activeAssignments.map((a) => (
                  <div key={a.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#171614]">{a.title}</p>
                      <span className="text-[10px] font-mono text-[#856D3B] font-bold">
                        {a.submissionsCount} / {a.totalStudents} Turned In
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#7A756B]">
                      <span>{a.className} • {a.subjectName}</span>
                      <span>Due {formatDate(a.dueDate)}</span>
                    </div>

                    <div className="w-full bg-[#FAF8F3] h-1.5 rounded-full overflow-hidden border border-[#E5E0D5]">
                      <div
                        className="bg-[#65705B] h-full rounded-full"
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
