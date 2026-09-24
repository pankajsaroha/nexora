"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  FileText,
  Users,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { WhatsAppPreviewModal } from "@/components/ui/whatsapp-preview-modal";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  className: string;
  sectionName: string;
  teacherName: string;
  dueDate: Date | string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  maxMarks: number;
  status: string;
  submissionsCount: number;
  totalStudents: number;
}

export function AssignmentsClient({
  assignments,
  sections,
  subjects,
  canCreate,
}: {
  assignments: AssignmentItem[];
  sections: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
  canCreate: boolean;
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [publishedAlertData, setPublishedAlertData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sectionId: sections[0]?.id || "",
    subjectId: subjects[0]?.id || "",
    dueDate: "2026-10-05",
    priority: "MEDIUM",
    maxMarks: "50",
  });

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreateModalOpen(false);
        const selectedSec = sections.find((s) => s.id === formData.sectionId)?.name || "8A";
        const selectedSub = subjects.find((s) => s.id === formData.subjectId)?.name || "Subject";

        setPublishedAlertData({
          recipientName: "Mr. Rajesh Sharma (Parent of Aarav)",
          recipientPhone: "+91 98100 11005",
          templateTitle: `New ${selectedSub} Homework Posted`,
          messageContent: `Dear Parent,\nA new ${selectedSub} assignment ('${formData.title}') has been posted for ${selectedSec}.\nDue Date: ${formatDate(formData.dueDate)}.\nMax Marks: ${formData.maxMarks}\n- Northstar International Academy`,
        });

        setIsWhatsAppModalOpen(true);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create assignment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="CURRICULUM & COURSEWORK EVALUATION"
        title="Assignments & Coursework"
        description="Publish homework problem sets, track submission ratios, record grades, and notify parent guardians."
        actions={
          canCreate ? (
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Post Assignment
            </Button>
          ) : undefined
        }
      />

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-mono text-xs rounded-xl border border-dashed border-[#E8E7DF]">
            No coursework assignments published yet.
          </div>
        ) : (
          assignments.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-editorial"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold px-2 py-0.5 rounded bg-slate-100 border border-blue-200">
                    {item.subjectName}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                      item.priority === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : item.priority === "MEDIUM"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E7DF] space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Target Class:</span>
                  <span className="font-semibold text-slate-800">
                    {item.className} ({item.sectionName})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Due Date:</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {formatDate(item.dueDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E8E7DF]/60">
                  <span>Submissions:</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {item.submissionsCount} / {item.totalStudents || 35} received
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Assignment Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create & Post Course Assignment"
          description="Publish homework to selected class cohort with automated parent dispatch."
          size="md"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Quadratic Equations Problem Set"
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks *</label>
                <input
                  type="number"
                  required
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Instructions *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Specify questions, required proofs, and submission guidelines..."
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E7DF]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Publish & Queue Alerts
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* WhatsApp Simulation Modal */}
      {isWhatsAppModalOpen && publishedAlertData && (
        <WhatsAppPreviewModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          recipientName={publishedAlertData.recipientName}
          recipientPhone={publishedAlertData.recipientPhone}
          templateTitle={publishedAlertData.templateTitle}
          messageContent={publishedAlertData.messageContent}
        />
      )}
    </div>
  );
}
