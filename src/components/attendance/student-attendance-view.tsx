"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface AttendanceRecordItem {
  id: string;
  date: Date | string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCUSED";
  remarks?: string | null;
}

export interface StudentAttendanceViewProps {
  studentName: string;
  className: string;
  sectionName: string;
  rollNumber?: string | null;
  admissionNumber: string;
  records: AttendanceRecordItem[];
  isParentView?: boolean;
  childrenList?: Array<{ id: string; fullName: string; className: string; sectionName: string }>;
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
}

export function StudentAttendanceView({
  studentName,
  className,
  sectionName,
  rollNumber,
  admissionNumber,
  records,
  isParentView,
  childrenList = [],
  selectedChildId,
  onSelectChild,
}: StudentAttendanceViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const halfDay = records.filter((r) => r.status === "HALF_DAY").length;
  const excused = records.filter((r) => r.status === "EXCUSED").length;

  const attendanceRate = total > 0 ? Math.round(((present + late + halfDay * 0.5) / total) * 100) : 100;

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (selectedMonth !== "ALL") {
      const recDate = new Date(r.date);
      const mStr = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, "0")}`;
      if (mStr !== selectedMonth) return false;
    }
    return true;
  });

  // Extract unique months for filter
  const months = Array.from(
    new Set(
      records.map((r) => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  ).sort().reverse();

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            PRESENT
          </span>
        );
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/15 text-destructive border border-destructive/30 font-mono">
            <XCircle className="w-3 h-3" />
            ABSENT
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono">
            <Clock className="w-3 h-3" />
            LATE
          </span>
        );
      case "HALF_DAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 border border-blue-500/30 font-mono">
            HALF DAY
          </span>
        );
      case "EXCUSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 border border-purple-500/30 font-mono">
            EXCUSED
          </span>
        );
      default:
        return <span className="text-xs font-mono">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary">
              {className} ({sectionName}) · Roll #{rollNumber || "—"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isParentView ? `${studentName}'s Attendance Record` : "My Attendance Register"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Admission ID: {admissionNumber} • Showing verified institutional roll-call attendance logs
          </p>
        </div>

        {/* Parent View: Child Selector */}
        {isParentView && childrenList.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-xl self-start sm:self-auto shadow-2xs">
            <span className="text-[11px] text-muted-foreground px-2">Child:</span>
            {childrenList.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectChild && onSelectChild(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  c.id === selectedChildId
                    ? "bg-card text-foreground shadow-xs font-bold border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.fullName} ({c.className})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Attendance Rate
          </span>
          <div className="text-2xl font-bold text-foreground font-mono">
            {attendanceRate}%
          </div>
          <span className="text-[10px] text-muted-foreground">Cumulative academic year</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Present Days
          </span>
          <div className="text-2xl font-bold text-success font-mono">
            {present}
          </div>
          <span className="text-[10px] text-muted-foreground">Of {total} school sessions</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Absent Days
          </span>
          <div className="text-2xl font-bold text-destructive font-mono">
            {absent}
          </div>
          <span className="text-[10px] text-muted-foreground">Unexcused leaves</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Late / Half Days
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {late + halfDay}
          </div>
          <span className="text-[10px] text-muted-foreground">{late} Late • {halfDay} Half Day</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">Filter Records:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present Only</option>
            <option value="ABSENT">Absent Only</option>
            <option value="LATE">Late Only</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="EXCUSED">Excused</option>
          </select>

          {months.length > 0 && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none font-mono"
            >
              <option value="ALL">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-[11px] font-mono text-muted-foreground">
          Showing {filteredRecords.length} of {total} records
        </span>
      </div>

      {/* Attendance Register Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4 font-bold">Session Date</th>
                <th className="py-3.5 px-4 font-bold">Day</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    No attendance records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const d = new Date(rec.date);
                  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

                  return (
                    <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {formatDate(rec.date)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {dayName}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {rec.remarks || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
