"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Users, Loader2, ShieldCheck, Mail, Phone, UserCheck } from "lucide-react";

export interface LinkGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export function LinkGuardianModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: LinkGuardianModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [relation, setRelation] = useState("PARENT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [grantParentPortal, setGrantParentPortal] = useState(false);
  const [parentPassword, setParentPassword] = useState("Parent@2026");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("Guardian full name and phone number are required.");
      return;
    }

    if (grantParentPortal && !email.trim()) {
      setErrorMessage("An email address is required to create a Parent Portal login account.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/students/${studentId}/guardians`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          relation,
          phone: phone.trim(),
          email: email.trim() || undefined,
          isPrimary,
          grantParentPortal,
          parentPassword: grantParentPortal ? parentPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link guardian");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to link guardian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Verified Parent / Guardian"
      description={`Add or link a family guardian record to student ${studentName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block text-[11px]">
            Guardian Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Mr. Rajesh Sharma"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block text-[11px]">
              Relationship *
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="PARENT">Parent / Guardian</option>
              <option value="LEGAL_GUARDIAN">Legal Guardian</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block text-[11px]">
              Primary Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98100 00000"
              className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block text-[11px]">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="guardian@example.com"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="isPrimary" className="text-xs text-foreground cursor-pointer">
            Set as Primary Guardian for notifications and emergency contact
          </label>
        </div>

        {/* Option to grant Parent Portal account */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="grantParentPortal"
              checked={grantParentPortal}
              onChange={(e) => setGrantParentPortal(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="grantParentPortal" className="text-xs font-bold text-foreground cursor-pointer">
              Enable Parent Portal login account for this guardian
            </label>
          </div>

          {grantParentPortal && (
            <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
              <span className="text-[11px] text-muted-foreground block">
                The guardian can sign in to the Parent Portal using their email to access academic progress, timetables, and fee records for all linked children.
              </span>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  placeholder="Parent@2026"
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading}>
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            Link Guardian
          </Button>
        </div>
      </form>
    </Modal>
  );
}
