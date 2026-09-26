"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Shield,
  Upload,
  CheckCircle2,
  X,
  UserPlus,
  ArrowRight,
  Hash,
  FileText,
  ExternalLink,
  Archive,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentAdmissionDialog, ProgramOption, AcademicYearOption, CustomFieldOption } from "./student-admission-dialog";
import { AssignRollNumberModal } from "./assign-roll-number-modal";

export interface StudentListItem {
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
  gender: string;
  dateOfBirth: Date | string;
  bloodGroup?: string | null;
  nationality?: string | null;
  category?: string | null;
  aadhaarNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  admissionDate: Date | string;
  admissionType?: string | null;
  className: string;
  classCode: string;
  classLevel: string;
  departmentName?: string | null;
  sectionName: string;
  classTeacherName?: string | null;
  academicYearName: string;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  guardianEmail?: string | null;
  guardianOccupation?: string | null;
  status: string;
  deactivatedAt?: Date | string | null;
  deactivationReason?: string | null;
  feesTotal: number;
  feesPaid: number;
  feesPending: number;
  feeBreakdown: Array<{
    id: string;
    category: string;
    amount: number;
    paid: number;
    pending: number;
    status: string;
  }>;
  customFieldValues?: Array<{
    id: string;
    value: string | null;
    customField: {
      id: string;
      name: string;
      key: string;
      fieldType: string;
    };
  }>;
}

