"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Sparkles,
  Users,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface StudentAttendanceItem {
  id: string;
  fullName: string;
  admissionNumber: string;
  rollNumber?: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCUSED";
  remarks?: string | null;
}

export function StudentAttendanceClient({
  sections,
  initialSectionId,
  students,
  selectedDateStr,
  canMark,
}: {
  sections: Array<{ id: string; className: string; sectionName: string }>;
  initialSectionId: string;
  students: StudentAttendanceItem[];
  selectedDateStr: string;
  canMark: boolean;
}) {
  const [currentSectionId, setCurrentSectionId] = useState(initialSectionId);
  const [date, setDate] = useState(selectedDateStr);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceItem[]>(students);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = (
    studentId: string,
    newStatus: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCUSED"
  ) => {
    setAttendanceRecords((prev) =>
      prev.map((item) =>
        item.id === studentId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendanceRecords((prev) =>
      prev.map((item) =>
        item.id === studentId ? { ...item, remarks } : item
      )
    );
  };

  const markAllPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((item) => ({ ...item, status: "PRESENT" }))
    );
  };

  const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "ABSENT").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "LATE").length;
  const total = attendanceRecords.length;
  const attendancePercentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : "100.0";

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: currentSectionId,
          date,
          records: attendanceRecords.map((r) => ({
            studentId: r.id,
            status: r.status,
            remarks: r.remarks,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveFeedback(
          `✓ Attendance successfully recorded for ${data.savedCount} students. ${
            data.absentAlertsCount > 0
              ? `(${data.absentAlertsCount} automated parent alerts dispatched)`
              : ""
          }`
        );
        router.refresh();
      } else {
        setSaveFeedback(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveFeedback(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <PageHeader
        category="Scholastic Operations"
        title="Student Attendance & Roll-Call"
        description="Verify daily attendance rosters, track punctuality thresholds, and record student participation."
        actions={
          canMark ? (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAttendance}
                isLoading={isSaving}
                leftIcon={<Save className="h-3.5 w-3.5" />}
              >
                Save Attendance Record
              </Button>
            </div>
          ) : undefined
        }
      />

      {saveFeedback && (
        <div className="rounded-xl bg-card border border-success/30 p-4 text-xs text-success font-semibold shadow-xs">
          {saveFeedback}
        </div>
      )}

      {/* Class & Date Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-white p-4 border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-accent font-bold mb-1">
              Select Class / Section
            </label>
            <select
              value={currentSectionId}
              onChange={(e) => {
                setCurrentSectionId(e.target.value);
                router.push(`/attendance?sectionId=${e.target.value}&date=${date}`);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-[#171614]"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.className} — Section {sec.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-accent font-bold mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                router.push(`/attendance?sectionId=${currentSectionId}&date=${e.target.value}`);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>
        </div>

        {/* Live Class Attendance KPI */}
        <div className="flex items-center gap-4 bg-card p-2.5 rounded-xl border border-border text-xs">
          <div className="text-center px-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">PRESENT</div>
            <div className="text-base font-mono font-bold text-accent">{presentCount}</div>
          </div>
          <div className="h-6 w-px bg-[#E5E0D5]" />
          <div className="text-center px-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">ABSENT</div>
            <div className="text-base font-mono font-bold text-destructive">{absentCount}</div>
          </div>
          <div className="h-6 w-px bg-[#E5E0D5]" />
          <div className="text-center px-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">LATE</div>
            <div className="text-base font-mono font-bold text-primary">{lateCount}</div>
          </div>
          <div className="h-6 w-px bg-[#E5E0D5]" />
          <div className="text-center px-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">RATE</div>
            <div className="text-base font-mono font-bold text-foreground">{attendancePercentage}%</div>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-card text-accent font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16 font-bold">Roll #</th>
                <th className="py-3 px-4 font-bold">Student Name & ID</th>
                <th className="py-3 px-4 font-bold">Attendance Status</th>
                <th className="py-3 px-4 font-bold">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-accent font-mono text-xs">
                    No student records enrolled in this cohort.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-card transition-colors ${
                      item.status === "ABSENT" ? "bg-destructive/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      #{item.rollNumber || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">
                        {item.fullName}
                      </div>
                      <div className="text-[11px] text-accent font-mono mt-0.5">
                        {item.admissionNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, "PRESENT")}
                          className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase font-bold transition-all ${
                            item.status === "PRESENT"
                              ? "bg-accent text-white shadow-xs"
                              : "bg-card border border-border text-foreground hover:bg-[#F3F0E8]"
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, "ABSENT")}
                          className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase font-bold transition-all ${
                            item.status === "ABSENT"
                              ? "bg-destructive text-white shadow-xs"
                              : "bg-card border border-border text-foreground hover:bg-[#F3F0E8]"
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, "LATE")}
                          className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase font-bold transition-all ${
                            item.status === "LATE"
                              ? "bg-[#B89B62] text-white shadow-xs"
                              : "bg-card border border-border text-foreground hover:bg-[#F3F0E8]"
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, "EXCUSED")}
                          className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase font-bold transition-all ${
                            item.status === "EXCUSED"
                              ? "bg-primary text-white shadow-xs"
                              : "bg-card border border-border text-foreground hover:bg-[#F3F0E8]"
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        placeholder="Add remark (e.g. Medical leave, Late bus)..."
                        value={item.remarks || ""}
                        onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-border bg-white px-2.5 py-1 text-xs text-foreground placeholder:text-accent focus:outline-none focus:ring-1 focus:ring-[#171614]"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
