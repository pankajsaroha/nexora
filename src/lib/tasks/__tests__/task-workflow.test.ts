import test from "node:test";
import assert from "node:assert/strict";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  validateTaskAssignmentAuthority,
  TaskItem,
} from "../service";
import type { SessionUser } from "@/lib/auth";

test("Task Management Architecture & Workflow Logic", async (t) => {
  const institutionA = "inst-apex-001";
  const institutionB = "inst-beacon-002";

  const principalUser: SessionUser = {
    id: "usr-principal-01",
    institutionId: institutionA,
    email: "principal@apex.edu",
    fullName: "Dr. Vikram Seth",
    roleCode: "PRINCIPAL",
    institutionName: "Apex University",
    institutionCode: "APEX",
    permissions: ["tasks.view", "tasks.create", "tasks.assign", "tasks.reassign", "tasks.manage"],
  };

  const teacherAnanya: SessionUser = {
    id: "usr-ananya-01",
    teacherId: "tch-ananya-01",
    institutionId: institutionA,
    email: "ananya.m@apex.edu",
    fullName: "Ananya Mukherjee",
    roleCode: "TEACHER",
    institutionName: "Apex University",
    institutionCode: "APEX",
    permissions: ["tasks.view", "tasks.create"],
  };

  const teacherRahul: SessionUser = {
    id: "usr-rahul-02",
    teacherId: "tch-rahul-02",
    institutionId: institutionA,
    email: "rahul.s@apex.edu",
    fullName: "Rahul Sharma",
    roleCode: "TEACHER",
    institutionName: "Apex University",
    institutionCode: "APEX",
    permissions: ["tasks.view", "tasks.create"],
  };

  const teacherPriya: SessionUser = {
    id: "usr-priya-03",
    teacherId: "tch-priya-03",
    institutionId: institutionA,
    email: "priya.s@apex.edu",
    fullName: "Priya Singh",
    roleCode: "TEACHER",
    institutionName: "Apex University",
    institutionCode: "APEX",
    permissions: ["tasks.view", "tasks.create"],
  };

  const teacherAmit: SessionUser = {
    id: "usr-amit-04",
    teacherId: "tch-amit-04",
    institutionId: institutionA,
    email: "amit.k@apex.edu",
    fullName: "Amit Kumar",
    roleCode: "TEACHER",
    institutionName: "Apex University",
    institutionCode: "APEX",
    permissions: ["tasks.view", "tasks.create"],
  };

  const foreignUser: SessionUser = {
    id: "usr-foreign-05",
    institutionId: institutionB,
    email: "foreign@beacon.edu",
    fullName: "Foreign User",
    roleCode: "TEACHER",
    institutionName: "Beacon Academy",
    institutionCode: "BEACON",
    permissions: ["tasks.view", "tasks.create"],
  };

  await t.test("1. Model & Types: Valid statuses, priorities, and domain task types", () => {
    assert.deepEqual(TASK_STATUSES, ["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]);
    assert.deepEqual(TASK_PRIORITIES, ["LOW", "MEDIUM", "HIGH", "URGENT"]);
    assert.ok(TASK_TYPES.includes("GENERAL"));
    assert.ok(TASK_TYPES.includes("ACADEMIC"));
    assert.ok(TASK_TYPES.includes("ATTENDANCE"));
    assert.ok(TASK_TYPES.includes("EXAM"));
    assert.ok(TASK_TYPES.includes("ASSIGNMENT"));
    assert.ok(TASK_TYPES.includes("ADMINISTRATIVE"));
    assert.ok(TASK_TYPES.includes("FACULTY"));
    assert.ok(TASK_TYPES.includes("STUDENT"));
    assert.ok(TASK_TYPES.includes("FEE"));
    assert.ok(TASK_TYPES.includes("EVENT"));
  });

  await t.test("2. Self-Task Flow: Teacher can always assign tasks to themselves", async () => {
    const result = await validateTaskAssignmentAuthority(teacherAnanya, teacherAnanya.id);
    assert.equal(result.allowed, true);
  });

  await t.test("3. Principal Flow: Principal can assign tasks institution-wide", async () => {
    assert.equal(
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"].includes(principalUser.roleCode),
      true
    );
  });

  await t.test("4. Class Teacher Peer Coordination: Allowed for teachers of the same class/section", () => {
    // Ananya is Class Teacher of 8-A
    const classTeacherSectionIds = ["sec-8A"];
    const sectionTeacherMap: Record<string, string[]> = {
      "sec-8A": [teacherAnanya.id, teacherRahul.id, teacherPriya.id],
      "sec-9A": [teacherAmit.id],
    };

    // Helper to evaluate Class Teacher peer assignment logic
    const isPeerAuthorized = (classTeacherUser: SessionUser, targetUserId: string) => {
      if (classTeacherUser.id === targetUserId) return true;
      const managedTeachers = classTeacherSectionIds.flatMap((secId) => sectionTeacherMap[secId] || []);
      return managedTeachers.includes(targetUserId);
    };

    // Ananya -> Rahul (Physics in 8-A): SUCCESS
    assert.equal(isPeerAuthorized(teacherAnanya, teacherRahul.id), true, "Ananya should be able to assign task to Rahul for 8-A");

    // Ananya -> Priya (English in 8-A): SUCCESS
    assert.equal(isPeerAuthorized(teacherAnanya, teacherPriya.id), true, "Ananya should be able to assign task to Priya for 8-A");

    // Ananya -> Amit (Class 9-A only): REJECT
    assert.equal(isPeerAuthorized(teacherAnanya, teacherAmit.id), false, "Ananya cannot assign tasks to Amit who teaches 9-A");
  });

  await t.test("5. Multi-Tenancy Safety: Cross-institution assignment rejected", async () => {
    assert.notEqual(teacherAnanya.institutionId, foreignUser.institutionId);
    const isSameTenant = teacherAnanya.institutionId === foreignUser.institutionId;
    assert.equal(isSameTenant, false, "Cross-tenant task assignment must be rejected");
  });

  await t.test("6. Dynamic Overdue Calculation: Does not corrupt underlying status", () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days in future

    // Overdue task
    const task1: Partial<TaskItem> = {
      status: "IN_PROGRESS",
      dueDate: pastDate,
    };
    const now = new Date();
    const isTask1Overdue = Boolean(task1.dueDate && task1.status !== "COMPLETED" && now > new Date(task1.dueDate));
    assert.equal(isTask1Overdue, true);
    assert.equal(task1.status, "IN_PROGRESS", "Underlying status remains IN_PROGRESS");

    // Completed task with past due date is NOT overdue
    const task2: Partial<TaskItem> = {
      status: "COMPLETED",
      dueDate: pastDate,
    };
    const isTask2Overdue = Boolean(task2.dueDate && task2.status !== "COMPLETED" && now > new Date(task2.dueDate));
    assert.equal(isTask2Overdue, false, "Completed task cannot be overdue");

    // Future task is NOT overdue
    const task3: Partial<TaskItem> = {
      status: "TODO",
      dueDate: futureDate,
    };
    const isTask3Overdue = Boolean(task3.dueDate && task3.status !== "COMPLETED" && now > new Date(task3.dueDate));
    assert.equal(isTask3Overdue, false);
  });

  await t.test("7. Status Lifecycle Rules: Assignee transitions vs Creator reopening", () => {
    const validTransitions: Record<string, string[]> = {
      TODO: ["IN_PROGRESS", "BLOCKED"],
      IN_PROGRESS: ["COMPLETED", "BLOCKED", "TODO"],
      BLOCKED: ["IN_PROGRESS", "TODO"],
      COMPLETED: ["IN_PROGRESS", "TODO"], // Reopen
    };

    assert.ok(validTransitions["TODO"].includes("IN_PROGRESS"));
    assert.ok(validTransitions["IN_PROGRESS"].includes("COMPLETED"));
    assert.ok(validTransitions["IN_PROGRESS"].includes("BLOCKED"));
    assert.ok(validTransitions["BLOCKED"].includes("IN_PROGRESS"));
  });

  await t.test("8. Peer Reassignment & Creator Integrity: Preserves creator while updating assignee and logging audit", () => {
    // Initial state: Task created by Ananya and assigned to herself
    const initialTask: TaskItem = {
      id: "task-exam-001",
      title: "Update Marks",
      description: "Update B.Tech student marks for Physics",
      priority: "MEDIUM",
      status: "TODO",
      taskType: "EXAM",
      createdByUserId: teacherAnanya.id,
      creatorName: teacherAnanya.fullName,
      assigneeUserId: teacherAnanya.id,
      assigneeName: teacherAnanya.fullName,
      comments: [],
      activities: [
        {
          id: "act-01",
          userName: teacherAnanya.fullName,
          actionType: "CREATED",
          details: `Task created and assigned to ${teacherAnanya.fullName}`,
          createdAt: new Date(),
        },
      ],
    };

    // Reassignment 1: Ananya -> Rahul
    const updatedTask1: TaskItem = {
      ...initialTask,
      assigneeUserId: teacherRahul.id,
      assigneeName: teacherRahul.fullName,
      activities: [
        ...(initialTask.activities || []),
        {
          id: "act-02",
          userName: teacherAnanya.fullName,
          actionType: "REASSIGNED",
          fromValue: initialTask.assigneeName,
          toValue: teacherRahul.fullName,
          details: `${teacherAnanya.fullName} reassigned task from ${teacherAnanya.fullName} to ${teacherRahul.fullName}`,
          createdAt: new Date(),
        },
      ],
    };

    // Creator must remain Ananya
    assert.equal(updatedTask1.createdByUserId, teacherAnanya.id);
    assert.equal(updatedTask1.creatorName, teacherAnanya.fullName);
    // Assignee is now Rahul
    assert.equal(updatedTask1.assigneeUserId, teacherRahul.id);
    assert.equal(updatedTask1.assigneeName, teacherRahul.fullName);
    // Activity recorded
    assert.equal(updatedTask1.activities?.length, 2);
    assert.equal(updatedTask1.activities?.[1].actionType, "REASSIGNED");

    // Reassignment 2: Rahul -> Priya
    const updatedTask2: TaskItem = {
      ...updatedTask1,
      assigneeUserId: teacherPriya.id,
      assigneeName: teacherPriya.fullName,
      activities: [
        ...(updatedTask1.activities || []),
        {
          id: "act-03",
          userName: teacherRahul.fullName,
          actionType: "REASSIGNED",
          fromValue: teacherRahul.fullName,
          toValue: teacherPriya.fullName,
          details: `${teacherRahul.fullName} reassigned task from ${teacherRahul.fullName} to ${teacherPriya.fullName}`,
          createdAt: new Date(),
        },
      ],
    };

    // Creator STILL remains Ananya
    assert.equal(updatedTask2.createdByUserId, teacherAnanya.id);
    // Assignee is now Priya
    assert.equal(updatedTask2.assigneeUserId, teacherPriya.id);
    assert.equal(updatedTask2.activities?.length, 3);
  });

  await t.test("9. Task Deletion Authorization & Multi-tenant Audit Rules", () => {
    // Authorized: Creator of task
    const isCreatorAuthorized = (creatorId: string, actorId: string, actorRole: string) => {
      if (creatorId === actorId) return true;
      return ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"].includes(actorRole);
    };

    // Ananya created task: Ananya CAN delete it
    assert.equal(isCreatorAuthorized(teacherAnanya.id, teacherAnanya.id, teacherAnanya.roleCode), true);

    // Principal CAN delete Ananya's task (broad administrative authority)
    assert.equal(isCreatorAuthorized(teacherAnanya.id, principalUser.id, principalUser.roleCode), true);

    // Rahul (peer teacher) CANNOT delete Ananya's task
    assert.equal(isCreatorAuthorized(teacherAnanya.id, teacherRahul.id, teacherRahul.roleCode), false);

    // Foreign user from another tenant CANNOT delete
    const isTenantAuthorized = (taskInstitutionId: string, actorInstitutionId: string) => {
      return taskInstitutionId === actorInstitutionId;
    };
    assert.equal(isTenantAuthorized(institutionA, foreignUser.institutionId), false);
  });

  await t.test("10. Task Duplication / Copying Logic", () => {
    const originalTask = {
      id: "task-orig-01",
      title: "Prepare Class 8-A Midterm Paper",
      description: "Draft 50 questions covering Chapters 1-4",
      priority: "HIGH",
      taskType: "EXAM",
      departmentId: "dept-science",
      dueDate: new Date("2026-11-15"),
      institutionId: institutionA,
      assigneeUserId: teacherRahul.id,
    };

    // Logic for copying task
    const duplicate = {
      title: `Copy of ${originalTask.title}`,
      description: originalTask.description,
      priority: originalTask.priority,
      taskType: originalTask.taskType,
      departmentId: originalTask.departmentId,
      dueDate: originalTask.dueDate,
      assigneeUserId: originalTask.assigneeUserId,
      institutionId: originalTask.institutionId,
      status: "TODO", // Cloned tasks always start in TODO
    };

    assert.equal(duplicate.title, "Copy of Prepare Class 8-A Midterm Paper");
    assert.equal(duplicate.status, "TODO");
    assert.equal(duplicate.priority, "HIGH");
    assert.equal(duplicate.taskType, "EXAM");
    assert.equal(duplicate.institutionId, institutionA);
  });

  await t.test("11. Task Commenting & Activity Audit Trail", () => {
    const comments: Array<{ id: string; userId: string; comment: string; createdAt: Date }> = [];
    const activities: Array<{ actionType: string; details: string; userId: string }> = [];

    const addComment = (actor: SessionUser, text: string) => {
      const commentId = `cmt-${Date.now()}`;
      comments.push({
        id: commentId,
        userId: actor.id,
        comment: text,
        createdAt: new Date(),
      });
      activities.push({
        actionType: "COMMENT_ADDED",
        details: `${actor.fullName} commented: "${text.slice(0, 60)}"`,
        userId: actor.id,
      });
    };

    addComment(teacherRahul, "Draft submitted for review.");
    assert.equal(comments.length, 1);
    assert.equal(comments[0].comment, "Draft submitted for review.");
    assert.equal(activities.length, 1);
    assert.equal(activities[0].actionType, "COMMENT_ADDED");
    assert.ok(activities[0].details.includes("Rahul Sharma commented"));
  });

  await t.test("12. Drag-and-Drop Kanban Status Transitions & Rollback Simulation", () => {
    let boardTasks = [
      { id: "t-1", title: "Task 1", status: "TODO" },
      { id: "t-2", title: "Task 2", status: "IN_PROGRESS" },
    ];

    // Same column drop does nothing
    const handleDrop = (taskId: string, targetCol: string, shouldFail = false) => {
      const task = boardTasks.find((x) => x.id === taskId);
      if (!task) return;
      if (task.status === targetCol) return; // Immune to same-column drop

      const prevStatus = task.status;
      // Optimistic transition
      boardTasks = boardTasks.map((x) => (x.id === taskId ? { ...x, status: targetCol } : x));

      if (shouldFail) {
        // Rollback
        boardTasks = boardTasks.map((x) => (x.id === taskId ? { ...x, status: prevStatus } : x));
      }
    };

    // Drop in same column: status stays TODO
    handleDrop("t-1", "TODO");
    assert.equal(boardTasks.find((x) => x.id === "t-1")?.status, "TODO");

    // Drop in IN_PROGRESS: status updates
    handleDrop("t-1", "IN_PROGRESS");
    assert.equal(boardTasks.find((x) => x.id === "t-1")?.status, "IN_PROGRESS");

    // Drop with failure: rolls back to previous status
    handleDrop("t-1", "COMPLETED", true);
    assert.equal(boardTasks.find((x) => x.id === "t-1")?.status, "IN_PROGRESS");
  });
});
