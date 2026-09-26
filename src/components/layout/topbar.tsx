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
import { formatDate } from "@/lib/utils";

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
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-[#E5E0D5] bg-[#F7F4ED]/95 px-6 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Global Search Command */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-[#555047] hover:bg-[#FAF8F3] hover:text-[#171614] border border-[#E5E0D5] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Command Search Palette */}
        <CommandPalette />
      </div>

      {/* Right: Academic Context, Role Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Subtle Academic Session Context */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#555047] font-mono px-3 py-1.5 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-[#856D3B]" />
          <span>AY 2026–27 · Term 1</span>
        </div>

        {/* Authenticated User Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#555047] font-mono px-3 py-1.5 rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] shadow-2xs">
          <Shield className="h-3.5 w-3.5 text-[#856D3B]" />
          <span className="font-bold text-[#171614] uppercase">{user.roleCode?.replace(/_/g, " ") || "MEMBER"}</span>
        </div>

        {/* Notification Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-[#555047] hover:bg-white hover:text-[#171614] border border-[#DCD7CB] bg-[#FAF8F3] transition-all shadow-2xs"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8C4A47]" />
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#E5E0D5] bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
                  <span className="text-xs font-extrabold text-[#171614]">Notifications</span>
                  <span className="text-[11px] font-mono text-[#7A756B]">{unreadCount} unread</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#7A756B] py-4 text-center">No notifications at this time.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-xs space-y-1 hover:border-[#B89B62] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#171614]">{n.title}</p>
                          <span className="text-[10px] font-mono text-[#7A756B]">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-[#555047] text-[11px]">{n.message}</p>
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
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-white border border-[#DCD7CB] bg-[#FAF8F3] transition-all shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#1B1916] text-[#FAF8F3] flex items-center justify-center text-xs font-bold shadow-2xs">
              {user.fullName ? user.fullName[0] : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#171614] leading-none">{user.fullName}</p>
              <p className="text-[10px] font-mono text-[#7A756B] uppercase mt-0.5">{user.roleCode}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#7A756B] hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E0D5] bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1 text-xs">
                <div className="p-2.5 border-b border-[#EFECE3] bg-[#FAF8F3] rounded-xl">
                  <p className="font-bold text-[#171614]">{user.fullName}</p>
                  <p className="text-[11px] text-[#7A756B] truncate font-mono">{user.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-[#35322C] hover:bg-[#FAF8F3] font-medium transition-colors"
                >
                  <Building className="h-3.5 w-3.5 text-[#7A756B]" />
                  <span>Institution Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-[#6F3D3A] hover:bg-[#FBF4F4] font-medium transition-colors"
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
