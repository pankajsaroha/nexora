"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  UserCheck,
  UserX,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";

export interface StudentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    fullName: string;
    admissionNumber: string;
    rollNumber?: string | null;
    loginId?: string | null;
    portalAccessStatus?: string | null;
    email?: string | null;
  };
  onSuccess: () => void;
}

export function ManageStudentAccessModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: StudentAccessModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [customLoginId, setCustomLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [actionType, setActionType] = useState<"VIEW" | "RESET_PASSWORD" | "SUSPEND">("VIEW");

  const status = student.portalAccessStatus || "NOT_ENABLED";
  const hasAccess = status === "ACTIVE" || status === "SETUP_PENDING";
  const isSuspended = status === "SUSPENDED";
  const isRevoked = status === "REVOKED";
  const notEnabled = status === "NOT_ENABLED";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableAccess = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/students/${student.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ENABLE",
          customLoginId: customLoginId.trim() || undefined,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enable portal access");

      setSuccessNotice(`Portal access enabled! Login ID: ${data.loginId}, Password: ${data.initialPassword}`);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to enable portal access");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password.trim() || password.trim().length < 6) {
      setErrorMessage("New password must be at least 6 characters in length.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/students/${student.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PASSWORD",
          newPassword: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setSuccessNotice("Student portal password updated successfully.");
      setPassword("");
      setActionType("VIEW");
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/students/${student.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUSPEND",
          reason: suspensionReason.trim() || "Administrative suspension",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to suspend access");

      setSuccessNotice("Student portal access has been suspended.");
      setActionType("VIEW");
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to suspend access");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/students/${student.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESTORE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore access");

      setSuccessNotice("Student portal access has been restored to Active.");
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to restore access");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke portal login access for ${student.fullName}? Student records and academic history will remain preserved.`)) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/students/${student.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke access");

      setSuccessNotice("Student portal access has been revoked.");
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to revoke access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Portal Access Management"
      description={`Manage login identity, authentication credentials, and access lifecycle for ${student.fullName}.`}
      size="md"
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Status Badge Header */}
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block font-bold">
              Current Access State
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {hasAccess && (
                <span className="inline-flex items-center gap-1.5 font-bold text-success">
                  <UserCheck className="w-4 h-4" />
                  <span>{status === "ACTIVE" ? "Active Student Portal" : "Setup Pending"}</span>
                </span>
              )}
              {isSuspended && (
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Portal Access Suspended</span>
                </span>
              )}
              {isRevoked && (
                <span className="inline-flex items-center gap-1.5 font-bold text-destructive">
                  <UserX className="w-4 h-4" />
                  <span>Portal Access Revoked</span>
                </span>
              )}
              {notEnabled && (
                <span className="inline-flex items-center gap-1.5 font-bold text-muted-foreground">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <span>Not Enabled</span>
                </span>
              )}
            </div>
          </div>

          {student.loginId && (
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block font-bold">
                Student Login ID
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-mono font-bold text-sm text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                  {student.loginId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(student.loginId!)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Copy Login ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-success-subtle border border-success/20 rounded-xl text-xs text-success">
            {successNotice}
          </div>
        )}

        {/* State 1: NOT_ENABLED -> Provision Form */}
        {notEnabled && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
              Enabling student portal access generates a collision-safe, institution-issued Login ID (e.g. <span className="font-mono font-bold text-foreground">NX7K42P</span>). The student can use this ID to sign in without requiring a personal email address or phone number.
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-[11px]">
                Custom Login ID (Optional — auto-generated if left blank)
              </label>
              <input
                type="text"
                value={customLoginId}
                onChange={(e) => setCustomLoginId(e.target.value.toUpperCase())}
                placeholder="e.g. NX7K42P (Auto-generated)"
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-[11px]">
                Initial Security Password (Optional — auto-generated if left blank)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Default: <LoginID>@2026"
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnableAccess}
                disabled={loading}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Enable Student Portal Access
              </Button>
            </div>
          </div>
        )}

        {/* State 2: ACTIVE or SETUP_PENDING */}
        {hasAccess && actionType === "VIEW" && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-card border border-border rounded-xl">
                <span className="text-muted-foreground block">Admission Number</span>
                <span className="font-mono font-bold text-foreground">{student.admissionNumber}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-xl">
                <span className="text-muted-foreground block">Roll Number</span>
                <span className="font-mono font-bold text-foreground">{student.rollNumber || "Unassigned"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={() => setActionType("RESET_PASSWORD")}
              >
                <Lock className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Reset Student Password
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => setActionType("SUSPEND")}
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                Temporarily Suspend Access
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={handleRevoke}
                disabled={loading}
              >
                <UserX className="w-3.5 h-3.5 mr-2" />
                Revoke Portal Access
              </Button>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Action Form: Reset Password */}
        {hasAccess && actionType === "RESET_PASSWORD" && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-[11px]">
                New Password (Minimum 6 characters) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setActionType("VIEW")} disabled={loading}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={handleResetPassword} disabled={!password || loading}>
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save New Password
              </Button>
            </div>
          </div>
        )}

        {/* Action Form: Suspend Access */}
        {hasAccess && actionType === "SUSPEND" && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block text-[11px]">
                Suspension Reason (for audit compliance)
              </label>
              <input
                type="text"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Disciplinary review, leave of absence, pending verification"
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setActionType("VIEW")} disabled={loading}>
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={handleSuspend}
                disabled={loading}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Confirm Suspension
              </Button>
            </div>
          </div>
        )}

        {/* State 3: SUSPENDED */}
        {isSuspended && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              Student portal login is currently blocked. Academic records, attendance, marks, and fees are preserved.
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleRevoke}
                disabled={loading}
              >
                Revoke Permanently
              </Button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleRestore} disabled={loading}>
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Restore Active Access
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* State 4: REVOKED */}
        {isRevoked && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
              Portal access was revoked. You can re-enable or restore access whenever the student requires login credentials.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={handleRestore} disabled={loading}>
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Re-enable Access
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
