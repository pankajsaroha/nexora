"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Calendar,
  Clock,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Send,
  Loader2,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CategorySummary {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  isPaid: boolean;
  entitledDays: number;
  accruedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

interface LeaveRequestItem {
  id: string;
  leaveType: string;
  startDate: string | Date;
  endDate: string | Date;
  totalDays: number;
  reason: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string | Date;
}

interface FacultyLeavesClientProps {
  teacher: {
    id: string;
    fullName: string;
    designation: string;
  };
  leaveSummary: {
    totalEntitledDays: number;
    totalAccruedDays: number;
    totalUsedDays: number;
    totalPendingDays: number;
    totalAvailableDays: number;
    categories: CategorySummary[];
    leaveYearName?: string;
  } | null;
  leaveRequests: LeaveRequestItem[];
}

export function FacultyLeavesClient({
  teacher,
  leaveSummary,
  leaveRequests,
}: FacultyLeavesClientProps) {
  const router = useRouter();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const categories = leaveSummary?.categories || [];

  // Form State
  const [selectedTypeId, setSelectedTypeId] = useState(categories[0]?.leaveTypeId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const selectedCategory = categories.find((c) => c.leaveTypeId === selectedTypeId) || categories[0];

  // Compute total days requested
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const requestedDays = calculateDays();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setErrorMsg("Please choose valid start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg("End date cannot be prior to start date.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide a brief reason for your leave.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          leaveTypeId: selectedTypeId || selectedCategory?.leaveTypeId,
          startDate,
          endDate,
          totalDays: requestedDays || 1,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit leave request.");
      }

      setSuccessMsg("Leave application submitted successfully. Pending administrative approval.");
      setIsApplyOpen(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this leave application?")) return;
    setCancellingId(requestId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/leaves/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", reason: "Cancelled by employee" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel request.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to cancel request.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Faculty Services & Entitlements"
        title="Leave Entitlement & Applications"
        description="Submit time-off requests, view approval decisions, and monitor statutory leave allowances."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                if (categories.length > 0 && !selectedTypeId) {
                  setSelectedTypeId(categories[0].leaveTypeId);
                }
                setIsApplyOpen(true);
              }}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Apply Leave
            </Button>
          </div>
        }
      />

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dynamic Quota Cards per configured category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-3 p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
            No active leave policy rules configured for your employment category.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.leaveTypeId}
              className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-1.5 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat.leaveTypeName} ({cat.leaveTypeCode})
                </span>
                <Badge variant={cat.isPaid ? "outline" : "secondary"} size="sm">
                  {cat.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="text-2xl font-bold font-mono text-foreground">
                {cat.availableDays}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / {cat.entitledDays} Total
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                <span>Accrued: <strong className="text-foreground">{cat.accruedDays}</strong></span>
                <span>Used: <strong className="text-foreground">{cat.usedDays}</strong></span>
                <span>Pending: <strong className="text-amber-600">{cat.pendingDays}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Leave Application History
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">
            {leaveRequests.length} Total Petitions
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Scheduled Dates</th>
                <th className="py-3 px-4">Total Days</th>
                <th className="py-3 px-4">Stated Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    No active or past leave applications on record.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((lr) => (
                  <tr key={lr.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <Badge variant="outline" size="sm">
                        {lr.leaveType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground font-mono text-[11px]">
                      {formatDate(lr.startDate)} to {formatDate(lr.endDate)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {lr.totalDays} Day{lr.totalDays > 1 ? "s" : ""}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-sm truncate text-[11px]">
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
                        <p className="text-[10px] text-destructive mt-0.5 max-w-[140px] truncate">
                          {lr.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lr.status === "PENDING" ? (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleCancel(lr.id)}
                          disabled={cancellingId === lr.id}
                        >
                          {cancellingId === lr.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Cancel"
                          )}
                        </Button>
                      ) : (
                        <span className="text-[11px] font-mono text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Apply for Leave</h3>
                <p className="text-xs text-muted-foreground">
                  Deductions apply to your allocated quota upon approval.
                </p>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-5 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Leave Type Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Leave Category</label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.leaveTypeId} value={c.leaveTypeId}>
                      {c.leaveTypeName} ({c.leaveTypeCode}) — {c.availableDays} Days Available
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Available balance: <strong>{selectedCategory.availableDays} days</strong> · Quota: {selectedCategory.entitledDays} days
                  </p>
                )}
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
              </div>

              {requestedDays > 0 && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Days Requested:</span>
                  <span className="font-bold font-mono text-foreground text-sm">
                    {requestedDays} Day{requestedDays > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Purpose / Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the reason for taking leave (e.g. personal exigency, medical treatment)..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary outline-none resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsApplyOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting || (selectedCategory && requestedDays > selectedCategory.availableDays)}
                  leftIcon={submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
