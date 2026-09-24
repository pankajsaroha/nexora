"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Calendar,
  Printer,
  Sparkles,
  Award,
  GraduationCap,
  Eye,
  CheckCircle2,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

export interface ExamItem {
  id: string;
  name: string;
  examType: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  subjects: Array<{
    id: string;
    subjectName: string;
    className: string;
    examDate: Date | string;
    maxMarks: number;
    passMarks: number;
  }>;
}

export interface ReportCardStudent {
  id: string;
  fullName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  classTeacherName: string;
  attendancePct: number;
  marks: Array<{
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade: string;
  }>;
}

export function ExamsClient({
  exams,
  sampleReportCard,
}: {
  exams: ExamItem[];
  sampleReportCard: ReportCardStudent;
}) {
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<string>("ALL");

  const totalMarksObtained = sampleReportCard.marks.reduce((acc, m) => acc + m.marksObtained, 0);
  const totalMaxMarks = sampleReportCard.marks.reduce((acc, m) => acc + m.maxMarks, 0);
  const overallPercentage = ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1);

  const filteredExams = exams.filter((e) => {
    if (selectedExamType === "ALL") return true;
    return e.examType === selectedExamType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Scholastic Evaluation"
        title="Exams & Academic Assessments"
        description="Term assessments, paper schedules, grading blueprints, and official report card generation."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportCardOpen(true)}
              leftIcon={<Award className="h-3.5 w-3.5" />}
            >
              Sample Report Card
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Create Assessment cycle modal will open.")}
            >
              Schedule Exam
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Exams</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{exams.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Scheduled assessment cycles</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Papers Scheduled</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {exams.reduce((acc, e) => acc + e.subjects.length, 0)}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Subject assessments</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Evaluation Status</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">96.4%</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Marks entered into ledger</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Institutional Average</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">84.2%</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Mean academic score</div>
        </div>
      </div>

      {/* Exam Schedules List */}
      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E8E7DF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {exam.examType}
                  </Badge>
                  <h2 className="text-sm font-bold text-slate-900">
                    {exam.name}
                  </h2>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Timeline: {formatDate(exam.startDate)} — {formatDate(exam.endDate)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={exam.status === "COMPLETED" ? "success" : "default"}
                  size="sm"
                >
                  {exam.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportCardOpen(true)}
                >
                  Report Cards →
                </Button>
              </div>
            </div>

            {/* Exam Paper Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {exam.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] p-3 text-xs space-y-1 hover:bg-white transition-colors"
                >
                  <div className="font-semibold text-slate-900">
                    {sub.subjectName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {sub.className} • {formatDate(sub.examDate)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 pt-1">
                    Max: {sub.maxMarks} marks <span className="text-slate-400">(Pass: {sub.passMarks})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Official Report Card Modal */}
      {isReportCardOpen && (
        <Modal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          title="Official Academic Report Card"
          description="Institutional Grade Assessment & Performance Evaluation (Print-Ready Dossier)."
          size="xl"
        >
          <div className="space-y-6">
            {/* Printable Container */}
            <div className="p-6 rounded-xl border border-[#E8E7DF] bg-white space-y-6">
              {/* Institution Header */}
              <div className="text-center border-b border-slate-900 pb-4 space-y-1">
                <div className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                  Northstar International Academy
                </div>
                <div className="text-xs text-slate-500">
                  Affiliated to CBSE • Institutional Assessment Wing • Knowledge Park III, Greater Noida
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest pt-1">
                  Term 1 Comprehensive Progress Report (AY 2026-2027)
                </div>
              </div>

              {/* Student Demographics Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] p-3.5 rounded-lg text-xs border border-[#E8E7DF]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Student Name</span>
                  <div className="font-bold text-slate-900">
                    {sampleReportCard.fullName}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Admission No</span>
                  <div className="font-mono font-bold text-slate-900">
                    {sampleReportCard.admissionNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Class & Section</span>
                  <div className="font-bold text-slate-900">
                    {sampleReportCard.className} ({sampleReportCard.sectionName})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Roll Number</span>
                  <div className="font-mono font-bold text-slate-900">
                    #{sampleReportCard.rollNumber}
                  </div>
                </div>
              </div>

              {/* Scholastic Performance Table */}
              <div className="overflow-hidden border border-[#E8E7DF] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F5] font-mono text-[11px] uppercase tracking-wider text-slate-600 border-b border-[#E8E7DF]">
                    <tr>
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3 text-center">Max Marks</th>
                      <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E7DF]">
                    {sampleReportCard.marks.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {m.subjectName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {m.maxMarks}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {m.marksObtained}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-emerald-700">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FAF9F5] font-bold text-xs border-t border-slate-900">
                      <td className="py-2.5 px-3 font-mono uppercase text-[11px]">Grand Total & Percentage</td>
                      <td className="py-2.5 px-3 text-center font-mono">{totalMaxMarks}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-900">
                        {totalMarksObtained} ({overallPercentage}%)
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-700">A+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Attendance & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    Class Tutor Remarks ({sampleReportCard.classTeacherName})
                  </span>
                  <p className="text-slate-700 italic">
                    &quot;Aarav demonstrates stellar analytical reasoning in Mathematics and exemplary participation in school robotics events.&quot;
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    Institutional Attendance Record
                  </span>
                  <div className="text-slate-900 font-mono font-bold">
                    {sampleReportCard.attendancePct}% Term Attendance Record
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Result: Promoted with First-Class Distinction
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-8 text-xs font-mono text-slate-500">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  Class Tutor
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  Exam Controller
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  Principal
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsReportCardOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Report Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
