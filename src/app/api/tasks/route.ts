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

    if (status && status !== "ALL") whereClause.status = status;

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
        activities: {
          include: {
            user: { select: { id: true, fullName: true, roleCode: true } },
          },
          orderBy: { createdAt: "desc" },
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
        { error: "Forbidden: You do not have permission to create tasks" },
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

    // Verify assignee belongs to institution
    let finalAssigneeId = assigneeUserId || user.id;
    const assignee = await prisma.user.findFirst({
      where: { id: finalAssigneeId, institutionId: user.institutionId },
    });

    if (!assignee) {
      return NextResponse.json(
        { error: "Assignee must be an active member of your institution." },
        { status: 400 }
      );
    }

    const task = await prisma.$transaction(async (tx) => {
      const created = await tx.task.create({
        data: {
          institutionId: user.institutionId,
          title: title.trim(),
          description: description.trim(),
          assigneeUserId: finalAssigneeId,
          createdByUserId: user.id,
          departmentId: departmentId || null,
          priority: priority || "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "TODO",
        },
        include: {
          assigneeUser: {
            select: { id: true, fullName: true, email: true, roleCode: true, avatarUrl: true },
          },
          createdByUser: {
            select: { id: true, fullName: true, email: true, roleCode: true },
          },
          department: true,
        },
      });

      // Record Task Activity Timeline entry
      await tx.taskActivity.create({
        data: {
          taskId: created.id,
          userId: user.id,
          actionType: "CREATED",
          details: `Task created and assigned to ${assignee.fullName}`,
          toValue: assignee.fullName,
        },
      });

      // Security Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "CREATE",
          entity: "Task",
          entityId: created.id,
          details: `Created task '${title}' assigned to ${assignee.fullName}. Priority: ${created.priority}`,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      message: `Task '${title}' created successfully.`,
      task,
    });
  } catch (error: any) {
    console.error("Create task error:", error);
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

    const { taskId, status, priority, dueDate, assigneeUserId, description, title } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, institutionId: user.institutionId },
      include: { assigneeUser: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      const activitiesToCreate: Array<{
        actionType: string;
        details: string;
        fromValue?: string;
        toValue?: string;
      }> = [];

      if (title && title.trim() !== existingTask.title) {
        updateData.title = title.trim();
      }
      if (description && description.trim() !== existingTask.description) {
        updateData.description = description.trim();
      }

      // Reassign assignee
      if (assigneeUserId && assigneeUserId !== existingTask.assigneeUserId) {
        if (!hasPermission(user, PERMISSIONS.TASKS_REASSIGN) && !hasPermission(user, PERMISSIONS.TASKS_ASSIGN) && !hasPermission(user, PERMISSIONS.TASKS_MANAGE)) {
          throw new Error("Forbidden: You do not have permission to reassign tasks.");
        }

        const newAssignee = await tx.user.findFirst({
          where: { id: assigneeUserId, institutionId: user.institutionId },
        });
        if (!newAssignee) {
          throw new Error("New assignee must belong to your institution.");
        }

        updateData.assigneeUserId = assigneeUserId;
        activitiesToCreate.push({
          actionType: "REASSIGNED",
          fromValue: existingTask.assigneeUser?.fullName || "Unassigned",
          toValue: newAssignee.fullName,
          details: `Reassigned from ${existingTask.assigneeUser?.fullName || "Unassigned"} to ${newAssignee.fullName}`,
        });
      }

      // Priority Change
      if (priority && priority !== existingTask.priority) {
        updateData.priority = priority;
        activitiesToCreate.push({
          actionType: "PRIORITY_CHANGED",
          fromValue: existingTask.priority,
          toValue: priority,
          details: `Priority changed from ${existingTask.priority} to ${priority}`,
        });
      }

      // Due Date Change
      if (dueDate !== undefined) {
        const newDue = dueDate ? new Date(dueDate) : null;
        updateData.dueDate = newDue;
        activitiesToCreate.push({
          actionType: "DUE_DATE_CHANGED",
          details: newDue ? `Due date set to ${newDue.toISOString().split("T")[0]}` : "Due date removed",
        });
      }

      // Status Change (Completed, Reopened, etc.)
      if (status && status !== existingTask.status) {
        updateData.status = status;
        if (status === "COMPLETED") {
          updateData.completedAt = new Date();
          activitiesToCreate.push({
            actionType: "COMPLETED",
            fromValue: existingTask.status,
            toValue: "COMPLETED",
            details: `Task marked as completed by ${user.fullName}`,
          });
        } else if (existingTask.status === "COMPLETED" && (status === "TODO" || status === "IN_PROGRESS")) {
          updateData.reopenedAt = new Date();
          activitiesToCreate.push({
            actionType: "REOPENED",
            fromValue: "COMPLETED",
            toValue: status,
            details: `Task reopened to ${status} by ${user.fullName}`,
          });
        } else {
          activitiesToCreate.push({
            actionType: "STATUS_CHANGED",
            fromValue: existingTask.status,
            toValue: status,
            details: `Status changed from ${existingTask.status} to ${status}`,
          });
        }
      }

      const task = await tx.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assigneeUser: {
            select: { id: true, fullName: true, email: true, roleCode: true, avatarUrl: true },
          },
          createdByUser: {
            select: { id: true, fullName: true, email: true, roleCode: true },
          },
          department: true,
          comments: {
            include: { user: { select: { id: true, fullName: true, roleCode: true, avatarUrl: true } } },
            orderBy: { createdAt: "asc" },
          },
          activities: {
            include: { user: { select: { id: true, fullName: true, roleCode: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      for (const act of activitiesToCreate) {
        await tx.taskActivity.create({
          data: {
            taskId,
            userId: user.id,
            actionType: act.actionType,
            details: act.details,
            fromValue: act.fromValue || null,
            toValue: act.toValue || null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "UPDATE",
          entity: "Task",
          entityId: taskId,
          details: `Updated task '${task.title}' (Status: ${task.status}, Priority: ${task.priority}, Assignee: ${task.assigneeUser?.fullName || "None"}).`,
        },
      });

      return task;
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error: any) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update task" },
      { status: 400 }
    );
  }
}
