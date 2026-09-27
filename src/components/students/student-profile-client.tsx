"use client";

import React, { useState, useEffect } from "react";
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
  Sliders,
  Plus,
  ExternalLink,
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
import { ManageCustomFieldsModal } from "./manage-custom-fields-modal";
import { AddCustomFieldValueModal } from "./add-custom-field-value-modal";
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
    };
  }>;
  customFieldValues: Array<{
    id: string;
    value: string | null;
    customField: {
      id: string;
      name: string;
      key: string;
      fieldType: string;
    };
  }>;
  fees: Array<{
    id: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate: Date | string;
    feeStructure: {
      id: string;
      frequency: string;
      feeCategory: {
        id: string;
        name: string;
      };
    };
    payments: Array<{
      id: string;
      amount: number;
      paymentDate: Date | string;
      paymentMethod: string;
      receiptNumber: string;
    }>;
  }>;
  attendance: Array<{
    id: string;
    date: Date | string;
    status: string;
    remarks?: string | null;
  }>;
}

interface StudentProfileClientProps {
  student?: StudentProfileData;
  initialStudent?: StudentProfileData;
  programs?: ProgramOption[];
  academicYears?: AcademicYearOption[];
  customFields?: CustomFieldOption[];
  currentUserRole?: string;
}

