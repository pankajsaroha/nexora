"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Trash2, XCircle } from "lucide-react";

export interface DeleteExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    id: string;
    name: string;
    status: string;
    totalEnteredMarks?: number;
  } | null;
  isSafeToDelete: boolean;
  reasonUnsafe?: string;
  canCancel: boolean;
  isLoading: boolean;
  errorMessage?: string | null;
  onConfirmDelete: () => Promise<void> | void;
  onRequestCancelAlternative?: (exam: any) => void;
}

export function DeleteExamModal({
  isOpen,
  onClose,
  exam,
  isSafeToDelete,
  reasonUnsafe,
  canCancel,
  isLoading,
  errorMessage,
  onConfirmDelete,
  onRequestCancelAlternative,
}: DeleteExamModalProps) {
  if (!isOpen || !exam) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSafeToDelete ? "Delete Examination" : "Cannot Delete Examination"}
      description={exam.name}
      size="md"
    >
      <div className="space-y-4 text-xs">
        {isSafeToDelete ? (
          <div className="space-y-2">
            <p className="text-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong>{exam.name}</strong>?
            </p>
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-950">
                  Warning: Permanent Database Deletion
                </div>
                <div className="text-rose-800 text-xs">
                  This permanently removes this examination and its configured paper timetable. This examination has no student marks recorded. This action cannot be undone.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="font-bold text-amber-950">
                Cannot permanently delete this examination
              </div>
              <div className="text-amber-900 text-xs leading-relaxed">
                {reasonUnsafe ||
                  "Academic records or evaluation ledgers are associated with this examination."}
              </div>
              {canCancel && exam.status !== "CANCELLED" && (
                <div className="pt-2 text-xs font-medium text-amber-900 border-t border-amber-200/60 space-y-2">
                  <div>
                    Safe Alternative: You can <span className="font-bold">Cancel</span> this examination instead. Cancelling preserves historical audit trails and mark ledgers while withdrawing the assessment.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {isSafeToDelete ? "Cancel" : "Close"}
          </Button>

          {isSafeToDelete ? (
            <Button
              size="sm"
              variant="danger"
              isLoading={isLoading}
              onClick={onConfirmDelete}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Examination
            </Button>
          ) : canCancel && exam.status !== "CANCELLED" && onRequestCancelAlternative ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
              onClick={() => {
                onClose();
                onRequestCancelAlternative(exam);
              }}
            >
              Cancel Examination (Safe Alternative)
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
