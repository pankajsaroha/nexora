"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface StudentExamSubjectResult {
  id: string;
  subjectName: string;
  subjectCode: string;
  examDate?: Date | string | null;
  maxMarks: number;
  passMarks: number;
  marksObtained: number | null;
  grade: string | null;
  isAbsent: boolean;
  remarks?: string | null;
}

export interface StudentPublishedExam {
  id: string;
  name: string;
  examType: string;
  academicYearName: string;
  termName?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  subjects: StudentExamSubjectResult[];
}

export interface StudentResultsViewProps {
  studentName: string;
  className: string;
  sectionName: string;
  rollNumber?: string | null;
  admissionNumber: string;
  exams: StudentPublishedExam[];
  isParentView?: boolean;
  childrenList?: Array<{ id: string; fullName: string; className: string }>;
  selectedChildId?: string;
  onSelectChild?: (id: string) => void;
}

export function StudentResultsView({
  studentName,
  className,
  sectionName,
  rollNumber,
  admissionNumber,
  exams,
  isParentView,
  childrenList = [],
  selectedChildId,
  onSelectChild,
}: StudentResultsViewProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Calculate stats for active exam
  let totalMax = 0;
  let totalObtained = 0;
  let hasPending = false;
  let allPassed = true;

  if (activeExam) {
    for (const sub of activeExam.subjects) {
      totalMax += sub.maxMarks;
      if (sub.marksObtained !== null) {
        totalObtained += sub.marksObtained;
        if (sub.marksObtained < sub.passMarks) {
          allPassed = false;
        }
      } else {
        hasPending = true;
      }
    }
  }

  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

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
            {isParentView ? `${studentName}'s Examination Results` : "My Examination Results & Marks"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Admission ID: {admissionNumber} • Strictly verified, published institutional report cards
          </p>
        </div>

        {/* Parent Child Switcher */}
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
                {c.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-sm">No Published Results Available</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto">
            Examinations are either currently in progress, undergoing grade verification, or awaiting official publication by the academic office.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Exam Selector Tabs */}
          <div className="flex border-b border-border gap-3 overflow-x-auto pb-1">
            {exams.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExamId(exam.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeExam?.id === exam.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {exam.name}
              </button>
            ))}
          </div>

          {activeExam && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Overall Percentage
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {overallPercentage !== null ? `${overallPercentage}%` : "Pending"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {totalObtained} / {totalMax} aggregate marks
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Result Status
                  </span>
                  <div className="flex items-center gap-1.5 pt-1">
                    {allPassed && !hasPending ? (
                      <span className="inline-flex items-center gap-1 font-bold text-success font-mono text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {hasPending ? "EVALUATING" : "NEEDS IMPROVEMENT"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Term threshold met</span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Total Subjects
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {activeExam.subjects.length}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Assessment modules</span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Publication Status
                  </span>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      PUBLISHED
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Officially published</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                      Subject-Wise Marks Ledger
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {activeExam.name} • {activeExam.academicYearName}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        <th className="py-3.5 px-4 font-bold">Subject</th>
                        <th className="py-3.5 px-4 font-bold">Code</th>
                        <th className="py-3.5 px-4 font-bold">Max Marks</th>
                        <th className="py-3.5 px-4 font-bold">Passing Marks</th>
                        <th className="py-3.5 px-4 font-bold">Marks Scored</th>
                        <th className="py-3.5 px-4 font-bold">Grade</th>
                        <th className="py-3.5 px-4 font-bold">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeExam.subjects.map((sub) => {
                        const passed = sub.marksObtained !== null && sub.marksObtained >= sub.passMarks;

                        return (
                          <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-foreground">
                              {sub.subjectName}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-muted-foreground">
                              {sub.subjectCode}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-foreground font-semibold">
                              {sub.maxMarks}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-muted-foreground">
                              {sub.passMarks}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {sub.isAbsent ? (
                                <span className="font-bold text-destructive">ABSENT</span>
                              ) : sub.marksObtained !== null ? (
                                <span className={`font-extrabold text-sm ${passed ? "text-success" : "text-destructive"}`}>
                                  {sub.marksObtained}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Pending</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {sub.grade ? (
                                <span className="font-mono font-bold px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                                  {sub.grade}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-muted-foreground">
                              {sub.remarks || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
