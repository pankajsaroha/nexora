"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  CalendarDays,
  Clock,
  Search,
  Plus,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  KeyRound,
  UserX,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Award,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { StaffOnboardingDialog } from "@/components/teachers/staff-onboarding-dialog";
import { EditStaffModal } from "@/components/teachers/edit-staff-modal";
import { DeactivateStaffModal } from "@/components/teachers/deactivate-staff-modal";
import { PermanentDeleteStaffModal } from "@/components/teachers/permanent-delete-staff-modal";
import { AssignTeachingModal } from "@/components/teachers/assign-teaching-modal";
import { ManageAccessModal } from "@/components/teachers/manage-access-modal";

export interface FormattedTeacherRecord {
  id: string;
  employeeId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  departmentId?: string | null;
  departmentName: string;
  departmentCode?: string;
  joiningDate: Date | string;
  employmentStatus: string;
  basicSalary: number;
  staffType: string;
  employmentType: string;
  photoUrl?: string | null;
  hasPortalAccess: boolean;
  portalRole?: string | null;
  classTeacherOf?: string | null;
  assignmentsCount: number;
  todayAttendance: string;
  casualLeaveBalance: number;
  sickLeaveBalance: number;
  earnedLeaveBalance: number;
  rawMetadata?: any;
  userAccount?: any;
}

interface TeacherListClientProps {
  teachers: FormattedTeacherRecord[];
  departments: Array<{ id: string; name: string; code: string }>;
  academicYears?: Array<{ id: string; name: string; isCurrent?: boolean }>;
  hrStats: {
    totalStaff: number;
    teachingCount: number;
    nonTeachingCount: number;
    activeCount: number;
    onLeaveCount: number;
    pendingLeaves: number;
  };
  canManage: boolean;
  canViewSalary: boolean;
  isSuperAdmin: boolean;
}

