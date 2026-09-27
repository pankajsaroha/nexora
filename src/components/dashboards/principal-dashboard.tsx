"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  Megaphone,
  Clock,
  Receipt,
  AlertCircle,
  CreditCard,
  Calendar,
  Plus,
  ChevronDown,
  Sparkles,
  School,
  GraduationCap,
  UploadCloud,
  FileCheck2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuickTaskModal } from "@/components/tasks/quick-task-modal";
import { QuickBroadcastModal } from "@/components/announcements/quick-broadcast-modal";
import { QuickPaymentModal } from "@/components/fees/quick-payment-modal";
import { StudentAdmissionDialog, ProgramOption, AcademicYearOption, CustomFieldOption } from "@/components/students/student-admission-dialog";

export interface PrincipalDashboardProps {
  userName?: string;
  institutionName?: string;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    attendanceTodayPct: number;
    attendancePresentCount?: number;
    attendanceAbsentCount?: number;
    attendanceLeaveCount?: number;
    isAttendanceRecordedToday?: boolean;
    totalFeeCollected: number;
    totalFeePending: number;
    pendingTasksCount: number;
    pendingLeaveRequests: number;
  };
  attentionItems: Array<{
    id: string;
    type: "ATTENDANCE" | "FEE" | "LEAVE" | "TASK" | "SETUP";
    title: string;
    subtitle: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    linkUrl: string;
  }>;
  todaySchedule: Array<{
    id: string;
    period: number;
    subjectName: string;
    className: string;
    startTime: string;
    endTime: string;
    roomNumber?: string;
  }>;
  priorityTasks: Array<{
    id: string;
    title: string;
    dueDate?: Date | null;
    priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
    assigneeName?: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    subtitle: string;
    timestamp: Date;
    type: "PAYMENT" | "ANNOUNCEMENT" | "TASK" | "ACADEMIC";
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    targetAudience: string;
    publishedAt: Date;
    authorName: string;
  }>;
  programs?: ProgramOption[];
  academicYears?: AcademicYearOption[];
  customFields?: CustomFieldOption[];
  setupState?: {
    hasClasses: boolean;
    hasStudents: boolean;
    hasTeachers: boolean;
    hasTimetable: boolean;
    hasAcademicYear: boolean;
  };
}

function formatTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDate(date);
}

