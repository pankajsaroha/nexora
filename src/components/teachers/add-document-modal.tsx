"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, Calendar } from "lucide-react";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  onSuccess: () => void;
}

export function AddDocumentModal({
  isOpen,
  onClose,
  staffId,
  staffName,
  onSuccess,
}: AddDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("RESUME");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please enter a document title");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staffId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          fileUrl: fileUrl.trim() || undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload document");

      setTitle("");
      setFileUrl("");
      setIssueDate("");
      setExpiryDate("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Staff Document"
      description={`Register credentials, contracts, and certifications for ${staffName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Document Category *</label>
          <select
            value={type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="RESUME">Resume / Curriculum Vitae</option>
            <option value="APPOINTMENT_LETTER">Appointment Letter</option>
            <option value="JOINING_LETTER">Joining Letter</option>
            <option value="QUALIFICATION_CERTIFICATE">Qualification / Degree Certificate</option>
            <option value="EXPERIENCE_CERTIFICATE">Experience Certificate</option>
            <option value="IDENTITY_PROOF">Government ID / Identity Proof</option>
            <option value="CONTRACT">Employment Contract</option>
            <option value="APPRAISAL_LETTER">Appraisal / Promotion Letter</option>
            <option value="OTHER">Other Institutional Document</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Document Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="e.g. Master of Computer Applications Degree Certificate"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            Document File / Storage URL (Optional)
          </label>
          <input
            type="text"
            value={fileUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileUrl(e.target.value)}
            placeholder="https://storage.institution.edu/docs/... or file identifier"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Issue Date</span>
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIssueDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Expiry Date (if any)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading || !title.trim()}>
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Save Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
