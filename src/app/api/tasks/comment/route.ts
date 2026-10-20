import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, comment } = await req.json();

    if (!taskId || !comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Task ID and non-empty comment are required" },
        { status: 400 }
      );
    }

    // Verify task exists within the caller's institution
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        institutionId: user.institutionId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or does not belong to your institution." },
        { status: 404 }
      );
    }

    // Atomic transaction for comment and audit activity trail
    const result = await prisma.$transaction(async (tx) => {
      const commentRecord = await tx.taskComment.create({
        data: {
          taskId,
          userId: user.id,
          comment: comment.trim(),
        },
        include: {
          user: {
            select: { id: true, fullName: true, roleCode: true, avatarUrl: true },
          },
        },
      });

      const snippet = comment.trim().slice(0, 80);
      const activityRecord = await tx.taskActivity.create({
        data: {
          taskId,
          userId: user.id,
          actionType: "COMMENT_ADDED",
          details: `${user.fullName} commented: "${snippet}${comment.trim().length > 80 ? "..." : ""}"`,
        },
      });

      return {
        comment: commentRecord,
        activity: {
          id: activityRecord.id,
          actionType: activityRecord.actionType,
          details: activityRecord.details,
          userName: user.fullName,
          createdAt: activityRecord.createdAt.toISOString(),
        },
      };
    });

    return NextResponse.json({
      success: true,
      comment: result.comment,
      activity: result.activity,
    });
  } catch (error: any) {
    console.error("POST /api/tasks/comment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add comment" },
      { status: 500 }
    );
  }
}

