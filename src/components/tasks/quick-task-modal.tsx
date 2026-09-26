"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Send, CheckCircle2, AlertCircle, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickTaskModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Array<{ id: string; fullName: string; roleCode: string }>>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeUserId: "",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Load active staff members
  useEffect(() => {
    if (isOpen) {
      setIsLoadingStaff(true);
      fetch("/api/teachers")
        .then((res) => res.json())
        .then((data) => {
          if (data.teachers && Array.isArray(data.teachers)) {
            const list = data.teachers.map((t: any) => ({
              id: t.userId || t.id,
              fullName: t.user?.fullName || t.fullName || "Faculty Member",
              roleCode: t.user?.roleCode || "FACULTY",
            }));
            setStaffList(list);
            if (list.length > 0 && !formData.assigneeUserId) {
              setFormData((prev) => ({ ...prev, assigneeUserId: list[0].id }));
            }
          }
        })
        .catch((err) => console.error("Failed to load staff list:", err))
        .finally(() => setIsLoadingStaff(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to assign task.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: "",
          description: "",
          assigneeUserId: staffList[0]?.id || "",
          priority: "HIGH",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        });
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Management Task"
      description="Create and assign an operational deliverable to faculty or administrative staff."
      size="md"
    >
      {success ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#525E4B]/10 text-[#525E4B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#171614] font-serif">Task Assigned Successfully</h4>
          <p className="text-xs text-[#65705B]">
            The task and activity timeline have been initialized and recorded in the audit log.
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
            <label className="block font-semibold text-[#171614] mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Science Laboratory Inventory Audit Q3"
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171614] mb-1">Assign To *</label>
              <select
                value={formData.assigneeUserId}
                onChange={(e) => setFormData({ ...formData, assigneeUserId: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              >
                {isLoadingStaff ? (
                  <option value="">Loading faculty roster...</option>
                ) : staffList.length === 0 ? (
                  <option value="">Self / Primary Admin</option>
                ) : (
                  staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.roleCode})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#171614] mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171614] mb-1">Target Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#171614] mb-1">Scope of Work & Instructions *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline specific objectives, checklist items, and institutional deliverables..."
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<CheckSquare className="w-3.5 h-3.5" />}>
              Assign Deliverable
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
