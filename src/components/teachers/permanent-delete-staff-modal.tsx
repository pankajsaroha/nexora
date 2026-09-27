"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, Loader2, ShieldAlert } from "lucide-react";

interface PermanentDeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    fullName: string;
    employeeCode: string;
    designation: string;
  };
  onSuccess: () => void;
}

export function PermanentDeleteStaffModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: PermanentDeleteStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed =
    confirmationInput.trim().toLowerCase() === staff.fullName.trim().toLowerCase() ||
    confirmationInput.trim().toUpperCase() === staff.employeeCode.trim().toUpperCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMessage(null);
    try {
      setLoading(true);
      const res = await fetch(`/api/teachers/${staff.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to delete staff record");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanent Staff Deletion (Super Admin)"
      description={`Eradicate the staff record for ${staff.fullName} (${staff.employeeCode}).`}
      size="md"
    >
      <div className="space-y-4 py-1 text-xs">
        <div className="p-3.5 bg-destructive/10 rounded-xl border border-destructive/20 text-xs space-y-2 text-destructive">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Permanent Deletion & Dependency Safety</span>
          </div>
          <p className="leading-relaxed opacity-95">
            This permanently purges qualifications, past experience, and user logins. If this staff member has historical <strong>Attendance</strong> or <strong>Payroll</strong> ledger records, deletion is blocked to protect financial records. Use <strong>Deactivate</strong> instead.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive">
            <strong>Action Blocked:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            Type <span className="font-mono text-primary font-bold">{staff.fullName}</span> or{" "}
            <span className="font-mono text-primary font-bold">{staff.employeeCode}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmationInput(e.target.value)}
            placeholder={staff.fullName}
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            )}
            Permanently Delete Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}
