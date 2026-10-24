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

  // Concurrently fetch recent notifications and authorized institutions
  const [notifications, authorizedInstitutions] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    user.roleCode === "SUPER_ADMIN"
      ? (prisma.institution.findMany({
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
          },
          orderBy: { name: "asc" },
        }) as Promise<Array<{ id: string; name: string; code: string; type: string; status?: string }>>)
      : Promise.resolve([] as Array<{ id: string; name: string; code: string; type: string; status?: string }>),
  ]);

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
