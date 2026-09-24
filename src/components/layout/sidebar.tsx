"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  Clock,
  BookOpen,
  FileCheck2,
  Receipt,
  Banknote,
  CheckSquare,
  Megaphone,
  Library,
  Bus,
  Building2,
  BarChart3,
  ShieldAlert,
  Settings,
  UploadCloud,
  ChevronRight,
  School,
  FileText,
} from "lucide-react";

export interface SidebarProps {
  roleCode: string;
  userName: string;
  institutionName: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({
  roleCode,
  userName,
  institutionName,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const getNavGroups = (): NavGroup[] => {
    // 1. Student Portal
    if (roleCode === "STUDENT") {
      return [
        {
          title: "ACADEMIC HUB",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Today's Timetable", href: "/academics/timetable", icon: Clock },
            { label: "Attendance Record", href: "/attendance", icon: CalendarDays },
            { label: "Assignments & HW", href: "/academics/assignments", icon: BookOpen },
            { label: "Exams & Results", href: "/academics/exams", icon: FileCheck2 },
            { label: "Fee Invoices", href: "/finance/fees", icon: Receipt },
            { label: "Announcements", href: "/announcements", icon: Megaphone },
            { label: "Calendar", href: "/calendar", icon: CalendarDays },
          ],
        },
      ];
    }

    // 2. Parent Portal
    if (roleCode === "PARENT") {
      return [
        {
          title: "FAMILY PORTAL",
          items: [
            { label: "Children Overview", href: "/dashboard", icon: LayoutDashboard },
            { label: "Class Timetable", href: "/academics/timetable", icon: Clock },
            { label: "Attendance", href: "/attendance", icon: CalendarDays },
            { label: "Homework & Tasks", href: "/academics/assignments", icon: BookOpen },
            { label: "Term Results", href: "/academics/exams", icon: FileCheck2 },
            { label: "Fee Invoices", href: "/finance/fees", icon: Receipt },
            { label: "Announcements", href: "/announcements", icon: Megaphone },
          ],
        },
      ];
    }

    // 3. Teacher Portal
    if (roleCode === "TEACHER") {
      return [
        {
          title: "TEACHING WORKSPACE",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Roll-Call Attendance", href: "/attendance", icon: CalendarDays },
            { label: "Class Timetable", href: "/academics/timetable", icon: Clock },
            { label: "Assignments", href: "/academics/assignments", icon: BookOpen },
            { label: "Exams & Marks", href: "/academics/exams", icon: FileCheck2 },
            { label: "My Tasks", href: "/tasks", icon: CheckSquare },
            { label: "Leave Requests", href: "/attendance/leaves", icon: Clock },
            { label: "Announcements", href: "/announcements", icon: Megaphone },
          ],
        },
      ];
    }

    // 4. Accountant Portal
    if (roleCode === "ACCOUNTANT") {
      return [
        {
          title: "FINANCIAL LEDGER",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Fee Collection", href: "/finance/fees", icon: Receipt },
            { label: "Staff Payroll", href: "/finance/payroll", icon: Banknote },
            { label: "Operational Tasks", href: "/tasks", icon: CheckSquare },
            { label: "Financial Reports", href: "/reports", icon: BarChart3 },
          ],
        },
      ];
    }

    // 5. Default / Principal / Admin / HOD Executive Navigation
    return [
      {
        title: "OVERVIEW",
        items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
      },
      {
        title: "PEOPLE",
        items: [
          { label: "Students", href: "/students", icon: Users },
          { label: "Teachers & Staff", href: "/teachers", icon: GraduationCap },
        ],
      },
      {
        title: "ACADEMICS",
        items: [
          { label: "Classes & Sections", href: "/academics/classes", icon: School },
          { label: "Timetable Grid", href: "/academics/timetable", icon: Clock },
          { label: "Assignments", href: "/academics/assignments", icon: BookOpen },
          { label: "Exams & Results", href: "/academics/exams", icon: FileCheck2 },
        ],
      },
      {
        title: "OPERATIONS",
        items: [
          { label: "Daily Attendance", href: "/attendance", icon: CalendarDays },
          { label: "Staff Attendance", href: "/attendance/staff", icon: Clock },
          { label: "Staff Leaves", href: "/attendance/leaves", icon: FileText },
          { label: "Management Tasks", href: "/tasks", icon: CheckSquare },
          { label: "Announcements", href: "/announcements", icon: Megaphone },
          { label: "Institution Calendar", href: "/calendar", icon: CalendarDays },
        ],
      },
      {
        title: "FINANCE",
        items: [
          { label: "Fee Ledgers", href: "/finance/fees", icon: Receipt },
          { label: "Payroll & Salary", href: "/finance/payroll", icon: Banknote },
        ],
      },
      {
        title: "SERVICES",
        items: [
          { label: "Library Catalog", href: "/library", icon: Library },
          { label: "Transport & Buses", href: "/transport", icon: Bus },
          { label: "Hostel & Rooms", href: "/hostel", icon: Building2 },
        ],
      },
      {
        title: "INSIGHTS & ADMIN",
        items: [
          { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
          { label: "CSV Data Import", href: "/import", icon: UploadCloud },
          { label: "Security Audit Logs", href: "/audit-logs", icon: ShieldAlert },
          { label: "Institution Settings", href: "/settings", icon: Settings },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0F172A] text-slate-300 border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-white text-[#0F172A] flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
              NX
            </div>
            <div className="overflow-hidden">
              <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                NEXORA
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block mt-1">
                {institutionName || "Northstar Academy"}
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Nav Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-2">
                {group.title}
              </span>

              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-editorial",
                      isActive
                        ? "bg-white/10 text-white font-semibold shadow-2xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Identity Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
              {userName ? userName[0] : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-none">{userName}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5 truncate">{roleCode}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
