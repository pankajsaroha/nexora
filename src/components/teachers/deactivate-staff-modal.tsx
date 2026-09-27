"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserX, Loader2 } from "lucide-react";
import { EmploymentStatus } from "@/lib/staff";

interface DeactivateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    fullName: string;
    employeeCode: string;
    designation: string;
    status: string;
  };
  onSuccess: () => void;
}

export function DeactivateStaffModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: DeactivateStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [targetStatus, setTargetStatus] = useState<EmploymentStatus>("DEACTIVATED");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff status");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate / Change Staff Status"
      description={`Update employment status for ${staff.fullName} (${staff.employeeCode}).`}
      size="md"
    >
      <div className="space-y-4 py-1 text-xs">
        <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs space-y-1.5 text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Audit & Historical Preservation</span>
          </div>
          <p className="leading-relaxed">
            Deactivating or marking an employee as Resigned/Terminated preserves all historical records (attendance, payroll ledgers, and timetable entries) while cleanly disabling their active login access.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Select New Employment Status *</label>
          <select
            value={targetStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTargetStatus(e.target.value as EmploymentStatus)
            }
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="DEACTIVATED">Deactivated (Temporary / Suspended)</option>
            <option value="ON_LEAVE">On Extended Leave</option>
            <option value="RESIGNED">Resigned (Relieved)</option>
            <option value="RETIRED">Retired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            Reason / Administrative Remarks (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Provide reason for status transition or exit remarks..."
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeactivate}
            disabled={loading}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Confirm Status Change
          </Button>
        </div>
      </div>
    </Modal>
  );
}
