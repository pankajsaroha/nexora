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
  ChevronRight,
  ClipboardEdit,
  Users,
  AlertCircle,
  Save,
  Check,
  Clock,
  Filter,
  ArrowRight,
  History,
  RotateCcw,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Lock,
  Unlock,
  Trash2,
  MoreVertical,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { calculateGrade, EXAM_TYPES } from "@/lib/exams/service";
import { DeleteExamModal } from "@/components/exams/delete-exam-modal";

export interface SubjectPaperItem {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  sections: Array<{ id: string; name: string }>;
  examDate: string | null;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passMarks: number;
  roomNumber?: string | null;
  enrolledStudentsCount: number;
  enteredMarksCount: number;
  evaluationStatus: "NOT_STARTED" | "DRAFT" | "COMPLETED";
}

export interface AuditLogItem {
  id: string;
  action: string;
  userName: string;
  userEmail?: string;
  details?: any;
  createdAt: string;
}

export interface ExamItem {
  id: string;
  name: string;
  examType: string;
  examTypeLabel: string;
  academicYearName: string;
  termName: string;
  startDate: string;
  endDate: string;
  status: string;
  targetClasses: string[];
  papersCount: number;
  totalExpectedMarks: number;
  totalEnteredMarks: number;
  progressPct: number;
  averageScorePct?: number;
  evaluatedPapersCount?: number;
  evaluationStatus?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  resultStatus?: "NOT_STARTED" | "IN_PROGRESS" | "VERIFIED" | "PUBLISHED";
  createdById?: string | null;
  createdByName?: string | null;
  createdByEmail?: string | null;
  subjects: SubjectPaperItem[];
  auditLogs?: AuditLogItem[];
}

export interface StudentRosterItem {
  studentId: string;
  admissionNumber: string;
  rollNumber: string;
  fullName: string;
  sectionId: string;
  sectionName: string;
  marksObtained: number | null;
  grade: string | null;
  isAbsent: boolean;
  remarks: string;
}

export interface ClassOption {
  id: string;
  name: string;
  code: string;
  sections: Array<{ id: string; name: string; classTeacherName?: string }>;
}

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
  type: string;
}

export interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
  terms: Array<{ id: string; name: string; isCurrent: boolean }>;
}

export interface StudentOption {
  id: string;
  fullName: string;
  admissionNumber: string;
  rollNumber?: string | null;
  currentClassId: string;
  currentSectionId: string;
}

export interface ScopedReportCardData {
  institution: {
    name: string;
    address: string;
    city: string;
    state: string;
    brandingColor: string;
  };
  exam: {
    id: string;
    name: string;
    examType: string;
    examTypeLabel: string;
    academicYearName: string;
    termName: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  student: {
    id: string;
    fullName: string;
    admissionNumber: string;
    rollNumber: string;
    className: string;
    sectionName: string;
    classTeacherName: string;
    attendancePct: number;
  };
  marks: Array<{
    subjectName: string;
    subjectCode: string;
    maxMarks: number;
    marksObtained: number;
    passMarks: number;
    grade: string;
    isAbsent: boolean;
    remarks?: string;
  }>;
  summary: {
    totalMaxMarks: number;
    totalMarksObtained: number;
    overallPercentage: number;
    overallGrade: string;
    resultStatus: string;
  };
}

export function ExamsClient({
  exams: initialExams,
  stats,
  classes,
  subjects,
  academicYears,
  students,
  initialReportCard,
  currentUser,
}: {
  exams: ExamItem[];
  stats: {
    totalExams: number;
    scheduledExams?: number;
    ongoingExams?: number;
    resultsPending?: number;
    resultsPublished?: number;
    papersScheduled: number;
    evaluationProgressPct: number;
    institutionalAveragePct: number;
  };
  classes: ClassOption[];
  subjects: SubjectOption[];
  academicYears: AcademicYearOption[];
  students: StudentOption[];
  initialReportCard?: ScopedReportCardData | null;
  currentUser: {
    id: string;
    fullName: string;
    roleCode: string;
    teacherId?: string;
  };
}) {
  const router = useRouter();
  const isSuperAdmin = currentUser.roleCode === "SUPER_ADMIN";
  const isInstAdmin =
    isSuperAdmin ||
    ["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "HOD", "EXAM_COORDINATOR"].includes(
      currentUser.roleCode || ""
    );
  const [exams, setExams] = useState<ExamItem[]>(initialExams);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navigatingExamId, setNavigatingExamId] = useState<string | null>(null);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const [isMarksEntryModalOpen, setIsMarksEntryModalOpen] = useState(false);

  // Status Confirmation Modal State
  const [statusConfirmState, setStatusConfirmState] = useState<{
    isOpen: boolean;
    examId: string;
    examName: string;
    targetStatus: string;
    title: string;
    description: string;
    requiresReason: boolean;
    reasonText: string;
    confirmButtonText: string;
    newStartDate?: string;
    newEndDate?: string;
    isLoading: boolean;
    errorMessage: string | null;
  }>({
    isOpen: false,
    examId: "",
    examName: "",
    targetStatus: "",
    title: "",
    description: "",
    requiresReason: false,
    reasonText: "",
    confirmButtonText: "Confirm",
    isLoading: false,
    errorMessage: null,
  });

  // Exam Card Action Menu State
  const [openMenuExamId, setOpenMenuExamId] = useState<string | null>(null);

