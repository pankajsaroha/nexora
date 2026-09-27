import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If no user found (or not seeded yet), fallback gracefully or redirect
  if (!user) {
    redirect("/login");
  }

  // Fetch recent notifications for user
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch authorized institutions for Super Admin
  let authorizedInstitutions: Array<{ id: string; name: string; code: string; type: string }> = [];
  if (user.roleCode === "SUPER_ADMIN") {
    authorizedInstitutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
      },
      orderBy: { name: "asc" },
    });
  }

  return (
    <DashboardShell
      user={user}
      institutions={authorizedInstitutions}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
