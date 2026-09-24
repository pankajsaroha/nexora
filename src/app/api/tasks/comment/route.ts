import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const newComment = await prisma.taskComment.create({
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

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to add comment" },
      { status: 500 }
    );
  }
}
