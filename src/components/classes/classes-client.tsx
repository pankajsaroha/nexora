"use client";

import React, { useState } from "react";
import { Building2, Users, GraduationCap, Plus, BookOpen, Layers, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  level: string;
  sections: Array<{
    id: string;
    name: string;
    roomNumber?: string | null;
    capacity: number;
    classTeacherName?: string | null;
    studentsCount: number;
  }>;
}

export function ClassesClient({ classes }: { classes: ClassItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const totalSections = classes.reduce((acc, c) => acc + c.sections.length, 0);
  const totalEnrolled = classes.reduce(
    (acc, c) => acc + c.sections.reduce((sAcc, s) => sAcc + s.studentsCount, 0),
    0
  );
  const totalCapacity = classes.reduce(
    (acc, c) => acc + c.sections.reduce((sAcc, s) => sAcc + s.capacity, 0),
    0
  );

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sections.some(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.classTeacherName && s.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = Array.from(new Set(classes.map((c) => c.level)));

  return (
    <div className="space-y-6">
      <PageHeader
        category="Academic Architecture"
        title="Classes & Cohort Structure"
        description="Institutional grade tiers, section divisions, assigned class tutors, and room capacity allocations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Class blueprint export ready for download.")}
            >
              Export Structure
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Add Class modal will open.")}
            >
              Add Class
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Classes</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{classes.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Active grade levels</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Sections</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalSections}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Homerooms configured</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Enrolled Students</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalEnrolled}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Across all divisions</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Capacity Utilization</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">{totalEnrolled} / {totalCapacity} desks filled</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E8E7DF] bg-white p-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search class, section, teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Level:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedLevel("ALL")}
              className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                selectedLevel === "ALL"
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                  selectedLevel === lvl
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Class Cohorts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-4 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-mono font-bold text-xs">
                  {c.code}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {c.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    Level: {c.level}
                  </div>
                </div>
              </div>

              <Badge variant="outline" size="sm">
                {c.sections.length} Sections
              </Badge>
            </div>

            <div className="space-y-2">
              {c.sections.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-lg bg-[#FAF9F5] p-3 border border-[#E8E7DF] flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      Section {sec.name}{" "}
                      <span className="font-mono text-[10px] text-slate-400 font-normal">
                        ({sec.roomNumber || "Main Building"})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Class Tutor:{" "}
                      <span className="font-medium text-slate-800">
                        {sec.classTeacherName || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {sec.studentsCount}{" "}
                      <span className="text-slate-400 font-normal text-[10px]">/ {sec.capacity}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">Enrolled</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-[#E8E7DF]">
              <span>Total Class Roll</span>
              <span className="font-mono font-bold text-slate-900">
                {c.sections.reduce((acc, s) => acc + s.studentsCount, 0)} Students
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
