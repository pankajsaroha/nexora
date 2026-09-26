"use client";

import React, { useState } from "react";
import { Clock, Calendar, Printer, Building, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        eyebrow="ACADEMIC SCHEDULE & ROOM ALLOCATION"
        title="Master Timetable Grid"
        description="Visual matrix of lecture periods, faculty room allocations, and clash-free academic scheduling."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="h-3.5 w-3.5 text-[#7A756B]" />}
          className="no-print"
        >
          Print Schedule
        </Button>
      </PageHeader>

      {/* Selector and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#E5E0D5] shadow-2xs no-print">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-[#FAF8F3] border border-[#DCD7CB] p-1">
            <button
              type="button"
              onClick={() => setViewMode("CLASS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === "CLASS"
                  ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                  : "text-[#555047] hover:text-[#171614]"
              }`}
            >
              Class Timetable
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TEACHER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === "TEACHER"
                  ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                  : "text-[#555047] hover:text-[#171614]"
              }`}
            >
              Faculty Timetable
            </button>
          </div>
        </div>

        {viewMode === "CLASS" ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A756B] font-mono">Select Cohort:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2 text-xs font-bold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} - Section {s.sectionName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A756B] font-mono">Select Faculty:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2 text-xs font-bold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead className="border-b border-[#EFECE3] bg-[#FAF8F3] text-[#7A756B] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold border-r border-[#EFECE3] w-24">Day</th>
                {periods.map((p) => (
                  <th key={p.period} className="py-3.5 px-3 font-bold border-r border-[#EFECE3] last:border-r-0">
                    <div>P{p.period}</div>
                    <div className="text-[9px] font-normal text-[#7A756B]">
                      {p.start}–{p.end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[#171614] border-r border-[#EFECE3] bg-[#FAF8F3]/40">
                    {day.slice(0, 3)}
                  </td>
                  {periods.map((p) => {
                    const slot = getSlot(day, p.period);
                    return (
                      <td
                        key={p.period}
                        className="py-2.5 px-2.5 border-r border-[#EFECE3] last:border-r-0 align-top"
                      >
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-1 hover:border-[#B89B62] transition-all">
                            <p className="font-bold text-xs text-[#171614] truncate">{slot.subjectName}</p>
                            <p className="text-[10px] text-[#7A756B] truncate font-mono">
                              {viewMode === "CLASS" ? slot.teacherName : `${slot.className} (${slot.sectionName})`}
                            </p>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B] font-bold inline-block">
                              {slot.roomNumber || "Room 104"}
                            </span>
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[10px] text-[#A8A398] font-mono">
                            —
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