export function PrincipalDashboard({
  userName = "Administrator",
  institutionName = "Educational Institution",
  stats,
  attentionItems = [],
  todaySchedule = [],
  priorityTasks = [],
  recentActivity = [],
  recentAnnouncements = [],
  programs = [],
  academicYears = [],
  customFields = [],
  setupState = {
    hasClasses: true,
    hasStudents: stats.totalStudents > 0,
    hasTeachers: stats.totalTeachers > 0,
    hasTimetable: todaySchedule.length > 0,
    hasAcademicYear: true,
  },
}: PrincipalDashboardProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  // Current time greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const firstName = formatTitleCase(userName.split(" ")[0] || "Administrator");
  const fullNameFormatted = formatTitleCase(userName);

  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const dateFormatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const presentPct = stats.attendanceTodayPct;
  const absentPct = stats.totalStudents > 0 ? Math.max(0, +(100 - presentPct).toFixed(1)) : 0;
  const isAttendanceRecorded = stats.isAttendanceRecordedToday ?? (stats.totalStudents > 0 && presentPct > 0);

  // Calculate setup steps completed
  const setupSteps = [
    { label: "Institution Profile", done: true, link: "/settings" },
    { label: "Academic Session", done: setupState.hasAcademicYear, link: "/academics/classes" },
    { label: "Programs & Classes", done: setupState.hasClasses, link: "/academics/classes" },
    { label: "Student Admissions", done: setupState.hasStudents, link: "/students" },
    { label: "Faculty Directory", done: setupState.hasTeachers, link: "/teachers" },
    { label: "Master Timetable", done: setupState.hasTimetable, link: "/academics/timetable" },
  ];
  const completedSetupCount = setupSteps.filter((s) => s.done).length;
  const setupProgressPct = Math.round((completedSetupCount / setupSteps.length) * 100);

  const isBrandNewInstitution = stats.totalStudents === 0 && !setupState.hasStudents;

  return (
    <div className="space-y-7 max-w-6xl mx-auto font-sans selection:bg-primary selection:text-primary-foreground">
      {/* 1. GREETING & DATE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}.
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Here&apos;s what needs your attention today.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold text-foreground">{dayOfWeek}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{dateFormatted}</p>
        </div>
      </div>

      {/* 2. TOP KPI METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Students */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Total Students
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {stats.totalStudents.toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground block truncate">
            {stats.totalStudents > 0
              ? "Enrolled scholars across active cohorts"
              : "No students enrolled yet"}
          </span>
        </div>

        {/* Metric 2: Today's Attendance */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Today&apos;s Attendance
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {isAttendanceRecorded ? `${presentPct}%` : "—"}
          </div>
          <span
            className={`text-[11px] block truncate ${
              isAttendanceRecorded ? "text-success font-medium" : "text-muted-foreground"
            }`}
          >
            {isAttendanceRecorded
              ? stats.attendancePresentCount !== undefined
                ? `${stats.attendancePresentCount} Present · ${stats.attendanceAbsentCount || 0} Absent`
                : "Daily register recorded"
              : "No attendance recorded yet"}
          </span>
        </div>

        {/* Metric 3: Pending Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Pending Tasks
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {stats.pendingTasksCount}
          </div>
          <span
            className={`text-[11px] block truncate ${
              stats.pendingTasksCount > 0 ? "text-warning font-medium" : "text-muted-foreground"
            }`}
          >
            {stats.pendingTasksCount > 0
              ? "Requiring administrative action"
              : "All workflows up to date"}
          </span>
        </div>

        {/* Metric 4: Fee Collection */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-1 shadow-2xs hover:border-primary/40 transition-all">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Fee Collection
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(stats.totalFeeCollected)}
          </div>
          <span
            className={`text-[11px] block truncate ${
              stats.totalFeePending > 0 ? "text-muted-foreground" : "text-success font-medium"
            }`}
          >
            {stats.totalFeePending > 0
              ? `${formatCurrency(stats.totalFeePending)} pending reconciliation`
              : "All collections up to date"}
          </span>
        </div>
      </section>

      {/* 3. QUICK ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card/60 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdmissionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-primary" />
            <span>Assign Task</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Broadcast</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {isMoreActionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreActionsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    <span>Record Payment</span>
                  </button>

                  <Link
                    href="/attendance"
                    onClick={() => setIsMoreActionsOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-foreground hover:bg-muted transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Mark Attendance</span>
                  </Link>

                  <Link
                    href="/teachers"
                    onClick={() => setIsMoreActionsOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-foreground hover:bg-muted transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Add Faculty</span>
                  </Link>

                  <Link
                    href="/academics/timetable"
                    onClick={() => setIsMoreActionsOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-foreground hover:bg-muted transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Configure Timetable</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. NEW INSTITUTION SETUP ONBOARDING CARD (shown when institution has zero students) */}
      {isBrandNewInstitution && (
        <section className="p-6 rounded-2xl border border-primary/30 bg-primary-subtle/40 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Welcome to Nexora</h2>
                <p className="text-xs text-muted-foreground">
                  Your institution workspace is ready. Complete these foundational steps to initialize your campus.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-mono font-semibold text-primary">
                {setupProgressPct}% Completed
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${setupProgressPct}%` }}
            />
          </div>

          {/* Steps checklist grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {setupSteps.map((step, idx) => (
              <Link
                key={idx}
                href={step.link}
                className="p-3 rounded-xl border border-border bg-card/80 hover:bg-card flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      step.done
                        ? "bg-success text-success-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {step.done ? "✓" : idx + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {step.label}
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/70">
            <button
              type="button"
              onClick={() => setIsAdmissionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll First Student</span>
            </button>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Add Faculty</span>
            </Link>
            <Link
              href="/import"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Import via CSV</span>
            </Link>
          </div>
        </section>
      )}

      {/* 5. NEEDS YOUR ATTENTION SECTION (Only shown when actionable items exist) */}
      {attentionItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                Needs Your Attention
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {attentionItems.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden shadow-2xs">
            {attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.linkUrl}
                className="p-4 flex items-center justify-between hover:bg-muted/40 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 mr-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      item.severity === "HIGH"
                        ? "bg-destructive"
                        : item.severity === "MEDIUM"
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground shrink-0">
                  <span className="text-[11px] font-mono">Review</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. TODAY AT A GLANCE (Two-Column Section) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Today's Attendance */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Today&apos;s Attendance
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isAttendanceRecorded ? "text-success" : "text-muted-foreground"
                }`}
              >
                {isAttendanceRecorded ? `${presentPct}% Present` : "Not Recorded"}
              </span>
            </div>

            {isAttendanceRecorded ? (
              <div className="space-y-2">
                {/* Attendance Dual Bar */}
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${presentPct}%` }}
                  />
                  <div
                    className="bg-destructive/60 h-full transition-all duration-500"
                    style={{ width: `${absentPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Present ({presentPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-destructive/60" />
                    <span>Absent / Leave ({absentPct}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground">Active Students</span>
                    <p className="font-semibold text-foreground text-sm">{stats.totalStudents}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground">Faculty Leaves</span>
                    <p className="font-semibold text-warning text-sm">{stats.pendingLeaveRequests}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border space-y-2">
                <CalendarCheck className="w-5 h-5 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">No attendance recorded today</p>
                <p className="text-[11px] text-muted-foreground">
                  Morning register has not yet been submitted by class teachers.
                </p>
                <div className="pt-1">
                  <Link
                    href="/attendance"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Mark Attendance</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/80">
            <Link
              href="/attendance"
              className="text-xs font-medium text-foreground hover:text-primary flex items-center justify-between transition-colors"
            >
              <span>View Attendance Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (7 cols): Today's Active Schedule */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Today&apos;s Schedule
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {todaySchedule.length > 0 ? `${todaySchedule.length} periods active` : "No slots"}
              </span>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border space-y-1.5">
                <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">No timetable scheduled for today</p>
                <p className="text-[11px] text-muted-foreground">
                  Classes and subject periods will appear here once configured.
                </p>
                <div className="pt-1">
                  <Link
                    href="/academics/timetable"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Configure Timetable</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {todaySchedule.slice(0, 4).map((slot) => (
                  <div
                    key={slot.id}
                    className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 mr-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        P{slot.period}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block truncate">{slot.subjectName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono truncate block">{slot.className}</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-muted-foreground shrink-0">
                      <span>{slot.startTime} – {slot.endTime}</span>
                      {slot.roomNumber && (
                        <span className="text-[10px] text-muted-foreground block">{slot.roomNumber}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/80">
            <Link
              href="/academics/timetable"
              className="text-xs font-medium text-foreground hover:text-primary flex items-center justify-between transition-colors"
            >
              <span>View Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. TASKS & RECENT ACTIVITY (Two-Column Section) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Pending Tasks */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Pending Tasks
              </span>
              <span className="text-[11px] font-mono text-warning font-semibold">
                {priorityTasks.length} Active
              </span>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border space-y-1">
                <CheckCircle2 className="w-5 h-5 mx-auto text-success" />
                <p className="font-medium text-foreground">No pending tasks</p>
                <p className="text-[11px] text-muted-foreground">All institutional responsibilities are up to date.</p>
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-muted/10">
                {priorityTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 min-w-0 mr-2">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date set"}
                        {task.assigneeName ? ` · Assigned to ${task.assigneeName}` : ""}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                        task.priority === "URGENT" || task.priority === "HIGH"
                          ? "bg-destructive/15 text-destructive border border-destructive/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/80">
            <Link
              href="/tasks"
              className="text-xs font-medium text-foreground hover:text-primary flex items-center justify-between transition-colors"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Operational Activity */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Recent Activity
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">Operations Feed</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border space-y-1">
                <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">No recent activity</p>
                <p className="text-[11px] text-muted-foreground">Admissions, receipts, and circulars will stream here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 mr-2">
                      <p className="font-semibold text-foreground truncate">{act.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{act.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/80">
            <Link
              href="/finance/fees"
              className="text-xs font-medium text-foreground hover:text-primary flex items-center justify-between transition-colors"
            >
              <span>View Fee Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CAMPUS ANNOUNCEMENTS */}
      <section className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Institutional Announcements
            </span>
          </div>
          <Link
            href="/announcements"
            className="text-xs font-semibold text-primary hover:underline transition-colors"
          >
            View All ({recentAnnouncements.length}) →
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No active announcements for this session.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentAnnouncements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5"
              >
                <p className="text-xs font-semibold text-foreground line-clamp-1">{ann.title}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-muted border border-border">{ann.targetAudience}</span>
                  <span>{formatDate(ann.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <StudentAdmissionDialog
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        programs={programs}
        academicYears={academicYears}
        customFields={customFields}
        onSuccess={() => {
          setIsAdmissionModalOpen(false);
          window.location.reload();
        }}
      />

      <QuickTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <QuickBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      <QuickPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
