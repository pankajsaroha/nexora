"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  LogOut,
  Calendar,
  Building2,
  ChevronDown,
  Settings,
  ShieldAlert,
  User,
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
    linkUrl?: string | null;
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

  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isSuperAdmin = user.roleCode === "SUPER_ADMIN";
  const canManageInstitution = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(user.roleCode || "");
  const formattedName = formatTitleCase(user.fullName || "User");
  const formattedRole = formatRoleTitle(user.roleCode);

  // Close menus on outside pointerdown
  React.useEffect(() => {
    if (!showNotifications && !showUserMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showNotifications, showUserMenu]);

  // Close menus on Escape key
  React.useEffect(() => {
    if (!showNotifications && !showUserMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications, showUserMenu]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue redirect
    }
    window.location.href = "/login";
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      {/* Primary Topbar Row */}
      <header className="flex h-14 sm:h-16 w-full items-center justify-between px-3.5 sm:px-6 lg:px-8 gap-2 sm:gap-3 lg:gap-4 min-w-0">
        {/* Left: Mobile Sidebar Hamburger & Global Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-1 sm:mr-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground border border-border bg-card/80 lg:hidden transition-colors shrink-0 shadow-2xs cursor-pointer active:scale-95"
            aria-label="Open sidebar navigation"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Global Search Command Palette */}
          <div className="flex-1 min-w-0 max-w-full sm:max-w-md lg:max-w-lg">
            <CommandPalette />
          </div>
        </div>

        {/* Right: Actions & User Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Super Admin Institution Selector (Desktop & Tablet) */}
          {isSuperAdmin && (
            <div className="hidden md:flex items-center">
              <InstitutionSelector
                currentInstitutionId={user.institutionId}
                currentInstitutionName={user.institutionName}
                institutions={institutions}
                isSuperAdmin={isSuperAdmin}
              />
            </div>
          )}

          {/* Academic Session Context (Large Screens) */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1.5 rounded-xl border border-border bg-card/80 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>AY 2026–27 · Term 1</span>
          </div>

          {/* Theme Toggle (Tablet and Desktop) */}
          <ThemeToggle className="hidden sm:flex" />

          {/* Notifications Popover */}
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground border border-border bg-card/80 transition-all shadow-2xs cursor-pointer active:scale-95"
              aria-label="View notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{unreadCount} unread</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No new notifications for your profile.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.linkUrl || "/attendance/leaves"}
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 rounded-xl border border-border bg-muted/30 text-xs space-y-1 hover:border-accent/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{n.message}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl p-1 sm:p-1.5 hover:bg-muted/80 border border-border bg-card/90 transition-all shadow-2xs cursor-pointer h-9 sm:h-10 active:scale-95"
              aria-label="User profile and settings"
              aria-expanded={showUserMenu}
            >
              <div className="w-7 h-7 rounded-lg bg-surface-subtle border border-border text-foreground flex items-center justify-center text-xs font-semibold shadow-2xs shrink-0">
                {formattedName ? formattedName[0] : "U"}
              </div>
              <div className="hidden sm:block text-left mr-0.5">
                <p className="text-xs font-semibold text-foreground leading-none">{formattedName}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{formattedRole}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </button>

            {showUserMenu && (
              <div
                role="menu"
                aria-label="User account actions"
                className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs rounded-xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1"
              >
                <div className="px-3 py-2.5 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{formattedName}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium">
                      {formattedRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{user.email}</p>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40">
                    <p className="text-[10px] text-accent font-medium truncate">{user.institutionName}</p>
                    {isSuperAdmin && institutions.length > 1 && (
                      <Link
                        href="/institutions"
                        onClick={() => setShowUserMenu(false)}
                        className="text-[10px] text-accent font-semibold hover:underline shrink-0"
                      >
                        Switch →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Appearance Switcher */}
                <ThemeDropdownItem />

                <div className="pt-1 border-t border-border/60">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>

                  {canManageInstitution && (
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Institution Settings</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      href="/audit-logs"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Security & Audit Logs</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Contextual Strip for Super Admin (Clean 2nd Row on Mobile) */}
      {isSuperAdmin && (
        <div className="md:hidden border-t border-border/80 bg-card/90 px-3.5 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden mr-1">
            <div className="w-5 h-5 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Building2 className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[11px] text-muted-foreground shrink-0 font-medium">Tenant:</span>
              <span className="font-semibold text-foreground truncate text-xs" title={user.institutionName}>
                {user.institutionName || "All Institutions"}
              </span>
            </div>
          </div>
          {institutions.length > 1 ? (
            <InstitutionSelector
              currentInstitutionId={user.institutionId}
              currentInstitutionName={user.institutionName}
              institutions={institutions}
              isSuperAdmin={isSuperAdmin}
              compactMobileTrigger={true}
            />
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium border border-border shrink-0">
              Active
            </span>
          )}
        </div>
      )}
    </div>
  );
}
