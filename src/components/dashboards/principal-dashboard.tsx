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
  TrendingUp,
  CreditCard,
  Calendar,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuickTaskModal } from "@/components/tasks/quick-task-modal";
import { QuickBroadcastModal } from "@/components/announcements/quick-broadcast-modal";
import { QuickPaymentModal } from "@/components/fees/quick-payment-modal";

export interface PrincipalDashboardProps {
  userName?: string;
  institutionName?: string;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    attendanceTodayPct: number;
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
}

export function PrincipalDashboard({
  userName = "Administrator",
  institutionName = "Educational Institution",
  stats,
  attentionItems,
  todaySchedule = [],
  priorityTasks = [],
  recentActivity = [],
  recentAnnouncements = [],
}: PrincipalDashboardProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Current time greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const presentPct = stats.attendanceTodayPct;
  const absentPct = stats.totalStudents > 0 ? Math.max(0, +(100 - presentPct).toFixed(1)) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2 font-sans selection:bg-[#171614] selection:text-[#F7F4ED]">
      {/* 1. WELCOME & DAILY COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A756B] font-bold">
              {institutionName}
            </span>
            <span className="text-[#DCD7CB]">•</span>
            <span className="text-[10px] font-mono text-[#856D3B] font-semibold">
              {todayFormatted}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171614] font-serif">
            {greeting}, {userName}.
          </h1>
          <p className="text-xs text-[#555047] mt-1">
            Here&apos;s what needs your attention today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-white text-[#171614] hover:bg-[#FAF8F3] hover:border-[#B89B62] transition-all shadow-2xs cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#856D3B]" />
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#DCD7CB] bg-[#FAF8F3] text-[#171614] hover:bg-[#EFECE3] hover:border-[#B89B62] transition-all shadow-2xs cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#7A756B]" />
            <span>Broadcast Notice</span>
          </button>
          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#1B1916] text-[#FAF8F3] hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#D4B87C]" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY 4 METRIC BLOCKS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Scholars */}
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            01 / TOTAL STUDENTS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight font-serif">
            {stats.totalStudents.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#555047] block font-medium">
            {stats.totalStudents > 0 ? "Active grade cohorts" : "No scholars enrolled yet"}
          </span>
        </div>

        {/* Metric 2: Attendance */}
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            02 / TODAY&apos;S ATTENDANCE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight font-serif">
            {presentPct}%
          </div>
          <span className="text-[11px] text-[#525E4B] block font-bold">
            {stats.totalStudents > 0 ? "Daily register recorded" : "Awaiting first morning roll"}
          </span>
        </div>

        {/* Metric 3: Pending Tasks */}
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            03 / PENDING TASKS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight font-serif">
            {stats.pendingTasksCount}
          </div>
          <span className="text-[11px] text-[#856D3B] block font-bold">
            {stats.pendingTasksCount > 0 ? "Requiring resolution" : "All workflows up to date"}
          </span>
        </div>

        {/* Metric 4: Fees Realized */}
        <div className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-1 shadow-2xs hover:border-[#B89B62] transition-all">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            04 / FEES REALIZED
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight font-serif">
            {formatCurrency(stats.totalFeeCollected)}
          </div>
          <span className="text-[11px] text-[#6F3D3A] block font-bold">
            {formatCurrency(stats.totalFeePending)} outstanding
          </span>
        </div>
      </section>

      {/* 3. TODAY'S ATTENTION SECTION */}
      {attentionItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614]">
              Today&apos;s Attention Items ({attentionItems.length})
            </h2>
            <span className="text-[11px] text-[#7A756B]">Action required</span>
          </div>

          <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-2xl bg-white overflow-hidden shadow-2xs">
            {attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.linkUrl}
                className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      item.severity === "HIGH"
                        ? "bg-[#6F3D3A]"
                        : item.severity === "MEDIUM"
                        ? "bg-[#B89B62]"
                        : "bg-[#525E4B]"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-[#171614] group-hover:text-[#856D3B] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#7A756B] mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#555047] group-hover:text-[#171614]">
                  <span className="text-[11px] uppercase tracking-wider font-mono">Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform text-[#7A756B] group-hover:text-[#171614]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. TODAY AT A GLANCE (Two-Column Section) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Attendance Overview */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171614] uppercase tracking-wider font-mono text-[11px]">
                Daily Attendance Roll
              </span>
              <span className="text-[11px] font-mono text-[#525E4B] font-bold">
                {presentPct}% Present
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-[#EFECE3] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#525E4B] h-full transition-all duration-500"
                  style={{ width: `${presentPct}%` }}
                />
                <div
                  className="bg-[#C45B5B] h-full transition-all duration-500"
                  style={{ width: `${absentPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7A756B] font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#525E4B]" />
                  <span>Present ({presentPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C45B5B]" />
                  <span>Absent / On Leave ({absentPct}%)</span>
                </div>
              </div>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-[#7A756B]">Active Scholars</span>
                <p className="font-bold text-[#171614] text-sm">{stats.totalStudents}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-[#7A756B]">Staff on Leave</span>
                <p className="font-bold text-[#856D3B] text-sm">{stats.pendingLeaveRequests}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E0D5]">
            <Link
              href="/attendance"
              className="text-xs font-bold text-[#171614] hover:text-[#856D3B] flex items-center justify-between transition-colors"
            >
              <span>Open Attendance Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col (7 cols): Today's Active Schedule & Classes */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171614] uppercase tracking-wider font-mono text-[11px]">
                Today&apos;s Active Schedule
              </span>
              <span className="text-[11px] font-mono text-[#7A756B]">
                {todaySchedule.length > 0 ? `${todaySchedule.length} periods today` : "Full Day"}
              </span>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A756B] bg-[#FAF8F3] rounded-xl border border-[#E5E0D5]">
                <Calendar className="w-5 h-5 mx-auto mb-1.5 text-[#A8A398]" />
                <p className="font-medium text-[#555047]">No active timetable slots configured yet.</p>
                <p className="text-[11px] text-[#7A756B] mt-0.5">Classes and subject periods will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {todaySchedule.slice(0, 4).map((slot) => (
                  <div
                    key={slot.id}
                    className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#171614] text-[#F7F4ED] flex items-center justify-center font-mono font-bold text-[10px]">
                        P{slot.period}
                      </span>
                      <div>
                        <span className="font-bold text-[#171614] block leading-tight">{slot.subjectName}</span>
                        <span className="text-[10px] text-[#7A756B] font-mono">{slot.className}</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#555047]">
                      <span>{slot.startTime} - {slot.endTime}</span>
                      {slot.roomNumber && (
                        <span className="text-[10px] text-[#7A756B] block">{slot.roomNumber}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D5]">
            <Link
              href="/academics/timetable"
              className="text-xs font-bold text-[#171614] hover:text-[#856D3B] flex items-center justify-between transition-colors"
            >
              <span>View Full Institutional Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TASKS & RECENT ACTIVITY (Two-Column Section) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Administrative Tasks */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171614] uppercase tracking-wider font-mono text-[11px]">
                Pending Administrative Tasks
              </span>
              <span className="text-[11px] font-mono text-[#856D3B] font-bold">
                {priorityTasks.length} Active
              </span>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A756B] bg-[#FAF8F3] rounded-xl border border-[#E5E0D5]">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-[#525E4B]" />
                <p className="font-medium text-[#555047]">All administrative tasks are completed.</p>
                <p className="text-[11px] text-[#7A756B] mt-0.5">New tasks assigned to your team will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFECE3] border border-[#E5E0D5] rounded-xl overflow-hidden bg-[#FAF8F3]">
                {priorityTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#171614]">{task.title}</p>
                      <p className="text-[10px] text-[#7A756B]">
                        {task.assigneeName ? `Assigned to ${task.assigneeName}` : "General Administration"}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        task.priority === "URGENT" || task.priority === "HIGH"
                          ? "bg-[#FBF4F4] text-[#6F3D3A] border border-[#ECCECE]"
                          : "bg-white text-[#555047] border border-[#DCD7CB]"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D5]">
            <Link
              href="/tasks"
              className="text-xs font-bold text-[#171614] hover:text-[#856D3B] flex items-center justify-between transition-colors"
            >
              <span>View All Task Boards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Operational Activity & Financial Summary */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171614] uppercase tracking-wider font-mono text-[11px]">
                Recent Operational Activity
              </span>
              <span className="text-[11px] font-mono text-[#7A756B]">Real-time stream</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A756B] bg-[#FAF8F3] rounded-xl border border-[#E5E0D5]">
                <Clock className="w-5 h-5 mx-auto mb-1.5 text-[#A8A398]" />
                <p className="font-medium text-[#555047]">No recent activity logged today.</p>
                <p className="text-[11px] text-[#7A756B] mt-0.5">Admissions, receipts, and circulars will stream here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#171614]">{act.title}</p>
                      <p className="text-[11px] text-[#7A756B]">{act.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#7A756B]">
                      {formatDate(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E0D5]">
            <Link
              href="/finance/fees"
              className="text-xs font-bold text-[#171614] hover:text-[#856D3B] flex items-center justify-between transition-colors"
            >
              <span>Open Institutional Fee Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CAMPUS CIRCULARS */}
      <section className="p-5 rounded-2xl border border-[#E5E0D5] bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#856D3B]" />
            <span className="text-xs font-bold text-[#171614] uppercase tracking-wider font-mono text-[11px]">
              Active Institutional Circulars
            </span>
          </div>
          <Link
            href="/announcements"
            className="text-xs font-bold text-[#856D3B] hover:text-[#171614] transition-colors"
          >
            View All ({recentAnnouncements.length}) →
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <p className="text-xs text-[#7A756B] py-2">No active broadcast circulars for this session.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentAnnouncements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-1.5"
              >
                <p className="text-xs font-bold text-[#171614] line-clamp-1">{ann.title}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7A756B]">
                  <span>{ann.targetAudience}</span>
                  <span>{formatDate(ann.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Action Modals */}
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