export function StudentProfileClient({
  student: propStudent,
  initialStudent,
  programs = [],
  academicYears = [],
  customFields = [],
  currentUserRole,
}: StudentProfileClientProps) {
  const [student, setStudent] = useState<StudentProfileData>(
    (propStudent || initialStudent)!
  );
  const [activeCustomFields, setActiveCustomFields] = useState<CustomFieldOption[]>(customFields);
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "fees" | "custom_fields">("overview");

  // Modals state
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManageFieldsModalOpen, setIsManageFieldsModalOpen] = useState(false);
  const [isAddFieldValueModalOpen, setIsAddFieldValueModalOpen] = useState(false);
  const [selectedCustomFieldKey, setSelectedCustomFieldKey] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const router = useRouter();

  // Financial summary
  const totalFees = student.fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = student.fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalFees - totalPaid);

  // Attendance summary
  const totalAttendanceDays = student.attendance.length;
  const presentDays = student.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY"
  ).length;
  const attendanceRate = totalAttendanceDays > 0 ? Math.round((presentDays / totalAttendanceDays) * 100) : null;

  // Populated custom fields count
  const populatedCustomFieldsCount =
    student.customFieldValues?.filter(
      (cfv) => cfv.value !== null && cfv.value !== undefined && cfv.value !== ""
    )?.length || 0;

  // Custom field values dictionary
  const customValuesMap: Record<string, any> = {};
  if (student.customFieldValues && Array.isArray(student.customFieldValues)) {
    for (const cfv of student.customFieldValues) {
      if (cfv.customField?.key) {
        customValuesMap[cfv.customField.key] = cfv.value;
      }
    }
  }

  const refreshStudent = async () => {
    try {
      const res = await fetch(`/api/students/${student.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student || data);
      }
    } catch (err) {
      console.error("Failed to refresh student profile:", err);
    }
    router.refresh();
  };

  const refreshCustomFieldDefinitions = async () => {
    try {
      const res = await fetch("/api/students/custom-fields");
      if (res.ok) {
        const data = await res.json();
        setActiveCustomFields(data.customFields || []);
      }
    } catch (err) {
      console.error("Failed to refresh custom field definitions:", err);
    }
  };

  const handleRestoreStudent = async () => {
    if (!confirm(`Restore ${student.fullName} to Active status?`)) return;

    setIsRestoring(true);
    try {
      const res = await fetch(`/api/students/${student.id}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        setStudent((prev) => ({ ...prev, status: "ACTIVE", deactivatedAt: null, deactivationReason: null }));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to restore student");
      }
    } catch (err) {
      console.error("Restore student error:", err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearFieldValue = async (fieldKey: string) => {
    if (!confirm("Remove this custom field value from the student record?")) return;

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customFieldValues: {
            [fieldKey]: null,
          },
        }),
      });

      if (res.ok) {
        await refreshStudent();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to clear field value");
      }
    } catch (err) {
      console.error("Failed to clear custom field value:", err);
    }
  };

  const isDeactivated = student.status === "DEACTIVATED" || student.status === "ARCHIVED";
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 font-sans">
      {/* Back Link & Page Header */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-3 transition-colors"
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
              leftIcon={<Edit3 className="h-3.5 w-3.5 text-muted-foreground" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRollModalOpen(true)}
              leftIcon={<Hash className="h-3.5 w-3.5 text-muted-foreground" />}
            >
              {student.rollNumber ? "Update Roll #" : "Assign Roll #"}
            </Button>
            {isDeactivated ? (
              <Button
                size="sm"
                onClick={handleRestoreStudent}
                isLoading={isRestoring}
                leftIcon={<RefreshCw className="h-3.5 w-3.5 text-primary-foreground" />}
              >
                Restore Student
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeactivateModalOpen(true)}
                leftIcon={<UserX className="h-3.5 w-3.5 text-muted-foreground" />}
              >
                Deactivate
              </Button>
            )}
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-destructive" />}
              >
                Permanent Delete
              </Button>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Deactivated Notice Banner if applicable */}
      {isDeactivated && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserX className="h-4 w-4 shrink-0 text-destructive" />
            <div>
              <span className="font-bold">This student profile is currently DEACTIVATED.</span>
              <p className="text-[11px] text-foreground/80 mt-0.5">
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
        <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Roll Number
          </span>
          <div className="font-mono text-base font-bold text-foreground">
            {student.rollNumber || (
              <span className="text-xs font-sans text-primary font-semibold">Unassigned</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">Institution Roll Identifier</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Attendance Rate
          </span>
          <div className="text-base font-bold text-foreground font-mono">
            {attendanceRate !== null ? `${attendanceRate}%` : "No Records"}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {totalAttendanceDays > 0 ? `${presentDays}/${totalAttendanceDays} days present` : "Term register"}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Fee Ledger Balance
          </span>
          <div className="text-base font-bold text-foreground font-mono">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-primary">
            {totalFees > 0 ? `₹${totalPaid.toLocaleString("en-IN")} Paid of ₹${totalFees.toLocaleString("en-IN")}` : "No dues invoiced"}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            Enrollment Status
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`w-2 h-2 rounded-full ${student.status === "ACTIVE" ? "bg-success" : "bg-destructive"}`} />
            <span className="font-bold text-foreground text-sm uppercase font-mono">{student.status}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Since {formatDate(student.admissionDate)}</span>
        </div>
      </div>

      {/* Clean Tabs Bar */}
      <div className="flex border-b border-border gap-6 text-xs overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === "academic"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Academic & Timetable
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === "fees"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Financial Ledgers & Receipts ({student.fees.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom_fields")}
          className={`pb-3 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "custom_fields"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Fields ({populatedCustomFieldsCount})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1 & 2: Personal & Guardian Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Identity & Personal */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
                Biographical & Identity Information
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">First Name</span>
                  <span className="font-bold text-foreground">{student.firstName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Middle Name</span>
                  <span className="font-bold text-foreground">{student.middleName || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Last Name</span>
                  <span className="font-bold text-foreground">{student.lastName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Date of Birth</span>
                  <span className="font-bold text-foreground">{formatDate(student.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Gender</span>
                  <span className="font-bold text-foreground capitalize">{student.gender.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Blood Group</span>
                  <span className="font-bold text-foreground">{student.bloodGroup || "Not Specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Nationality</span>
                  <span className="font-bold text-foreground">{student.nationality || "Indian"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Social Category</span>
                  <span className="font-bold text-foreground">{student.category || "General"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Aadhaar / National ID</span>
                  <span className="font-mono font-bold text-foreground">
                    {student.aadhaarNumber ? `•••• ${student.aadhaarNumber.slice(-4)}` : "Not Recorded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Guardian & Contact */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
                Guardian & Emergency Relations
              </span>

              {student.guardians.length === 0 ? (
                <p className="text-xs text-muted-foreground">No guardian linkage recorded.</p>
              ) : (
                <div className="space-y-3">
                  {student.guardians.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{g.guardian.fullName}</span>
                          <span className="text-[10px] font-mono text-primary uppercase">({g.guardian.relation})</span>
                          {g.isPrimary && (
                            <span className="text-[9px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1 font-mono">
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

            {/* Institution Custom Fields Summary Snippet */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Custom Fields Summary ({populatedCustomFieldsCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom_fields")}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All →
                  </button>
                </div>
              </div>

              {activeCustomFields.length === 0 ? (
                <div className="text-xs text-muted-foreground flex items-center justify-between py-1">
                  <span>No custom fields configured for your institution yet.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsManageFieldsModalOpen(true)}
                    className="h-7 text-xs"
                  >
                    Configure Fields
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {activeCustomFields.slice(0, 6).map((field) => {
                    const match = student.customFieldValues?.find((cfv) => cfv.customField.key === field.key);
                    return (
                      <div key={field.id} className="space-y-0.5">
                        <span className="text-muted-foreground block text-[11px] truncate">{field.name}</span>
                        <span className="font-bold text-foreground block truncate">
                          {match?.value ? (
                            match.value
                          ) : (
                            <span className="text-muted-foreground/70 font-normal">Not Provided</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Residential & Academic Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
                Residential Location
              </span>
              <p className="text-xs text-foreground leading-relaxed">
                {student.address || [student.addressLine1, student.addressLine2, student.city, student.state, student.pincode, student.country].filter(Boolean).join(", ") || "No address on file."}
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
                Academic Registration Identifiers
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Admission Number</span>
                  <span className="font-mono font-bold text-foreground">{student.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Institution Roll #</span>
                  <span className="font-mono font-bold text-foreground">{student.rollNumber || "Not Assigned"}</span>
                </div>
                {student.universityRegNumber && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">University Registration #</span>
                    <span className="font-mono font-bold text-foreground">{student.universityRegNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block text-[11px]">Admission Type</span>
                  <span className="font-semibold text-foreground">{student.admissionType || "Regular"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
              Program & Cohort Enrollment
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Program / Grade</span>
                <span className="font-bold text-foreground text-sm">{student.currentClass.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Section</span>
                <span className="font-bold text-foreground text-sm">Section {student.currentSection.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Academic Year</span>
                <span className="font-mono font-bold text-foreground text-sm">{student.academicYear.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Class Mentor / Teacher</span>
                <span className="font-bold text-foreground text-sm">
                  {student.currentSection.classTeacher?.fullName || "Administrative Roster"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
              Recent Attendance History (Last 60 Records)
            </span>

            {student.attendance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No attendance marked yet for this term.</p>
            ) : (
              <div className="divide-y divide-border text-xs">
                {student.attendance.slice(0, 10).map((att) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-foreground">{formatDate(att.date)}</span>
                      {att.remarks && <span className="text-muted-foreground text-[11px] ml-2">({att.remarks})</span>}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        att.status === "PRESENT"
                          ? "bg-success/15 text-success border-success/30"
                          : att.status === "HALF_DAY"
                          ? "bg-warning/15 text-warning border-warning/30"
                          : "bg-destructive/15 text-destructive border-destructive/30"
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

      {/* TAB 3: FEES */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                Total Invoiced
              </span>
              <div className="text-xl font-bold font-mono text-foreground">
                ₹{totalFees.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                Total Paid
              </span>
              <div className="text-xl font-bold font-mono text-success">
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                Outstanding Balance
              </span>
              <div className="text-xl font-bold font-mono text-destructive">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                Assigned Fee Structure Breakdown
              </span>
              <Link href="/finance/fees">
                <Button size="sm" variant="outline">
                  Go to Fee Desk & Collect
                </Button>
              </Link>
            </div>

            {student.fees.length === 0 ? (
              <div className="p-6 rounded-2xl bg-muted/40 text-center text-xs text-muted-foreground">
                No specific fee accounts generated for this student.
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {student.fees.map((fee) => (
                  <div key={fee.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{fee.feeStructure.feeCategory.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Frequency: {fee.feeStructure.frequency} • Due: {formatDate(fee.dueDate)}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-foreground">₹{fee.totalAmount.toLocaleString("en-IN")}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${fee.status === "PAID" ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"}`}>
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

      {/* TAB 4: CUSTOM FIELDS */}
      {activeTab === "custom_fields" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl border border-border bg-card shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Institutional Custom Fields</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage custom student demographics, transport routes, previous school history, and organizational tags.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedCustomFieldKey(null);
                  setIsAddFieldValueModalOpen(true);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Field
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageFieldsModalOpen(true)}
                leftIcon={<Sliders className="w-3.5 h-3.5 text-muted-foreground" />}
              >
                Manage Fields
              </Button>
            </div>
          </div>

          {/* Populated Custom Fields Table / List */}
          {student.customFieldValues && student.customFieldValues.filter((cfv) => cfv.value !== null && cfv.value !== undefined && cfv.value !== "").length > 0 ? (
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xs divide-y divide-border">
              {student.customFieldValues
                .filter((cfv) => cfv.value !== null && cfv.value !== undefined && cfv.value !== "")
                .map((cfv) => {
                  const def = activeCustomFields.find((f) => f.key === cfv.customField?.key);
                  return (
                    <div
                      key={cfv.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-foreground text-xs">
                            {cfv.customField?.name || def?.name || cfv.customField?.key}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                            {cfv.customField?.key}
                          </span>
                          {def?.fieldType && (
                            <Badge variant="outline" className="text-[10px]">
                              {def.fieldType}
                            </Badge>
                          )}
                        </div>
                        {def?.helpText && <p className="text-[11px] text-muted-foreground">{def.helpText}</p>}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-xs font-semibold text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border max-w-xs truncate">
                          {cfv.value}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomFieldKey(cfv.customField?.key);
                              setIsAddFieldValueModalOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClearFieldValue(cfv.customField?.key)}
                            className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                            title="Clear Field Value"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="p-10 rounded-3xl border border-dashed border-border bg-card text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">No Custom Fields Added</h4>
                <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-1">
                  No custom fields have been added for this student. Assign configured institutional fields or define new fields.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomFieldKey(null);
                    setIsAddFieldValueModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Field
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManageFieldsModalOpen(true)}
                  leftIcon={<Sliders className="w-3.5 h-3.5 text-muted-foreground" />}
                >
                  Manage Fields
                </Button>
              </div>
            </div>
          )}
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

      {/* Edit Student Profile Modal */}
      {isEditModalOpen && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={student}
          programs={programs}
          academicYears={academicYears}
          customFields={activeCustomFields}
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

      {/* Manage Institution Custom Fields Modal */}
      {isManageFieldsModalOpen && (
        <ManageCustomFieldsModal
          isOpen={isManageFieldsModalOpen}
          onClose={() => setIsManageFieldsModalOpen(false)}
          onFieldsUpdated={async () => {
            await refreshCustomFieldDefinitions();
            await refreshStudent();
          }}
        />
      )}

      {/* Add / Edit Student Custom Field Value Modal */}
      {isAddFieldValueModalOpen && (
        <AddCustomFieldValueModal
          isOpen={isAddFieldValueModalOpen}
          onClose={() => setIsAddFieldValueModalOpen(false)}
          studentId={student.id}
          studentName={student.fullName}
          availableCustomFields={activeCustomFields}
          existingValues={customValuesMap}
          initialFieldKey={selectedCustomFieldKey}
          onSuccess={async () => {
            await refreshStudent();
          }}
          onOpenManageFields={() => {
            setIsManageFieldsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