export function TeacherListClient({
  teachers: initialTeachers,
  departments,
  academicYears = [],
  hrStats,
  canManage,
  canViewSalary,
  isSuperAdmin,
}: TeacherListClientProps) {
  const router = useRouter();

  // Search and Filters
  const [search, setSearch] = useState("");
  const [selectedStaffType, setSelectedStaffType] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedAccess, setSelectedAccess] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Active dropdown menu for actions column
  const [openMenuStaffId, setOpenMenuStaffId] = useState<string | null>(null);

  // Modals state
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<any | null>(null);
  const [selectedStaffForDeactivate, setSelectedStaffForDeactivate] = useState<any | null>(null);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState<any | null>(null);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState<any | null>(null);
  const [selectedStaffForAccess, setSelectedStaffForAccess] = useState<any | null>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuStaffId(null);
    if (openMenuStaffId) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openMenuStaffId]);

  // Filtered list
  const filteredTeachers = initialTeachers.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.fullName.toLowerCase().includes(q) ||
      t.employeeId.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      t.departmentName.toLowerCase().includes(q);

    const matchesType =
      selectedStaffType === "ALL" ||
      (selectedStaffType === "TEACHING" && t.staffType === "TEACHING") ||
      (selectedStaffType === "NON_TEACHING" && t.staffType === "NON_TEACHING");

    const matchesDept =
      selectedDept === "ALL" ||
      t.departmentId === selectedDept ||
      t.departmentName.toLowerCase() === selectedDept.toLowerCase();

    const matchesStatus = selectedStatus === "ALL" || t.employmentStatus === selectedStatus;

    const matchesAccess =
      selectedAccess === "ALL" ||
      (selectedAccess === "GRANTED" && t.hasPortalAccess) ||
      (selectedAccess === "NONE" && !t.hasPortalAccess);

    return matchesSearch && matchesType && matchesDept && matchesStatus && matchesAccess;
  });

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRestoreStaff = async (staffId: string, fullName: string) => {
    try {
      const res = await fetch(`/api/teachers/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (!res.ok) throw new Error("Failed to restore staff");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to restore");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              PEOPLE & HUMAN RESOURCES
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
            Teachers & Staff Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage faculty, staff, assignments, access, and employment records.
          </p>
        </div>

        {/* Header Action Buttons - Perfectly Aligned Single Row */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/import" className="inline-flex shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4 text-muted-foreground shrink-0" />}
              className="h-9 px-4 text-xs font-semibold whitespace-nowrap shrink-0 rounded-xl"
            >
              Import CSV
            </Button>
          </Link>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setOnboardOpen(true)}
              leftIcon={<Plus className="w-4 h-4 shrink-0" />}
              className="h-9 px-4 text-xs font-semibold whitespace-nowrap shrink-0 rounded-xl shadow-xs"
            >
              Onboard Staff
            </Button>
          )}
        </div>
      </div>

      {/* HR Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Staff</span>
            <Users className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          </div>
          <div className="text-xl font-bold text-foreground">{hrStats.totalStaff}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Teaching Faculty</span>
            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          </div>
          <div className="text-xl font-bold text-foreground">{hrStats.teachingCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Non-Teaching</span>
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          </div>
          <div className="text-xl font-bold text-foreground">{hrStats.nonTeachingCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Active on Duty</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 opacity-80" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {hrStats.activeCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">On Leave</span>
            <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-80" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {hrStats.onLeaveCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Pending Leaves</span>
            <Clock className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          </div>
          <div className="text-xl font-bold text-foreground">{hrStats.pendingLeaves}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-card rounded-2xl border border-border shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name, employee code, designation, email, or phone..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-border bg-muted/30 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Staff Type */}
          <select
            value={selectedStaffType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedStaffType(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9"
          >
            <option value="ALL">All Staff Types</option>
            <option value="TEACHING">Teaching Staff</option>
            <option value="NON_TEACHING">Non-Teaching Staff</option>
          </select>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="RESIGNED">Resigned</option>
            <option value="RETIRED">Retired</option>
            <option value="TERMINATED">Terminated</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          {/* Portal Access */}
          <select
            value={selectedAccess}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedAccess(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9"
          >
            <option value="ALL">Portal Access (All)</option>
            <option value="GRANTED">Login Active</option>
            <option value="NONE">No Login</option>
          </select>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-[22%] min-w-[180px]">Staff Member</th>
                <th className="py-3.5 px-4 w-[16%] min-w-[140px]">Designation / Department</th>
                <th className="py-3.5 px-4 w-[10%] min-w-[95px]">Staff Type</th>
                <th className="py-3.5 px-4 w-[12%] min-w-[110px]">Assignments</th>
                <th className="py-3.5 px-4 w-[15%] min-w-[140px]">Contact</th>
                <th className="py-3.5 px-4 w-[13%] min-w-[135px]">Status / Access</th>
                <th className="py-3.5 px-4 w-[12%] min-w-[130px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground space-y-2">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                    <p className="font-semibold text-foreground text-sm">No Staff Records Found</p>
                    <p className="text-xs text-muted-foreground">
                      No staff members match the selected search or filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Staff Member */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/teachers/${t.id}`}
                        className="flex items-center gap-3 group-hover:text-primary transition-colors truncate"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt={t.fullName}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span>{t.firstName[0]}{t.lastName[0] || ""}</span>
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <div
                            className="font-bold text-foreground group-hover:text-primary truncate text-xs"
                            title={t.fullName}
                          >
                            {t.fullName}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {t.employeeId}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Designation / Department */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground truncate text-xs" title={t.designation}>
                        {t.designation}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={t.departmentName}>
                        {t.departmentName}
                      </p>
                    </td>

                    {/* Staff Type */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={
                          t.staffType === "TEACHING"
                            ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                            : "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30 text-[10px]"
                        }
                      >
                        {t.staffType === "TEACHING" ? "Teaching" : "Non-Teaching"}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5 capitalize truncate">
                        {t.employmentType.toLowerCase()}
                      </div>
                    </td>

                    {/* Assignments */}
                    <td className="py-3.5 px-4">
                      {t.classTeacherOf ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 max-w-full truncate"
                          title={t.classTeacherOf}
                        >
                          <Award className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.classTeacherOf}</span>
                        </span>
                      ) : t.assignmentsCount > 0 ? (
                        <span className="text-[11px] text-muted-foreground font-medium truncate block">
                          {t.assignmentsCount} Courses
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-[11px] text-muted-foreground space-y-0.5">
                      <div className="text-foreground truncate text-xs" title={t.email}>
                        {t.email}
                      </div>
                      <div className="font-mono text-muted-foreground truncate text-[11px]">{t.phone}</div>
                    </td>

                    {/* Status / Access */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start min-w-0">
                        <Badge
                          variant="outline"
                          className={
                            t.employmentStatus === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                              : t.employmentStatus === "ON_LEAVE"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                              : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                          }
                        >
                          {t.employmentStatus}
                        </Badge>
                        <div className="text-[11px] whitespace-nowrap">
                          {t.hasPortalAccess ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <ShieldCheck className="w-3 h-3 shrink-0" />
                              <span className="truncate">Portal: Active</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground opacity-75">
                              <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>No portal access</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions Column: Profile → and ⋯ Menu */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* Primary Visible Action: Profile */}
                        <Link href={`/teachers/${t.id}`} className="shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs text-primary hover:text-foreground font-semibold inline-flex items-center whitespace-nowrap rounded-lg shrink-0"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                          </Button>
                        </Link>

                        {/* Compact ⋯ Overflow Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            aria-label={`More actions for ${t.fullName}`}
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuStaffId(openMenuStaffId === t.id ? null : t.id);
                            }}
                            className={`h-8 w-8 rounded-lg border transition-colors flex items-center justify-center shrink-0 ${
                              openMenuStaffId === t.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground shadow-2xs"
                            }`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openMenuStaffId === t.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-border/50 text-left"
                            >
                              <div className="py-1">
                                <Link
                                  href={`/teachers/${t.id}`}
                                  onClick={() => setOpenMenuStaffId(null)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 transition-colors font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span>View Profile</span>
                                </Link>

                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStaffForEdit({
                                        id: t.id,
                                        firstName: t.firstName,
                                        lastName: t.lastName,
                                        fullName: t.fullName,
                                        email: t.email,
                                        phone: t.phone,
                                        designation: t.designation,
                                        departmentId: t.departmentId,
                                        department: t.departmentName,
                                        status: t.employmentStatus,
                                        staffType: t.staffType,
                                        metadata: t.rawMetadata,
                                      });
                                      setOpenMenuStaffId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>Edit Staff</span>
                                  </button>
                                )}

                                {t.staffType === "TEACHING" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStaffForAssign({
                                        id: t.id,
                                        fullName: t.fullName,
                                        employeeCode: t.employeeId,
                                        department: t.departmentName,
                                      });
                                      setOpenMenuStaffId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>Assign Subjects & Homeroom</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStaffForAccess({
                                      id: t.id,
                                      fullName: t.fullName,
                                      employeeCode: t.employeeId,
                                      officialEmail: t.email,
                                      user: t.userAccount,
                                    });
                                    setOpenMenuStaffId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Manage Portal Access</span>
                                </button>
                              </div>

                              <div className="py-1">
                                {t.employmentStatus === "ACTIVE" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStaffForDeactivate({
                                        id: t.id,
                                        fullName: t.fullName,
                                        employeeCode: t.employeeId,
                                        designation: t.designation,
                                        status: t.employmentStatus,
                                      });
                                      setOpenMenuStaffId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-left transition-colors font-medium"
                                  >
                                    <UserX className="w-3.5 h-3.5 shrink-0" />
                                    <span>Deactivate Staff</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRestoreStaff(t.id, t.fullName);
                                      setOpenMenuStaffId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-left transition-colors font-medium"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span>Restore Staff</span>
                                  </button>
                                )}

                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStaffForDelete({
                                        id: t.id,
                                        fullName: t.fullName,
                                        employeeCode: t.employeeId,
                                        designation: t.designation,
                                      });
                                      setOpenMenuStaffId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-destructive hover:bg-destructive/10 text-left transition-colors font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Delete Permanently</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-2.5 bg-muted/30 border-t border-border">
          <PremiumPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTeachers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Onboarding Dialog */}
      {onboardOpen && (
        <StaffOnboardingDialog
          isOpen={onboardOpen}
          onClose={() => setOnboardOpen(false)}
          departments={departments}
          academicYears={academicYears}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Edit Staff Modal */}
      {selectedStaffForEdit && (
        <EditStaffModal
          isOpen={!!selectedStaffForEdit}
          onClose={() => setSelectedStaffForEdit(null)}
          staff={selectedStaffForEdit}
          departments={departments}
          onSuccess={() => {
            setSelectedStaffForEdit(null);
            router.refresh();
          }}
        />
      )}

      {/* Deactivate Modal */}
      {selectedStaffForDeactivate && (
        <DeactivateStaffModal
          isOpen={!!selectedStaffForDeactivate}
          onClose={() => setSelectedStaffForDeactivate(null)}
          staff={selectedStaffForDeactivate}
          onSuccess={() => {
            setSelectedStaffForDeactivate(null);
            router.refresh();
          }}
        />
      )}

      {/* Delete Modal */}
      {selectedStaffForDelete && (
        <PermanentDeleteStaffModal
          isOpen={!!selectedStaffForDelete}
          onClose={() => setSelectedStaffForDelete(null)}
          staff={selectedStaffForDelete}
          onSuccess={() => {
            setSelectedStaffForDelete(null);
            router.refresh();
          }}
        />
      )}

      {/* Assign Teaching Modal */}
      {selectedStaffForAssign && (
        <AssignTeachingModal
          isOpen={!!selectedStaffForAssign}
          onClose={() => setSelectedStaffForAssign(null)}
          staff={selectedStaffForAssign}
          onSuccess={() => {
            setSelectedStaffForAssign(null);
            router.refresh();
          }}
        />
      )}

      {/* Manage Access Modal */}
      {selectedStaffForAccess && (
        <ManageAccessModal
          isOpen={!!selectedStaffForAccess}
          onClose={() => setSelectedStaffForAccess(null)}
          staff={selectedStaffForAccess}
          onSuccess={() => {
            setSelectedStaffForAccess(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
