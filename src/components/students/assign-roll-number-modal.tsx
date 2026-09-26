"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Hash } from "lucide-react";

interface AssignRollNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  currentRollNumber: string | null;
  onSuccess: (updatedRollNumber: string | null) => void;
}

export function AssignRollNumberModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  currentRollNumber,
  onSuccess,
}: AssignRollNumberModalProps) {
  const [rollNumber, setRollNumber] = useState(currentRollNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: rollNumber.trim() !== "" ? rollNumber.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update roll number");
      }

      onSuccess(data.student.rollNumber);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update roll number");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign / Update Roll Number"
      description={`Official academic roll number assigned by institution or university for ${studentName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-[#171614] mb-1.5">
            Official Roll Number
          </label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A756B]" />
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. BTECH-CSE-2026-041 or 12"
              className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
            />
          </div>
          <p className="text-[11px] text-[#7A756B] mt-1.5 leading-relaxed">
            Enter the institution or university issued roll number. Leave blank if not yet assigned. Nexora does not auto-generate or increment roll numbers.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EFECE3]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Save Roll Number
          </Button>
        </div>
      </form>
    </Modal>
  );
}
