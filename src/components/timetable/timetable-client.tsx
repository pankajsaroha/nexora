"use client";

import React, { useState } from "react";
import { Clock, Calendar, Printer, Filter, Building, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export interface TimetableSlotData {
  id: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  className: string;
  sectionName: string;
  roomNumber?: string | null;
}

export function TimetableClient({
  slots,
  sections,
  teachers,
  initialSectionId,
}: {
  slots: TimetableSlotData[];
  sections: Array<{ id: string; className: string; sectionName: string }>;
  teachers: Array<{ id: string; fullName: string }>;
  initialSectionId: string;
}) {
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [viewMode, setViewMode] = useState<"CLASS" | "TEACHER">("CLASS");
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || "");

  const days: Array<"MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY"> = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const periods = [
    { period: 1, start: "08:30", end: "09:15" },
    { period: 2, start: "09:15", end: "10:00" },
    { period: 3, start: "10:15", end: "11:00" },
    { period: 4, start: "11:00", end: "11:45" },
    { period: 5, start: "12:30", end: "13:15" },
    { period: 6, start: "13:15", end: "14:00" },
    { period: 7, start: "14:00", end: "14:45" },
  ];

  const filteredSlots = slots.filter((slot) => {
    if (viewMode === "CLASS") {
      const sec = sections.find((s) => s.id === selectedSectionId);
      if (!sec) return true;
      return slot.className === sec.className && slot.sectionName === sec.sectionName;
    } else {
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (!teacher) return true;
      return slot.teacherName === teacher.fullName;
    }
  });

  const getSlot = (day: string, periodNum: number) => {
    return filteredSlots.find(
      (s) => s.dayOfWeek === day && s.periodNumber === periodNum
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="ACADEMIC SCHEDULE & ROOM ALLOCATION"
        title="Institutional Master Timetable"
        description="Visual matrix of lecture periods, faculty room allocations, and clash-free academic scheduling."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
            className="no-print"
          >
            Print Schedule
          </Button>
        }
      />

      {/* Selector and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-white p-4 border border-[#E8E7DF] shadow-2xs no-print">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] p-1">
            <button
              type="button"
              onClick={() => setViewMode("CLASS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-editorial ${
                viewMode === "CLASS"
                  ? "bg-[#0F172A] text-white shadow-2xs"
                  : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Class View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TEACHER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-editorial ${
                viewMode === "TEACHER"
                  ? "bg-[#0F172A] text-white shadow-2xs"
                  : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Teacher View
            </button>
          </div>
        </div>

        <div>
          {viewMode === "CLASS" ? (
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.className} — Section {sec.sectionName}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Timetable Visual Grid */}
      <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E7DF] bg-[#FAF9F5]">
                <th className="py-3 px-4 text-left font-mono text-[11px] uppercase tracking-wider font-bold text-slate-500 w-28">
                  Day / Period
                </th>
                {periods.map((p) => (
                  <th
                    key={p.period}
                    className="py-3 px-2 font-mono text-[11px] uppercase tracking-wider font-bold text-slate-700 border-l border-[#E8E7DF] min-w-[130px]"
                  >
                    <div>P{p.period}</div>
                    <div className="text-[10px] text-slate-400 font-normal font-sans">
                      {p.start} – {p.end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#FAF9F5]/40 transition-colors">
                  <td className="py-4 px-4 text-left font-mono font-bold text-[#0F172A] bg-[#FAF9F5]/80">
                    {day.substring(0, 3)}
                  </td>
                  {periods.map((p) => {
                    const slot = getSlot(day, p.period);
                    return (
                      <td
                        key={p.period}
                        className="py-3 px-2 border-l border-[#E8E7DF] align-top"
                      >
                        {slot ? (
                          <div className="rounded-lg bg-white border border-[#E8E7DF] p-2.5 text-left space-y-1 shadow-2xs hover:border-slate-400 transition-editorial">
                            <div className="font-bold text-[#0F172A] truncate">
                              {slot.subjectName}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {viewMode === "CLASS" ? slot.teacherName : `${slot.className} (${slot.sectionName})`}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 font-medium">
                              {slot.roomNumber || "Room 104"}
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 rounded-lg border border-dashed border-[#E8E7DF] flex items-center justify-center font-mono text-[10px] text-slate-400">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
