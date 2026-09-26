import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      where: { institutionId: user.institutionId },
      include: {
        authorUser: {
          select: { id: true, fullName: true, roleCode: true, email: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.ANNOUNCEMENTS_CREATE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to publish announcements" },
        { status: 403 }
      );
    }

    const { title, content, targetAudience, priority, sendWhatsApp, sendEmail } =
      await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const announcement = await prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({
        data: {
          institutionId: user.institutionId,
          authorUserId: user.id,
          title: title.trim(),
          content: content.trim(),
          targetAudience: targetAudience || "EVERYONE",
          priority: priority || "NORMAL",
          publishedAt: new Date(),
        },
        include: {
          authorUser: {
            select: { id: true, fullName: true, roleCode: true },
          },
        },
      });

      // Immutable Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "CREATE",
          entity: "Announcement",
          entityId: created.id,
          details: `Published circular '${title}' to audience: ${created.targetAudience} (Priority: ${created.priority}).`,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      message: "Broadcast circular dispatched successfully.",
      announcement,
    });
  } catch (error: any) {
    console.error("Create announcement error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to publish circular" },
      { status: 500 }
    );
  }
}
