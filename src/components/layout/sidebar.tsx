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

export function Sidebar({
  roleCode,
  userName,
  institutionName,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const formattedName = formatTitleCase(userName || "User");
  const formattedRole = formatRoleTitle(roleCode);

  const getNavGroups = (): NavGroup[] => {
    // 1. Student Portal
    if (roleCode === "STUDENT") {
      return [
        {
          title: "Academic Hub",
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
          title: "Family Portal",
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
          title: "Teaching Workspace",
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
          title: "Financial Ledger",
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
        title: "Overview",
        items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
      },
      {
        title: "People",
        items: [
          { label: "Students", href: "/students", icon: Users },
          { label: "Teachers & Staff", href: "/teachers", icon: GraduationCap },
        ],
      },
      {
        title: "Academics",
        items: [
          { label: "Classes & Sections", href: "/academics/classes", icon: School },
          { label: "Timetable Grid", href: "/academics/timetable", icon: Clock },
          { label: "Assignments", href: "/academics/assignments", icon: BookOpen },
          { label: "Exams & Results", href: "/academics/exams", icon: FileCheck2 },
        ],
      },
      {
        title: "Operations",
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
        title: "Finance",
        items: [
          { label: "Fee Ledgers", href: "/finance/fees", icon: Receipt },
          { label: "Payroll & Salary", href: "/finance/payroll", icon: Banknote },
        ],
      },
      {
        title: "Services",
        items: [
          { label: "Library Catalog", href: "/library", icon: Library },
          { label: "Transport & Buses", href: "/transport", icon: Bus },
          { label: "Hostel & Rooms", href: "/hostel", icon: Building2 },
        ],
      },
      {
        title: "Insights & Admin",
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
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs group-hover:scale-105 transition-transform">
              NX
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-foreground block leading-none font-sans">
                NEXORA
              </span>
              <span className="text-[10px] text-muted-foreground font-mono truncate block mt-1">
                {institutionName || "Academic Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Nav Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70 block mb-1.5">
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
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border">
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
        <div className="p-3.5 border-t border-sidebar-border bg-sidebar flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-2xs">
              {formattedName ? formattedName[0] : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate leading-none">{formattedName}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">{formattedRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
