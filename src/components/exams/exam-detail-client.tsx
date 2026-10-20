"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  ClipboardEdit,
  Award,
  History,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Lock,
  Unlock,
  Trash2,
  XCircle,
  MoreVertical,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  ShieldCheck,
  GraduationCap,
  Users,
  Check,
  Save,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { calculateGrade } from "@/lib/exams/service";
import { DeleteExamModal } from "@/components/exams/delete-exam-modal";
import type {
  ExamItem,
  SubjectPaperItem,
  AuditLogItem,
  StudentRosterItem,
  StudentOption,
  ScopedReportCardData,
} from "@/components/exams/exams-client";

interface ParsedAuditEvent {
  title: string;
  summary: string;
  badgeColor: string;
  dotColor: string;
  parsedFields: Array<{ label: string; value: string }>;
}

function formatAuditEventDetails(
  action: string,
  rawDetails: any,
  exam: ExamItem
): ParsedAuditEvent {
  let details: Record<string, any> = {};
  if (typeof rawDetails === "string") {
    try {
      details = JSON.parse(rawDetails);
    } catch {
      details = { note: rawDetails };
    }
  } else if (rawDetails && typeof rawDetails === "object") {
    details = rawDetails;
  }

  const fields: Array<{ label: string; value: string }> = [];

  if (details.previousStatus && details.newStatus) {
    fields.push({
      label: "Status Transition",
      value: `${details.previousStatus} → ${details.newStatus}`,
    });
  } else if (details.status) {
    fields.push({ label: "Lifecycle Status", value: String(details.status) });
  }

  if (details.papersCount) {
    fields.push({ label: "Configured Papers", value: `${details.papersCount} papers` });
  }
  if (details.papersUpdatedCount) {
    fields.push({ label: "Papers Scheduled", value: `${details.papersUpdatedCount} papers` });
  }
  if (details.startDate && details.endDate) {
    fields.push({
      label: "Examination Period",
      value: `${formatDate(details.startDate)} — ${formatDate(details.endDate)}`,
    });
  } else if (details.rescheduledStartDate && details.rescheduledEndDate) {
    fields.push({
      label: "Examination Period",
      value: `${formatDate(details.rescheduledStartDate)} — ${formatDate(details.rescheduledEndDate)}`,
    });
  }
  if (details.subjectName) {
    fields.push({ label: "Subject", value: String(details.subjectName) });
  }
  if (details.className) {
    fields.push({ label: "Class / Section", value: String(details.className) });
  }
  if (details.studentsCount !== undefined) {
    fields.push({ label: "Students Evaluated", value: `${details.studentsCount} candidates` });
  }
  if (details.reason) {
    fields.push({ label: "Administrative Reason", value: String(details.reason) });
  }

  switch (action) {
    case "CREATE_EXAM_SCHEDULE":
      return {
        title: "Examination Created",
        summary: `Created in Draft with ${details.papersCount || exam.papersCount} configured subject papers`,
        badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        dotColor: "bg-slate-400",
        parsedFields: fields,
      };

    case "SCHEDULE_EXAM_TIMETABLE":
    case "UPDATE_EXAM_STATUS_SCHEDULED":
      return {
        title: "Examination Scheduled",
        summary: details.papersUpdatedCount
          ? `${details.papersUpdatedCount} papers scheduled on academic timetable`
          : "Timetable scheduled and finalized",
        badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
        dotColor: "bg-blue-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_ONGOING":
      return {
        title: "Examination Started",
        summary: "Assessment commenced across designated classrooms",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        dotColor: "bg-amber-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_COMPLETED":
      return {
        title: "Examination Completed",
        summary: "All assessment papers concluded",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dotColor: "bg-emerald-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_RESULTS_IN_PROGRESS":
      return {
        title: "Evaluation In Progress",
        summary: "Subject teachers recording candidate marks and grades",
        badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
        dotColor: "bg-sky-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_RESULTS_VERIFIED":
      return {
        title: "Results Verified",
        summary: "Assessment marks audited and sealed by coordinator",
        badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
        dotColor: "bg-teal-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_PUBLISHED":
      return {
        title: "Results Published",
        summary: "Official academic report cards and records declared",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dotColor: "bg-emerald-600",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_POSTPONED":
      return {
        title: "Examination Postponed",
        summary: details.reason || "Examination deferred for timetable rescheduling",
        badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
        dotColor: "bg-purple-500",
        parsedFields: fields,
      };

    case "UPDATE_EXAM_STATUS_CANCELLED":
      return {
        title: "Examination Cancelled",
        summary: details.reason || "Assessment cancelled by institutional authority",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        dotColor: "bg-rose-500",
        parsedFields: fields,
      };

    case "SUBMIT_MARKS":
    case "SAVE_MARKS_DRAFT":
      return {
        title: action === "SUBMIT_MARKS" ? "Marks Submitted" : "Marks Draft Saved",
        summary: `${details.subjectName || "Subject"} (${details.className || ""}): ${details.studentsCount || 0} candidate marks recorded`,
        badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
        dotColor: "bg-indigo-500",
        parsedFields: fields,
      };

    case "DELETE_EXAM":
      return {
        title: "Examination Deleted",
        summary: details.examName ? `Deleted ${details.examName}` : "Examination deleted",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        dotColor: "bg-rose-600",
        parsedFields: fields,
      };

    default:
      return {
        title: action.replace(/_/g, " "),
        summary: typeof rawDetails === "string" ? rawDetails : "Operational audit entry recorded",
        badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-400",
        parsedFields: fields,
      };
  }
}

export function ExamDetailClient({
  exam: initialExam,
  currentUser,
  students = [],
  initialReportCard,
}: {
  exam: ExamItem;
  currentUser: {
    id: string;
    fullName: string;
    roleCode: string;
    teacherId?: string;
  };
  students?: StudentOption[];
  initialReportCard?: ScopedReportCardData | null;
}) {
  const router = useRouter();
  const [exam, setExam] = useState<ExamItem>(initialExam);
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "PAPERS" | "MARKS" | "RESULTS" | "HISTORY"
  >("OVERVIEW");
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // State to track expanded audit log cards in History tab
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const toggleLogExpand = (id: string) =>
    setExpandedLogIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // Overflow action menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Status Transition Modal State
  const [statusConfirmState, setStatusConfirmState] = useState<{
    isOpen: boolean;
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
    targetStatus: "",
    title: "",
    description: "",
    requiresReason: false,
    reasonText: "",
    confirmButtonText: "Confirm",
    isLoading: false,
    errorMessage: null,
  });

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    isSafeToDelete: boolean;
    reasonUnsafe?: string;
    isLoading: boolean;
    errorMessage: string | null;
  }>({
    isOpen: false,
    isSafeToDelete: false,
    isLoading: false,
    errorMessage: null,
  });

  // Paper Timetable Scheduling Modal State
  const [timetableModalState, setTimetableModalState] = useState<{
    isOpen: boolean;
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
    isReschedule: false,
    papers: [],
    isLoading: false,
    globalError: null,
  });

  // Marks Entry State
  const [activePaper, setActivePaper] = useState<SubjectPaperItem | null>(
    exam.subjects?.[0] || null
  );
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
  const [rcSelectedStudentId, setRcSelectedStudentId] = useState<string>(
    students[0]?.id || ""
  );
  const [isLoadingReportCard, setIsLoadingReportCard] = useState(false);

  // Authorization Evaluation
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
  const canVerifyResults = isInstAdmin;
  const canPublishResults = isInstAdmin;
  const canReopenResults = isInstAdmin;
  const canDeleteExam = isSuperAdmin || isInstAdmin || isExamCreator;

  // Open Timetable Scheduler Interface
  const openTimetableScheduler = (isReschedule = false) => {
    const defaultStartTime = "09:00";
    const defaultEndTime = "12:00";

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
      isReschedule,
      papers: papersState,
      isLoading: false,
      globalError: null,
    });
  };

  // Save Timetable (Schedule / Reschedule)
  const handleSaveTimetable = async () => {
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

      await refreshExam();
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

  // Refresh current exam data
  const refreshExam = async () => {
    try {
      const res = await fetch(`/api/exams/${exam.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          setExam(data.exam);
          if (activePaper) {
            const updatedPaper = data.exam.subjects?.find(
              (s: SubjectPaperItem) => s.id === activePaper.id
            );
            if (updatedPaper) setActivePaper(updatedPaper);
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh exam:", err);
    }
  };

  // Status transition prompt
  const promptStatusTransition = (nextStatus: string) => {
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
        errorMessage: "A mandatory administrative reason is required for this action.",
      }));
      return;
    }

    setStatusConfirmState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
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

      await refreshExam();
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

  // Prompt Delete Exam
  const promptDeleteExam = () => {
    let isSafe = true;
    let reasonUnsafe: string | undefined;

    if (exam.totalEnteredMarks > 0) {
      isSafe = false;
      reasonUnsafe = `Cannot delete this examination because marks have already been recorded for ${exam.totalEnteredMarks} student(s).`;
    } else if (exam.status === "PUBLISHED") {
      isSafe = false;
      reasonUnsafe = "Cannot permanently delete this examination because official results have already been published.";
    } else if (exam.status === "RESULTS_VERIFIED") {
      isSafe = false;
      reasonUnsafe = "Cannot permanently delete this examination because academic results have been verified and sealed.";
    }

    setDeleteModalState({
      isOpen: true,
      isSafeToDelete: isSafe,
      reasonUnsafe,
      isLoading: false,
      errorMessage: null,
    });
  };

  // Execute Delete
  const executeDeleteExam = async () => {
    setDeleteModalState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete examination.");
      }

      router.push("/academics/exams");
    } catch (err: any) {
      console.error("Delete exam error:", err);
      setDeleteModalState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: err.message || "Failed to delete examination.",
      }));
    }
  };

  // Load Marks Roster for a Paper
  const loadPaperMarksRoster = async (paper: SubjectPaperItem) => {
    setActivePaper(paper);
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

  // Student Mark input change
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

  // Absent Toggle
  const handleAbsentToggle = (studentId: string) => {
    setMarksRoster((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        const willBeAbsent = !s.isAbsent;
        return {
          ...s,
          isAbsent: willBeAbsent,
          marksObtained: willBeAbsent ? 0 : s.marksObtained ?? null,
          grade: willBeAbsent ? "AB" : s.marksObtained !== null ? calculateGrade(s.marksObtained, activePaper?.maxMarks || 100) : null,
        };
      })
    );
  };

  // Save Marks Roster
  const handleSaveMarksRoster = async () => {
    if (!activePaper) return;
    setIsSavingMarks(true);
    setMarksSaveMessage(null);
    setMarksErrorMessage(null);

    try {
      const payloadMarks = marksRoster
        .filter((s) => s.marksObtained !== null || s.isAbsent)
        .map((s) => ({
          studentId: s.studentId,
          marksObtained: s.isAbsent ? 0 : Number(s.marksObtained),
          grade: s.isAbsent
            ? "AB"
            : s.grade || calculateGrade(Number(s.marksObtained), activePaper.maxMarks),
          isAbsent: Boolean(s.isAbsent),
          remarks: s.remarks || undefined,
        }));

      const res = await fetch(`/api/exams/papers/${activePaper.id}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: payloadMarks }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to submit marks ledger.");
      }

      const resJson = await res.json();
      setMarksSaveMessage(
        resJson.message || `Successfully recorded ${payloadMarks.length} student marks.`
      );
      await refreshExam();
    } catch (err: any) {
      console.error("Save marks error:", err);
      setMarksErrorMessage(err.message || "Failed to record marks.");
    } finally {
      setIsSavingMarks(false);
    }
  };

  // Load Report Card for Selected Student
  const loadStudentReportCard = async (studentId: string) => {
    setRcSelectedStudentId(studentId);
    setIsLoadingReportCard(true);
    try {
      const res = await fetch(
        `/api/exams/${exam.id}/report-cards?studentId=${studentId}`
      );
      if (res.ok) {
        const data = await res.json();
        setReportCardData(data.reportCard || null);
      }
    } catch (err) {
      console.error("Failed to fetch student report card:", err);
    } finally {
      setIsLoadingReportCard(false);
    }
  };

  const filteredRoster = marksRoster.filter(
    (s) => selectedSectionFilter === "ALL" || s.sectionId === selectedSectionFilter
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/academics/exams"
            onClick={() => setIsNavigatingBack(true)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted ${
              isNavigatingBack ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isNavigatingBack ? "animate-pulse" : ""}`} />
            <span>{isNavigatingBack ? "Returning to Exams..." : "Exams"}</span>
          </Link>

          {/* Quick status pills: Exam Status + Result / Evaluation Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-md border flex-shrink-0 ${
                exam.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : exam.status === "RESULTS_VERIFIED"
                  ? "bg-teal-50 text-teal-800 border-teal-300"
                  : exam.status === "ONGOING"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : exam.status === "COMPLETED"
                  ? "bg-slate-100 text-slate-800 border-slate-300"
                  : exam.status === "SCHEDULED"
                  ? "bg-blue-50 text-blue-800 border-blue-300"
                  : exam.status === "POSTPONED"
                  ? "bg-purple-50 text-purple-800 border-purple-300"
                  : exam.status === "CANCELLED"
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-slate-50 text-slate-800 border-slate-300"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              {exam.status}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border flex-shrink-0 ${
                exam.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : exam.status === "RESULTS_VERIFIED"
                  ? "bg-teal-50 text-teal-800 border-teal-200"
                  : exam.totalEnteredMarks > 0
                  ? "bg-sky-50 text-sky-800 border-sky-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {exam.status === "PUBLISHED"
                ? "Results: Published"
                : exam.status === "RESULTS_VERIFIED"
                ? "Results: Verified"
                : exam.totalEnteredMarks > 0
                ? `Evaluation: ${exam.totalEnteredMarks}/${exam.totalExpectedMarks} (${exam.progressPct}%)`
                : "Results: Not Started"}
            </span>
          </div>
        </div>

        {/* Title, Eyebrow & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px]">
                {exam.examTypeLabel}
              </span>
              <span>•</span>
              <span className="font-medium font-mono text-foreground">
                {exam.academicYearName}
                {exam.termName ? ` · ${exam.termName}` : ""}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {exam.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
              {exam.targetClasses.length > 0 && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  {exam.targetClasses.join(", ")}
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                {formatDate(exam.startDate)} → {formatDate(exam.endDate)}
              </span>
              {exam.createdByName && (
                <>
                  <span>•</span>
                  <span>
                    Created by: <span className="font-semibold text-foreground">{exam.createdByName}</span>
                    {isExamCreator && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        You (Creator)
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* DRAFT */}
            {exam.status === "DRAFT" && (
              <>
                {canDoOperational && (
                  <Button
                    size="sm"
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => openTimetableScheduler(false)}
                  >
                    Schedule Examination
                  </Button>
                )}
                {canDeleteExam && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={promptDeleteExam}
                  >
                    Delete Examination
                  </Button>
                )}
              </>
            )}

            {/* SCHEDULED */}
            {(exam.status === "SCHEDULED" || exam.status === "UPCOMING") && (
              <>
                {canDoOperational && (
                  <>
                    <Button
                      size="sm"
                      leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                      onClick={() => promptStatusTransition("ONGOING")}
                    >
                      Start Examination
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => openTimetableScheduler(true)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Clock className="w-3.5 h-3.5" />}
                      onClick={() => promptStatusTransition("POSTPONED")}
                    >
                      Postpone
                    </Button>
                  </>
                )}
                {canDeleteExam && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={promptDeleteExam}
                  >
                    Delete Examination
                  </Button>
                )}
              </>
            )}

            {/* ONGOING */}
            {exam.status === "ONGOING" && (
              <>
                {canDoOperational && (
                  <>
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => promptStatusTransition("COMPLETED")}
                    >
                      Complete Examination
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => openTimetableScheduler(true)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Clock className="w-3.5 h-3.5" />}
                      onClick={() => promptStatusTransition("POSTPONED")}
                    >
                      Postpone
                    </Button>
                  </>
                )}
                {canDeleteExam && exam.totalEnteredMarks === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={promptDeleteExam}
                  >
                    Delete Examination
                  </Button>
                )}
              </>
            )}

            {/* COMPLETED */}
            {exam.status === "COMPLETED" && (
              <>
                {canDoOperational && (
                  <Button
                    size="sm"
                    leftIcon={<ClipboardEdit className="w-3.5 h-3.5" />}
                    onClick={() => setActiveTab("MARKS")}
                  >
                    Enter / Review Marks
                  </Button>
                )}
                {canDeleteExam && exam.totalEnteredMarks === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={promptDeleteExam}
                  >
                    Delete Examination
                  </Button>
                )}
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={() => promptStatusTransition("CANCELLED")}
                  >
                    Cancel Examination
                  </Button>
                )}
              </>
            )}

            {/* RESULTS_IN_PROGRESS */}
            {exam.status === "RESULTS_IN_PROGRESS" && canVerifyResults && (
              <Button
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                onClick={() => promptStatusTransition("RESULTS_VERIFIED")}
              >
                Mark Results Verified
              </Button>
            )}

            {/* RESULTS_VERIFIED */}
            {exam.status === "RESULTS_VERIFIED" && canPublishResults && (
              <Button
                size="sm"
                leftIcon={<Lock className="w-3.5 h-3.5" />}
                onClick={() => promptStatusTransition("PUBLISHED")}
              >
                Publish Official Results
              </Button>
            )}

            {/* POSTPONED */}
            {exam.status === "POSTPONED" && (
              <>
                {canDoOperational && (
                  <Button
                    size="sm"
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => openTimetableScheduler(true)}
                  >
                    Reschedule Examination
                  </Button>
                )}
                {canDeleteExam && exam.totalEnteredMarks === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50 border-rose-200"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={promptDeleteExam}
                  >
                    Delete Examination
                  </Button>
                )}
              </>
            )}

            {/* PUBLISHED: Admin Reopen */}
            {exam.status === "PUBLISHED" && canReopenResults && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Unlock className="w-3.5 h-3.5 text-amber-600" />}
                onClick={() => promptStatusTransition("RESULTS_VERIFIED")}
              >
                Reopen Assessment
              </Button>
            )}

            {/* Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg border border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white border border-border shadow-xl z-40 py-1 text-xs divide-y divide-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setActiveTab("MARKS");
                          if (exam.subjects?.[0]) {
                            loadPaperMarksRoster(exam.subjects[0]);
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                        Enter Subject Marks
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setActiveTab("RESULTS");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        Report Cards
                      </button>
                    </div>

                    {exam.status === "SCHEDULED" && canDoOperational && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            promptStatusTransition("DRAFT");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                          Return to Draft
                        </button>
                      </div>
                    )}

                    {canCancel && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            promptStatusTransition("CANCELLED");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Cancel Examination
                        </button>
                      </div>
                    )}

                    {canDeleteExam && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            promptDeleteExam();
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium cursor-pointer"
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-border pt-3 overflow-x-auto">
          {[
            { id: "OVERVIEW", label: "Overview", icon: BookOpen },
            {
              id: "PAPERS",
              label: `Papers (${exam.papersCount || exam.subjects?.length || 0})`,
              icon: Calendar,
            },
            { id: "MARKS", label: "Marks & Evaluation", icon: ClipboardEdit },
            { id: "RESULTS", label: "Report Cards", icon: Award },
            { id: "HISTORY", label: "Lifecycle & History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "MARKS" && !marksRoster.length && exam.subjects?.[0]) {
                    loadPaperMarksRoster(exam.subjects[0]);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Examination Status
              </div>
              <div className="mt-1 text-base font-bold text-foreground truncate">
                {exam.status}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {exam.papersCount || exam.subjects?.length || 0} configured papers
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Result & Evaluation
              </div>
              <div className="mt-1 text-base font-bold text-primary truncate">
                {exam.status === "PUBLISHED"
                  ? "Published"
                  : exam.status === "RESULTS_VERIFIED"
                  ? "Verified"
                  : exam.totalEnteredMarks > 0
                  ? "In Progress"
                  : "Not Started"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {exam.totalEnteredMarks} / {exam.totalExpectedMarks} marks ({exam.progressPct}%)
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Average Score
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {exam.averageScorePct && exam.averageScorePct > 0 ? `${exam.averageScorePct}%` : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Cohort mean performance</div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Target Classes
              </div>
              <div className="mt-1 text-base font-bold text-foreground truncate pt-1">
                {exam.targetClasses.join(", ") || "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Enrolled student cohorts</div>
            </div>
          </div>

          {/* Lifecycle & Operational Status Box */}
          <div className="p-5 rounded-xl border border-border bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Lifecycle State & Semantics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current operational state and transition governance for this cycle.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-primary">
                {exam.status}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {exam.status === "DRAFT" &&
                "Examination is in initial draft. Subjects and timetable blueprints are configured. Ready to be scheduled and published to the academic timetable."}
              {exam.status === "SCHEDULED" &&
                "Timetable is finalized and published. Awaiting commencement of paper administration."}
              {exam.status === "ONGOING" &&
                "Examination papers are actively being conducted across designated classrooms."}
              {exam.status === "COMPLETED" &&
                "All assessment papers concluded. Ready for subject teachers to record candidate marks."}
              {exam.status === "RESULTS_IN_PROGRESS" &&
                "Assigned subject teachers are entering, auditing, and submitting candidate scores."}
              {exam.status === "RESULTS_VERIFIED" &&
                "Marks have been audited and verified by class tutors and exam coordinators. Ready for official publication."}
              {exam.status === "PUBLISHED" &&
                "Results are officially declared. Marks ledgers are locked from regular teacher modifications."}
              {exam.status === "POSTPONED" &&
                "Examination cycle is deferred. Timetable records are preserved for rescheduling."}
              {exam.status === "CANCELLED" &&
                "Examination is cancelled and retained for institutional compliance records."}
            </p>

            {/* Quick Actions Bar */}
            <div className="pt-2 flex items-center gap-2 flex-wrap border-t border-border">
              <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase mr-2">
                Available Operations:
              </span>
              {exam.status === "DRAFT" && (
                <>
                  {canDoOperational && (
                    <Button
                      size="sm"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => openTimetableScheduler(false)}
                    >
                      Schedule Examination
                    </Button>
                  )}
                  {canDeleteExam && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={promptDeleteExam}
                    >
                      Delete Examination
                    </Button>
                  )}
                </>
              )}
              {(exam.status === "SCHEDULED" || exam.status === "UPCOMING") && (
                <>
                  {canDoOperational && (
                    <>
                      <Button
                        size="sm"
                        leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                        onClick={() => promptStatusTransition("ONGOING")}
                      >
                        Start Examination
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        onClick={() => openTimetableScheduler(true)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Clock className="w-3.5 h-3.5" />}
                        onClick={() => promptStatusTransition("POSTPONED")}
                      >
                        Postpone
                      </Button>
                    </>
                  )}
                  {canDeleteExam && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={promptDeleteExam}
                    >
                      Delete Examination
                    </Button>
                  )}
                </>
              )}
              {exam.status === "ONGOING" && (
                <>
                  {canDoOperational && (
                    <>
                      <Button
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => promptStatusTransition("COMPLETED")}
                      >
                        Complete Examination
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        onClick={() => openTimetableScheduler(true)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Clock className="w-3.5 h-3.5" />}
                        onClick={() => promptStatusTransition("POSTPONED")}
                      >
                        Postpone
                      </Button>
                    </>
                  )}
                  {canDeleteExam && exam.totalEnteredMarks === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={promptDeleteExam}
                    >
                      Delete Examination
                    </Button>
                  )}
                </>
              )}
              {exam.status === "COMPLETED" && (
                <>
                  {canDoOperational && (
                    <Button
                      size="sm"
                      leftIcon={<ClipboardEdit className="w-3.5 h-3.5" />}
                      onClick={() => setActiveTab("MARKS")}
                    >
                      Enter / Review Marks
                    </Button>
                  )}
                  {canDeleteExam && exam.totalEnteredMarks === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={promptDeleteExam}
                    >
                      Delete Examination
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={() => promptStatusTransition("CANCELLED")}
                    >
                      Cancel Examination
                    </Button>
                  )}
                </>
              )}
              {exam.status === "RESULTS_IN_PROGRESS" && canVerifyResults && (
                <Button
                  size="sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => promptStatusTransition("RESULTS_VERIFIED")}
                >
                  Mark Results Verified
                </Button>
              )}
              {exam.status === "RESULTS_VERIFIED" && canPublishResults && (
                <Button
                  size="sm"
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                  onClick={() => promptStatusTransition("PUBLISHED")}
                >
                  Publish Official Results
                </Button>
              )}
              {exam.status === "POSTPONED" && (
                <>
                  {canDoOperational && (
                    <Button
                      size="sm"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => openTimetableScheduler(true)}
                    >
                      Reschedule Examination
                    </Button>
                  )}
                  {canDeleteExam && exam.totalEnteredMarks === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={promptDeleteExam}
                    >
                      Delete Examination
                    </Button>
                  )}
                </>
              )}
              {exam.status === "PUBLISHED" && canReopenResults && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Unlock className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={() => promptStatusTransition("RESULTS_VERIFIED")}
                >
                  Reopen Assessment
                </Button>
              )}
            </div>
          </div>

          {/* Quick Paper Summary */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Configured Papers ({exam.subjects?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab("PAPERS")}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                View Full Timetable →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(exam.subjects || []).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-border bg-card/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-foreground">{p.subjectName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {p.examDate ? (
                        <span>{formatDate(p.examDate)} · {p.startTime} - {p.endTime}</span>
                      ) : (
                        <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                          Not scheduled
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("MARKS");
                      loadPaperMarksRoster(p);
                    }}
                  >
                    Enter Marks
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: PAPERS */}
      {activeTab === "PAPERS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Subject Papers & Timetable ({exam.subjects?.length || 0})
              </h3>
              <p className="text-xs text-muted-foreground">
                Configured assessment papers with scheduled slots, maximum marks, and evaluation status.
              </p>
            </div>

            {canDoOperational && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                onClick={() =>
                  openTimetableScheduler(
                    exam.status === "SCHEDULED" ||
                      exam.status === "ONGOING" ||
                      exam.status === "POSTPONED"
                  )
                }
              >
                {exam.status === "DRAFT" ? "Configure & Schedule Timetable" : "Reschedule Timetable"}
              </Button>
            )}
          </div>

          {(!exam.subjects || exam.subjects.length === 0) ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border bg-white text-muted-foreground text-xs">
              No papers configured for this examination.
            </div>
          ) : (
            <div className="space-y-2.5">
              {exam.subjects.map((paper) => (
                <div
                  key={paper.id}
                  className="p-4 rounded-xl border border-border bg-white shadow-2xs hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {paper.subjectName}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {paper.subjectCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
                      <span>Class: <strong className="text-foreground">{paper.className}</strong></span>
                      <span>•</span>
                      <span>
                        Date:{" "}
                        {paper.examDate ? (
                          <strong className="text-foreground">{formatDate(paper.examDate)}</strong>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            Not scheduled
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span>Time: <strong className="text-foreground">{paper.startTime} — {paper.endTime}</strong></span>
                      <span>•</span>
                      <span>Max: <strong className="text-foreground">{paper.maxMarks}</strong> (Pass: {paper.passMarks})</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          paper.evaluationStatus === "COMPLETED"
                            ? "bg-emerald-500"
                            : paper.evaluationStatus === "DRAFT"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                        }`}
                      />
                      <span>
                        Evaluation:{" "}
                        <strong className="text-foreground">
                          {paper.enteredMarksCount} of {paper.enrolledStudentsCount} marks entered
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<ClipboardEdit className="w-3.5 h-3.5 text-primary" />}
                      onClick={() => {
                        setActiveTab("MARKS");
                        loadPaperMarksRoster(paper);
                      }}
                    >
                      Enter Marks
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: MARKS & EVALUATION */}
      {activeTab === "MARKS" && (
        <div className="space-y-4">
          {/* Paper Selector & Roster Toolbar */}
          <div className="p-4 rounded-xl border border-border bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Paper:
              </label>
              <select
                value={activePaper?.id || ""}
                onChange={(e) => {
                  const p = exam.subjects.find((s) => s.id === e.target.value);
                  if (p) loadPaperMarksRoster(p);
                }}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {(exam.subjects || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectName} ({s.className}) · {s.examDate ? formatDate(s.examDate) : "Not scheduled"}
                  </option>
                ))}
              </select>

              {activePaper && activePaper.sections.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Section:
                  </label>
                  <select
                    value={selectedSectionFilter}
                    onChange={(e) => setSelectedSectionFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs"
                  >
                    <option value="ALL">All Sections</option>
                    {activePaper.sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activePaper && (
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  size="sm"
                  onClick={handleSaveMarksRoster}
                  isLoading={isSavingMarks}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Marks Ledger
                </Button>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {marksSaveMessage && (
            <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{marksSaveMessage}</span>
            </div>
          )}
          {marksErrorMessage && (
            <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{marksErrorMessage}</span>
            </div>
          )}

          {/* Marks Table */}
          {isLoadingRoster ? (
            <div className="p-12 text-center rounded-xl border border-border bg-white text-muted-foreground text-xs">
              Loading student roster...
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border bg-white text-muted-foreground text-xs">
              No active candidates found for this paper.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-[11px] font-mono uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Roll #</th>
                      <th className="px-4 py-3">Candidate Name</th>
                      <th className="px-4 py-3">Admission #</th>
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Marks (Max: {activePaper?.maxMarks || 100})</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Absent</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRoster.map((student) => (
                      <tr
                        key={student.studentId}
                        className={`hover:bg-muted/30 transition-colors ${
                          student.isAbsent ? "bg-rose-50/40 opacity-75" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          {student.rollNumber || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {student.admissionNumber}
                        </td>
                        <td className="px-4 py-3">{student.sectionName}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max={activePaper?.maxMarks || 100}
                            step="0.5"
                            disabled={student.isAbsent}
                            value={student.marksObtained !== null ? student.marksObtained : ""}
                            onChange={(e) =>
                              handleStudentMarkChange(student.studentId, e.target.value)
                            }
                            placeholder="Marks"
                            className="w-24 px-2.5 py-1 rounded-md border border-border bg-card text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              student.isAbsent
                                ? "bg-rose-100 text-rose-800"
                                : student.grade === "A+" || student.grade === "A"
                                ? "bg-emerald-100 text-emerald-800"
                                : student.grade === "F"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {student.grade || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={student.isAbsent}
                            onChange={() => handleAbsentToggle(student.studentId)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={student.remarks || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMarksRoster((prev) =>
                                prev.map((s) =>
                                  s.studentId === student.studentId ? { ...s, remarks: val } : s
                                )
                              );
                            }}
                            placeholder="Optional note"
                            className="w-full px-2 py-1 rounded border border-border bg-card text-[11px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: REPORT CARDS */}
      {activeTab === "RESULTS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Candidate:
              </label>
              <select
                value={rcSelectedStudentId}
                onChange={(e) => loadStudentReportCard(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNumber}) · Roll #{s.rollNumber || "—"}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Report Card
            </Button>
          </div>

          {isLoadingReportCard ? (
            <div className="p-12 text-center rounded-xl border border-border bg-white text-muted-foreground text-xs">
              Loading report card...
            </div>
          ) : !reportCardData ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border bg-white text-muted-foreground text-xs">
              No report card data available for the selected candidate.
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-white shadow-xs space-y-6 max-w-3xl mx-auto">
              {/* Report Header */}
              <div className="text-center border-b border-border pb-4 space-y-1">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  {reportCardData.institution.name}
                </h2>
                <div className="text-xs text-muted-foreground">
                  {reportCardData.institution.address}, {reportCardData.institution.city},{" "}
                  {reportCardData.institution.state}
                </div>
                <div className="pt-2 font-mono text-xs font-bold text-primary uppercase tracking-wider">
                  Official Academic Report Card • {reportCardData.exam.name}
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-card/60 border border-border text-xs">
                <div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Student Name</div>
                  <div className="font-bold text-foreground mt-0.5">{reportCardData.student.fullName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Roll Number</div>
                  <div className="font-bold text-foreground font-mono mt-0.5">{reportCardData.student.rollNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Class & Section</div>
                  <div className="font-bold text-foreground mt-0.5">{reportCardData.student.className} - {reportCardData.student.sectionName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Attendance</div>
                  <div className="font-bold text-emerald-700 font-mono mt-0.5">{reportCardData.student.attendancePct}%</div>
                </div>
              </div>

              {/* Marks Ledger Table */}
              <table className="w-full text-xs text-left border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/60 text-[11px] font-mono uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Max Marks</th>
                    <th className="px-4 py-2.5">Pass Marks</th>
                    <th className="px-4 py-2.5">Marks Obtained</th>
                    <th className="px-4 py-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reportCardData.marks.map((m, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-semibold text-foreground">
                        {m.subjectName}{" "}
                        <span className="text-[10px] font-mono text-muted-foreground">({m.subjectCode})</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono">{m.maxMarks}</td>
                      <td className="px-4 py-2.5 font-mono">{m.passMarks}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-foreground">
                        {m.isAbsent ? <span className="text-rose-600">Absent</span> : m.marksObtained}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-muted text-[11px]">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40 font-bold text-xs border-t border-border">
                  <tr>
                    <td className="px-4 py-3">Total / Overall</td>
                    <td className="px-4 py-3 font-mono">{reportCardData.summary.totalMaxMarks}</td>
                    <td className="px-4 py-3 font-mono">—</td>
                    <td className="px-4 py-3 font-mono text-primary font-bold">
                      {reportCardData.summary.totalMarksObtained} ({reportCardData.summary.overallPercentage}%)
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      Grade: {reportCardData.summary.overallGrade} ({reportCardData.summary.resultStatus})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: LIFECYCLE & HISTORY */}
      {activeTab === "HISTORY" && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Lifecycle & Examination History
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authoritative chronological audit trail and operational state progression.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium text-muted-foreground">
                Total Events: <strong>{exam.auditLogs?.length || 0}</strong>
              </span>
            </div>
          </div>

          {/* Top Status Cards: Current Examination Status & Results Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Examination Status Card */}
            <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>Current Examination Status</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live State
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                    exam.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : exam.status === "RESULTS_VERIFIED"
                      ? "bg-teal-50 text-teal-800 border-teal-300"
                      : exam.status === "ONGOING"
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : exam.status === "COMPLETED"
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : exam.status === "SCHEDULED"
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : exam.status === "POSTPONED"
                      ? "bg-purple-50 text-purple-800 border-purple-300"
                      : exam.status === "CANCELLED"
                      ? "bg-rose-50 text-rose-800 border-rose-300"
                      : "bg-slate-50 text-slate-800 border-slate-300"
                  }`}
                >
                  {exam.status}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDate(exam.startDate)} → {formatDate(exam.endDate)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
                <span>
                  Administered by{" "}
                  <strong className="text-foreground">
                    {exam.createdByName || "Examination Creator"}
                  </strong>
                </span>
                <span className="font-mono text-[11px]">
                  {exam.papersCount || exam.subjects?.length || 0} Papers
                </span>
              </div>
            </div>

            {/* 2. Results & Evaluation Card */}
            <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>Results & Evaluation Status</span>
                <span className="text-[11px] font-mono font-bold text-primary">
                  {exam.progressPct}% Progress
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                    exam.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : exam.status === "RESULTS_VERIFIED"
                      ? "bg-teal-50 text-teal-800 border-teal-300"
                      : exam.totalEnteredMarks > 0
                      ? "bg-sky-50 text-sky-800 border-sky-300"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {exam.status === "PUBLISHED"
                    ? "PUBLISHED"
                    : exam.status === "RESULTS_VERIFIED"
                    ? "VERIFIED"
                    : exam.totalEnteredMarks > 0
                    ? "IN_PROGRESS"
                    : "NOT_STARTED"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {exam.evaluatedPapersCount || 0} / {exam.papersCount} papers evaluated
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
                <span>
                  {exam.status === "PUBLISHED"
                    ? "Official report cards published"
                    : exam.status === "RESULTS_VERIFIED"
                    ? "Results verified, pending publication"
                    : "0 report cards published"}
                </span>
                <span className="font-mono text-[11px] text-primary font-semibold">
                  {exam.totalEnteredMarks} / {exam.totalExpectedMarks} Marks Recorded
                </span>
              </div>
            </div>
          </div>

          {/* Results & Evaluation Stage Pipeline */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Evaluation & Result Pipeline
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Marks Entry</div>
                <div className="font-semibold text-foreground">
                  {exam.totalEnteredMarks === 0
                    ? "Not Started"
                    : `${exam.totalEnteredMarks} / ${exam.totalExpectedMarks} marks`}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Paper Evaluation</div>
                <div className="font-semibold text-foreground">
                  {exam.evaluatedPapersCount || 0} / {exam.papersCount} Papers
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Verification</div>
                <div className="font-semibold text-foreground">
                  {exam.status === "RESULTS_VERIFIED" || exam.status === "PUBLISHED"
                    ? "Verified"
                    : "Not Started"}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Publication</div>
                <div className="font-semibold text-foreground">
                  {exam.status === "PUBLISHED" ? "Published" : "Not Started"}
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Administrative Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Chronological Audit Trail
            </h4>

            {(!exam.auditLogs || exam.auditLogs.length === 0) ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-border bg-white text-muted-foreground text-xs">
                No audit records recorded yet for this examination cycle.
              </div>
            ) : (
              <div className="relative border-l-2 border-border ml-3 pl-5 sm:pl-6 space-y-4 pt-1 pb-2">
                {exam.auditLogs.map((log) => {
                  const event = formatAuditEventDetails(log.action, log.details, exam);
                  const isExpanded = Boolean(expandedLogIds[log.id]);

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <div
                        className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-border/50 ${event.dotColor}`}
                      />

                      <div className="p-4 rounded-xl border border-border bg-white shadow-2xs hover:border-primary/30 transition-all space-y-2">
                        {/* Event Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-foreground">
                              {event.title}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${event.badgeColor}`}
                            >
                              {log.action}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </div>
                        </div>

                        {/* Summary & Actor */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <p className="text-muted-foreground leading-relaxed">
                            {event.summary}
                          </p>
                          <div className="text-[11px] text-muted-foreground shrink-0">
                            By <strong className="text-foreground">{log.userName}</strong>
                            {log.userEmail && (
                              <span className="font-mono text-[10px] text-muted-foreground ml-1">
                                ({log.userEmail})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expandable Key-Value Details */}
                        {event.parsedFields.length > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <button
                              type="button"
                              onClick={() => toggleLogExpand(log.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Hide Audit Details</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>View Audit Details ({event.parsedFields.length} fields)</span>
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2.5 p-3 rounded-lg bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {event.parsedFields.map((f, fIdx) => (
                                  <div key={fIdx} className="space-y-0.5">
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                                      {f.label}
                                    </div>
                                    <div className="font-semibold text-foreground font-mono text-[11px] break-words">
                                      {f.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lifecycle Status Confirmation Modal */}
      {statusConfirmState.isOpen && (
        <Modal
          isOpen={statusConfirmState.isOpen}
          onClose={() =>
            setStatusConfirmState((prev) => ({ ...prev, isOpen: false, errorMessage: null }))
          }
          title={statusConfirmState.title}
          description={exam.name}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-foreground leading-relaxed">{statusConfirmState.description}</p>

            {statusConfirmState.targetStatus === "SCHEDULED" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-card border border-border">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase">
                    Start Date
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
                    className="mt-1 w-full px-2.5 py-1.5 rounded border border-border bg-white text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase">
                    End Date
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
                    className="mt-1 w-full px-2.5 py-1.5 rounded border border-border bg-white text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {statusConfirmState.requiresReason && (
              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground">
                  Reason for this action <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={statusConfirmState.reasonText}
                  onChange={(e) =>
                    setStatusConfirmState((prev) => ({
                      ...prev,
                      reasonText: e.target.value,
                    }))
                  }
                  placeholder="Provide an administrative reason for audit logs..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {statusConfirmState.errorMessage && (
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{statusConfirmState.errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
                onClick={executeStatusTransition}
                isLoading={statusConfirmState.isLoading}
              >
                {statusConfirmState.confirmButtonText}
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
        exam={exam}
        isSafeToDelete={deleteModalState.isSafeToDelete}
        reasonUnsafe={deleteModalState.reasonUnsafe}
        canCancel={canCancel}
        isLoading={deleteModalState.isLoading}
        errorMessage={deleteModalState.errorMessage}
        onConfirmDelete={executeDeleteExam}
        onRequestCancelAlternative={() => {
          promptStatusTransition("CANCELLED");
        }}
      />

      {/* Paper Timetable Scheduling / Rescheduling Modal */}
      {timetableModalState.isOpen && (
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
          description={`Configure official paper dates and examination slots for ${exam.name}`}
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
                  {formatDate(exam.startDate)} → {formatDate(exam.endDate)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every paper must be scheduled on an actual examination date within this overall window ({exam.startDate.split("T")[0]} to {exam.endDate.split("T")[0]}). Start time must precede end time.
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
                  const examStart = exam.startDate.split("T")[0];
                  const examEnd = exam.endDate.split("T")[0];

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
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-white text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                            Start Time <span className="text-rose-500">*</span>
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
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-white text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                            End Time <span className="text-rose-500">*</span>
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
                            className="w-full px-2.5 py-1.5 rounded border border-border bg-white text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
