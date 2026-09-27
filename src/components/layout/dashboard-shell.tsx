"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export interface DashboardShellProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    roleCode: string;
    institutionName: string;
    institutionId?: string;
  };
  institutions?: Array<{
    id: string;
    name: string;
    code: string;
    type?: string;
  }>;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string | Date;
  }>;
  children: React.ReactNode;
}

export function DashboardShell({ user, institutions = [], notifications, children }: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        roleCode={user.roleCode}
        userName={user.fullName}
        institutionName={user.institutionName}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          user={user}
          institutions={institutions}
          notifications={notifications}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
