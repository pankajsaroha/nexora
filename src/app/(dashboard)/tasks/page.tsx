import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { TasksClient } from "@/components/tasks/tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [tasks, staffUsers, departments] = await Promise.all([
    prisma.task.findMany({
      where: { institutionId: user.institutionId },
      include: {
        assigneeUser: true,
        createdByUser: true,
        department: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        institutionId: user.institutionId,
        roleCode: { in: ["PRINCIPAL", "VICE_PRINCIPAL", "HOD", "TEACHER", "HR_ADMIN", "ACCOUNTANT"] },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.TASKS_CREATE);
  const canReassign = hasPermission(user, PERMISSIONS.TASKS_REASSIGN) || hasPermission(user, PERMISSIONS.TASKS_MANAGE);

  const formattedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as any,
    status: t.status as any,
    dueDate: t.dueDate,
    assigneeUserId: t.assigneeUserId,
    assigneeName: t.assigneeUser?.fullName,
    assigneeRole: t.assigneeUser?.roleCode,
    creatorName: t.createdByUser.fullName,
    departmentName: t.department?.name,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    reopenedAt: t.reopenedAt,
    comments: t.comments.map((c) => ({
      id: c.id,
      userName: c.user.fullName,
      comment: c.comment,
      createdAt: c.createdAt,
    })),
    activities: t.activities.map((a) => ({
      id: a.id,
      userName: a.user.fullName,
      actionType: a.actionType,
      details: a.details,
      fromValue: a.fromValue,
      toValue: a.toValue,
      createdAt: a.createdAt,
    })),
  }));

  return (
    <TasksClient
      tasks={formattedTasks}
      staffList={staffUsers.map((u) => ({ id: u.id, fullName: u.fullName, roleCode: u.roleCode }))}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      canCreate={canCreate}
      canReassign={canReassign}
    />
  );
}
