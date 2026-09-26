"use client";

import React, { useState } from "react";
import { Megaphone, Send, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface QuickBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickBroadcastModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "EVERYONE",
    priority: "NORMAL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish broadcast circular.");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: "",
          content: "",
          targetAudience: "EVERYONE",
          priority: "NORMAL",
        });
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to dispatch broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Campus Notice"
      description="Dispatch official notices instantly to faculty, students, or parents across digital channels."
      size="lg"
    >
      {success ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#525E4B]/10 text-[#525E4B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#171614] font-serif">Notice Broadcast Dispatched</h4>
          <p className="text-xs text-[#65705B]">
            Your announcement has been published to all selected channels and logged in institutional audit registers.
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
            <label className="block font-semibold text-[#171614] mb-1">Notice Title / Subject *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule Revision for Mid-Term Examination 2026"
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171614] mb-1">Target Audience *</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              >
                <option value="EVERYONE">All Campus (Scholars, Faculty & Parents)</option>
                <option value="PARENTS">Guardians & Parents Only</option>
                <option value="TEACHERS">Faculty & Staff Members</option>
                <option value="STUDENTS">Enrolled Students Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#171614] mb-1">Urgency / Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              >
                <option value="NORMAL">Normal Advisory</option>
                <option value="HIGH">High Importance</option>
                <option value="URGENT">Urgent Broadcast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171614] mb-1">Notice Content & Dispatch Text *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write official circular text, timing guidelines, and instructions..."
              className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#65705B]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Multi-channel distribution enabled</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#525E4B] uppercase bg-[#525E4B]/10 px-2 py-0.5 rounded">
              Verified Gateway
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Dispatch Notice
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
