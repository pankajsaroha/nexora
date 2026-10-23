"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Users,
  GraduationCap,
  School,
  Calendar,
  ExternalLink,
  ArrowRight,
  Info,
  Loader2,
  Clock,
  Lock,
  FileCheck,
  Check,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface InstitutionRecord {
  id: string;
  name: string;
  code: string;
  type: string;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  statusReason?: string | null;
  suspendedAt?: string | null;
  archivedAt?: string | null;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentContext: boolean;
  counts: {
    users: number;
    students: number;
    teachers: number;
    classes: number;
    guardians: number;
    auditLogs: number;
  };
}

interface DependencyData {
  institution: {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
  };
  dependencies: {
    users: number;
    students: number;
    guardians: number;
    teachers: number;
    classes: number;
    sections: number;
    exams: number;
    marks: number;
    studentAttendance: number;
    staffAttendance: number;
    assignments: number;
    feeStructures: number;
    feePayments: number;
    tasks: number;
    announcements: number;
    auditLogs: number;
  };
  retentionAssessment: {
    safeToDelete: boolean;
    isLastRemaining: boolean;
    isCurrentActiveTenant: boolean;
    hasFinancialRecords: boolean;
    isProtectedInzivoo: boolean;
    blockers: string[];
  };
}

export function InstitutionLifecycleClient({ user }: { user: any }) {
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "ARCHIVED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modals
  const [selectedInst, setSelectedInst] = useState<InstitutionRecord | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Status Action Modal (Suspend / Reactivate / Archive)
  const [statusActionOpen, setStatusActionOpen] = useState(false);
  const [statusActionType, setStatusActionType] = useState<"SUSPEND" | "REACTIVATE" | "ARCHIVE">("SUSPEND");
  const [statusReason, setStatusReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Protected Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dependencyData, setDependencyData] = useState<DependencyData | null>(null);
  const [dependencyLoading, setDependencyLoading] = useState(false);
  const [deleteConfirmationCode, setDeleteConfirmationCode] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/institutions");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load institutions");
      }
      const data = await res.json();
      setInstitutions(data.institutions || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Filtered List
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusTab === "ALL" ? true : inst.status === statusTab;

    const matchesType =
      typeFilter === "ALL" ? true : inst.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Metrics
  const totalCount = institutions.length;
  const activeCount = institutions.filter((i) => i.status === "ACTIVE").length;
  const suspendedCount = institutions.filter((i) => i.status === "SUSPENDED").length;
  const archivedCount = institutions.filter((i) => i.status === "ARCHIVED").length;
  const totalStudents = institutions.reduce((acc, i) => acc + (i.counts.students || 0), 0);
  const totalFaculty = institutions.reduce((acc, i) => acc + (i.counts.teachers || 0), 0);

  // Handlers
  const handleSwitchTenant = async (instId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/auth/switch-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: instId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to switch institution context");
        return;
      }
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Switch error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStatusAction = (
    inst: InstitutionRecord,
    action: "SUSPEND" | "REACTIVATE" | "ARCHIVE"
  ) => {
    setSelectedInst(inst);
    setStatusActionType(action);
    setStatusReason("");
    setActionError(null);
    setStatusActionOpen(true);
  };

  const handleSubmitStatusAction = async () => {
    if (!selectedInst) return;
    if (
      (statusActionType === "SUSPEND" || statusActionType === "ARCHIVE") &&
      statusReason.trim().length < 5
    ) {
      setActionError("Please provide a valid administrative reason (minimum 5 characters).");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/institutions/${selectedInst.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: statusActionType,
          reason: statusReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Status update failed");
      }

      setStatusActionOpen(false);
      await fetchInstitutions();
    } catch (err: any) {
      setActionError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = async (inst: InstitutionRecord) => {
    setSelectedInst(inst);
    setDeleteConfirmationCode("");
    setDeleteReason("");
    setDeleteError(null);
    setDeleteModalOpen(true);
    setDependencyLoading(true);

    try {
      const res = await fetch(`/api/institutions/${inst.id}/dependencies`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to inspect dependencies");
      }
      const data = await res.json();
      setDependencyData(data);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to load dependencies");
    } finally {
      setDependencyLoading(false);
    }
  };

  const handleExecutePermanentDelete = async () => {
    if (!selectedInst) return;
    if (deleteConfirmationCode.trim().toUpperCase() !== selectedInst.code.trim().toUpperCase()) {
      setDeleteError(`Please type the exact institution code: ${selectedInst.code}`);
      return;
    }
    if (deleteReason.trim().length < 8) {
      setDeleteError("Please provide an audit justification (minimum 8 characters).");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const res = await fetch(`/api/institutions/${selectedInst.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationCode: deleteConfirmationCode,
          reason: deleteReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deletion failed");
      }

      setDeleteModalOpen(false);
      await fetchInstitutions();
    } catch (err: any) {
      setDeleteError(err.message || "Permanent deletion failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Super Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Institution Lifecycle Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Audit, govern, suspend, archive, and securely manage all institutional tenants across the Nexora cloud infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchInstitutions}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className={cn("w-3.5 h-3.5", loading && "animate-spin text-primary")} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">Total Tenants</p>
          <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-success uppercase font-semibold">Active</p>
          <p className="text-2xl font-bold text-success">{activeCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">Suspended</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{suspendedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">Archived</p>
          <p className="text-2xl font-extrabold text-muted-foreground">{archivedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-primary uppercase font-bold">Enrolled Students</p>
          <p className="text-2xl font-extrabold text-primary">{totalStudents}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <p className="text-[11px] font-mono text-primary uppercase font-bold">Total Faculty</p>
          <p className="text-2xl font-extrabold text-primary">{totalFaculty}</p>
        </div>
      </div>

      {/* Control Bar: Tabs, Search, Type Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-3 rounded-xl border border-border shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "All Tenants", count: totalCount },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "SUSPENDED", label: "Suspended", count: suspendedCount },
            { id: "ARCHIVED", label: "Archived", count: archivedCount },
          ].map((tab) => {
            const isSelected = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Type dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, code, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-background border border-border text-foreground rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="SCHOOL">Schools (K-12)</option>
            <option value="COLLEGE">Higher Ed Colleges</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-xl border border-border text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-semibold text-foreground">Querying institutional cluster records...</p>
          <p className="text-xs text-muted-foreground">Verifying database integrity across multi-tenant partitions</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Error Loading Institutions</span>
          </div>
          <p className="text-xs">{error}</p>
          <button
            type="button"
            onClick={fetchInstitutions}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="p-16 bg-card rounded-xl border border-border text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No institutions match the active filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or switching the status tab to see all registered tenants.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInstitutions.map((inst) => {
            const isProtectedInzivoo = inst.id === "04625961-2d1e-4bf8-8013-5c16040751bc";

            return (
              <div
                key={inst.id}
                className={cn(
                  "p-5 rounded-xl bg-card border transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6",
                  inst.isCurrentContext ? "border-accent/50 ring-1 ring-accent/30" : "border-border hover:border-border/80"
                )}
              >
                {/* Left: Info */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-muted border border-border text-foreground">
                      {inst.code}
                    </span>

                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                      {inst.type}
                    </span>

                    {/* Status Badge */}
                    {inst.status === "ACTIVE" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-md bg-success-subtle border border-success/20 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    )}

                    {inst.status === "SUSPENDED" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>SUSPENDED</span>
                      </span>
                    )}

                    {inst.status === "ARCHIVED" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-md bg-muted border border-border text-muted-foreground">
                        <Archive className="w-3 h-3" />
                        <span>ARCHIVED</span>
                      </span>
                    )}

                    {inst.isCurrentContext && (
                      <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                        ACTIVE SESSION CONTEXT
                      </span>
                    )}

                    {isProtectedInzivoo && (
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                        CORE VERIFIED TENANT
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground truncate">{inst.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      ID: {inst.id} · Created: {formatDate(inst.createdAt)}
                    </p>
                  </div>

                  {inst.statusReason && (
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary shrink-0" />
                      <span><strong>Lifecycle Notice:</strong> {inst.statusReason}</span>
                    </div>
                  )}

                  {/* Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
                    <div className="p-2 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block font-mono">STUDENTS</span>
                      <strong className="text-sm font-bold text-foreground">{inst.counts.students}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block font-mono">FACULTY</span>
                      <strong className="text-sm font-bold text-foreground">{inst.counts.teachers}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block font-mono">CLASSES</span>
                      <strong className="text-sm font-bold text-foreground">{inst.counts.classes}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block font-mono">USERS</span>
                      <strong className="text-sm font-bold text-foreground">{inst.counts.users}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block font-mono">AUDIT LOGS</span>
                      <strong className="text-sm font-bold text-foreground">{inst.counts.auditLogs}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
                  {!inst.isCurrentContext && (
                    <button
                      type="button"
                      onClick={() => handleSwitchTenant(inst.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer shadow-2xs"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Switch Context</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInst(inst);
                        setViewDetailsOpen(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {inst.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(inst, "SUSPEND")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </button>
                    ) : inst.status === "SUSPENDED" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(inst, "REACTIVATE")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-success-subtle hover:bg-success/20 text-success border border-success/20 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(inst, "REACTIVATE")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    )}

                    {inst.status !== "ARCHIVED" && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusAction(inst, "ARCHIVE")}
                        className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
                        title="Archive Institution"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isProtectedInzivoo && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(inst)}
                        className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors cursor-pointer"
                        title="Protected Permanent Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW DETAILS */}
      {viewDetailsOpen && selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-xl bg-card border border-border p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-foreground font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedInst.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground">Code: {selectedInst.code} · Type: {selectedInst.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailsOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Status</span>
                  <span className="font-bold text-foreground">{selectedInst.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Database Identifier</span>
                  <span className="font-mono text-foreground truncate block">{selectedInst.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Contact Email</span>
                  <span className="font-medium text-foreground">{selectedInst.email || "N/A"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Contact Phone</span>
                  <span className="font-medium text-foreground">{selectedInst.phone || "N/A"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Registered Address</span>
                <p className="text-xs text-foreground">
                  {selectedInst.address}, {selectedInst.city}, {selectedInst.state}
                </p>
                {selectedInst.website && (
                  <p className="text-xs text-primary font-mono mt-1">
                    Website: {selectedInst.website}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold block">Live Database Counts</span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">STUDENTS</span>
                    <strong className="text-sm font-bold text-foreground">{selectedInst.counts.students}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">STAFF</span>
                    <strong className="text-sm font-bold text-foreground">{selectedInst.counts.teachers}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">CLASSES</span>
                    <strong className="text-sm font-bold text-foreground">{selectedInst.counts.classes}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDetailsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STATUS ACTION (SUSPEND / REACTIVATE / ARCHIVE) */}
      {statusActionOpen && selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-card border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                  statusActionType === "SUSPEND"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : statusActionType === "ARCHIVE"
                    ? "bg-muted text-foreground border border-border"
                    : "bg-success-subtle text-success border border-success/20"
                )}
              >
                {statusActionType === "SUSPEND" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : statusActionType === "ARCHIVE" ? (
                  <Archive className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {statusActionType === "SUSPEND"
                    ? "Suspend Institution"
                    : statusActionType === "ARCHIVE"
                    ? "Archive Institution"
                    : "Reactivate Institution"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target Tenant: <strong className="text-foreground">{selectedInst.name} ({selectedInst.code})</strong>
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {actionError}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-2">
              {statusActionType === "SUSPEND" && (
                <p>
                  Suspending an institution blocks login and portal access for all its students, faculty, and administrators. Institutional records and ledgers are preserved in full.
                </p>
              )}
              {statusActionType === "ARCHIVE" && (
                <p>
                  Archiving removes this institution from normal operational workflows while preserving historical academic records and audit ledgers. Authorized Super Admins can restore it at any time.
                </p>
              )}
              {statusActionType === "REACTIVATE" && (
                <p>
                  Reactivating restores full operational capability and login privileges for all associated users.
                </p>
              )}
            </div>

            {(statusActionType === "SUSPEND" || statusActionType === "ARCHIVE") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Administrative Reason / Justification <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. End of operational term; administrative review; tenant offboarding..."
                  className="w-full p-3 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusActionOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitStatusAction}
                disabled={actionLoading}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm flex items-center gap-2",
                  statusActionType === "SUSPEND"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : statusActionType === "ARCHIVE"
                    ? "bg-primary hover:bg-primary-hover"
                    : "bg-success hover:bg-success/90"
                )}
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Confirm {statusActionType === "SUSPEND" ? "Suspension" : statusActionType === "ARCHIVE" ? "Archival" : "Reactivation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROTECTED PERMANENT DELETE */}
      {deleteModalOpen && selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-xl bg-card border border-destructive/40 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/15 text-destructive text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  Protected Destructive Workflow
                </div>
                <h3 className="text-xl font-extrabold text-foreground">
                  Permanently Delete Institution
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target: <strong className="text-foreground">{selectedInst.name}</strong> ({selectedInst.code})
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                <strong>Deletion Prevented:</strong>
                <p>{deleteError}</p>
              </div>
            )}

            {/* Dependency Inspection */}
            {dependencyLoading ? (
              <div className="p-8 text-center space-y-2 bg-muted/30 rounded-xl border border-border">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs font-semibold text-foreground">Inspecting institutional relational dependencies...</p>
              </div>
            ) : dependencyData ? (
              <div className="space-y-4">
                {/* Blockers check */}
                {!dependencyData.retentionAssessment.safeToDelete && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Permanent Deletion Blocked by Policy</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {dependencyData.retentionAssessment.blockers.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Live Dependency Table */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-muted-foreground block">
                    Actual Dependent Records To Be Destroyed
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">STUDENTS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.students}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">STAFF/TEACHERS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.teachers}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">CLASSES</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.classes}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">SECTIONS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.sections}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">ATTENDANCE LOGS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.studentAttendance}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">FEE PAYMENTS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.feePayments}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">ASSIGNMENTS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.assignments}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-muted-foreground block">USER ACCOUNTS</span>
                      <strong className="text-sm font-bold text-foreground">{dependencyData.dependencies.users}</strong>
                    </div>
                  </div>
                </div>

                {/* Confirmation inputs */}
                {dependencyData.retentionAssessment.safeToDelete && (
                  <div className="space-y-4 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Type the exact institution code (<strong className="text-primary font-mono">{selectedInst.code}</strong>) to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmationCode}
                        onChange={(e) => setDeleteConfirmationCode(e.target.value)}
                        placeholder={`Type "${selectedInst.code}" here`}
                        className="w-full p-2.5 rounded-xl text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Documented Audit Justification <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="State legal or operational justification for permanent removal..."
                        className="w-full p-2.5 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Action will be permanently recorded in platform audit logs.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Cancel
                </button>

                {dependencyData?.retentionAssessment.safeToDelete && (
                  <button
                    type="button"
                    onClick={handleExecutePermanentDelete}
                    disabled={
                      deleteLoading ||
                      deleteConfirmationCode.trim().toUpperCase() !== selectedInst.code.trim().toUpperCase() ||
                      deleteReason.trim().length < 8
                    }
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Permanently Destroy Tenant</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
