"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  KeyRound,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Settings,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { ChangePasswordCard } from "./change-password-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminSelfProfileProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    roleCode: string;
    roleName: string;
    institutionId: string;
    institutionName: string;
    institutionCode?: string | null;
    isSuperAdmin: boolean;
  };
}

export function AdminSelfProfile({ user }: AdminSelfProfileProps) {
  const canManageInstitution = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(user.roleCode);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Top Banner Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-xs">
              {user.fullName ? user.fullName[0] : "A"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user.fullName}
                </h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  {user.roleName}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Institution: {user.institutionName}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {canManageInstitution && (
            <Link href="/settings">
              <Button size="sm" variant="outline" className="gap-2 shrink-0">
                <Settings className="w-3.5 h-3.5 text-primary" />
                <span>Go to Institution Settings</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Governance Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-bold">Verified Administrative Identity.</span>
            <span className="text-muted-foreground ml-1">
              You are signed into Nexora with elevated operational privileges. Institutional configuration is segregated under Institution Settings.
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Account Details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Building2 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Assigned Operational Scope</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Governance Authority:</span>
              <span className="font-semibold text-foreground">{user.roleName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Assigned Institution:</span>
              <span className="font-semibold text-foreground">{user.institutionName}</span>
            </div>
            {user.institutionCode && (
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Affiliation Code:</span>
                <span className="font-mono font-bold text-foreground">{user.institutionCode}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Cross-Tenant Scope:</span>
              <span className="font-semibold text-foreground">
                {user.isSuperAdmin ? "Global Multi-Tenant Authority" : "Scoped to Active Institution"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Settings className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Administrative Shortcuts</h3>
          </div>

          <div className="space-y-2 text-xs">
            {canManageInstitution && (
              <Link
                href="/settings"
                className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-foreground block">Institution Configuration</span>
                  <span className="text-[11px] text-muted-foreground">
                    Branding, affiliation codes, and student schema fields
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            )}

            {user.isSuperAdmin && (
              <Link
                href="/audit-logs"
                className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-foreground block">Security & Audit Trail</span>
                  <span className="text-[11px] text-muted-foreground">
                    Inspect immutable authentication and resource mutation logs
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            )}

            <Link
              href="/dashboard"
              className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-foreground block">Operations Dashboard</span>
                <span className="text-[11px] text-muted-foreground">
                  Return to your administrative metrics overview
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Account Security & Password Management */}
        <div className="md:col-span-2">
          <ChangePasswordCard />
        </div>

        {/* Active Session & Sign Out */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Active Administrative Session</h4>
              <p className="text-[11px] text-muted-foreground">
                Signed in as {user.fullName} ({user.email}). Sign out to terminate active tokens.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } finally {
                window.location.href = "/login";
              }
            }}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-semibold gap-2 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Nexora</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
