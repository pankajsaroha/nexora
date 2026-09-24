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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: any = {
      institutionId: user.institutionId,
    };

    if (status) whereClause.status = status;

    // If teacher / non-principal, filter to assigned or created tasks
    if (user.roleCode === "TEACHER") {
      whereClause.OR = [
        { assigneeUserId: user.id },
        { createdByUserId: user.id },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assigneeUser: {
          select: { id: true, fullName: true, email: true, roleCode: true, avatarUrl: true },
        },
        createdByUser: {
          select: { id: true, fullName: true, email: true, roleCode: true },
        },
        department: true,
        comments: {
          include: {
            user: { select: { id: true, fullName: true, roleCode: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.TASKS_CREATE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to create management tasks" },
        { status: 403 }
      );
    }

    const { title, description, assigneeUserId, departmentId, priority, dueDate } =
      await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        institutionId: user.institutionId,
        title,
        description,
        assigneeUserId: assigneeUserId || user.id,
        createdByUserId: user.id,
        departmentId: departmentId || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "TODO",
      },
      include: {
        assigneeUser: true,
        createdByUser: true,
      },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "TASK_CREATED",
      entity: "Task",
      entityId: task.id,
      details: {
        title,
        assignedTo: task.assigneeUser?.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Task '${title}' created successfully.`,
      task,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, status, priority, dueDate } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "TASK_STATUS_UPDATED",
      entity: "Task",
      entityId: taskId,
      details: { newStatus: status },
    });

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${status}`,
      task,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update task" },
      { status: 500 }
    );
  }
}
