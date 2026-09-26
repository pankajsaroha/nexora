"use client";

import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowLeft,
  Edit3,
  Shield,
  FileText,
  Clock,
  Sparkles,
  Archive,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { AssignRollNumberModal } from "./assign-roll-number-modal";
import { EditStudentModal } from "./edit-student-modal";
import { DeactivateStudentModal } from "./deactivate-student-modal";
import { PermanentDeleteStudentModal } from "./permanent-delete-student-modal";
import { CustomFieldOption, ProgramOption, AcademicYearOption } from "./student-admission-dialog";
import { useRouter } from "next/navigation";

export interface StudentProfileData {
  id: string;
  admissionNumber: string;
  rollNumber?: string | null;
  universityRegNumber?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth: Date | string;
  gender: string;
  bloodGroup?: string | null;
  nationality?: string | null;
  category?: string | null;
  aadhaarNumber?: string | null;
  photoUrl?: string | null;
  address?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  admissionDate: Date | string;
  admissionType?: string | null;
  previousSchool?: string | null;
  previousQualification?: string | null;
  batch?: string | null;
  semester?: string | null;
  status: string;
  deactivatedAt?: Date | string | null;
  deactivationReason?: string | null;
  notes?: string | null;
  currentClass: {
    id: string;
    name: string;
    code: string;
    level: string;
    durationYears?: number | null;
    department?: { id: string; name: string; code: string } | null;
  };
  currentSection: {
    id: string;
    name: string;
    classTeacher?: { id: string; fullName: string; email: string; phone: string } | null;
  };
  academicYear: {
    id: string;
    name: string;
    isCurrent: boolean;
  };
  guardians: Array<{
    id: string;
    isPrimary: boolean;
    guardian: {
      id: string;
      fullName: string;
      relation: string;
      phone: string;
      email?: string | null;
      occupation?: string | null;
      address?: string | null;
    };
  }>;
  fees: Array<{
    id: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: Date | string;
    status: string;
    feeStructure: {
      id: string;
      amount: number;
      frequency: string;
      feeCategory: { id: string; name: string };
    };
    payments: Array<{
      id: string;
      receiptNumber: string;
      amount: number;
      paymentDate: Date | string;
      paymentMethod: string;
      transactionRef?: string | null;
    }>;
  }>;
  attendance: Array<{
    id: string;
    date: Date | string;
    status: string;
    remarks?: string | null;
  }>;
  customFieldValues?: Array<{
    id: string;
    value: string | null;
    customField: {
      id: string;
      name: string;
      key: string;
      fieldType: string;
      options?: string | null;
    };
  }>;
}

