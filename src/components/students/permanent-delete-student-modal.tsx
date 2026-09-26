"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PermanentDeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    fullName: string;
    admissionNumber: string;
    rollNumber?: string | null;
  };
  onSuccess?: () => void;
}

export function PermanentDeleteStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: PermanentDeleteStudentModalProps) {
  const router = useRouter();
  const [typedName, setTypedName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = typedName.trim().toLowerCase() === student.fullName.trim().toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to permanently delete student record.");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/students");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during permanent deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanently Delete Student Record"
      description="Privileged Platform Operation (Super Admin Only)"
      size="md"
    >
      <form onSubmit={handleDelete} className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#8B3A3A]/10 border border-[#8B3A3A]/25 text-[#8B3A3A] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#8B3A3A]" />
            <span>This action cannot be undone</span>
          </div>
          <p className="text-xs leading-relaxed text-[#171614]/80">
            Permanently deleting will erase all candidate credentials, custom field values, and linked relationships for this student from the institutional database.
          </p>
          <p className="text-[11px] text-[#8B3A3A] font-semibold">
            Note: If historical fee payments have already been collected, permanent deletion will be blocked by system governance. In that case, use <strong>Deactivate Student</strong> instead.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#7A756B]">Student Full Name:</span>
            <span className="font-bold text-[#171614]">{student.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7A756B]">Admission Number:</span>
            <span className="font-mono font-bold text-[#171614]">{student.admissionNumber}</span>
          </div>
          {student.rollNumber && (
            <div className="flex justify-between">
              <span className="text-[#7A756B]">Roll Number:</span>
              <span className="font-mono font-bold text-[#171614]">{student.rollNumber}</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#8B3A3A]/10 border border-[#8B3A3A]/25 text-[#8B3A3A] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#171614]">
            Type the student&apos;s full name <span className="font-mono text-[#8B3A3A]">({student.fullName})</span> to confirm:
          </label>
          <input
            type="text"
            required
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={student.fullName}
            className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B3A3A]"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E0D5]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isDeleting}
            disabled={!isConfirmed}
            className="bg-[#8B3A3A] text-white hover:bg-[#722F2F] border-transparent"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Permanently
          </Button>
        </div>
      </form>
    </Modal>
  );
}
