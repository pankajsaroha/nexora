import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getScopedTasksForUser,
  createInstitutionalTask,
  updateInstitutionalTask,
  deleteInstitutionalTask,
  copyInstitutionalTask,
  getAssignableUsersForUser,
} from "@/lib/tasks/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const taskType = searchParams.get("taskType") || undefined;
    const scope = (searchParams.get("scope") as any) || undefined;
    const search = searchParams.get("search") || undefined;

    const tasks = await getScopedTasksForUser(user, {
      status,
      priority,
      taskType,
      scope,
      search,
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("GET /api/tasks error:", error);
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

    const body = await req.json();

    // Check for task duplicate / copy action
    if (body.action === "DUPLICATE" || body.action === "COPY" || body.isDuplicate) {
      if (!body.taskId) {
        return NextResponse.json(
          { error: "Task ID is required for task duplication" },
          { status: 400 }
        );
      }
      const task = await copyInstitutionalTask({
        user,
        taskId: body.taskId,
      });

      return NextResponse.json({
        success: true,
        message: `Task '${task.title}' duplicated successfully.`,
        task,
      });
    }

    const {
      title,
      description,
      assigneeUserId,
      departmentId,
      priority,
      taskType,
      relatedEntity,
      relatedEntityId,
      academicContext,
      dueDate,
    } = body;

    const task = await createInstitutionalTask({
      user,
      title,
      description,
      assigneeUserId,
      departmentId,
      priority,
      taskType,
      relatedEntity,
      relatedEntityId,
      academicContext,
      dueDate,
    });

    return NextResponse.json({
      success: true,
      message: `Task '${title}' created successfully.`,
      task,
    });
  } catch (error: any) {
    console.error("POST /api/tasks error:", error);
    const isForbidden = error?.message?.includes("Forbidden") || error?.message?.includes("not authorized");
    return NextResponse.json(
      { error: error?.message || "Failed to create task" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, status, priority, dueDate, assigneeUserId, description, title, taskType } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await updateInstitutionalTask({
      user,
      taskId,
      status,
      priority,
      dueDate,
      assigneeUserId,
      title,
      description,
      taskType,
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error: any) {
    console.error("PATCH /api/tasks error:", error);
    const isForbidden = error?.message?.includes("Forbidden") || error?.message?.includes("not authorized");
    return NextResponse.json(
      { error: error?.message || "Failed to update task" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let taskId = searchParams.get("taskId");

    if (!taskId) {
      try {
        const body = await req.json();
        taskId = body?.taskId;
      } catch {
        // No JSON body provided
      }
    }

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    await deleteInstitutionalTask({
      user,
      taskId,
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/tasks error:", error);
    const isForbidden =
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("not authorized") ||
      error?.message?.includes("authority");
    return NextResponse.json(
      { error: error?.message || "Failed to delete task" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