export function StudentProfileClient({
  student: initialStudent,
  customFields = [],
  programs = [],
  academicYears = [],
  currentUserRole = "ADMIN",
}: {
  student: StudentProfileData;
  customFields?: CustomFieldOption[];
  programs?: ProgramOption[];
  academicYears?: AcademicYearOption[];
  currentUserRole?: string;
}) {
  const [student, setStudent] = useState<StudentProfileData>(initialStudent);
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "fees">("overview");
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const primaryGuardianLink =
    student.guardians.find((g) => g.isPrimary) || student.guardians[0];
  const primaryGuardian = primaryGuardianLink?.guardian;

  // Real fee computations
  const totalFees = student.fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = student.fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = student.fees.reduce((acc, f) => acc + f.pendingAmount, 0);

  // Real attendance computations
  const totalAttendanceDays = student.attendance.length;
  const presentDays = student.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "HALF_DAY"
  ).length;
  const attendanceRate =
    totalAttendanceDays > 0
      ? Math.round((presentDays / totalAttendanceDays) * 1000) / 10
      : null;

  const handleRestoreStudent = async () => {
    if (!confirm(`Restore ${student.fullName} to ACTIVE student directory?`)) return;
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESTORE" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStudent((prev) => ({ ...prev, status: "ACTIVE" }));
        router.refresh();
      }
    } catch (err) {
      console.error("Restore student error:", err);
    } finally {
      setIsRestoring(false);
    }
  };

  const isDeactivated = student.status === "DEACTIVATED" || student.status === "ARCHIVED";
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Back Link & Page Header */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A756B] hover:text-[#171614] mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Students Directory</span>
        </Link>

        <PageHeader
          eyebrow={`ADMISSION ID: ${student.admissionNumber}`}
          title={student.fullName}
          description={`Program: ${student.currentClass.name} (${student.currentSection.name}) • Academic Year: ${student.academicYear.name}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit3 className="h-3.5 w-3.5 text-[#7A756B]" />}
            >
              Edit Dossier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRollModalOpen(true)}
              leftIcon={<Hash className="h-3.5 w-3.5 text-[#7A756B]" />}
            >
              {student.rollNumber ? "Update Roll #" : "Assign Roll #"}
            </Button>
            {isDeactivated ? (
              <Button
                size="sm"
                onClick={handleRestoreStudent}
                isLoading={isRestoring}
                leftIcon={<RefreshCw className="h-3.5 w-3.5 text-[#D4B87C]" />}
              >
                Restore Student
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeactivateModalOpen(true)}
                leftIcon={<UserX className="h-3.5 w-3.5 text-[#7A756B]" />}
              >
                Deactivate
              </Button>
            )}
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border-[#8B3A3A]/40 text-[#8B3A3A] hover:bg-[#8B3A3A]/10"
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-[#8B3A3A]" />}
              >
                Permanent Delete
              </Button>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Deactivated Notice Banner if applicable */}
      {isDeactivated && (
        <div className="rounded-2xl border border-[#8B3A3A]/20 bg-[#8B3A3A]/5 p-4 text-xs text-[#8B3A3A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserX className="h-4 w-4 shrink-0 text-[#8B3A3A]" />
            <div>
              <span className="font-bold">This student profile is currently DEACTIVATED.</span>
              <p className="text-[11px] text-[#171614]/70 mt-0.5">
                {student.deactivationReason ? `Reason: ${student.deactivationReason}. ` : ""}
                All academic, attendance, and fee ledgers remain preserved for audit compliance.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleRestoreStudent} isLoading={isRestoring}>
            Restore to Active
          </Button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            Roll Number
          </span>
          <div className="font-mono text-base font-bold text-[#171614]">
            {student.rollNumber || (
              <span className="text-xs font-sans text-[#856D3B] font-semibold">Unassigned</span>
            )}
          </div>
          <span className="text-[10px] text-[#7A756B]">Institution Roll Identifier</span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            Attendance Rate
          </span>
          <div className="text-base font-bold text-[#171614] font-mono">
            {attendanceRate !== null ? `${attendanceRate}%` : "No Records"}
          </div>
          <span className="text-[10px] text-[#7A756B]">
            {totalAttendanceDays > 0 ? `${presentDays}/${totalAttendanceDays} days present` : "Term register"}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            Fee Ledger Balance
          </span>
          <div className="text-base font-bold text-[#171614] font-mono">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#856D3B]">
            {totalFees > 0 ? `₹${totalPaid.toLocaleString("en-IN")} Paid of ₹${totalFees.toLocaleString("en-IN")}` : "No dues invoiced"}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
            Enrollment Status
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`w-2 h-2 rounded-full ${student.status === "ACTIVE" ? "bg-[#525E4B]" : "bg-[#8B3A3A]"}`} />
            <span className="font-bold text-[#171614] text-sm uppercase font-mono">{student.status}</span>
          </div>
          <span className="text-[10px] text-[#7A756B]">Since {formatDate(student.admissionDate)}</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#E5E0D5] gap-6 text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-[#171614] text-[#171614]"
              : "border-transparent text-[#7A756B] hover:text-[#171614]"
          }`}
        >
          General Dossier
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            activeTab === "academic"
              ? "border-[#171614] text-[#171614]"
              : "border-transparent text-[#7A756B] hover:text-[#171614]"
          }`}
        >
          Academic & Timetable
        </button>
        <button
          onClick={() => setActiveTab("fees")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
            activeTab === "fees"
              ? "border-[#171614] text-[#171614]"
              : "border-transparent text-[#7A756B] hover:text-[#171614]"
          }`}
        >
          Financial Ledgers & Receipts ({student.fees.length})
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1 & 2: Personal & Guardian Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Identity & Personal */}
            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                Biographical & Identity Information
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#7A756B] block">First Name</span>
                  <span className="font-bold text-[#171614]">{student.firstName}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Middle Name</span>
                  <span className="font-bold text-[#171614]">{student.middleName || "—"}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Last Name</span>
                  <span className="font-bold text-[#171614]">{student.lastName}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Date of Birth</span>
                  <span className="font-bold text-[#171614]">{formatDate(student.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Gender</span>
                  <span className="font-bold text-[#171614] capitalize">{student.gender.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Blood Group</span>
                  <span className="font-bold text-[#171614]">{student.bloodGroup || "Not Specified"}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Nationality</span>
                  <span className="font-bold text-[#171614]">{student.nationality || "Indian"}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Social Category</span>
                  <span className="font-bold text-[#171614]">{student.category || "General"}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block">Aadhaar / National ID</span>
                  <span className="font-mono font-bold text-[#171614]">
                    {student.aadhaarNumber ? `•••• ${student.aadhaarNumber.slice(-4)}` : "Not Recorded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Guardian & Contact */}
            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                Guardian & Emergency Relations
              </span>

              {student.guardians.length === 0 ? (
                <p className="text-xs text-[#7A756B]">No guardian linkage recorded.</p>
              ) : (
                <div className="space-y-3">
                  {student.guardians.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#171614]">{g.guardian.fullName}</span>
                          <span className="text-[10px] font-mono text-[#856D3B] uppercase">({g.guardian.relation})</span>
                          {g.isPrimary && (
                            <span className="text-[9px] font-mono bg-[#171614] text-[#FAF8F3] px-1.5 py-0.5 rounded font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[#7A756B] mt-1 font-mono">
                          <span>Phone: {g.guardian.phone}</span>
                          {g.guardian.email && <span>Email: {g.guardian.email}</span>}
                          {g.guardian.occupation && <span>Occupation: {g.guardian.occupation}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Institution Custom Fields */}
            {customFields.length > 0 && (
              <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#856D3B]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B]">
                    Institutional Custom Field Attributes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {customFields.map((field) => {
                    const match = student.customFieldValues?.find((cfv) => cfv.customField.key === field.key);
                    return (
                      <div key={field.id}>
                        <span className="text-[#7A756B] block text-[11px]">{field.name}</span>
                        <span className="font-bold text-[#171614]">
                          {match?.value ? match.value : <span className="text-[#A8A295] font-normal">Not Provided</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Col 3: Residential & Academic Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                Residential Location
              </span>
              <p className="text-xs text-[#171614] leading-relaxed">
                {student.address || [student.addressLine1, student.addressLine2, student.city, student.state, student.pincode, student.country].filter(Boolean).join(", ") || "No address on file."}
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                Academic Registration Identifiers
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#7A756B] block text-[11px]">Admission Number</span>
                  <span className="font-mono font-bold text-[#171614]">{student.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-[#7A756B] block text-[11px]">Institution Roll #</span>
                  <span className="font-mono font-bold text-[#171614]">{student.rollNumber || "Not Assigned"}</span>
                </div>
                {student.universityRegNumber && (
                  <div>
                    <span className="text-[#7A756B] block text-[11px]">University Registration #</span>
                    <span className="font-mono font-bold text-[#171614]">{student.universityRegNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#7A756B] block text-[11px]">Admission Type</span>
                  <span className="font-semibold text-[#171614]">{student.admissionType || "Regular"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACADEMIC */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
              Program & Cohort Enrollment
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#7A756B] block">Program / Grade</span>
                <span className="font-bold text-[#171614] text-sm">{student.currentClass.name}</span>
              </div>
              <div>
                <span className="text-[#7A756B] block">Section</span>
                <span className="font-bold text-[#171614] text-sm">Section {student.currentSection.name}</span>
              </div>
              <div>
                <span className="text-[#7A756B] block">Academic Year</span>
                <span className="font-mono font-bold text-[#171614] text-sm">{student.academicYear.name}</span>
              </div>
              <div>
                <span className="text-[#7A756B] block">Class Mentor / Teacher</span>
                <span className="font-bold text-[#171614] text-sm">
                  {student.currentSection.classTeacher?.fullName || "Administrative Roster"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
              Recent Attendance History (Last 60 Records)
            </span>

            {student.attendance.length === 0 ? (
              <p className="text-xs text-[#7A756B] py-2">No attendance marked yet for this term.</p>
            ) : (
              <div className="divide-y divide-[#EFECE3] text-xs">
                {student.attendance.slice(0, 10).map((att) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#171614]">{formatDate(att.date)}</span>
                      {att.remarks && <span className="text-[#7A756B] text-[11px] ml-2">({att.remarks})</span>}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        att.status === "PRESENT"
                          ? "bg-[#525E4B]/10 text-[#525E4B]"
                          : att.status === "HALF_DAY"
                          ? "bg-[#B89B62]/10 text-[#856D3B]"
                          : "bg-[#8B3A3A]/10 text-[#8B3A3A]"
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: FEES */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
                Total Invoiced
              </span>
              <div className="text-xl font-bold font-mono text-[#171614]">
                ₹{totalFees.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
                Total Paid
              </span>
              <div className="text-xl font-bold font-mono text-[#525E4B]">
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756B] font-bold block">
                Outstanding Balance
              </span>
              <div className="text-xl font-bold font-mono text-[#8B3A3A]">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B]">
                Assigned Fee Structure Breakdown
              </span>
              <Link href="/finance/fees">
                <Button size="sm" variant="outline">
                  Go to Fee Desk & Collect
                </Button>
              </Link>
            </div>

            {student.fees.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FAF8F3] text-center text-xs text-[#7A756B]">
                No specific fee accounts generated for this student.
              </div>
            ) : (
              <div className="divide-y divide-[#EFECE3] text-xs">
                {student.fees.map((fee) => (
                  <div key={fee.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#171614]">{fee.feeStructure.feeCategory.name}</p>
                      <p className="text-[11px] text-[#7A756B] font-mono">
                        Frequency: {fee.feeStructure.frequency} • Due: {formatDate(fee.dueDate)}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#171614]">₹{fee.totalAmount.toLocaleString("en-IN")}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fee.status === "PAID" ? "bg-[#F4F6F1] text-[#525E4B]" : "bg-[#FAF6ED] text-[#856D3B]"}`}>
                        {fee.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Roll Number Modal */}
      {isRollModalOpen && (
        <AssignRollNumberModal
          isOpen={isRollModalOpen}
          onClose={() => setIsRollModalOpen(false)}
          studentId={student.id}
          studentName={student.fullName}
          currentRollNumber={student.rollNumber || null}
          onSuccess={(newRoll) => {
            setStudent((prev) => ({ ...prev, rollNumber: newRoll }));
            router.refresh();
          }}
        />
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={student}
          programs={programs}
          academicYears={academicYears}
          customFields={customFields}
          onSuccess={(updated) => {
            setStudent((prev) => ({ ...prev, ...updated }));
            router.refresh();
          }}
        />
      )}

      {/* Deactivate Student Modal */}
      {isDeactivateModalOpen && (
        <DeactivateStudentModal
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          studentId={student.id}
          studentName={student.fullName}
          admissionNumber={student.admissionNumber}
          onSuccess={() => {
            setStudent((prev) => ({ ...prev, status: "DEACTIVATED" }));
            router.refresh();
          }}
        />
      )}

      {/* Super Admin Permanent Delete Modal */}
      {isDeleteModalOpen && (
        <PermanentDeleteStudentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          student={{
            id: student.id,
            fullName: student.fullName,
            admissionNumber: student.admissionNumber,
            rollNumber: student.rollNumber,
          }}
          onSuccess={() => {
            router.push("/students");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
