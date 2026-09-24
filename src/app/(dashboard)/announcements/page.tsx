import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AnnouncementsClient } from "@/components/announcements/announcements-client";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const announcements = await prisma.announcement.findMany({
    where: { institutionId: user.institutionId },
    include: { authorUser: true },
    orderBy: { publishedAt: "desc" },
  });

  const canCreate = hasPermission(user, PERMISSIONS.ANNOUNCEMENTS_CREATE);

  const formatted = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    targetAudience: a.targetAudience,
    priority: a.priority as any,
    publishedAt: a.publishedAt,
    authorName: a.authorUser?.fullName || "Administrative Office",
  }));

  return <AnnouncementsClient announcements={formatted} canCreate={canCreate} />;
}
