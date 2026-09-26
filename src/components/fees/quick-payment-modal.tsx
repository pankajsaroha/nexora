"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickPaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickPaymentModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState<any>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    studentFeeId: "",
    amount: "",
    paymentMethod: "CASH",
    notes: "Counter collection - Term fee installment",
    transactionRef: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoadingStudents(true);
      fetch("/api/students?status=ACTIVE")
        .then((res) => res.json())
        .then((data) => {
          if (data.students && Array.isArray(data.students)) {
            setStudents(data.students);
            if (data.students.length > 0) {
              const first = data.students[0];
              const firstFee = first.fees?.[0];
              setFormData((prev) => ({
                ...prev,
                studentId: first.id,
                studentFeeId: firstFee?.id || "",
                amount: firstFee ? String(firstFee.pendingAmount) : "",
              }));
              setSelectedStudentFee(firstFee || null);
            }
          }
        })
        .catch((err) => console.error("Failed to load students:", err))
        .finally(() => setIsLoadingStudents(false));
    }
  }, [isOpen]);

  const handleStudentSelect = (stId: string) => {
    const student = students.find((s) => s.id === stId);
    const fee = student?.fees?.[0];
    setFormData((prev) => ({
      ...prev,
      studentId: stId,
      studentFeeId: fee?.id || "",
      amount: fee ? String(fee.pendingAmount) : "",
    }));
    setSelectedStudentFee(fee || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.studentFeeId) {
      setError("This student does not have an active fee structure assigned yet. Please assign a fee schedule in the Finance module first.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          studentFeeId: formData.studentFeeId,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          transactionRef: formData.transactionRef || `COUNTER_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record payment.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fee Payment"
      description="Issue official fee receipt, reconcile ledger balance, and update student financial records."
      size="md"
    >
      {success ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#525E4B]/10 text-[#525E4B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#171614] font-serif">Payment Recorded Successfully</h4>
          <p className="text-xs text-[#65705B]">
            Official institutional receipt generated and financial ledger updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-[#8B3A3A]/10 border border-[#8B3A3A]/20 text-[#8B3A3A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171614] mb-1">Select Student *</label>
            <select
              value={formData.studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
            >
              {isLoadingStudents ? (
                <option value="">Loading student roster...</option>
              ) : students.length === 0 ? (
                <option value="">No active students found</option>
              ) : (
                students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} • Adm #{st.admissionNumber || "N/A"} ({st.currentClass?.name || "General"} {st.currentSection?.name || ""})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedStudentFee && (
            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#7A756B] block">Current Balance</span>
                <span className="font-bold text-[#171614] text-sm">
                  {formatCurrency(selectedStudentFee.pendingAmount)} Pending
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#7A756B] block">Total Invoiced</span>
                <span className="font-mono text-xs text-[#555047]">
                  {formatCurrency(selectedStudentFee.totalAmount)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171614] mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171614] mb-1">Payment Mode *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              >
                <option value="CASH">Cash Counter</option>
                <option value="UPI">UPI / QR Transfer</option>
                <option value="NET_BANKING">Net Banking / NEFT / RTGS</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
                <option value="POS">Card POS Terminal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171614] mb-1">Receipt Notes & References</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Term 1 installment received at reception"
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
              Record & Generate Receipt
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