  // Delete Examination Modal State (Super Admin, Inst Admin, Creator with Dependency Validation)
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    exam: ExamItem | null;
    isSafeToDelete: boolean;
    reasonUnsafe?: string;
    isLoading: boolean;
    errorMessage: string | null;
  }>({
    isOpen: false,
    exam: null,
    isSafeToDelete: false,
    isLoading: false,
    errorMessage: null,
  });

  // Paper Timetable Scheduling Modal State
  const [timetableModalState, setTimetableModalState] = useState<{
    isOpen: boolean;
    exam: ExamItem | null;
    isReschedule: boolean;
    papers: Array<{
      id: string;
      subjectName: string;
      subjectCode: string;
      maxMarks: number;
      passMarks: number;
      examDate: string;
      startTime: string;
      endTime: string;
      roomNumber: string;
      error?: string;
    }>;
    isLoading: boolean;
    globalError: string | null;
  }>({
    isOpen: false,
    exam: null,
    isReschedule: false,
    papers: [],
    isLoading: false,
    globalError: null,
  });

  // Open Timetable Scheduler Interface
  const openTimetableScheduler = (exam: ExamItem, isReschedule = false) => {
    const defaultStartTime = "09:00";
    const defaultEndTime = "12:00";
    const examStart = exam.startDate.split("T")[0];
    const examEnd = exam.endDate.split("T")[0];

    const papersState = (exam.subjects || []).map((sub) => {
      const initialDate = sub.examDate ? sub.examDate.split("T")[0] : "";

      return {
        id: sub.id,
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode,
        maxMarks: sub.maxMarks,
        passMarks: sub.passMarks,
        examDate: initialDate,
        startTime: sub.startTime || defaultStartTime,
        endTime: sub.endTime || defaultEndTime,
        roomNumber: sub.roomNumber || "",
      };
    });

    setTimetableModalState({
      isOpen: true,
      exam,
      isReschedule,
      papers: papersState,
      isLoading: false,
      globalError: null,
    });
  };

  // Save Timetable (Schedule / Reschedule)
  const handleSaveTimetable = async () => {
    if (!timetableModalState.exam) return;
    const exam = timetableModalState.exam;
    const examStart = exam.startDate.split("T")[0];
    const examEnd = exam.endDate.split("T")[0];
    let hasErrors = false;

    const updatedPapers = timetableModalState.papers.map((p) => {
      let error: string | undefined;
      if (!p.examDate) {
        error = "Examination date is required.";
        hasErrors = true;
      } else if (p.examDate < examStart || p.examDate > examEnd) {
        error = `Exam date must fall between ${examStart} and ${examEnd}.`;
        hasErrors = true;
      } else if (!p.startTime || !p.endTime) {
        error = "Start and End times are required.";
        hasErrors = true;
      } else if (p.startTime >= p.endTime) {
        error = "Start time must be earlier than End time.";
        hasErrors = true;
      }

      return { ...p, error };
    });

    if (hasErrors) {
      setTimetableModalState((prev) => ({
        ...prev,
        papers: updatedPapers,
        globalError: "Please fix the highlighted timetable validation errors before proceeding.",
      }));
      return;
    }

    setTimetableModalState((prev) => ({
      ...prev,
      papers: updatedPapers,
      isLoading: true,
      globalError: null,
    }));

    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isReschedule: timetableModalState.isReschedule,
          papers: timetableModalState.papers.map((p) => ({
            id: p.id,
            examDate: p.examDate,
            startTime: p.startTime,
            endTime: p.endTime,
            roomNumber: p.roomNumber || undefined,
          })),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to schedule examination timetable.");
      }

      const refreshRes = await fetch("/api/exams");
      if (refreshRes.ok) {
        const updatedData = await refreshRes.json();
        setExams(updatedData.exams || []);
      }

      setTimetableModalState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (err: any) {
      console.error("Timetable scheduling error:", err);
      setTimetableModalState((prev) => ({
        ...prev,
        isLoading: false,
        globalError: err.message || "Failed to schedule timetable.",
      }));
    }
  };

  // Marks Entry State
  const [activePaper, setActivePaper] = useState<SubjectPaperItem | null>(null);
  const [activePaperExam, setActivePaperExam] = useState<ExamItem | null>(null);
  const [marksRoster, setMarksRoster] = useState<StudentRosterItem[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [marksSaveMessage, setMarksSaveMessage] = useState<string | null>(null);
  const [marksErrorMessage, setMarksErrorMessage] = useState<string | null>(null);

  // Report Card State
  const [reportCardData, setReportCardData] = useState<ScopedReportCardData | null>(
    initialReportCard || null
  );
  const [rcSelectedExamId, setRcSelectedExamId] = useState<string>(
    initialExams[0]?.id || ""
  );
  const [rcSelectedStudentId, setRcSelectedStudentId] = useState<string>(
    students[0]?.id || ""
  );
  const [isLoadingReportCard, setIsLoadingReportCard] = useState(false);

  // Schedule Exam Form State
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    examType: "UNIT_TEST",
    academicYearId: academicYears[0]?.id || "",
    classId: classes[0]?.id || "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    selectedSubjectIds: subjects.slice(0, 3).map((s) => s.id),
  });

  const canManageLifecycle = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HOD",
    "TEACHER",
  ].includes(currentUser.roleCode || "");

  // Filter exams
  const filteredExams = exams.filter((e) => {
    const matchesStatus =
      selectedStatusFilter === "ALL" ||
      e.status === selectedStatusFilter ||
      (selectedStatusFilter === "SCHEDULED" && e.status === "UPCOMING");
    const matchesType =
      selectedTypeFilter === "ALL" || e.examType === selectedTypeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.examTypeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.targetClasses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.subjects.some((s) => s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Open Marks Entry Modal for a Paper
  const handleOpenMarksEntry = async (paper: SubjectPaperItem, parentExam: ExamItem) => {
    setActivePaper(paper);
    setActivePaperExam(parentExam);
    setIsMarksEntryModalOpen(true);
    setIsLoadingRoster(true);
    setMarksSaveMessage(null);
    setMarksErrorMessage(null);

    try {
      const res = await fetch(`/api/exams/papers/${paper.id}/marks`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to load marks roster");
      }
      const data = await res.json();
      setMarksRoster(data.students || []);
    } catch (err: any) {
      console.error("Failed to load paper roster:", err);
      setMarksErrorMessage(err.message || "Failed to load student roster");
    } finally {
      setIsLoadingRoster(false);
    }
  };

  // Open Manage Exam Page
  const handleOpenManageExam = (exam: ExamItem) => {
    setNavigatingExamId(exam.id);
    router.push(`/academics/exams/${exam.id}`);
  };

  // Initiate Lifecycle Transition Confirmation
  const promptStatusTransition = (exam: ExamItem, nextStatus: string) => {
    let title = `Update Status to ${nextStatus}`;
    let description = `Are you sure you want to transition ${exam.name} to ${nextStatus}?`;
    let confirmButtonText = "Confirm";
    let requiresReason = false;
    let newStartDate = exam.startDate.split("T")[0];
    let newEndDate = exam.endDate.split("T")[0];

    if (nextStatus === "SCHEDULED") {
      if (exam.status === "DRAFT") {
        title = "Schedule Examination";
        description =
          "Scheduling will finalize the configured papers and timetable and publish the examination schedule.";
        confirmButtonText = "Confirm & Schedule";
      } else {
        title = "Reschedule Examination";
        description =
          "This will reschedule the examination cycle and publish updated timetable dates.";
        confirmButtonText = "Confirm & Reschedule";
      }
    } else if (nextStatus === "ONGOING") {
      title = "Start Examination";
      description =
        "This marks the examination as actively in session across target cohorts.";
      confirmButtonText = "Start Examination";
    } else if (nextStatus === "COMPLETED") {
      title = "Complete Examination";
      description =
        "This marks all papers as concluded and transitions the assessment cycle into marks evaluation mode.";
      confirmButtonText = "Complete Examination";
    } else if (nextStatus === "RESULTS_IN_PROGRESS") {
      title = "Initiate Results Processing";
      description =
        "This authorizes assigned subject faculty to enter, verify, and draft marks for all enrolled candidates.";
      confirmButtonText = "Start Processing";
    } else if (nextStatus === "RESULTS_VERIFIED") {
      if (exam.status === "PUBLISHED") {
        title = "Reopen Assessment Results";
        description =
          "Reopening a published assessment unlocks marks ledgers for authorized amendments. A documented administrative reason is required.";
        requiresReason = true;
        confirmButtonText = "Reopen Results";
      } else {
        title = "Verify Assessment Results";
        description =
          "This confirms all subject marks are entered, reviewed by class tutors, and verified for official declaration.";
        confirmButtonText = "Verify Results";
      }
    } else if (nextStatus === "PUBLISHED") {
      title = "Publish Official Results";
      description =
        "This publishes official marks and locks the assessment ledgers from regular teacher edits. Official report cards will become accessible.";
      confirmButtonText = "Publish Results";
    } else if (nextStatus === "POSTPONED") {
      title = "Postpone Examination";
      description =
        "This defers scheduled assessment papers while preserving existing candidate configuration and timetable records.";
      confirmButtonText = "Postpone Examination";
    } else if (nextStatus === "CANCELLED") {
      title = "Cancel Examination";
      description =
        "This examination will be cancelled and retained for historical and compliance purposes.";
      requiresReason = true;
      confirmButtonText = "Cancel Examination";
    } else if (nextStatus === "DRAFT") {
      title = "Return to Draft";
      description =
        "Returning to Draft will unpublish the schedule and allow configuration changes.";
      confirmButtonText = "Return to Draft";
    }

    setStatusConfirmState({
      isOpen: true,
      examId: exam.id,
      examName: exam.name,
      targetStatus: nextStatus,
      title,
      description,
      requiresReason,
      reasonText: "",
      confirmButtonText,
      newStartDate,
      newEndDate,
      isLoading: false,
      errorMessage: null,
    });
  };

  // Execute Lifecycle Transition
  const executeStatusTransition = async () => {
    if (statusConfirmState.requiresReason && !statusConfirmState.reasonText.trim()) {
      setStatusConfirmState((prev) => ({
        ...prev,
        errorMessage: "A mandatory administrative reason is required to reopen published results.",
      }));
      return;
    }

    setStatusConfirmState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

    try {
      const res = await fetch(`/api/exams/${statusConfirmState.examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusConfirmState.targetStatus,
          reason: statusConfirmState.reasonText || undefined,
          startDate: statusConfirmState.newStartDate || undefined,
          endDate: statusConfirmState.newEndDate || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to update assessment status.");
      }

      // Refresh examinations
      const refreshRes = await fetch("/api/exams");
      if (refreshRes.ok) {
        const updatedData = await refreshRes.json();
        setExams(updatedData.exams || []);
      }

      setStatusConfirmState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (err: any) {
      console.error("Transition error:", err);
      setStatusConfirmState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: err.message || "Failed to transition assessment status.",
      }));
    }
  };

  // Prompt Delete Examination with Dependency Validation (Super Admin, Inst Admin, Creator)
  const promptDeleteExam = (exam: ExamItem) => {
    let isSafe = true;
    let reasonUnsafe: string | undefined;

    if (exam.status !== "DRAFT") {
      isSafe = false;
      reasonUnsafe = `This examination is in "${exam.status}" status. Only DRAFT examinations with no recorded student marks can be permanently deleted. For scheduled, ongoing, or completed assessments, please use "Cancel Examination" to safely withdraw it while preserving historical records.`;
    } else if (exam.totalEnteredMarks > 0) {
      isSafe = false;
      reasonUnsafe = `Cannot delete this examination because marks have already been recorded for ${exam.totalEnteredMarks} student(s).`;
    }

    setDeleteModalState({
      isOpen: true,
      exam,
      isSafeToDelete: isSafe,
      reasonUnsafe,
      isLoading: false,
      errorMessage: null,
    });
  };

  // Execute Safe Delete (Creator, Inst Admin, Super Admin)
  const executeDeleteExam = async () => {
    if (!deleteModalState.exam) return;
    setDeleteModalState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
    try {
      const res = await fetch(`/api/exams/${deleteModalState.exam.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete examination.");
      }

      // Refresh examinations
      const refreshRes = await fetch("/api/exams");
      if (refreshRes.ok) {
        const updatedData = await refreshRes.json();
        setExams(updatedData.exams || []);
      }

      setDeleteModalState((prev) => ({ ...prev, isOpen: false, isLoading: false, exam: null }));
    } catch (err: any) {
      console.error("Delete draft exam error:", err);
      setDeleteModalState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: err.message || "Failed to delete examination.",
      }));
    }
  };

  // Handle Mark Change in Roster
  const handleStudentMarkChange = (studentId: string, value: string) => {
    setMarksRoster((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        if (value === "") {
          return { ...s, marksObtained: null, grade: null, isAbsent: false };
        }
        const numeric = parseFloat(value);
        if (isNaN(numeric)) return s;
        const maxM = activePaper?.maxMarks || 100;
        const bounded = Math.max(0, Math.min(maxM, numeric));
        const autoGrade = calculateGrade(bounded, maxM);
        return { ...s, marksObtained: bounded, grade: autoGrade, isAbsent: false };
      })
    );
  };

  // Handle Absent Toggle
  const handleAbsentToggle = (studentId: string) => {
    setMarksRoster((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        const willBeAbsent = !s.isAbsent;
        return {
          ...s,
          isAbsent: willBeAbsent,
          marksObtained: willBeAbsent ? 0 : s.marksObtained,
          grade: willBeAbsent
            ? "AB"
            : calculateGrade(s.marksObtained || 0, activePaper?.maxMarks || 100),
        };
      })
    );
  };

  // Handle Student Remarks Change
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  // Save or Finalize Marks
  const handleSaveMarks = async (finalize = false) => {
    if (!activePaper) return;
    setIsSavingMarks(true);
    setMarksSaveMessage(null);
    setMarksErrorMessage(null);

    try {
      const payload = {
        sectionId: selectedSectionFilter !== "ALL" ? selectedSectionFilter : undefined,
        finalize,
        marks: marksRoster.map((r) => ({
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          isAbsent: r.isAbsent,
          remarks: r.remarks,
        })),
      };

      const res = await fetch(`/api/exams/papers/${activePaper.id}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to save marks");
      }

      const resData = await res.json();
      setMarksSaveMessage(resData.message || "Marks saved successfully.");

      // Refresh exams list from server
      const refreshRes = await fetch("/api/exams");
      if (refreshRes.ok) {
        const updatedData = await refreshRes.json();
        setExams(updatedData.exams || []);
      }

      if (finalize) {
        setTimeout(() => {
          setIsMarksEntryModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Save marks error:", err);
      setMarksErrorMessage(err.message || "Failed to save marks.");
    } finally {
      setIsSavingMarks(false);
    }
  };

  // Open Scoped Report Card
  const handleOpenReportCard = async (examId?: string, studentId?: string) => {
    const targetExamId = examId || rcSelectedExamId || exams[0]?.id;
    const targetStudentId = studentId || rcSelectedStudentId || students[0]?.id;

    setRcSelectedExamId(targetExamId);
    setRcSelectedStudentId(targetStudentId);
    setIsReportCardModalOpen(true);
    setIsLoadingReportCard(true);

    try {
      if (targetExamId && targetStudentId) {
        const res = await fetch(
          `/api/exams/report-cards?examId=${targetExamId}&studentId=${targetStudentId}`
        );
        if (res.ok) {
          const data = await res.json();
          setReportCardData(data);
        }
      }
    } catch (err) {
      console.error("Report card fetch error:", err);
    } finally {
      setIsLoadingReportCard(false);
    }
  };

  // Submit New Schedule Form (Starts as DRAFT)
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSchedule(true);
    setScheduleError(null);

    try {
      const selectedClass = classes.find((c) => c.id === scheduleForm.classId) || classes[0];
      const papers = scheduleForm.selectedSubjectIds.map((subId) => ({
        subjectId: subId,
        classId: selectedClass?.id,
        examDate: null,
        startTime: "09:00",
        endTime: "12:00",
        maxMarks: 100,
        passMarks: 40,
      }));

      const payload = {
        name: scheduleForm.name,
        examType: scheduleForm.examType,
        academicYearId: scheduleForm.academicYearId || undefined,
        classId: selectedClass?.id,
        startDate: scheduleForm.startDate,
        endDate: scheduleForm.endDate,
        papers,
      };

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to schedule assessment");
      }

      setScheduleSuccess(true);
      const refreshRes = await fetch("/api/exams");
      if (refreshRes.ok) {
        const updatedData = await refreshRes.json();
        setExams(updatedData.exams || []);
      }

      setTimeout(() => {
        setIsScheduleModalOpen(false);
        setScheduleSuccess(false);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error("Schedule error:", err);
      setScheduleError(err.message || "Failed to schedule exam");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Scholastic Evaluation"
        title="Exams & Academic Assessments"
        description="Term assessments, paper schedules, grading blueprints, marks evaluation, and official report cards."
        actions={
          <div className="flex items-center gap-2">
            {exams.length > 0 && students.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReportCard()}
                leftIcon={<Award className="h-3.5 w-3.5 text-primary" />}
              >
                Report Cards
              </Button>
            )}
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => {
                setScheduleForm({
                  name: "Term 1 Unit Test 1",
                  examType: "UNIT_TEST",
                  academicYearId: academicYears[0]?.id || "",
                  classId: classes[0]?.id || "",
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  selectedSubjectIds: subjects.slice(0, 3).map((s) => s.id),
                });
                setIsScheduleModalOpen(true);
              }}
            >
              + Create Examination
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total Examinations
          </div>
          <div className="mt-1 text-2xl font-bold text-foreground">{stats.totalExams}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Configured assessment cycles</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Scheduled & Upcoming
          </div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {stats.scheduledExams ?? 0}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Papers on academic timetable</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Active / Ongoing
          </div>
          <div className="mt-1 text-2xl font-bold text-primary">
            {stats.ongoingExams ?? 0}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Currently administered cycles</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Results Status
          </div>
          <div className="mt-1 text-base font-bold text-foreground flex items-center gap-1.5 pt-1">
            <span className="text-warning font-mono">{stats.resultsPending ?? 0} Pending</span>
            <span>·</span>
            <span className="text-success font-mono">{stats.resultsPublished ?? 0} Published</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Evaluation & report status</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-2.5 rounded-xl border border-border shadow-xs">
        {/* Dominant Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search examinations by title, type, cohort, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Compact Filter Popover & Active Filter Tags */}
        <div className="relative flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Active Status Filter Chip */}
          {selectedStatusFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-semibold border border-primary/20">
              Status: {selectedStatusFilter}
              <button
                type="button"
                onClick={() => setSelectedStatusFilter("ALL")}
                className="hover:text-primary/70 p-0.5"
                title="Clear status filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          {/* Active Type Filter Chip */}
          {selectedTypeFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-semibold border border-primary/20">
              Type: {EXAM_TYPES.find((t) => t.code === selectedTypeFilter)?.label || selectedTypeFilter}
              <button
                type="button"
                onClick={() => setSelectedTypeFilter("ALL")}
                className="hover:text-primary/70 p-0.5"
                title="Clear type filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                selectedStatusFilter !== "ALL" || selectedTypeFilter !== "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedStatusFilter !== "ALL" || selectedTypeFilter !== "ALL") && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-popover border border-border shadow-2xl z-40 p-4 space-y-4 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                      Filter Examinations
                    </span>
                    {(selectedStatusFilter !== "ALL" || selectedTypeFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatusFilter("ALL");
                          setSelectedTypeFilter("ALL");
                        }}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Status Group */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      Examination Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {[
                        { code: "ALL", label: "All Statuses" },
                        { code: "DRAFT", label: "Draft" },
                        { code: "SCHEDULED", label: "Scheduled" },
                        { code: "ONGOING", label: "Ongoing" },
                        { code: "COMPLETED", label: "Completed" },
                        { code: "RESULTS_IN_PROGRESS", label: "In Progress" },
                        { code: "RESULTS_VERIFIED", label: "Verified" },
                        { code: "PUBLISHED", label: "Published" },
                        { code: "POSTPONED", label: "Postponed" },
                        { code: "CANCELLED", label: "Cancelled" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setSelectedStatusFilter(item.code)}
                          className={`text-left px-2 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                            selectedStatusFilter === item.code
                              ? "bg-primary text-primary-foreground font-bold"
                              : "bg-muted/50 text-foreground hover:bg-muted"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam Type Group */}
                  <div className="space-y-1.5 border-t border-border pt-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      Assessment Type
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => setSelectedTypeFilter("ALL")}
                        className={`text-left px-2 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                          selectedTypeFilter === "ALL"
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        }`}
                      >
                        All Types
                      </button>
                      {EXAM_TYPES.map((t) => (
                        <button
                          key={t.code}
                          type="button"
                          onClick={() => setSelectedTypeFilter(t.code)}
                          className={`text-left px-2 py-1.5 rounded-md text-[11px] font-mono transition-colors truncate cursor-pointer ${
                            selectedTypeFilter === t.code
                              ? "bg-primary text-primary-foreground font-bold"
                              : "bg-muted/50 text-foreground hover:bg-muted"
                          }`}
                          title={t.label}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Exam Schedules List (2-column Grid on Desktop) */}
      <div>
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-bold text-foreground">No examinations found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || selectedStatusFilter !== "ALL" || selectedTypeFilter !== "ALL"
                ? "No examinations match your search criteria or active filters."
                : "Schedule a Half-Yearly, Mid-Term, or Unit Test examination in the academic calendar to configure subject papers, assign faculty evaluators, and process marks."}
            </p>
            {searchQuery || selectedStatusFilter !== "ALL" || selectedTypeFilter !== "ALL" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatusFilter("ALL");
                  setSelectedTypeFilter("ALL");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsScheduleModalOpen(true)}
              >
                + Create Examination
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam) => {
              const isSuperAdmin = currentUser.roleCode === "SUPER_ADMIN";
              const isInstAdmin =
                isSuperAdmin ||
                ["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "HOD", "EXAM_COORDINATOR"].includes(
                  currentUser.roleCode || ""
                );
              const isExamCreator = Boolean(
                exam.createdById &&
                  (exam.createdById === currentUser.id ||
                    (currentUser.teacherId && exam.createdById === currentUser.teacherId))
              );
              const canDoOperational = isExamCreator || isInstAdmin;
              const canCancel = isInstAdmin && exam.status !== "CANCELLED";
              const canDelete = isSuperAdmin || isInstAdmin || isExamCreator;
              const isNavigating = navigatingExamId === exam.id;

              return (
                <div
                  key={exam.id}
                  onClick={() => handleOpenManageExam(exam)}
                  className={`cursor-pointer rounded-xl border border-border bg-card shadow-2xs hover:border-accent/40 hover:shadow-sm transition-all duration-150 p-4 flex flex-col justify-between gap-3 group relative ${
                    isNavigating ? "ring-2 ring-primary/40 opacity-80" : ""
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Eyebrow + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                          {exam.examTypeLabel}
                        </span>
                        <span className="text-muted-foreground text-[10px]">•</span>
                        <span className="text-[11px] font-medium text-muted-foreground font-mono">
                          {exam.academicYearName}
                          {exam.termName ? ` · ${exam.termName}` : ""}
                        </span>
                      </div>

                      {/* Compact Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                          exam.status === "PUBLISHED"
                            ? "bg-success-subtle text-success border-success-border"
                            : exam.status === "RESULTS_VERIFIED"
                            ? "bg-success-subtle text-success border-success-border"
                            : exam.status === "RESULTS_IN_PROGRESS"
                            ? "bg-info-subtle text-info border-info-border"
                            : exam.status === "ONGOING"
                            ? "bg-warning-subtle text-warning border-warning-border"
                            : exam.status === "COMPLETED"
                            ? "bg-muted text-foreground border-border"
                            : exam.status === "POSTPONED"
                            ? "bg-accent-subtle text-accent border-accent/20"
                            : exam.status === "CANCELLED"
                            ? "bg-destructive-subtle text-destructive border-destructive-border"
                            : "bg-muted/60 text-muted-foreground border-border"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {exam.status}
                      </span>
                    </div>

                    {/* Title & Creator */}
                    <div>
                      <h3 className="text-sm font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {exam.name}
                      </h3>
                      {exam.createdByName && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          by <span className="font-semibold text-foreground">{exam.createdByName}</span>
                          {isExamCreator && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              You (Creator)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cohort & Schedule Line */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
                      {exam.targetClasses.length > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
                          <span className="truncate max-w-[160px]">{exam.targetClasses.join(", ")}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-primary/70" />
                        {formatDate(exam.startDate)} → {formatDate(exam.endDate)}
                      </span>
                    </div>

                    {/* Papers Count & Evaluation Summary */}
                    <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/50 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground font-mono">
                        {exam.papersCount} {exam.papersCount === 1 ? "Paper" : "Papers"}
                      </span>
                      {exam.subjects.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-muted-foreground truncate max-w-[180px]" title={exam.subjects.map(s => s.subjectName).join(", ")}>
                            {exam.subjects.slice(0, 2).map((s) => s.subjectName).join(", ")}
                            {exam.subjects.length > 2 ? ` +${exam.subjects.length - 2} more` : ""}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {exam.totalEnteredMarks === 0 ? (
                          <span className="text-muted-foreground">Evaluation not started</span>
                        ) : (
                          <span>
                            Evaluation: <strong className="text-foreground">{exam.totalEnteredMarks}</strong> / {exam.totalExpectedMarks} ({exam.progressPct}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Summary Card Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isNavigating}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManageExam(exam);
                      }}
                      leftIcon={<ClipboardEdit className="h-3.5 w-3.5 text-primary" />}
                    >
                      Manage Exam
                    </Button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuExamId(openMenuExamId === exam.id ? null : exam.id);
                        }}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                        title="More Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {openMenuExamId === exam.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuExamId(null);
                            }}
                          />
                          <div
                            className="absolute right-0 bottom-full mb-1 w-52 rounded-xl bg-popover border border-border shadow-xl z-30 py-1 text-xs divide-y divide-border"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              {exam.subjects.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuExamId(null);
                                    handleOpenMarksEntry(exam.subjects[0], exam);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                  Enter Subject Marks
                                </button>
                              )}
                              {students.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuExamId(null);
                                    handleOpenReportCard(exam.id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-600" />
                                  Report Cards
                                </button>
                              )}
                            </div>

                            {/* Lifecycle quick triggers */}
                            {canDoOperational && (
                              <div className="py-1">
                                {exam.status === "DRAFT" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuExamId(null);
                                      openTimetableScheduler(exam, false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    Schedule Examination
                                  </button>
                                )}
                                {(exam.status === "SCHEDULED" || exam.status === "UPCOMING") && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        promptStatusTransition(exam, "ONGOING");
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5 text-primary" />
                                      Start Examination
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        openTimetableScheduler(exam, true);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                    >
                                      <Calendar className="w-3.5 h-3.5 text-primary" />
                                      Reschedule Examination
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        promptStatusTransition(exam, "POSTPONED");
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                      Postpone Examination
                                    </button>
                                  </>
                                )}
                                {exam.status === "ONGOING" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        promptStatusTransition(exam, "COMPLETED");
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                      Complete Examination
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        openTimetableScheduler(exam, true);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                    >
                                      <Calendar className="w-3.5 h-3.5 text-primary" />
                                      Reschedule Examination
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuExamId(null);
                                        promptStatusTransition(exam, "POSTPONED");
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                      Postpone Examination
                                    </button>
                                  </>
                                )}
                                {exam.status === "POSTPONED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuExamId(null);
                                      openTimetableScheduler(exam, true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2 text-primary font-semibold cursor-pointer"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    Reschedule Examination
                                  </button>
                                )}
                              </div>
                            )}

                            {canCancel && (
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuExamId(null);
                                    promptStatusTransition(exam, "CANCELLED");
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Cancel Examination
                                </button>
                              </div>
                            )}

                            {canDelete && (
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuExamId(null);
                                    promptDeleteExam(exam);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  Delete Examination
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lifecycle Status Confirmation Modal */}
      {statusConfirmState.isOpen && (
        <Modal
          isOpen={statusConfirmState.isOpen}
          onClose={() =>
            setStatusConfirmState((prev) => ({ ...prev, isOpen: false, errorMessage: null }))
          }
          title={statusConfirmState.title}
          description={statusConfirmState.examName}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-foreground leading-relaxed">{statusConfirmState.description}</p>

            {/* Postpone date adjustment */}
            {statusConfirmState.targetStatus === "POSTPONED" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-card rounded-lg border border-border">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Rescheduled Start Date
                  </label>
                  <input
                    type="date"
                    value={statusConfirmState.newStartDate || ""}
                    onChange={(e) =>
                      setStatusConfirmState((prev) => ({
                        ...prev,
                        newStartDate: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Rescheduled End Date
                  </label>
                  <input
                    type="date"
                    value={statusConfirmState.newEndDate || ""}
                    onChange={(e) =>
                      setStatusConfirmState((prev) => ({
                        ...prev,
                        newEndDate: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            {statusConfirmState.requiresReason && (
              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground">
                  {statusConfirmState.targetStatus === "CANCELLED"
                    ? "Reason for Cancellation *"
                    : "Reason for Reopening Assessment *"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusConfirmState.reasonText}
                  onChange={(e) =>
                    setStatusConfirmState((prev) => ({
                      ...prev,
                      reasonText: e.target.value,
                    }))
                  }
                  placeholder={
                    statusConfirmState.targetStatus === "CANCELLED"
                      ? "State the reason for cancelling this examination cycle (required for institutional audit logs)..."
                      : "State the administrative justification for unlocking published marks..."
                  }
                  className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {statusConfirmState.errorMessage && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {statusConfirmState.errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setStatusConfirmState((prev) => ({ ...prev, isOpen: false, errorMessage: null }))
                }
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={statusConfirmState.targetStatus === "CANCELLED" ? "danger" : "primary"}
                isLoading={statusConfirmState.isLoading}
                onClick={executeStatusTransition}
              >
                {statusConfirmState.confirmButtonText || (statusConfirmState.targetStatus === "CANCELLED" ? "Cancel Examination" : "Confirm")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shared Unified Delete Exam Confirmation Modal */}
      <DeleteExamModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState((prev) => ({ ...prev, isOpen: false, errorMessage: null }))
        }
        exam={deleteModalState.exam}
        isSafeToDelete={deleteModalState.isSafeToDelete}
        reasonUnsafe={deleteModalState.reasonUnsafe}
        canCancel={isInstAdmin}
        isLoading={deleteModalState.isLoading}
        errorMessage={deleteModalState.errorMessage}
        onConfirmDelete={executeDeleteExam}
        onRequestCancelAlternative={(targetExam) => {
          if (targetExam) {
            promptStatusTransition(targetExam, "CANCELLED");
          }
        }}
      />

      {/* Marks Entry Modal */}
      {isMarksEntryModalOpen && activePaper && (
        <Modal
          isOpen={isMarksEntryModalOpen}
          onClose={() => setIsMarksEntryModalOpen(false)}
          title={`Marks Entry: ${activePaper.subjectName}`}
          description={`${activePaperExam?.name || "Assessment"} • Class: ${activePaper.className} • Max Marks: ${activePaper.maxMarks} • Pass Marks: ${activePaper.passMarks}`}
          size="xl"
        >
          <div className="space-y-4 text-xs">
            {/* Section & Scope Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase text-muted-foreground">
                  Filter Section:
                </span>
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground font-mono"
                >
                  <option value="ALL">All Sections</option>
                  {activePaper.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      Section {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] font-mono text-muted-foreground">
                Total Candidates: <span className="font-bold text-foreground">{marksRoster.length}</span>
              </div>
            </div>

            {/* Notification messages */}
            {marksSaveMessage && (
              <div className="p-3 rounded-lg bg-success/15 text-success border border-success/30 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                <span>{marksSaveMessage}</span>
              </div>
            )}
            {marksErrorMessage && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
                <span>{marksErrorMessage}</span>
              </div>
            )}

            {/* Student Roster Marks Table */}
            {isLoadingRoster ? (
              <div className="p-12 text-center text-muted-foreground font-mono">
                Loading student marks ledger...
              </div>
            ) : marksRoster.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-border text-muted-foreground">
                No students enrolled in this class or section.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card font-mono text-[11px] uppercase tracking-wider text-muted-foreground sticky top-0 border-b border-border z-10">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Roll</th>
                      <th className="py-2.5 px-3 font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold">Sec</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-28">
                        Marks (Max: {activePaper.maxMarks})
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-center w-16">Grade</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-20">Absent</th>
                      <th className="py-2.5 px-3 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {marksRoster
                      .filter(
                        (s) =>
                          selectedSectionFilter === "ALL" || s.sectionId === selectedSectionFilter
                      )
                      .map((student) => (
                        <tr key={student.studentId} className="hover:bg-card/50 transition-colors">
                          <td className="py-2 px-3 font-mono text-muted-foreground">
                            #{student.rollNumber}
                          </td>
                          <td className="py-2 px-3 font-medium text-foreground">
                            <div>{student.fullName}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {student.admissionNumber}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">
                            {student.sectionName}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={activePaper.maxMarks}
                              step="0.5"
                              disabled={student.isAbsent}
                              value={student.marksObtained !== null ? student.marksObtained : ""}
                              onChange={(e) =>
                                handleStudentMarkChange(student.studentId, e.target.value)
                              }
                              placeholder="—"
                              className={`w-20 text-center font-mono font-bold py-1 px-2 rounded border focus:outline-none focus:ring-1 focus:ring-accent ${
                                student.isAbsent
                                  ? "bg-muted text-muted-foreground border-border opacity-50"
                                  : "border-border bg-background text-foreground"
                              }`}
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`font-mono font-bold text-xs ${
                                student.grade === "F" || student.grade === "AB"
                                  ? "text-destructive"
                                  : "text-success"
                              }`}
                            >
                              {student.grade || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleAbsentToggle(student.studentId)}
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border transition-colors ${
                                student.isAbsent
                                  ? "bg-destructive/15 text-destructive border-destructive/30"
                                  : "bg-card text-muted-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {student.isAbsent ? "ABSENT" : "Present"}
                            </button>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={student.remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(student.studentId, e.target.value)
                              }
                              placeholder="Optional evaluation note..."
                              className="w-full text-xs py-1 px-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMarksEntryModalOpen(false)}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isSavingMarks}
                  onClick={() => handleSaveMarks(false)}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  isLoading={isSavingMarks}
                  onClick={() => handleSaveMarks(true)}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Submit & Finalize Marks
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Scoped Report Card Modal */}
      {isReportCardModalOpen && (
        <Modal
          isOpen={isReportCardModalOpen}
          onClose={() => setIsReportCardModalOpen(false)}
          title="Official Academic Report Card"
          description="Institutional Grade Assessment & Performance Evaluation (Print-Ready Report Card)."
          size="xl"
        >
          <div className="space-y-6">
            {/* Scoped Selector Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-card rounded-lg border border-border text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                  Select Assessment Cycle:
                </label>
                <select
                  value={rcSelectedExamId}
                  onChange={(e) => {
                    setRcSelectedExamId(e.target.value);
                    handleOpenReportCard(e.target.value, rcSelectedStudentId);
                  }}
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground font-semibold"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.examTypeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                  Select Student:
                </label>
                <select
                  value={rcSelectedStudentId}
                  onChange={(e) => {
                    setRcSelectedStudentId(e.target.value);
                    handleOpenReportCard(rcSelectedExamId, e.target.value);
                  }}
                  className="w-full rounded border border-border bg-background p-1.5 text-xs text-foreground font-semibold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoadingReportCard ? (
              <div className="p-16 text-center text-muted-foreground font-mono">
                Generating official student performance report card...
              </div>
            ) : !reportCardData ? (
              <div className="p-12 text-center text-muted-foreground rounded-lg border border-dashed border-border">
                No report card records available for the selected student in this assessment.
              </div>
            ) : (
              /* Printable Report Card */
              <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                {/* Institution Header */}
                <div className="text-center border-b border-foreground pb-4 space-y-1">
                  <div className="text-base font-extrabold tracking-tight text-foreground uppercase">
                    {reportCardData.institution.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Affiliated to CBSE • Institutional Assessment Wing • {reportCardData.institution.city},{" "}
                    {reportCardData.institution.state}
                  </div>
                  <div className="text-xs font-mono font-bold text-foreground uppercase tracking-widest pt-1">
                    {reportCardData.exam.name} ({reportCardData.exam.academicYearName})
                  </div>
                </div>

                {/* Student Demographics Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card p-3.5 rounded-lg text-xs border border-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      Student Name
                    </span>
                    <div className="font-bold text-foreground">{reportCardData.student.fullName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      Admission No
                    </span>
                    <div className="font-mono font-bold text-foreground">
                      {reportCardData.student.admissionNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      Class & Section
                    </span>
                    <div className="font-bold text-foreground">
                      {reportCardData.student.className} ({reportCardData.student.sectionName})
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      Roll Number
                    </span>
                    <div className="font-mono font-bold text-foreground">
                      #{reportCardData.student.rollNumber}
                    </div>
                  </div>
                </div>

                {/* Scholastic Performance Table */}
                <div className="overflow-hidden border border-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-card font-mono text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Subject Name</th>
                        <th className="py-2.5 px-3 text-center font-semibold">Max Marks</th>
                        <th className="py-2.5 px-3 text-center font-semibold">Marks Obtained</th>
                        <th className="py-2.5 px-3 text-center font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b divide-border">
                      {reportCardData.marks.map((m, idx) => (
                        <tr key={idx} className="hover:bg-card/50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-foreground">{m.subjectName}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                            {m.maxMarks}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                            {m.isAbsent ? "ABSENT" : m.marksObtained}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-mono font-bold text-primary">{m.grade}</span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-card font-bold text-xs border-t border-foreground">
                        <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-foreground">
                          Grand Total & Percentage
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-foreground">
                          {reportCardData.summary.totalMaxMarks}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-foreground">
                          {reportCardData.summary.totalMarksObtained} (
                          {reportCardData.summary.overallPercentage}%)
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-primary font-bold">
                          {reportCardData.summary.overallGrade}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Attendance & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      Class Tutor Remarks ({reportCardData.student.classTeacherName})
                    </span>
                    <p className="text-foreground italic">
                      &quot;Demonstrates active academic diligence, strong scholastic aptitude, and consistent class participation.&quot;
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      Institutional Attendance Record
                    </span>
                    <div className="text-foreground font-mono font-bold">
                      {reportCardData.student.attendancePct}% Term Attendance Record
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Result: {reportCardData.summary.resultStatus}
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between pt-8 text-xs font-mono text-muted-foreground">
                  <div className="text-center">
                    <div className="w-32 border-b border-border mb-1" />
                    Class Tutor
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-border mb-1" />
                    Exam Controller
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-border mb-1" />
                    Principal
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsReportCardModalOpen(false)}>
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

      {/* Create Examination Modal (Initializes as DRAFT) */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Create Examination Cycle"
          description="Configure a new Unit Test, Mid-Term, or Board assessment in the academic calendar."
          size="md"
        >
          {scheduleSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-card border border-primary text-primary flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Examination Draft Created</h4>
              <p className="text-xs text-muted-foreground">
                Assessment blueprint initialized in DRAFT status. You can now schedule papers, assign faculty, or publish to timetable.
              </p>
            </div>
          ) : (
            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {scheduleError && (
                <div className="p-2.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {scheduleError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Examination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1 (or Term 1 Half-Yearly 2026)"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Name of the examination cycle (e.g. Unit Test 1). Subject papers are selected below.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Assessment Type *</label>
                  <select
                    value={scheduleForm.examType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, examType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Target Cohort/Class *</label>
                  <select
                    value={scheduleForm.classId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.startDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.endDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Include Subject Papers in Blueprint:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-card rounded-lg border border-border">
                  {subjects.map((s) => {
                    const isSelected = scheduleForm.selectedSubjectIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 text-[11px] text-foreground cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScheduleForm({
                                ...scheduleForm,
                                selectedSubjectIds: [...scheduleForm.selectedSubjectIds, s.id],
                              });
                            } else {
                              setScheduleForm({
                                ...scheduleForm,
                                selectedSubjectIds: scheduleForm.selectedSubjectIds.filter(
                                  (id) => id !== s.id
                                ),
                              });
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmittingSchedule}>
                  Create Examination Draft
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Paper Timetable Scheduling / Rescheduling Modal */}
      {timetableModalState.isOpen && timetableModalState.exam && (
        <Modal
          isOpen={timetableModalState.isOpen}
          onClose={() =>
            setTimetableModalState((prev) => ({ ...prev, isOpen: false, globalError: null }))
          }
          title={
            timetableModalState.isReschedule
              ? "Reschedule Examination Timetable"
              : "Schedule Examination Timetable"
          }
          description={`Configure official paper dates and examination slots for ${timetableModalState.exam.name}`}
          size="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Examination Period Card */}
            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Overall Examination Period
                </span>
                <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary font-mono text-[11px] font-bold">
                  {formatDate(timetableModalState.exam.startDate)} → {formatDate(timetableModalState.exam.endDate)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every paper must be scheduled on an actual examination date within this overall window ({timetableModalState.exam.startDate.split("T")[0]} to {timetableModalState.exam.endDate.split("T")[0]}). Start time must precede end time.
              </p>
            </div>

            {/* Timetable Papers Form */}
            <div className="space-y-3">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Configured Paper Timetable ({timetableModalState.papers.length} Papers)</span>
                <span className="text-[10px] text-muted-foreground lowercase font-normal">
                  dates & times required
                </span>
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {timetableModalState.papers.map((paper) => {
                  const examStart = timetableModalState.exam!.startDate.split("T")[0];
                  const examEnd = timetableModalState.exam!.endDate.split("T")[0];

                  return (
                    <div
                      key={paper.id}
                      className={`p-3 rounded-lg border transition-all ${
                        paper.error
                          ? "border-rose-300 bg-rose-50/40"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                        <div>
                          <span className="font-bold text-foreground text-xs">
                            {paper.subjectName}
                          </span>
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            ({paper.subjectCode})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                          <span>Max: {paper.maxMarks}</span>
                          <span>•</span>
                          <span>Pass: {paper.passMarks}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5">
                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                            Exam Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            min={examStart}
                            max={examEnd}
                            value={paper.examDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTimetableModalState((prev) => ({
                                ...prev,
                                papers: prev.papers.map((p) =>
                                  p.id === paper.id ? { ...p, examDate: val, error: undefined } : p
                                ),
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                            Start Time <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="time"
                            value={paper.startTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTimetableModalState((prev) => ({
                                ...prev,
                                papers: prev.papers.map((p) =>
                                  p.id === paper.id ? { ...p, startTime: val, error: undefined } : p
                                ),
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                            End Time <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="time"
                            value={paper.endTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTimetableModalState((prev) => ({
                                ...prev,
                                papers: prev.papers.map((p) =>
                                  p.id === paper.id ? { ...p, endTime: val, error: undefined } : p
                                ),
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>

                      {paper.error && (
                        <div className="mt-2 text-[11px] font-medium text-rose-700 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <span>{paper.error}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note & Global Error */}
            <div className="p-3 rounded-lg bg-muted/60 border border-border text-[11px] text-muted-foreground leading-relaxed">
              {timetableModalState.isReschedule
                ? "Rescheduling updates the official paper timetable for teachers and candidates while preserving historical assessment data."
                : "Scheduling will finalize the paper timetable and publish the examination schedule."}
            </div>

            {timetableModalState.globalError && (
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{timetableModalState.globalError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTimetableModalState((prev) => ({ ...prev, isOpen: false, globalError: null }))
                }
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTimetable}
                isLoading={timetableModalState.isLoading}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                {timetableModalState.isReschedule
                  ? "Save & Reschedule Timetable"
                  : "Schedule Examination"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
