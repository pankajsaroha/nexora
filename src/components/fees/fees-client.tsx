"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  CreditCard,
  Building,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { WhatsAppPreviewModal } from "@/components/ui/whatsapp-preview-modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface StudentFeeItem {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: Date | string;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  parentName?: string | null;
  parentPhone?: string | null;
  payments: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date | string;
    transactionRef?: string | null;
  }>;
}

export function FeesClient({
  fees,
  canCollect,
}: {
  fees: StudentFeeItem[];
  canCollect: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<StudentFeeItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<any>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const filteredFees = fees.filter((f) => {
    const matchQuery =
      f.studentName.toLowerCase().includes(search.toLowerCase()) ||
      f.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.className.toLowerCase().includes(search.toLowerCase());

    const matchStatus = selectedStatus === "ALL" || f.status === selectedStatus;

    return matchQuery && matchStatus;
  });

  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const overdueAccountsCount = fees.filter((f) => f.status === "OVERDUE").length;

  const handleOpenPayment = (fee: StudentFeeItem) => {
    setSelectedFeeForPayment(fee);
    setPaymentAmount(String(fee.pendingAmount));
    setNotes("Term fee installment payment");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeForPayment) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeeId: selectedFeeForPayment.id,
          studentId: selectedFeeForPayment.studentId,
          amount: Number(paymentAmount),
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedFeeForPayment(null);
        setSelectedReceipt({
          receiptNumber: data.receiptNumber,
          studentName: selectedFeeForPayment.studentName,
          admissionNumber: selectedFeeForPayment.admissionNumber,
          className: `${selectedFeeForPayment.className} (${selectedFeeForPayment.sectionName})`,
          amount: Number(paymentAmount),
          paymentMethod,
          paymentDate: new Date(),
          remainingBalance: data.remainingBalance,
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerReminder = (fee: StudentFeeItem) => {
    setWhatsAppData({
      recipientName: fee.parentName || `Parent of ${fee.studentName}`,
      recipientPhone: fee.parentPhone || "+91 98100 11005",
      templateTitle: "Institutional Fee Reminder Notice",
      messageContent: `Dear Parent,\nThis is a polite reminder from Northstar International Academy that Term 1 fees of ${formatCurrency(
        fee.pendingAmount
      )} for ${fee.studentName} is due on ${formatDate(
        fee.dueDate
      )}.\nPlease settle dues via Nexora Parent Portal or the bursar office.\nThank you.`,
    });
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <PageHeader
        category="Financial Operations & Bursar Ledger"
        title="Student Fees & Collections"
        description="Term tuition invoices, online payment reconciliations, digital QR receipts, and automated parent notifications."
      />

      {/* Key Financial Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold block">
            01 / TOTAL REALIZATION
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[11px] text-accent block font-medium">
            Term 1 settled collections
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold block">
            02 / PENDING RECEIVABLES
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(totalPending)}
          </div>
          <span className="text-[11px] text-accent block font-medium">
            {overdueAccountsCount} Accounts past due date
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold block">
            03 / COLLECTION EFFICIENCY
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-accent tracking-tight">
            {totalCollected + totalPending > 0
              ? `${Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%`
              : "100%"}
          </div>
          <span className="text-[11px] text-accent block font-medium">
            Bursar target: 85% by Term 1
          </span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-white space-y-1 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold block">
            04 / ACTIVE INVOICES
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {fees.length} Total
          </div>
          <span className="text-[11px] text-accent block font-medium">
            Synchronized with student roster
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent" />
          <input
            type="search"
            placeholder="Search by student name, admission number, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-accent focus:outline-none focus:ring-1 focus:ring-[#171614]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Fee Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-card text-accent font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Student & Cohort</th>
                <th className="py-3 px-4 font-bold">Total Invoiced</th>
                <th className="py-3 px-4 font-bold">Amount Paid</th>
                <th className="py-3 px-4 font-bold">Pending Balance</th>
                <th className="py-3 px-4 font-bold">Due Date</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filteredFees.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-card transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-foreground">
                      {f.studentName}
                    </div>
                    <div className="text-[11px] text-accent font-mono mt-0.5">
                      {f.className} ({f.sectionName}) · {f.admissionNumber}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                    {formatCurrency(f.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">
                    {formatCurrency(f.paidAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {f.pendingAmount === 0 ? "₹0" : formatCurrency(f.pendingAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-accent font-mono">
                    {formatDate(f.dueDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        f.status === "PAID"
                          ? "bg-accent/10 text-accent border border-success/30/20"
                          : f.status === "PARTIAL"
                          ? "bg-[#B89B62]/10 text-primary border border-primary/20"
                          : f.status === "OVERDUE"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-card text-accent border border-border"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.pendingAmount > 0 && canCollect && (
                        <Button
                          size="xs"
                          onClick={() => handleOpenPayment(f)}
                          leftIcon={<CreditCard className="h-3 w-3" />}
                        >
                          Collect
                        </Button>
                      )}
                      {f.pendingAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => triggerReminder(f)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-foreground px-2 py-1 rounded hover:bg-card"
                        >
                          <MessageCircle className="h-3 w-3 text-accent" />
                          <span>Remind</span>
                        </button>
                      )}
                      {f.payments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const p = f.payments[0];
                            setSelectedReceipt({
                              receiptNumber: p.receiptNumber,
                              studentName: f.studentName,
                              admissionNumber: f.admissionNumber,
                              className: `${f.className} (${f.sectionName})`,
                              amount: p.amount,
                              paymentMethod: p.paymentMethod,
                              paymentDate: p.paymentDate,
                              remainingBalance: f.pendingAmount,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-foreground px-2 py-1 rounded hover:bg-card"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedFeeForPayment && (
        <Modal
          isOpen={!!selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          title={`Collect Fee Payment — ${selectedFeeForPayment.studentName}`}
          description={`Admission: ${selectedFeeForPayment.admissionNumber} • Outstanding Balance: ${formatCurrency(
            selectedFeeForPayment.pendingAmount
          )}`}
          size="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-foreground mb-1">Amount to Collect (₹) *</label>
              <input
                type="number"
                required
                max={selectedFeeForPayment.pendingAmount}
                min={1}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-base font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-[#171614]"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="ONLINE">Net Banking / Debit Card</option>
                <option value="CASH">Cash Collection</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Receipt Remarks / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Term 1 Tuition + Transport Fee"
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#171614]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedFeeForPayment(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Generate Receipt & Save
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Payment Receipt"
          description={`Receipt #${selectedReceipt.receiptNumber}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4 text-xs">
              <div className="text-center border-b border-border pb-3">
                <div className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                  Northstar International Academy
                </div>
                <div className="text-[11px] text-accent mt-0.5">
                  Knowledge Park III, Greater Noida, UP • Digital Payment Voucher
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-accent">Receipt No:</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Student Name:</span>
                  <span className="font-bold text-foreground">
                    {selectedReceipt.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Admission / Class:</span>
                  <span className="text-foreground">
                    {selectedReceipt.admissionNumber} ({selectedReceipt.className})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Payment Date:</span>
                  <span className="font-mono text-foreground">{formatDate(selectedReceipt.paymentDate, "dd MMM yyyy, HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Payment Mode:</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-border font-bold text-foreground">
                    {selectedReceipt.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-sm font-bold">
                  <span className="text-foreground">Amount Paid:</span>
                  <span className="font-mono text-accent">
                    {formatCurrency(selectedReceipt.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-accent">
                  <span>Remaining Due:</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedReceipt.remainingBalance)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppModalOpen && whatsAppData && (
        <WhatsAppPreviewModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          recipientName={whatsAppData.recipientName}
          recipientPhone={whatsAppData.recipientPhone}
          templateTitle={whatsAppData.templateTitle}
          messageContent={whatsAppData.messageContent}
        />
      )}
    </div>
  );
}
