"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  UserCheck,
  Plus,
  FileText,
  Loader2,
  Sliders,
  ShieldAlert,
  ArrowRightLeft,
  X,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface LeaveRequestData {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmployeeId: string;
  teacherDesignation: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  appliedDate: string;
}

interface LeaveTypeData {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
  description?: string | null;
  isActive: boolean;
}

interface PolicyRuleData {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  annualEntitlement: number;
  accrualFrequency: string;
  proRataEnabled: boolean;
  proRataBasis: string;
  roundingRule: string;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  maxBalance: number;
  requiresProof: boolean;
}

interface PolicyData {
  id: string;
  name: string;
  staffType: string;
  employmentType: string;
  isActive: boolean;
  leaveYearName: string;
  rules: PolicyRuleData[];
}

interface StaffBalanceData {
  teacherId: string;
  employeeId: string;
  fullName: string;
  designation: string;
  departmentName: string;
  totalEntitled: number;
  totalAccrued: number;
  totalUsed: number;
  totalPending: number;
  totalAvailable: number;
  categories: Array<{
    leaveTypeId: string;
    code: string;
    available: number;
    entitled: number;
  }>;
}

interface AdminLeaveManagementClientProps {
  leaveRequests: LeaveRequestData[];
  policy: PolicyData | null;
  leaveTypes: LeaveTypeData[];
  leaveYear: { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean } | null;
  staffBalances: StaffBalanceData[];
  canApprove: boolean;
}

