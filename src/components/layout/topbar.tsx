"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Check,
  LogOut,
  Calendar,
  Building,
  User,
  Shield,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { RoleSwitcher } from "@/components/ui/role-switcher";
import { CommandPalette } from "@/components/ui/command-palette";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTime, formatDate } from "@/lib/utils";

export interface TopbarProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    roleCode: string;
    institutionName: string;
  };
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

export function Topbar({ user, notifications = [], onOpenMobileSidebar }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-[#E8E7DF] bg-[#FAF9F5]/95 px-6 sm:px-8 backdrop-blur-xs">
      {/* Left: Mobile Toggle & Global Search Command */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Command Search Palette */}
        <CommandPalette />
      </div>

      {/* Right: Academic Context, Role Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Subtle Academic Session Context */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-3 py-1.5 rounded-lg border border-[#E8E7DF] bg-white">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>AY 2026–27 · Term 1</span>
        </div>

        {/* Subtle Demo Role Switcher */}
        <RoleSwitcher currentRoleCode={user.roleCode} />

        {/* Notification Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-[#E8E7DF] transition-editorial"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-[#F4F3ED] pb-3">
                  <span className="text-xs font-bold text-[#0F172A]">Notifications</span>
                  <span className="text-[11px] font-mono text-slate-400">{unreadCount} unread</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No notifications at this time.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] text-xs space-y-1 hover:border-slate-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#0F172A]">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white border border-transparent hover:border-[#E8E7DF] transition-editorial"
          >
            <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {user.fullName ? user.fullName[0] : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#0F172A] leading-none">{user.fullName}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{user.roleCode}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#E8E7DF] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1 text-xs">
                <div className="p-2 border-b border-[#F4F3ED]">
                  <p className="font-bold text-[#0F172A]">{user.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:bg-[#FAF9F5] font-medium"
                >
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>Institution Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
