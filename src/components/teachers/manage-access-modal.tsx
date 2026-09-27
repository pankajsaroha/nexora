"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { KeyRound, ShieldCheck, ShieldAlert, Loader2, UserCheck, UserX } from "lucide-react";

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    fullName: string;
    employeeCode: string;
    officialEmail?: string;
    user?: {
      id: string;
      email: string;
      role?: string;
      isActive: boolean;
    } | null;
  };
  onSuccess: () => void;
}

export function ManageAccessModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: ManageAccessModalProps) {
  const [loading, setLoading] = useState(false);
  const hasAccount = !!staff.user;

  const [email, setEmail] = useState(staff.user?.email || staff.officialEmail || "");
  const [role, setRole] = useState<string>(staff.user?.role || "TEACHER");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGrantOrUpdate = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GRANT",
          email: email.trim(),
          role,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update portal access");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to manage portal access");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke portal login access for ${staff.fullName}?`)) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke portal access");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to revoke portal access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hasAccount ? "Manage Portal Access" : "Grant Portal Login Access"}
      description={`Configure authentication credentials and permissions for ${staff.fullName}.`}
      size="md"
    >
      <div className="space-y-4 py-1 text-xs">
        {hasAccount ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <UserCheck className="w-4 h-4" />
              <span>Portal Login Active ({staff.user?.role})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevoke}
              disabled={loading}
              className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <UserX className="w-3.5 h-3.5 mr-1" />
              Revoke
            </Button>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>No Active Portal Account</span>
            </div>
            <p className="text-muted-foreground">This staff member currently does not have login credentials for Nexora.</p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Login Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="staff.member@institution.edu"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">System Role *</label>
          <select
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TEACHER">Teacher / Academic Faculty</option>
            <option value="ADMIN">Institution Administrator</option>
            <option value="ACCOUNTANT">Accountant / Finance</option>
            <option value="HR_ADMIN">HR Administrator</option>
            <option value="STAFF">General Non-Teaching Staff</option>
          </select>
          <p className="text-[11px] text-muted-foreground">
            Controls dashboard views and authorization scope.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">
            {hasAccount ? "New Password (leave blank to keep unchanged)" : "Initial Password *"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder={hasAccount ? "•••••••• (unchanged)" : "Minimum 6 characters"}
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
            onClick={handleGrantOrUpdate}
            disabled={!email || (!hasAccount && !password) || loading}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            {hasAccount ? "Save Access Updates" : "Grant Portal Access"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