export function AdminLeaveManagementClient({
  leaveRequests,
  policy,
  leaveTypes,
  leaveYear,
  staffBalances,
  canApprove,
}: AdminLeaveManagementClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "policy" | "types" | "balances">("requests");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State for Processing Requests
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // State for Adjustment Modal
  const [adjustModalTeacher, setAdjustModalTeacher] = useState<StaffBalanceData | null>(null);
  const [adjustTypeId, setAdjustTypeId] = useState<string>("");
  const [adjustDays, setAdjustDays] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  // State for New Leave Type Modal
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [typeIsPaid, setTypeIsPaid] = useState(true);
  const [typeDesc, setTypeDesc] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);

  // Notification Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredRequests = leaveRequests.filter((lr) => {
    if (statusFilter === "ALL") return true;
    return lr.status === statusFilter;
  });

  const handleReview = async (requestId: string, action: "APPROVE" | "REJECT" | "CANCEL", reason?: string) => {
    setProcessingId(requestId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/leaves/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");

      setFeedback({
        type: "success",
        message: `Leave petition successfully ${action.toLowerCase()}d. Ledger updated.`,
      });
      setRejectModalId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to process petition" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalTeacher || !adjustTypeId || !adjustDays) return;
    if (!adjustReason.trim()) {
      alert("Please provide an audited reason for this balance adjustment.");
      return;
    }

    setIsAdjusting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/leaves/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: adjustModalTeacher.teacherId,
          leaveTypeId: adjustTypeId,
          days: adjustDays,
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust balance");

      setFeedback({ type: "success", message: "Audited balance adjustment posted to immutable ledger." });
      setAdjustModalTeacher(null);
      setAdjustReason("");
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to adjust balance" });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim() || !typeCode.trim()) return;

    setIsCreatingType(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/leaves/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: typeName.trim(),
          code: typeCode.trim().toUpperCase(),
          isPaid: typeIsPaid,
          description: typeDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create leave type");

      setFeedback({ type: "success", message: `Leave category ${data.name} (${data.code}) created successfully.` });
      setIsCreateTypeOpen(false);
      setTypeName("");
      setTypeCode("");
      setTypeDesc("");
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create category" });
    } finally {
      setIsCreatingType(false);
    }
  };

  const pendingCount = leaveRequests.filter((lr) => lr.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <PageHeader
        category="Human Resources & Statutory Operations"
        title="Leave Management & Faculty Ledger"
        description="Unified policy engine, automated entitlement accruals, approval workflows, and immutable transaction ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateTypeOpen(true)}
              leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
            >
              Add Leave Type
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "requests"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Leave Requests</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              pendingCount > 0
                ? "bg-amber-500/20 text-amber-700 font-bold dark:text-amber-400"
                : "bg-background/20"
            }`}
          >
            {pendingCount > 0 ? `${pendingCount} Pending` : `${leaveRequests.length}`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("balances")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "balances"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Faculty Balances</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
            {staffBalances.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "policy"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Leave Policy Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("types")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "types"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Leave Categories</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
            {leaveTypes.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LEAVE REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors ${
                    statusFilter === s
                      ? "bg-muted font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {filteredRequests.length} record{filteredRequests.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4">Duration & Dates</th>
                  <th className="py-3 px-4">Stated Purpose</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canApprove && <th className="py-3 px-4 text-right">Decision</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono text-xs">
                      No leave petitions found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{lr.teacherName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {lr.teacherEmployeeId} · {lr.teacherDesignation}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" size="sm">
                          {lr.leaveType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {formatDate(lr.startDate)} to {formatDate(lr.endDate)}
                        <span className="block text-[11px] text-muted-foreground font-normal">
                          {lr.totalDays} Day{lr.totalDays > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs truncate text-[11px]">
                        {lr.reason}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            lr.status === "APPROVED"
                              ? "success"
                              : lr.status === "PENDING"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {lr.status}
                        </Badge>
                        {lr.status === "REJECTED" && lr.rejectionReason && (
                          <div className="text-[10px] text-destructive mt-0.5 max-w-[150px] truncate">
                            {lr.rejectionReason}
                          </div>
                        )}
                      </td>
                      {canApprove && (
                        <td className="py-3 px-4 text-right">
                          {lr.status === "PENDING" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant="primary"
                                onClick={() => handleReview(lr.id, "APPROVE")}
                                disabled={processingId === lr.id}
                              >
                                {processingId === lr.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setRejectModalId(lr.id)}
                                disabled={processingId === lr.id}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : lr.status === "APPROVED" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleReview(lr.id, "CANCEL", "Revoked by Administrator")}
                              disabled={processingId === lr.id}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-[11px] font-mono text-muted-foreground">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY BALANCES */}
      {activeTab === "balances" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty ID & Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Category Breakdown (Available)</th>
                  <th className="py-3 px-4 font-mono text-center">Accrued / Used</th>
                  <th className="py-3 px-4 font-mono text-right">Net Available</th>
                  <th className="py-3 px-4 text-right">Audited Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffBalances.map((sb) => (
                  <tr key={sb.teacherId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{sb.fullName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {sb.employeeId} · {sb.designation}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{sb.departmentName}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {sb.categories.map((c) => (
                          <span
                            key={c.leaveTypeId}
                            className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono font-medium text-foreground"
                          >
                            {c.code}: <strong>{c.available}</strong>/{c.entitled}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-foreground">{sb.totalAccrued}</span> /{" "}
                      <span className="text-muted-foreground">{sb.totalUsed}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-foreground">
                      {sb.totalAvailable} Days
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setAdjustModalTeacher(sb);
                          if (sb.categories.length > 0) {
                            setAdjustTypeId(sb.categories[0].leaveTypeId);
                          }
                          setAdjustDays(1);
                        }}
                      >
                        <ArrowRightLeft className="w-3 h-3 mr-1" />
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE POLICY RULES */}
      {activeTab === "policy" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Active Leave Year
              </span>
              <h3 className="font-bold text-base text-foreground">{leaveYear?.name || "Academic Leave Cycle"}</h3>
              <p className="text-xs text-muted-foreground">
                Period: {leaveYear ? formatDate(leaveYear.startDate) : "—"} to{" "}
                {leaveYear ? formatDate(leaveYear.endDate) : "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                Policy: {policy?.name || "Standard Faculty Policy"}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4 font-mono text-center">Annual Quota</th>
                  <th className="py-3 px-4 text-center">Accrual Mode</th>
                  <th className="py-3 px-4 text-center">Pro-Rata Joiners</th>
                  <th className="py-3 px-4 text-center">Carry Forward</th>
                  <th className="py-3 px-4 text-right">Proof Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!policy || policy.rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono text-xs">
                      No policy rules configured yet.
                    </td>
                  </tr>
                ) : (
                  policy.rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {rule.leaveTypeName} ({rule.leaveTypeCode})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                        {rule.annualEntitlement} Days
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground uppercase">
                        {rule.accrualFrequency}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={rule.proRataEnabled ? "outline" : "secondary"} size="sm">
                          {rule.proRataEnabled ? `Yes (${rule.roundingRule.toLowerCase()})` : "No"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                        {rule.allowCarryForward ? `Max ${rule.maxCarryForwardDays}d` : "Lapses"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={rule.requiresProof ? "warning" : "outline"} size="sm">
                          {rule.requiresProof ? "Required" : "Optional"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE CATEGORIES */}
      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Pay Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaveTypes.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{t.code}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{t.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={t.isPaid ? "outline" : "secondary"} size="sm">
                        {t.isPaid ? "Paid Leave" : "Loss of Pay (Unpaid)"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {t.description || "General leave quota"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={t.isActive ? "success" : "secondary"} size="sm">
                        {t.isActive ? "Active" : "Archived"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Reject Leave Petition</h3>
              <button
                onClick={() => setRejectModalId(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Rejection Reason / Remarks</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State the rationale for rejection (e.g. academic examination duty, low coverage)..."
                rows={3}
                className="w-full p-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary outline-none resize-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setRejectModalId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleReview(rejectModalId, "REJECT", rejectReason)}
                disabled={processingId === rejectModalId}
              >
                {processingId === rejectModalId ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audited Adjustment Modal */}
      {adjustModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Audited Balance Adjustment</h3>
                <p className="text-xs text-muted-foreground">
                  Employee: {adjustModalTeacher.fullName} ({adjustModalTeacher.employeeId})
                </p>
              </div>
              <button
                onClick={() => setAdjustModalTeacher(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Leave Category</label>
                <select
                  value={adjustTypeId}
                  onChange={(e) => setAdjustTypeId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
                  required
                >
                  {adjustModalTeacher.categories.map((c) => (
                    <option key={c.leaveTypeId} value={c.leaveTypeId}>
                      {c.code} (Available: {c.available} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Days to Adjust (+ to grant, - to deduct)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustDays}
                  onChange={(e) => setAdjustDays(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-mono text-foreground outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Audited Reason / Reference</label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Reason for manual adjustment (e.g. compensatory off credit, onboarding error correction)..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustModalTeacher(null)}
                  disabled={isAdjusting}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" variant="primary" disabled={isAdjusting}>
                  {isAdjusting ? "Posting..." : "Post Adjustment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Leave Type Modal */}
      {isCreateTypeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Create Leave Category</h3>
              <button
                onClick={() => setIsCreateTypeOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveType} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category Name</label>
                  <input
                    type="text"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="e.g. Sabbatical Leave"
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Code</label>
                  <input
                    type="text"
                    value={typeCode}
                    onChange={(e) => setTypeCode(e.target.value)}
                    placeholder="e.g. SAB"
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-mono uppercase text-foreground outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="typeIsPaid"
                  checked={typeIsPaid}
                  onChange={(e) => setTypeIsPaid(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="typeIsPaid" className="text-xs font-medium text-foreground cursor-pointer">
                  Paid Leave Category (Statutory compensation)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Optional description of rules or prerequisites..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateTypeOpen(false)}
                  disabled={isCreatingType}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" variant="primary" disabled={isCreatingType}>
                  {isCreatingType ? "Saving..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
