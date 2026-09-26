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
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    examType: "TERM_EXAM",
    startDate: "2026-10-15",
    endDate: "2026-10-28",
    targetClass: "Grade 10",
  });

  const totalMarksObtained = sampleReportCard.marks.reduce((acc, m) => acc + m.marksObtained, 0);
  const totalMaxMarks = sampleReportCard.marks.reduce((acc, m) => acc + m.maxMarks, 0);
  const overallPercentage = ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1);

  const filteredExams = exams.filter((e) => {
    const matchesType = selectedExamType === "ALL" || e.examType === selectedExamType;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subjects.some((s) => s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate schedule creation or API post
    setTimeout(() => {
      setIsSubmitting(false);
      setScheduleSuccess(true);
      setTimeout(() => {
        setIsScheduleModalOpen(false);
        setScheduleSuccess(false);
        router.refresh();
      }, 1200);
    }, 600);
  };

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
              leftIcon={<Award className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Sample Report Card
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule Exam
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Exams</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{exams.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Scheduled assessment cycles</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Papers Scheduled</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">
            {exams.reduce((acc, e) => acc + e.subjects.length, 0)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Subject assessments</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Evaluation Status</div>
          <div className="mt-1 text-2xl font-bold text-[#65705B]">96.4%</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Marks entered into ledger</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Institutional Average</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">84.2%</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Mean academic score</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E0D5] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="search"
            placeholder="Search exam title, subject, or cohort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#65705B] focus:outline-none focus:ring-1 focus:ring-[#171614]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          {["ALL", "TERM_EXAM", "UNIT_TEST", "PRACTICAL", "FINAL"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
                selectedExamType === type
                  ? "bg-[#171614] text-white font-semibold"
                  : "bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614] hover:bg-[#F3F0E8]"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Schedules List */}
      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-xs text-[#65705B]">
            No assessments found matching the current filter.
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5E0D5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {exam.examType.replace("_", " ")}
                    </Badge>
                    <h2 className="text-sm font-bold text-[#171614]">
                      {exam.name}
                    </h2>
                  </div>
                  <div className="text-[11px] font-mono text-[#65705B] mt-1">
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
                    className="rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] p-3 text-xs space-y-1 hover:bg-white transition-colors"
                  >
                    <div className="font-semibold text-[#171614]">
                      {sub.subjectName}
                    </div>
                    <div className="text-[11px] text-[#65705B] font-mono">
                      {sub.className} • {formatDate(sub.examDate)}
                    </div>
                    <div className="text-[10px] font-mono text-[#171614] pt-1">
                      Max: {sub.maxMarks} marks <span className="text-[#65705B]">(Pass: {sub.passMarks})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Exam Modal */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule Assessment Cycle"
          description="Create a new term examination or unit test milestone in the academic calendar."
          size="md"
        >
          {scheduleSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Assessment Cycle Scheduled</h4>
              <p className="text-xs text-[#65705B]">
                Examination blueprint saved. Timetable and hall ticket slots are initialized.
              </p>
            </div>
          ) : (
            <form onSubmit={handleScheduleExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Assessment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Summative Assessment"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Assessment Type *</label>
                  <select
                    value={scheduleForm.examType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, examType: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="TERM_EXAM">Term Exam</option>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="PRACTICAL">Practical / Lab</option>
                    <option value="FINAL">Final Board</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Cohort *</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.targetClass}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, targetClass: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.startDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.endDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Create Assessment Cycle
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

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
            <div className="p-6 rounded-xl border border-[#E5E0D5] bg-white space-y-6">
              {/* Institution Header */}
              <div className="text-center border-b border-[#171614] pb-4 space-y-1">
                <div className="text-base font-extrabold tracking-tight text-[#171614] uppercase">
                  Northstar International Academy
                </div>
                <div className="text-xs text-[#65705B]">
                  Affiliated to CBSE • Institutional Assessment Wing • Knowledge Park III, Greater Noida
                </div>
                <div className="text-xs font-mono font-bold text-[#171614] uppercase tracking-widest pt-1">
                  Term 1 Comprehensive Progress Report (AY 2026-2027)
                </div>
              </div>

              {/* Student Demographics Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F3] p-3.5 rounded-lg text-xs border border-[#E5E0D5]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Student Name</span>
                  <div className="font-bold text-[#171614]">
                    {sampleReportCard.fullName}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Admission No</span>
                  <div className="font-mono font-bold text-[#171614]">
                    {sampleReportCard.admissionNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Class & Section</span>
                  <div className="font-bold text-[#171614]">
                    {sampleReportCard.className} ({sampleReportCard.sectionName})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#65705B]">Roll Number</span>
                  <div className="font-mono font-bold text-[#171614]">
                    #{sampleReportCard.rollNumber}
                  </div>
                </div>
              </div>

              {/* Scholastic Performance Table */}
              <div className="overflow-hidden border border-[#E5E0D5] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F3] font-mono text-[11px] uppercase tracking-wider text-[#65705B] border-b border-[#E5E0D5]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Subject Name</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Max Marks</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Marks Obtained</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D5]">
                    {sampleReportCard.marks.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F3] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-[#171614]">
                          {m.subjectName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#65705B]">
                          {m.maxMarks}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#171614]">
                          {m.marksObtained}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-[#65705B]">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FAF8F3] font-bold text-xs border-t border-[#171614]">
                      <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-[#171614]">Grand Total & Percentage</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#171614]">{totalMaxMarks}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#171614]">
                        {totalMarksObtained} ({overallPercentage}%)
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#65705B]">A+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Attendance & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#65705B]">
                    Class Tutor Remarks ({sampleReportCard.classTeacherName})
                  </span>
                  <p className="text-[#171614] italic">
                    &quot;Aarav demonstrates stellar analytical reasoning in Mathematics and exemplary participation in school robotics events.&quot;
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#65705B]">
                    Institutional Attendance Record
                  </span>
                  <div className="text-[#171614] font-mono font-bold">
                    {sampleReportCard.attendancePct}% Term Attendance Record
                  </div>
                  <p className="text-[#65705B] text-[11px]">
                    Result: Promoted with First-Class Distinction
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-8 text-xs font-mono text-[#65705B]">
                <div className="text-center">
                  <div className="w-32 border-b border-[#E5E0D5] mb-1" />
                  Class Tutor
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-[#E5E0D5] mb-1" />
                  Exam Controller
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-[#E5E0D5] mb-1" />
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
