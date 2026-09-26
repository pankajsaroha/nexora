"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

interface DeactivateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  onSuccess: () => void;
}

export function DeactivateStudentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  admissionNumber,
  onSuccess,
}: DeactivateStudentModalProps) {
  const [reason, setReason] = useState("Administrative withdrawal / Transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DEACTIVATE",
          deactivationReason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deactivate student.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to deactivate student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate Student Record"
      description={`Archive ${studentName} (${admissionNumber}) while preserving full historical records.`}
      size="md"
    >
      <form onSubmit={handleDeactivate} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Safety & History Preservation Banner */}
        <div className="rounded-2xl border border-[#D4B87C]/40 bg-[#FAF6ED] p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[#856D3B] font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Complete Historical Audit Trail Preserved</span>
          </div>
          <p className="text-[11px] text-[#7A756B] leading-relaxed">
            Deactivating removes the student from active daily attendance rosters and cohort counts. All previous attendance history, grade reports, fee payment ledgers, and guardian relationships are securely preserved. You can restore this student anytime.
          </p>
        </div>

        <div>
          <label className="block font-bold text-[#171614] mb-1.5">
            Deactivation Reason *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          >
            <option value="Administrative withdrawal / Transfer">Administrative withdrawal / Transfer</option>
            <option value="Completed course / Graduated">Completed course / Graduated</option>
            <option value="Temporary leave of absence">Temporary leave of absence</option>
            <option value="Fee default / Suspended">Fee default / Suspended</option>
            <option value="Other institutional reason">Other institutional reason</option>
          </select>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EFECE3]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className="bg-[#856D3B] hover:bg-[#6E5A30] text-white"
          >
            Confirm Deactivation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
