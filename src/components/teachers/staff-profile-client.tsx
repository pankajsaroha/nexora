"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  KeyRound,
  History,
  Edit,
  Mail,
  Phone,
  Building,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Lock,
  Sparkles,
  Award,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  MapPin,
  HeartHandshake,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditStaffModal } from "@/components/teachers/edit-staff-modal";
import { DeactivateStaffModal } from "@/components/teachers/deactivate-staff-modal";
import { PermanentDeleteStaffModal } from "@/components/teachers/permanent-delete-staff-modal";
import { AssignTeachingModal } from "@/components/teachers/assign-teaching-modal";
import { ManageAccessModal } from "@/components/teachers/manage-access-modal";
import { AddDocumentModal } from "@/components/teachers/add-document-modal";

interface StaffProfileClientProps {
  staff: any;
  currentUserId?: string;
  isSuperAdmin?: boolean;
  canManageStaff?: boolean;
  canViewPayroll?: boolean;
}

export function StaffProfileClient({
  staff: initialStaff,
  currentUserId,
  isSuperAdmin = false,
  canManageStaff = true,
  canViewPayroll = true,
}: StaffProfileClientProps) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Dropdown states
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [moreTabMenuOpen, setMoreTabMenuOpen] = useState(false);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fullName = `${staff.firstName} ${staff.lastName}`.trim();
  const meta = staff.metadata || {};
  const isTeaching = staff.staffType !== "NON_TEACHING";

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setHeaderMenuOpen(false);
      setMoreTabMenuOpen(false);
    };
    if (headerMenuOpen || moreTabMenuOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [headerMenuOpen, moreTabMenuOpen]);

  const refreshData = async () => {
    try {
      const res = await fetch(`/api/teachers/${staff.id}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    try {
      const res = await fetch(`/api/teachers/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (!res.ok) throw new Error("Failed to restore staff");
      setActionMessage(`${fullName} has been restored to Active status.`);
      refreshData();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to restore staff");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this document?")) return;
    try {
      const res = await fetch(`/api/teachers/${staff.id}/documents?docId=${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      refreshData();
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
    }
  };

  // Primary 6 Tabs
  const primaryTabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal", icon: MapPin },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "attendance", label: "Attendance & Leave", icon: CalendarCheck },
    { id: "documents", label: `Documents (${meta.documents?.length || 0})`, icon: FileText },
  ];

  // Secondary Tabs under "More ▾"
  const secondaryTabs = [
    ...(canViewPayroll ? [{ id: "payroll", label: "Payroll", icon: CreditCard }] : []),
    { id: "access", label: "System Access", icon: KeyRound },
    { id: "activity", label: "Activity", icon: History },
  ];

  const isMoreTabActive = secondaryTabs.some((t) => t.id === activeTab);
  const activeSecondaryTabLabel = secondaryTabs.find((t) => t.id === activeTab)?.label;

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto py-2">
      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/teachers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Teachers & Staff</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs font-medium text-foreground flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs text-muted-foreground hover:text-foreground font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Profile Identity Header Card */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity Left Column */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-xl sm:text-2xl text-primary shrink-0 overflow-hidden shadow-2xs">
              {staff.profilePhoto ? (
                <img
                  src={staff.profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {staff.firstName[0]}
                  {staff.lastName?.[0] || ""}
                </span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
                  {fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[11px] font-bold border border-border">
                  {staff.employeeCode}
                </span>
              </div>

              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="text-foreground font-semibold">{staff.designation || "Staff Member"}</span>
                <span>·</span>
                <span>{staff.department || "General Department"}</span>
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge
                  variant="outline"
                  className={
                    staff.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                      : staff.status === "ON_LEAVE"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                      : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                  }
                >
                  {staff.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    isTeaching
                      ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                      : "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30 text-[10px]"
                  }
                >
                  {staff.staffType || "TEACHING"}
                </Badge>
                {meta.employmentType && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {meta.employmentType.toLowerCase()}
                  </Badge>
                )}
              </div>

              {/* Contact & Meta Sub-row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                {(staff.officialEmail || staff.email) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{staff.officialEmail || staff.email}</span>
                  </div>
                )}
                {staff.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{staff.phone}</span>
                  </div>
                )}
                {staff.joiningDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Joined {new Date(staff.joiningDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  {staff.user ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Portal: Enabled</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 opacity-75">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Portal: No account</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Identity Actions: Primary [Edit Staff] + Secondary [⋯] */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {canManageStaff && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-9 px-4 text-xs font-semibold shadow-xs inline-flex items-center gap-2 rounded-xl"
              >
                <Edit className="w-3.5 h-3.5 shrink-0" />
                <span>Edit Staff</span>
              </Button>
            )}

            {/* Overflow Menu ⋯ */}
            <div className="relative">
              <button
                type="button"
                title="More Actions"
                aria-label={`Actions for ${fullName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setHeaderMenuOpen(!headerMenuOpen);
                }}
                className={`h-9 w-9 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                  headerMenuOpen
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground shadow-2xs"
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {headerMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-border/50 text-left"
                >
                  <div className="py-1">
                    {isTeaching && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignOpen(true);
                          setHeaderMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Assign Teaching</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDocumentOpen(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Upload Document</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccessOpen(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-foreground hover:bg-muted/60 text-left transition-colors font-medium"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Manage Portal Access</span>
                    </button>
                  </div>

                  <div className="py-1">
                    {staff.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeactivateOpen(true);
                          setHeaderMenuOpen(false);
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
                          handleRestore();
                          setHeaderMenuOpen(false);
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
                          setDeleteOpen(true);
                          setHeaderMenuOpen(false);
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
        </div>
      </div>

      {/* Clean 6-Tab Navigation with "More ▾" */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More ▾ Dropdown Tab */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMoreTabMenuOpen(!moreTabMenuOpen);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
              isMoreTabActive
                ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <span>{isMoreTabActive ? activeSecondaryTabLabel : "More"}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </button>

          {moreTabMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1.5 w-44 rounded-xl bg-card border border-border shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
            >
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMoreTabMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors font-medium ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (True 360° Summary)                                      */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Card 1: Employment Snapshot */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Employment</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("employment")}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  View details
                </button>
              </div>
              <div className="space-y-2 text-xs divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-semibold text-foreground">{staff.designation}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold text-foreground">{staff.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Employment Type:</span>
                  <span className="font-semibold text-foreground capitalize">{meta.employmentType?.toLowerCase() || "Permanent"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Work Location:</span>
                  <span className="font-semibold text-foreground">{meta.campus || "Main Campus"}</span>
                </div>
              </div>
            </div>

            {/* Summary Card 2: Academic / Workload Snapshot */}
            {isTeaching ? (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Academic Load</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("academic")}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    View details
                  </button>
                </div>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Homeroom Incharge:</span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]" title={staff.classTeacherOf?.map((c: any) => `${c.name} ${c.section || ""}`).join(", ")}>
                      {staff.classTeacherOf && staff.classTeacherOf.length > 0
                        ? staff.classTeacherOf.map((c: any) => `${c.name} ${c.section || ""}`).join(", ")
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Assigned Courses:</span>
                    <span className="font-semibold text-foreground">
                      {staff.assignments?.length || 0} Courses
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Weekly Periods:</span>
                    <span className="font-semibold text-foreground">
                      {meta.weeklyLoad || "18"} Periods/Wk
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Staff Category:</span>
                    <span className="font-semibold text-foreground">Teaching Faculty</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>Operational Scope</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("employment")}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    View details
                  </button>
                </div>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Staff Category:</span>
                    <span className="font-semibold text-foreground">Non-Teaching Operations</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Division:</span>
                    <span className="font-semibold text-foreground">{staff.department}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Work Shift:</span>
                    <span className="font-semibold text-foreground">{meta.workShift || "Standard Day"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Total Experience:</span>
                    <span className="font-semibold text-foreground">{meta.totalExperienceYears || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card 3: Attendance & Leave Snapshot */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  <span>Attendance & Leaves</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("attendance")}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  View details
                </button>
              </div>
              <div className="space-y-2 text-xs divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Monthly Attendance:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {staff.attendanceStats?.attendancePercentage || 96}% Present
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Today's Status:</span>
                  <span className="font-semibold text-foreground">
                    {staff.attendanceStats?.todayStatus || "Present (Bio)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Available Leave:</span>
                  <span className="font-semibold text-foreground">
                    {staff.leaveSummary?.totalAvailableDays ?? 0} Days Available
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Pending Requests:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {staff.leaveSummary?.totalPendingDays ?? staff.leaveStats?.pending ?? 0} Days Awaiting
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Active Assignments Strip (if Teaching) */}
          {isTeaching && staff.assignments && staff.assignments.length > 0 && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Current Course Teaching Allocations</h3>
                  <p className="text-xs text-muted-foreground">Active class and subject assignments</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("academic")}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Manage in Academic Tab →
                </button>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold">Subject / Course</th>
                      <th className="p-3 font-semibold">Class / Program</th>
                      <th className="p-3 font-semibold">Section</th>
                      <th className="p-3 font-semibold">Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {staff.assignments.slice(0, 5).map((a: any) => (
                      <tr key={a.id} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold text-foreground">{a.subject?.name || "N/A"}</td>
                        <td className="p-3 text-muted-foreground">{a.class?.name || "N/A"}</td>
                        <td className="p-3 font-mono">{a.section || a.class?.section || "A"}</td>
                        <td className="p-3 font-mono text-muted-foreground">{a.subject?.code || "SUB-01"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERSONAL                                                           */}
      {/* ========================================================================= */}
      {activeTab === "personal" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>Personal Identifiers</span>
              </div>
              <div className="space-y-2 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold text-foreground">{fullName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-semibold text-foreground">
                    {staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : "Not Provided"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-semibold text-foreground capitalize">{staff.gender || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Blood Group:</span>
                  <span className="font-semibold text-foreground">{staff.bloodGroup || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="font-semibold text-foreground">{meta.nationality || "Indian"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Govt ID / Aadhaar:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {meta.aadhaarNumber ? `•••• •••• ${meta.aadhaarNumber.slice(-4)}` : "Not Registered"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">PAN Reference:</span>
                  <span className="font-mono text-foreground font-semibold">{meta.panNumber || "Not Registered"}</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>Contact Details</span>
              </div>
              <div className="space-y-2 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Official Email:</span>
                  <span className="font-semibold text-foreground">{staff.officialEmail || staff.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Personal Email:</span>
                  <span className="font-semibold text-foreground">{meta.personalEmail || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Primary Contact Phone:</span>
                  <span className="font-semibold text-foreground font-mono">{staff.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Alternate Phone:</span>
                  <span className="font-semibold text-foreground font-mono">{meta.alternatePhone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Current Residential Address</span>
              </div>
              {meta.currentAddress ? (
                <div className="space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">{meta.currentAddress.addressLine1 || meta.currentAddress.line1}</p>
                  <p>{meta.currentAddress.city}, {meta.currentAddress.state} - {meta.currentAddress.pincode}</p>
                  <p>{meta.currentAddress.country || "India"}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No current address registered.</p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Permanent Address</span>
              </div>
              {meta.permanentAddress ? (
                <div className="space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">{meta.permanentAddress.addressLine1 || meta.permanentAddress.line1}</p>
                  <p>{meta.permanentAddress.city}, {meta.permanentAddress.state} - {meta.permanentAddress.pincode}</p>
                  <p>{meta.permanentAddress.country || "India"}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Same as current address or not registered.</p>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 text-xs md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <HeartHandshake className="w-4 h-4 text-amber-500" />
                <span>Emergency Contacts</span>
              </div>
              {meta.emergencyContacts && meta.emergencyContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meta.emergencyContacts.map((em: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">{em.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {em.relation}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{em.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No emergency contact registered.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMPLOYMENT                                                         */}
      {/* ========================================================================= */}
      {activeTab === "employment" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Briefcase className="w-4 h-4 text-primary" />
            <span>Employment & Institutional Parameters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 divide-y divide-border/60">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-mono font-semibold text-foreground">{staff.employeeCode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Staff Category:</span>
                <span className="font-semibold text-foreground">{staff.staffType || "TEACHING"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">{staff.department}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Designation:</span>
                <span className="font-semibold text-foreground">{staff.designation}</span>
              </div>
            </div>

            <div className="space-y-2 divide-y divide-border/60">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Employment Type:</span>
                <span className="font-semibold text-foreground">{meta.employmentType || "Permanent"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="text-[10px]">
                  {staff.status}
                </Badge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Date of Joining:</span>
                <span className="font-semibold text-foreground">
                  {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Confirmation Date:</span>
                <span className="font-semibold text-foreground">{meta.confirmationDate || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-2 divide-y divide-border/60">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Work Location / Campus:</span>
                <span className="font-semibold text-foreground">{meta.campus || "Main Campus"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Assigned Shift:</span>
                <span className="font-semibold text-foreground">{meta.workShift || "Regular Day"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Contract Term:</span>
                <span className="font-semibold text-foreground">
                  {meta.contractEndDate ? `Until ${meta.contractEndDate}` : "Permanent / Continuous"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Exit / Relieving Date:</span>
                <span className="font-semibold text-foreground">{meta.exitDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACADEMIC (Qualifications, Experience, Teaching Assignments)        */}
      {/* ========================================================================= */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          {/* Section 1: Academic Teaching Assignments (for Teaching Staff) */}
          {isTeaching && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Teaching Allocations & Timetable</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Assigned courses and homeroom responsibilities</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAssignOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Assign Course / Homeroom
                </Button>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Class Teacher / Homeroom Role:</span>
                </div>
                {staff.classTeacherOf && staff.classTeacherOf.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {staff.classTeacherOf.map((c: any) => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs py-1 px-3 font-semibold"
                      >
                        {c.name} {c.section ? `• Section ${c.section}` : ""} (Room {c.roomNumber || "N/A"})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not currently appointed as Class Teacher.</p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Assigned Courses ({staff.assignments?.length || 0})
                </h4>
                {staff.assignments && staff.assignments.length > 0 ? (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-3 font-semibold">Subject / Course</th>
                          <th className="p-3 font-semibold">Code</th>
                          <th className="p-3 font-semibold">Class / Program</th>
                          <th className="p-3 font-semibold">Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {staff.assignments.map((a: any) => (
                          <tr key={a.id} className="hover:bg-muted/20">
                            <td className="p-3 font-semibold text-foreground">{a.subject?.name || "Subject"}</td>
                            <td className="p-3 font-mono text-muted-foreground">{a.subject?.code || "SUB"}</td>
                            <td className="p-3 text-foreground">{a.class?.name || "N/A"}</td>
                            <td className="p-3 font-mono">{a.section || a.class?.section || "A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active course assignments recorded.</p>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Qualifications */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Academic Qualifications & Certifications</span>
                </h3>
                <p className="text-xs text-muted-foreground">Degrees, diplomas, and national eligibility certifications</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="h-8 text-xs font-semibold">
                <Edit className="w-3.5 h-3.5 mr-1" />
                Update Degrees
              </Button>
            </div>

            {meta.qualifications && meta.qualifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meta.qualifications.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-foreground text-sm">{q.degree}</span>
                        {q.field && <span className="text-muted-foreground ml-1.5 font-medium">in {q.field}</span>}
                      </div>
                      {q.year && <Badge variant="outline" className="font-mono text-[10px]">{q.year}</Badge>}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{q.institution || "Institution Not Specified"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No qualifications registered yet.</p>
            )}
          </div>

          {/* Section 3: Prior Experience */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Prior Professional Experience</span>
                </h3>
                <p className="text-xs text-muted-foreground">Previous institutions, universities, and industry</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="h-8 text-xs font-semibold">
                <Edit className="w-3.5 h-3.5 mr-1" />
                Update Experience
              </Button>
            </div>

            {meta.experience && meta.experience.length > 0 ? (
              <div className="space-y-3">
                {meta.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-foreground text-sm">{exp.role}</div>
                      <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>{exp.organization}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {exp.duration || `${exp.startDate || "N/A"} - ${exp.endDate || "N/A"}`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No previous experience recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ATTENDANCE & LEAVE                                                 */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Monthly Attendance</span>
              <div className="text-2xl font-extrabold text-foreground">{staff.attendanceStats?.attendancePercentage || 96}%</div>
              <p className="text-[11px] text-muted-foreground">{staff.attendanceStats?.presentDays || 22} Present / {staff.attendanceStats?.workingDays || 24} Total Days</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Total Available Quota</span>
              <div className="text-2xl font-extrabold text-foreground">
                {staff.leaveSummary?.totalAvailableDays ?? 0} Days
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Leave Year: {staff.leaveSummary?.leaveYear?.name || "Current Session"}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Pending Applications</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {staff.leaveSummary?.totalPendingDays ?? staff.leaveStats?.pending ?? 0} Days
              </div>
              <p className="text-[11px] text-muted-foreground">Awaiting institutional approval</p>
            </div>
          </div>

          {/* Dynamic Leave Category Accounts from Single Source of Truth Ledger */}
          {staff.leaveSummary?.accounts && staff.leaveSummary.accounts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Entitlement Breakdown by Category
                </h4>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Authoritative Policy Ledger
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {staff.leaveSummary.accounts.map((acc: any) => (
                  <div key={acc.leaveTypeId} className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{acc.leaveTypeName}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{acc.leaveTypeCode}</Badge>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-foreground font-mono">{acc.availableDays}</span>
                      <span className="text-xs text-muted-foreground">/ {acc.entitledDays} Entitled</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <span>Accrued / Carried:</span>
                        <span className="font-mono font-medium text-foreground">{acc.accruedDays + acc.carriedOverDays} d</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consumed (Used):</span>
                        <span className="font-mono font-medium text-foreground">{acc.usedDays} d</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Review:</span>
                        <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{acc.pendingDays} d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-foreground">Institutional Attendance System</h3>
              <p className="text-muted-foreground mt-0.5">Biometric / RFID synchronization active for {staff.employeeCode}</p>
            </div>
            <Link href="/attendance">
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Open Attendance Module
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DOCUMENTS                                                          */}
      {/* ========================================================================= */}
      {activeTab === "documents" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Staff Documents & Certifications</span>
              </h3>
              <p className="text-xs text-muted-foreground">Contracts, resume, appointment letter, and certificates</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setDocumentOpen(true)} className="h-8 text-xs font-semibold gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Upload Document
            </Button>
          </div>

          {meta.documents && meta.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meta.documents.map((doc: any) => (
                <div key={doc.id} className="p-4 rounded-xl bg-card border border-border flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground">{doc.title}</span>
                    <Badge variant="outline" className="text-[10px] block w-fit">
                      {doc.type}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground pt-1">
                      Uploaded on: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto opacity-40 mb-1" />
              <p>No documents attached for this staff member yet.</p>
              <Button size="sm" variant="outline" onClick={() => setDocumentOpen(true)} className="h-8 text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Attach First Document
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY TAB: PAYROLL (Under More ▾)                                     */}
      {/* ========================================================================= */}
      {canViewPayroll && activeTab === "payroll" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Compensation & Banking Ledger</span>
              </h3>
              <p className="text-xs text-muted-foreground">Institutional payroll terms and banking details (Strictly Confidential)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="h-8 text-xs font-semibold">
              <Edit className="w-3.5 h-3.5 mr-1" />
              Update Payroll Info
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h4 className="font-bold text-foreground">Monthly Salary Structure</h4>
              <div className="space-y-1.5 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Basic Pay:</span>
                  <span className="font-mono font-bold text-foreground">
                    {staff.basicSalary ? `₹ ${staff.basicSalary.toLocaleString()}` : "Confidential"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Allowances:</span>
                  <span className="font-mono text-foreground">₹ 0</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-foreground pt-2">
                  <span>Gross Remuneration:</span>
                  <span className="font-mono text-primary text-sm">₹ {(staff.basicSalary || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h4 className="font-bold text-foreground">Registered Banking Details</h4>
              <div className="space-y-1.5 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Account Holder:</span>
                  <span className="font-bold text-foreground">{meta.bankAccountHolder || fullName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-bold text-foreground">{meta.bankName || "Not Registered"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono text-foreground font-bold">
                    {staff.bankAccountNumber
                      ? `•••• •••• ${staff.bankAccountNumber.slice(-4)}`
                      : "•••• •••• ••••"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY TAB: SYSTEM ACCESS (Under More ▾)                               */}
      {/* ========================================================================= */}
      {activeTab === "access" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Portal Authentication & System Permissions</span>
              </h3>
              <p className="text-xs text-muted-foreground">User account configuration for logging into Nexora</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setAccessOpen(true)} className="h-8 text-xs font-semibold gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {staff.user ? "Edit Login / Reset Password" : "Grant Portal Account"}
            </Button>
          </div>

          {staff.user ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span>Active User Account Linked</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Login Email:</span>
                  <p className="font-bold text-foreground">{staff.user.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned System Role:</span>
                  <p className="font-bold text-foreground">{staff.user.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <span>No Nexora Login Provisioned</span>
              </div>
              <p className="text-muted-foreground">This staff member is registered in the institutional employee database but does not have a user account.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY TAB: ACTIVITY (Under More ▾)                                    */}
      {/* ========================================================================= */}
      {activeTab === "activity" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <History className="w-4 h-4 text-primary" />
            <span>Historical Mutation & Activity Log</span>
          </div>

          {staff.auditLogs && staff.auditLogs.length > 0 ? (
            <div className="space-y-3">
              {staff.auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-3.5 bg-card rounded-xl border border-border text-xs">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-4 text-center">No historical mutations recorded for this staff record.</p>
          )}
        </div>
      )}

      {/* Action Modals */}
      {editOpen && (
        <EditStaffModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          staff={staff}
          onSuccess={refreshData}
        />
      )}

      {deactivateOpen && (
        <DeactivateStaffModal
          isOpen={deactivateOpen}
          onClose={() => setDeactivateOpen(false)}
          staff={{
            id: staff.id,
            fullName,
            employeeCode: staff.employeeCode,
            designation: staff.designation,
            status: staff.status,
          }}
          onSuccess={refreshData}
        />
      )}

      {deleteOpen && (
        <PermanentDeleteStaffModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          staff={{
            id: staff.id,
            fullName,
            employeeCode: staff.employeeCode,
            designation: staff.designation,
          }}
          onSuccess={() => router.push("/teachers")}
        />
      )}

      {assignOpen && (
        <AssignTeachingModal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          staff={{
            id: staff.id,
            fullName,
            employeeCode: staff.employeeCode,
            department: staff.department,
          }}
          onSuccess={refreshData}
        />
      )}

      {accessOpen && (
        <ManageAccessModal
          isOpen={accessOpen}
          onClose={() => setAccessOpen(false)}
          staff={{
            id: staff.id,
            fullName,
            employeeCode: staff.employeeCode,
            officialEmail: staff.officialEmail || staff.email,
            user: staff.user,
          }}
          onSuccess={refreshData}
        />
      )}

      {documentOpen && (
        <AddDocumentModal
          isOpen={documentOpen}
          onClose={() => setDocumentOpen(false)}
          staffId={staff.id}
          staffName={fullName}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
