import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { TasksClient } from "@/components/tasks/tasks-client";
import {
  getScopedTasksForUser,
  getAssignableUsersForUser,
} from "@/lib/tasks/service";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [tasks, assignableUsers, departments] = await Promise.all([
    getScopedTasksForUser(user),
    getAssignableUsersForUser(user),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.TASKS_CREATE) || user.roleCode === "TEACHER";
  const canReassign = true;

  return (
    <TasksClient
      tasks={tasks}
      assignableUsers={assignableUsers}
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      canCreate={canCreate}
      canReassign={canReassign}
      currentUser={{
        id: user.id,
        fullName: user.fullName,
        roleCode: user.roleCode,
      }}
    />
  );
}
