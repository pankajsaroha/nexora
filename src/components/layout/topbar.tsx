"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  LogOut,
  Calendar,
  User,
  Shield,
  ChevronDown,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { CommandPalette } from "@/components/ui/command-palette";
import { ThemeToggle, ThemeDropdownItem } from "@/components/ui/theme-toggle";
import { InstitutionSelector, InstitutionItem } from "@/components/ui/institution-selector";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export interface TopbarProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    roleCode: string;
    institutionName: string;
    institutionId?: string;
  };
  institutions?: InstitutionItem[];
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string | Date;
  }>;
  onOpenMobileSidebar: () => void;
}

function formatTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRoleTitle(roleCode: string): string {
  if (!roleCode) return "Staff";
  switch (roleCode.toUpperCase()) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "PRINCIPAL":
      return "Principal";
    case "TEACHER":
      return "Faculty";
    case "STUDENT":
      return "Student";
    case "PARENT":
      return "Parent";
    case "ACCOUNTANT":
      return "Accountant";
    case "ADMIN":
      return "Administrator";
    default:
      return formatTitleCase(roleCode.replace(/_/g, " "));
  }
}

export function Topbar({
  user,
  institutions = [],
  notifications = [],
  onOpenMobileSidebar,
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
  const formattedName = formatTitleCase(user.fullName || "User");
  const formattedRole = formatRoleTitle(user.roleCode);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue redirect
    }
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile Toggle & Global Search Command */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground border border-border lg:hidden transition-colors shrink-0"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Single-line Command Search */}
        <CommandPalette />
      </div>

      {/* Right: Institution Context (Super Admin), Academic Session, Notifications, Theme, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Super Admin Institution Selector */}
        {isSuperAdmin && (
          <InstitutionSelector
            currentInstitutionId={user.institutionId}
            currentInstitutionName={user.institutionName}
            institutions={institutions}
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {/* Academic Session Context */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2.5 py-1.5 rounded-xl border border-border bg-card/80 shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>AY 2026–27 · Term 1</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground border border-border bg-card/80 transition-all shadow-2xs cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{unreadCount} unread</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No new notifications for your profile.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl border border-border bg-muted/30 text-xs space-y-1 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <span className="text-[10px] font-mono text-muted-foreground">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle (Unobtrusive) */}
        <ThemeToggle className="hidden sm:flex" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted/80 border border-border bg-card/90 transition-all shadow-2xs cursor-pointer"
            aria-label="User profile and settings"
          >
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
              {formattedName ? formattedName[0] : "U"}
            </div>
            <div className="hidden sm:block text-left mr-0.5">
              <p className="text-xs font-semibold text-foreground leading-none">{formattedName}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{formattedRole}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                <div className="px-3 py-2.5 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{formattedName}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                      {formattedRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{user.email}</p>
                  <p className="text-[10px] text-primary font-medium truncate mt-1">{user.institutionName}</p>
                </div>

                {/* Appearance Switcher */}
                <ThemeDropdownItem />

                <div className="pt-1 border-t border-border/60">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>

                  {isSuperAdmin && (
                    <Link
                      href="/audit-logs"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Security & Audit Logs</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