export function StudentListClient({
  students,
  programs,
  academicYears,
  customFields = [],
  canCreate,
}: {
  students: StudentListItem[];
  programs: ProgramOption[];
  academicYears: AcademicYearOption[];
  customFields?: CustomFieldOption[];
  canCreate: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [statusTab, setStatusTab] = useState<"ACTIVE" | "DEACTIVATED" | "ALL">("ACTIVE");
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "academic" | "fees">("overview");
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [rollModalTarget, setRollModalTarget] = useState<{ id: string; name: string; roll: string | null } | null>(null);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const router = useRouter();

  const filteredStudents = students.filter((st) => {
    // Status Filter
    if (statusTab === "ACTIVE" && st.status !== "ACTIVE") return false;
    if (statusTab === "DEACTIVATED" && (st.status !== "DEACTIVATED" && st.status !== "ARCHIVED")) return false;

    const matchQuery =
      st.fullName.toLowerCase().includes(search.toLowerCase()) ||
      st.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(search.toLowerCase())) ||
      (st.email && st.email.toLowerCase().includes(search.toLowerCase())) ||
      (st.guardianName && st.guardianName.toLowerCase().includes(search.toLowerCase()));

    const matchProgram =
      selectedProgramFilter === "ALL" || st.className.toLowerCase().includes(selectedProgramFilter.toLowerCase());

    const matchGender =
      selectedGender === "ALL" || st.gender === selectedGender;

    return matchQuery && matchProgram && matchGender;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const deactivatedCount = students.filter((s) => s.status === "DEACTIVATED" || s.status === "ARCHIVED").length;

  const handleAdmissionSuccess = (newStudent: any) => {
    router.refresh();
  };

  const handleRestoreStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Restore ${studentName} to ACTIVE student directory?`)) return;
    setIsRestoringId(studentId);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESTORE" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Restore student error:", err);
    } finally {
      setIsRestoringId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        eyebrow="INSTITUTIONAL REGISTRY"
        title="Students & Enrollments"
        description="Comprehensive directory of registered candidates, guardian linkages, official roll numbers, and assigned program fee accounts."
      >
        <Link href="/settings/student-fields">
          <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5 text-[#856D3B]" />}>
            Custom Fields ({customFields.length})
          </Button>
        </Link>
        <Link href="/import">
          <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5 text-[#7A756B]" />}>
            Import CSV
          </Button>
        </Link>
        {canCreate && (
          <Button
            size="sm"
            onClick={() => setIsAdmissionOpen(true)}
            leftIcon={<UserPlus className="h-3.5 w-3.5 text-[#D4B87C]" />}
          >
            New Student Admission
          </Button>
        )}
      </PageHeader>

      {/* Lifecycle Status Tabs */}
      <div className="flex border-b border-[#EFECE3] gap-2 pb-1">
        {[
          { id: "ACTIVE", label: `Active Students (${activeCount})` },
          { id: "DEACTIVATED", label: `Archived / Deactivated (${deactivatedCount})` },
          { id: "ALL", label: `All Records (${students.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusTab(tab.id as any);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusTab === tab.id
                ? "bg-[#171614] text-[#FAF8F3] shadow-xs"
                : "text-[#7A756B] hover:text-[#171614] hover:bg-[#FAF8F3]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-[#E5E0D5] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A756B]" />
          <input
            type="search"
            placeholder="Search by student name, admission #, roll #, guardian, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#7A756B] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProgramFilter}
            onChange={(e) => {
              setSelectedProgramFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          >
            <option value="ALL">All Programs & Classes</option>
            {programs.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#EFECE3] bg-[#FAF8F3] text-[#7A756B] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Student Identity</th>
                <th className="py-3.5 px-4 font-bold">Program / Course</th>
                <th className="py-3.5 px-4 font-bold">Roll No.</th>
                <th className="py-3.5 px-4 font-bold">Primary Guardian</th>
                <th className="py-3.5 px-4 font-bold">Contact</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7A756B] font-mono text-xs">
                    No enrolled student records found in this view.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => {
                  const isDeact = st.status === "DEACTIVATED" || st.status === "ARCHIVED";
                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-[#FAF8F3] transition-colors ${isDeact ? "opacity-75 bg-[#FAF8F3]/40" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171614]">
                          {st.fullName}
                        </div>
                        <div className="text-[11px] text-[#7A756B] font-mono mt-0.5">
                          {st.admissionNumber} · {st.gender}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#35322C]">
                          {st.className}
                        </div>
                        <div className="text-[10px] text-[#7A756B] font-mono">
                          Section {st.sectionName} • {st.academicYearName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {st.rollNumber ? (
                          <span className="font-bold text-[#171614] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#E5E0D5]">
                            {st.rollNumber}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRollModalTarget({ id: st.id, name: st.fullName, roll: null })}
                            className="text-[10px] font-mono font-bold text-[#856D3B] hover:underline bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#D4B87C]/30"
                          >
                            Not assigned
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#171614] font-semibold">
                          {st.guardianName || "No guardian linked"}
                        </div>
                        <div className="text-[10px] text-[#7A756B] font-mono">
                          {st.guardianRelation || "Parent"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#7A756B] font-mono">
                        {st.guardianPhone || st.phone || "Not provided"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            st.status === "ACTIVE"
                              ? "bg-[#F4F6F1] text-[#525E4B] border-[#65705B]/30"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isDeact ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreStudent(st.id, st.fullName)}
                              disabled={isRestoringId === st.id}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#525E4B] hover:underline"
                            >
                              <RefreshCw className={`w-3 h-3 ${isRestoringId === st.id ? "animate-spin" : ""}`} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(st)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#856D3B] hover:text-[#171614] transition-colors"
                            >
                              <span>Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <Link
                            href={`/students/${st.id}`}
                            className="text-[#7A756B] hover:text-[#171614] p-1"
                            title="Open Full Dossier Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-2 bg-[#FAF8F3]/50">
          <PremiumPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Slide-Over Drawer Profile (100% Real Persisted Database Data) */}
      {selectedStudent && (
        <Drawer
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.fullName}
          description={`Admission ID: ${selectedStudent.admissionNumber} • ${selectedStudent.className} (Section ${selectedStudent.sectionName})`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Drawer Tab Navigation */}
            <div className="flex border-b border-[#EFECE3] pb-2 gap-2">
              {[
                { id: "overview", label: "Overview" },
                { id: "academic", label: "Academic & Cohort" },
                { id: "fees", label: "Fees & Ledger" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    drawerTab === tab.id
                      ? "bg-[#171614] text-[#FAF8F3] shadow-xs"
                      : "text-[#7A756B] hover:text-[#171614] hover:bg-[#FAF8F3]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {drawerTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Card Header */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#171614] text-[#FAF8F3] flex items-center justify-center font-bold text-lg shadow-xs">
                      {selectedStudent.firstName[0]}
                      {selectedStudent.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#171614]">{selectedStudent.fullName}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                          selectedStudent.status === "ACTIVE"
                            ? "bg-[#F4F6F1] text-[#525E4B] border-[#65705B]/30"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {selectedStudent.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A756B] mt-0.5 font-mono">
                        Roll: {selectedStudent.rollNumber || "Not assigned"} • {selectedStudent.className} ({selectedStudent.sectionName})
                      </p>
                      <p className="text-[11px] text-[#7A756B] font-mono mt-0.5">
                        {selectedStudent.email || "No direct email provided"}
                      </p>
                    </div>
                  </div>

                  <Link href={`/students/${selectedStudent.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3 w-3" />}>
                      Full Dossier
                    </Button>
                  </Link>
                </div>

                {/* Demographics Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                    Personal Demographics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-[#E5E0D5] bg-white text-xs shadow-2xs">
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Gender:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{selectedStudent.gender}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Date of Birth:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{formatDate(selectedStudent.dateOfBirth)}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Blood Group:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{selectedStudent.bloodGroup || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Nationality:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{selectedStudent.nationality || "Indian"}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Category:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{selectedStudent.category || "General"}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Aadhaar / ID:</span>
                      <p className="font-mono font-bold text-[#171614] mt-0.5">{selectedStudent.aadhaarNumber || "Not provided"}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-3 border-t border-[#EFECE3]">
                      <span className="text-[#7A756B] text-[11px]">Residential Address:</span>
                      <p className="font-medium text-[#35322C] mt-0.5 leading-relaxed">
                        {selectedStudent.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Fields in Drawer if present */}
                {selectedStudent.customFieldValues && selectedStudent.customFieldValues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                      Institutional Custom Fields
                    </span>
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-[#E5E0D5] bg-white text-xs shadow-2xs">
                      {selectedStudent.customFieldValues.map((cfv) => (
                        <div key={cfv.id}>
                          <span className="text-[#7A756B] text-[11px]">{cfv.customField.name}:</span>
                          <p className="font-bold text-[#171614] mt-0.5">
                            {cfv.value === "true" ? "Yes" : cfv.value === "false" ? "No" : cfv.value || "Not provided"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guardian Linkage */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                    Guardian & Family Linkage
                  </span>
                  <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-2.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A756B]">Primary Guardian:</span>
                      <span className="font-bold text-[#171614]">{selectedStudent.guardianName || "No guardian linked"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A756B]">Relationship:</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F3] text-[#171614] border border-[#DCD7CB] font-bold">
                        {selectedStudent.guardianRelation || "PARENT"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7A756B]">Emergency Phone:</span>
                      <span className="font-mono font-bold text-[#171614]">
                        {selectedStudent.guardianPhone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC & COHORT */}
            {drawerTab === "academic" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white text-xs space-y-3 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                    Program & Class Assignment
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171614]">{selectedStudent.className}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B] font-bold">
                      Section {selectedStudent.sectionName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#7A756B]">
                    <span>Academic Year:</span>
                    <span className="font-mono font-bold text-[#171614]">{selectedStudent.academicYearName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#7A756B]">
                    <span>Class Tutor:</span>
                    <span className="font-bold text-[#171614]">{selectedStudent.classTeacherName || "Not assigned"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FEES & LEDGER */}
            {drawerTab === "fees" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B]">
                      Assigned Fee Balance
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50 font-bold">
                      {selectedStudent.feesPending > 0 ? "Pending" : "Settled"}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#171614] font-mono">
                    ₹{selectedStudent.feesPending.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-[#7A756B]">
                    Total: ₹{selectedStudent.feesTotal.toLocaleString("en-IN")} · Paid: ₹{selectedStudent.feesPaid.toLocaleString("en-IN")}
                  </p>
                </div>

                {selectedStudent.feeBreakdown.length > 0 && (
                  <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white text-xs space-y-2 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                      Fee Breakdown
                    </span>
                    <div className="divide-y divide-[#EFECE3]">
                      {selectedStudent.feeBreakdown.map((item) => (
                        <div key={item.id} className="py-2 flex items-center justify-between">
                          <span className="font-medium text-[#171614]">{item.category}</span>
                          <span className="font-mono font-bold text-[#171614]">₹{item.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/finance/fees" className="block">
                    <Button className="w-full">
                      View Fee Ledger & Invoices
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* New Student Admission Modal Dialog */}
      {isAdmissionOpen && (
        <StudentAdmissionDialog
          isOpen={isAdmissionOpen}
          onClose={() => setIsAdmissionOpen(false)}
          programs={programs}
          academicYears={academicYears}
          customFields={customFields}
          onSuccess={handleAdmissionSuccess}
          onAssignRollNumber={(studentId, currentRoll) => {
            const admitted = students.find((s) => s.id === studentId);
            setRollModalTarget({
              id: studentId,
              name: admitted?.fullName || "Student",
              roll: currentRoll,
            });
          }}
        />
      )}

      {/* Assign Roll Number Modal */}
      {rollModalTarget && (
        <AssignRollNumberModal
          isOpen={!!rollModalTarget}
          onClose={() => setRollModalTarget(null)}
          studentId={rollModalTarget.id}
          studentName={rollModalTarget.name}
          currentRollNumber={rollModalTarget.roll}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
