"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  Send,
  CheckCircle2,
  FileText,
  Users,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumPagination } from "@/components/ui/premium-pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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

  const totalPages = Math.ceil(assignments.length / pageSize) || 1;
  const paginatedAssignments = assignments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        const selectedSec = sections.find((s) => s.id === formData.sectionId)?.name || "8A";
        const selectedSub = subjects.find((s) => s.id === formData.subjectId)?.name || "Subject";

        setPublishedAlertData({
          recipientName: "Mr. Rahul Sharma (Parent of Aarav)",
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
      <PageHeader
        eyebrow="COURSEWORK & PEDAGOGY"
        title="Assignments & Coursework"
        description="Publish homework problem sets, manage student submissions, and send automated WhatsApp parent notifications."
      >
        {canCreate && (
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5 text-[#D4B87C]" />}
          >
            Create Assignment
          </Button>
        )}
      </PageHeader>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedAssignments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#7A756B] rounded-2xl border border-dashed border-[#DCD7CB] bg-[#FAF8F3]">
            No coursework assignments published yet.
          </div>
        ) : (
          paginatedAssignments.map((a) => {
            const completionPct = Math.round(
              (a.submissionsCount / (a.totalStudents || 1)) * 100
            );

            return (
              <div
                key={a.id}
                className="rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs hover:border-[#B89B62] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50">
                      {a.subjectName}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A756B]">
                      {a.className} ({a.sectionName})
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-[#171614] leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[#555047] mt-1 line-clamp-2 leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#EFECE3]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#7A756B]">
                    <span>Submissions</span>
                    <span className="font-bold text-[#171614]">
                      {a.submissionsCount} / {a.totalStudents} ({completionPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#FAF8F3] h-1.5 rounded-full overflow-hidden border border-[#E5E0D5]">
                    <div
                      className="bg-[#65705B] h-full rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A756B] pt-1">
                    <span className="font-mono text-[#6F3D3A] font-bold">Due: {formatDate(a.dueDate)}</span>
                    <span className="font-mono font-bold text-[#171614]">{a.maxMarks} Marks</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <PremiumPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={assignments.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Publish New Assignment"
          description="Create structured homework or laboratory coursework for enrolled students."
          size="lg"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#171614] mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Physics: Mechanics & Optics Problem Set #4"
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171614] mb-1">
                Instructions & Rubric
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail the expected solutions, format, and chapter references..."
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Target Cohort / Section *
                </label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] font-semibold"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] font-semibold"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Submission Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Max Marks *
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  placeholder="50"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EFECE3]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Publish Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* WhatsApp Dispatch Modal */}
      {publishedAlertData && (
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
