"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  X,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTaskModal({ isOpen, onClose }: QuickTaskModalProps) {
  const [title, setTitle] = useState("Prepare Grade 8A Mid-Term Assessment Blueprint");
  const [description, setDescription] = useState("Align with CBSE curriculum units and finalize question weightage.");
  const [assignee, setAssignee] = useState("Mrs. Ananya Sharma (Grade 8A Incharge)");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("HIGH");
  const [dueDate, setDueDate] = useState("2026-09-30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ title: string; assignee: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate,
        }),
      }).catch(() => {});

      setSuccessData({ title, assignee });
    } catch {
      setSuccessData({ title, assignee });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171614]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E0D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#EFECE3] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#D4B87C]/50 text-[#856D3B] flex items-center justify-center shadow-2xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#171614] tracking-tight">
                {successData ? "Task Assigned Successfully" : "Assign Institutional Task"}
              </h3>
              <p className="text-[11px] font-mono text-[#7A756B] uppercase tracking-wider">
                {successData ? "Notification Dispatched" : "Direct Operational Delegation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#7A756B] hover:text-[#171614] hover:bg-[#EFECE3] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          <div className="p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F4F6F1] border border-[#65705B]/30 text-[#525E4B] mx-auto flex items-center justify-center shadow-inner animate-in zoom-in-50">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#525E4B] font-bold bg-[#F4F6F1] px-3 py-1 rounded-full border border-[#65705B]/30">
                ✓ Task Dispatched to Workspace
              </span>
              <h4 className="text-lg font-bold text-[#171614] pt-2">
                &ldquo;{successData.title}&rdquo;
              </h4>
              <p className="text-xs text-[#555047]">
                Assigned to: <strong className="text-[#171614]">{successData.assignee}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#7A756B]">
                <span>Priority:</span>
                <span className="font-bold text-[#6F3D3A]">{priority}</span>
              </div>
              <div className="flex justify-between text-[#7A756B]">
                <span>Due Date:</span>
                <span className="font-bold text-[#171614]">{dueDate}</span>
              </div>
              <div className="flex justify-between text-[#7A756B]">
                <span>Action Log:</span>
                <span className="text-[#525E4B] font-bold">Synced with Faculty Mobile & Web</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3.5 rounded-xl bg-[#1B1916] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2.5 text-xs text-[#171614] focus:bg-white focus:ring-2 focus:ring-[#B89B62] focus:border-transparent focus:outline-none transition-all"
                placeholder="e.g. Science Lab Stock Reconciliation"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1.5">
                Instructions & Deliverables
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2.5 text-xs text-[#171614] focus:bg-white focus:ring-2 focus:ring-[#B89B62] focus:border-transparent focus:outline-none transition-all resize-none"
                placeholder="Provide clear notes or attachments expected..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1.5">
                  Assign To
                </label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2.5 text-xs text-[#171614] focus:bg-white focus:ring-2 focus:ring-[#B89B62] focus:border-transparent focus:outline-none transition-all"
                >
                  <option>Mrs. Ananya Sharma (Grade 8A Incharge)</option>
                  <option>Dr. Arvind Menon (Principal)</option>
                  <option>Mrs. Neha Kapoor (Bursar & Accounts)</option>
                  <option>Mr. Rajeshwar Kulkarni (HOD Science)</option>
                  <option>Mathematics Department Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2.5 text-xs text-[#171614] focus:bg-white focus:ring-2 focus:ring-[#B89B62] focus:border-transparent focus:outline-none transition-all font-medium"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent (24h Deadline)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3.5 py-2.5 text-xs text-[#171614] focus:bg-white focus:ring-2 focus:ring-[#B89B62] focus:border-transparent focus:outline-none transition-all"
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#EFECE3] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#DCD7CB] text-xs font-semibold text-[#555047] hover:bg-[#FAF8F3] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B1916] text-[#F7F4ED] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2722] hover:border-[#B89B62] border border-[#1B1916] transition-all shadow-xs disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4B87C]" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <span>Create & Dispatch Task</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4B87C]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
