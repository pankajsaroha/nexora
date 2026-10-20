import { prisma } from "@/lib/prisma";
import { SessionUser } from "@/lib/auth";
import { parseStaffMetadata } from "@/lib/staff";
import { NotificationService } from "@/lib/notifications/service";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_TYPES = [
  "GENERAL",
  "ACADEMIC",
  "ATTENDANCE",
  "EXAM",
  "ASSIGNMENT",
  "ADMINISTRATIVE",
  "FACULTY",
  "STUDENT",
  "FEE",
  "EVENT",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface TaskActivityItem {
  id: string;
  userName: string;
  actionType: string;
  details: string;
  fromValue?: string | null;
  toValue?: string | null;
  createdAt: Date | string;
}

export interface TaskCommentItem {
  id: string;
  userName: string;
  comment: string;
  createdAt: Date | string;
}

export interface AcademicTaskContext {
  className?: string | null;
  sectionName?: string | null;
  subjectName?: string | null;
  examName?: string | null;
  classId?: string | null;
  sectionId?: string | null;
  subjectId?: string | null;
  examId?: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  taskType: TaskType;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  academicContext?: AcademicTaskContext | null;
  dueDate?: Date | string | null;
  isOverdue?: boolean;
  daysOverdue?: number;
  assigneeUserId?: string | null;
  assigneeName?: string | null;
  assigneeRole?: string | null;
  createdByUserId: string;
  creatorName: string;
  creatorRole?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  createdAt?: Date | string;
  completedAt?: Date | string | null;
  reopenedAt?: Date | string | null;
  comments: TaskCommentItem[];
  activities?: TaskActivityItem[];
}

export interface AssignableUserOption {
  id: string;
  fullName: string;
  roleCode: string;
  relationship: "SELF" | "DIRECT_REPORT" | "CLASS_PEER" | "DEPARTMENT_STAFF" | "INSTITUTION_STAFF";
  contextLabel?: string;
  groupLabel?: string;
  departmentName?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  subjectId?: string;
  subjectName?: string;
}

export interface ClassPeerTeacherResult {
  userId: string;
  fullName: string;
  roleCode: string;
  subjectId?: string;
  subjectName?: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  contextLabel: string;
  groupLabel: string;
}

/**
 * Resolves all direct reports managed by a specific user or teacher via reportingManager metadata or HOD scope.
 */
export async function getDirectReportUserIds(
  institutionId: string,
  user: SessionUser
): Promise<string[]> {
  const teacher = user.teacherId
    ? await prisma.teacher.findUnique({
        where: { id: user.teacherId },
        include: { department: true },
      })
    : null;

  const allTeachers = await prisma.teacher.findMany({
    where: { institutionId, employmentStatus: "ACTIVE" },
    select: {
      id: true,
      userId: true,
      employeeId: true,
      fullName: true,
      email: true,
      qualification: true,
      departmentId: true,
    },
  });

  const directReportUserIds: string[] = [];

  for (const t of allTeachers) {
    if (!t.userId || t.userId === user.id) continue;

    const meta = parseStaffMetadata(t.qualification);
    if (meta.reportingManager) {
      const rep = meta.reportingManager.trim().toLowerCase();
      const isMatch =
        (teacher && teacher.id.toLowerCase() === rep) ||
        (teacher && teacher.employeeId.toLowerCase() === rep) ||
        (teacher && teacher.email.toLowerCase() === rep) ||
        (user.email.toLowerCase() === rep) ||
        (user.id.toLowerCase() === rep) ||
        (user.fullName.toLowerCase() === rep);

      if (isMatch) {
        directReportUserIds.push(t.userId);
      }
    }
  }

  // If user is HOD of a department, they also manage all teachers in that department
  if (user.roleCode === "HOD" || (teacher && teacher.departmentId)) {
    const hodDepts = await prisma.department.findMany({
      where: {
        institutionId,
        OR: [
          ...(teacher ? [{ hodId: teacher.id }] : []),
          ...(teacher?.departmentId ? [{ id: teacher.departmentId }] : []),
        ],
      },
      include: { teachers: { select: { userId: true } } },
    });

    for (const dept of hodDepts) {
      for (const dt of dept.teachers) {
        if (dt.userId && dt.userId !== user.id && !directReportUserIds.includes(dt.userId)) {
          directReportUserIds.push(dt.userId);
        }
      }
    }
  }

  return directReportUserIds;
}

/**
 * Resolves all peer teachers teaching classes/sections for which the current user is the assigned Class Teacher / Coordinator.
 */
export async function getClassPeerTeachersForUser(
  institutionId: string,
  user: SessionUser
): Promise<ClassPeerTeacherResult[]> {
  if (!user.teacherId) {
    return [];
  }

  // 1. Find all sections where this teacher is assigned as Class Teacher
  const managedSections = await prisma.section.findMany({
    where: {
      class: { institutionId },
      OR: [
        { classTeacherId: user.teacherId },
        { classTeachers: { some: { teacherId: user.teacherId, isCurrent: true } } },
      ],
    },
    include: {
      class: true,
    },
  });

  if (managedSections.length === 0) {
    return [];
  }

  const managedSectionIds = managedSections.map((s) => s.id);

  // 2. Find subject teachers assigned to these sections via TeacherAssignment and TimetableSlot
  const [teacherAssignments, timetableSlots] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { sectionId: { in: managedSectionIds } },
      include: {
        teacher: { include: { user: true } },
        subject: true,
        section: { include: { class: true } },
      },
    }),
    prisma.timetableSlot.findMany({
      where: { sectionId: { in: managedSectionIds } },
      include: {
        teacher: { include: { user: true } },
        subject: true,
        section: { include: { class: true } },
      },
    }),
  ]);

  const peerMap = new Map<string, ClassPeerTeacherResult>();

  const processEntry = (
    teacher: any,
    subject: any,
    section: any
  ) => {
    if (!teacher || !teacher.userId || teacher.userId === user.id) {
      return;
    }

    const key = `${teacher.userId}_${section.id}_${subject?.id || "none"}`;
    if (!peerMap.has(key)) {
      const className = section.class.name;
      const sectionName = section.name;
      const classSectionLabel = `${className} - Section ${sectionName}`;
      const subjectName = subject?.name || "Subject Teacher";

      peerMap.set(key, {
        userId: teacher.userId,
        fullName: teacher.user?.fullName || teacher.fullName,
        roleCode: teacher.user?.roleCode || "TEACHER",
        subjectId: subject?.id,
        subjectName: subject?.name,
        classId: section.classId,
        className,
        sectionId: section.id,
        sectionName,
        contextLabel: `${subjectName} • ${classSectionLabel}`,
        groupLabel: `Recommended for ${classSectionLabel}`,
      });
    }
  };

  for (const ta of teacherAssignments) {
    processEntry(ta.teacher, ta.subject, ta.section);
  }

  for (const slot of timetableSlots) {
    processEntry(slot.teacher, slot.subject, slot.section);
  }

  return Array.from(peerMap.values());
}

/**
 * Returns the exact list of users the given actor is authorized to assign tasks to,
 * structured by coordination hierarchy (Self, Recommended Class Peers, Direct Reports, Other Faculty).
 */
export async function getAssignableUsersForUser(
  user: SessionUser
): Promise<AssignableUserOption[]> {
  const institutionId = user.institutionId;

  // 1. Broad administrative roles can assign to all institution staff
  const isBroadAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HR_ADMIN",
  ].includes(user.roleCode);

  if (isBroadAdmin) {
    const staffUsers = await prisma.user.findMany({
      where: {
        institutionId,
        roleCode: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
            "PRINCIPAL",
            "VICE_PRINCIPAL",
            "HOD",
            "TEACHER",
            "HR_ADMIN",
            "ACCOUNTANT",
          ],
        },
      },
      include: {
        teacher: {
          include: { department: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    return staffUsers.map((u) => ({
      id: u.id,
      fullName: u.id === user.id ? `${u.fullName} (Myself)` : u.fullName,
      roleCode: u.roleCode,
      relationship: u.id === user.id ? "SELF" : "INSTITUTION_STAFF",
      groupLabel: u.id === user.id ? "Self" : "Institution Staff",
      departmentName: u.teacher?.department?.name,
    }));
  }

  const assignableUsers: AssignableUserOption[] = [
    {
      id: user.id,
      fullName: `${user.fullName} (Myself)`,
      roleCode: user.roleCode,
      relationship: "SELF",
      groupLabel: "Self",
    },
  ];

  const addedUserIds = new Set<string>([user.id]);

  // 2. Class Teacher / Coordinator scope (Recommended for Class X)
  const classPeers = await getClassPeerTeachersForUser(institutionId, user);
  for (const cp of classPeers) {
    addedUserIds.add(cp.userId);
    assignableUsers.push({
      id: cp.userId,
      fullName: cp.fullName,
      roleCode: cp.roleCode,
      relationship: "CLASS_PEER",
      groupLabel: cp.groupLabel,
      contextLabel: cp.contextLabel,
      classId: cp.classId,
      className: cp.className,
      sectionId: cp.sectionId,
      sectionName: cp.sectionName,
      subjectId: cp.subjectId,
      subjectName: cp.subjectName,
    });
  }

  // 3. Direct reports for HOD or Teacher
  const directReportUserIds = await getDirectReportUserIds(institutionId, user);
  if (directReportUserIds.length > 0) {
    const directReports = await prisma.user.findMany({
      where: {
        id: { in: directReportUserIds },
        institutionId,
      },
      include: {
        teacher: {
          include: { department: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    for (const dr of directReports) {
      if (!addedUserIds.has(dr.id)) {
        addedUserIds.add(dr.id);
        assignableUsers.push({
          id: dr.id,
          fullName: dr.fullName,
          roleCode: dr.roleCode,
          relationship: "DIRECT_REPORT",
          groupLabel: "My Direct Reports",
          departmentName: dr.teacher?.department?.name,
        });
      }
    }
  }

  // 4. Other Faculty / Peer Teachers in the same institution
  const otherFaculty = await prisma.user.findMany({
    where: {
      institutionId,
      roleCode: { in: ["TEACHER", "HOD"] },
      id: { notIn: Array.from(addedUserIds) },
    },
    include: {
      teacher: {
        include: { department: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  for (const f of otherFaculty) {
    assignableUsers.push({
      id: f.id,
      fullName: f.fullName,
      roleCode: f.roleCode,
      relationship: "INSTITUTION_STAFF",
      groupLabel: "Other Faculty",
      contextLabel: f.teacher?.department?.name ? `Department of ${f.teacher.department.name}` : undefined,
      departmentName: f.teacher?.department?.name,
    });
  }

  return assignableUsers;
}

/**
 * Validates if the user is authorized to assign a task to the target assignee.
 */
export async function validateTaskAssignmentAuthority(
  user: SessionUser,
  targetUserId: string
): Promise<{ allowed: boolean; reason?: string; targetUser?: any }> {
  // 1. Assigning to oneself is always allowed
  if (targetUserId === user.id) {
    return {
      allowed: true,
      targetUser: {
        id: user.id,
        fullName: user.fullName,
        roleCode: user.roleCode,
        institutionId: user.institutionId,
        email: user.email,
      },
    };
  }

  // 2. Multi-tenancy check: target user must belong to same institution
  const targetUser = await prisma.user.findFirst({
    where: { id: targetUserId, institutionId: user.institutionId },
  });

  if (!targetUser) {
    return {
      allowed: false,
      reason: "Target user not found or belongs to a different institution.",
    };
  }

  // 3. Broad admin roles can assign to any institution staff
  if (
    ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "HR_ADMIN"].includes(
      user.roleCode
    )
  ) {
    return { allowed: true, targetUser };
  }

  // 4. Upward Assignment Guard: Teachers CANNOT assign operational tasks upwards to Principal, Admin, Super Admin
  const leadershipRoles = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"];
  if (leadershipRoles.includes(targetUser.roleCode)) {
    return {
      allowed: false,
      reason: `You cannot assign tasks to ${targetUser.fullName} (${targetUser.roleCode.replace(/_/g, " ")}). Teachers cannot assign operational tasks upwards to institutional leadership.`,
    };
  }

  // 5. Teachers can assign tasks to peer teachers, HODs, and staff within the same institution
  const allowedPeerRoles = ["TEACHER", "HOD", "ACCOUNTANT", "STAFF"];
  if (allowedPeerRoles.includes(targetUser.roleCode)) {
    return { allowed: true, targetUser };
  }

  return {
    allowed: false,
    reason: `You are not authorized to assign tasks to ${targetUser.fullName}.`,
  };
}

/**
 * Fetches institutional tasks scoped to the current user's visibility permissions.
 */
export async function getScopedTasksForUser(
  user: SessionUser,
  filters?: {
    status?: string;
    priority?: string;
    taskType?: string;
    scope?: "ALL" | "ASSIGNED_TO_ME" | "CREATED_BY_ME" | "MY_TEAM";
    search?: string;
  }
): Promise<TaskItem[]> {
  const institutionId = user.institutionId;
  const isBroadAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
  ].includes(user.roleCode);

  const [directReportIds, classPeers] = await Promise.all([
    getDirectReportUserIds(institutionId, user),
    getClassPeerTeachersForUser(institutionId, user),
  ]);

  const classPeerIds = classPeers.map((cp) => cp.userId);
  const authorizedTeamIds = Array.from(new Set([...directReportIds, ...classPeerIds]));

  const whereClause: any = {
    institutionId,
  };

  // Base visibility scoping
  if (!isBroadAdmin) {
    whereClause.OR = [
      { assigneeUserId: user.id },
      { createdByUserId: user.id },
      ...(authorizedTeamIds.length > 0
        ? [{ assigneeUserId: { in: authorizedTeamIds }, createdByUserId: user.id }]
        : []),
    ];
  }

  // User filter: Scope
  if (filters?.scope === "ASSIGNED_TO_ME") {
    whereClause.assigneeUserId = user.id;
    delete whereClause.OR;
  } else if (filters?.scope === "CREATED_BY_ME") {
    whereClause.createdByUserId = user.id;
    delete whereClause.OR;
  } else if (filters?.scope === "MY_TEAM") {
    if (authorizedTeamIds.length > 0) {
      whereClause.assigneeUserId = { in: authorizedTeamIds };
      delete whereClause.OR;
    }
  }

  // Filter: Status
  if (filters?.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }

  // Filter: Priority
  if (filters?.priority && filters.priority !== "ALL") {
    whereClause.priority = filters.priority;
  }

  // Filter: Task Type
  if (filters?.taskType && filters.taskType !== "ALL") {
    whereClause.taskType = filters.taskType;
  }

  // Filter: Search
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim();
    whereClause.AND = [
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      assigneeUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          roleCode: true,
          avatarUrl: true,
        },
      },
      createdByUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          roleCode: true,
        },
      },
      department: {
        select: { id: true, name: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, fullName: true, roleCode: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      activities: {
        include: {
          user: {
            select: { id: true, fullName: true, roleCode: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return tasks.map((t) => {
    let isOverdue = false;
    let daysOverdue = 0;

    if (t.dueDate && t.status !== "COMPLETED") {
      const due = new Date(t.dueDate);
      if (now.getTime() > due.getTime()) {
        isOverdue = true;
        daysOverdue = Math.max(
          1,
          Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        );
      }
    }

    // Parse academic context if encoded in relatedEntity
    let academicContext: AcademicTaskContext | null = null;
    if (t.relatedEntity && t.relatedEntity.startsWith("ACADEMIC:")) {
      try {
        academicContext = JSON.parse(t.relatedEntity.replace("ACADEMIC:", ""));
      } catch {
        // fallback
      }
    }

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority as TaskPriority,
      status: t.status as TaskStatus,
      taskType: (t.taskType || "GENERAL") as TaskType,
      relatedEntity: t.relatedEntity,
      relatedEntityId: t.relatedEntityId,
      academicContext,
      dueDate: t.dueDate,
      isOverdue,
      daysOverdue,
      assigneeUserId: t.assigneeUserId,
      assigneeName: t.assigneeUser?.fullName || "Unassigned",
      assigneeRole: t.assigneeUser?.roleCode,
      createdByUserId: t.createdByUserId,
      creatorName: t.createdByUser.fullName,
      creatorRole: t.createdByUser.roleCode,
      departmentId: t.departmentId,
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
    };
  });
}

/**
 * Creates a new task with strict server-side validation and assignment authorization checks.
 */
export async function createInstitutionalTask({
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
}: {
  user: SessionUser;
  title: string;
  description: string;
  assigneeUserId?: string | null;
  departmentId?: string | null;
  priority?: TaskPriority;
  taskType?: TaskType;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  academicContext?: AcademicTaskContext | null;
  dueDate?: string | Date | null;
}) {
  if (!title || !title.trim()) {
    throw new Error("Task title is required.");
  }
  if (!description || !description.trim()) {
    throw new Error("Task description is required.");
  }

  const finalAssigneeId = assigneeUserId || user.id;

  // 1. Verify assignment permission & resolve target user in a single query
  const authCheck = await validateTaskAssignmentAuthority(user, finalAssigneeId);
  if (!authCheck.allowed) {
    throw new Error(authCheck.reason || "Forbidden: You are not authorized to assign this task.");
  }

  const assigneeUser = authCheck.targetUser;
  if (!assigneeUser) {
    throw new Error("Assignee user does not exist in your institution.");
  }

  const parsedDueDate = dueDate ? new Date(dueDate) : null;
  const finalPriority = priority || "MEDIUM";
  const finalTaskType = taskType || "GENERAL";

  // If academic context is provided, serialize into relatedEntity if not otherwise occupied
  let finalRelatedEntity = relatedEntity || null;
  if (academicContext && Object.keys(academicContext).length > 0) {
    finalRelatedEntity = `ACADEMIC:${JSON.stringify(academicContext)}`;
  }

  // 2. Perform atomic database writes within transaction (with bounded timeout)
  const created = await prisma.$transaction(
    async (tx) => {
      const task = await tx.task.create({
        data: {
          institutionId: user.institutionId,
          title: title.trim(),
          description: description.trim(),
          assigneeUserId: finalAssigneeId,
          createdByUserId: user.id,
          departmentId: departmentId || null,
          priority: finalPriority,
          taskType: finalTaskType,
          relatedEntity: finalRelatedEntity,
          relatedEntityId: relatedEntityId || null,
          dueDate: parsedDueDate,
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

      // Activity timeline entry
      await tx.taskActivity.create({
        data: {
          taskId: task.id,
          userId: user.id,
          actionType: "CREATED",
          details: `Task created and assigned to ${assigneeUser.fullName}`,
          toValue: assigneeUser.fullName,
        },
      });

      // Audit log entry
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "CREATE",
          entity: "Task",
          entityId: task.id,
          details: `Created task '${title.trim()}' assigned to ${assigneeUser.fullName}. Priority: ${finalPriority}, Type: ${finalTaskType}`,
        },
      });

      return task;
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );

  // 3. Dispatch Notification AFTER successful transaction commit (outside transaction boundary)
  if (finalAssigneeId !== user.id) {
    try {
      await NotificationService.dispatch({
        inApp: [
          {
            userId: finalAssigneeId,
            institutionId: user.institutionId,
            title: "New Task Assigned",
            message: `${user.fullName} assigned you a task: "${title.trim()}"`,
            type: "TASK",
            linkUrl: "/tasks",
            relatedEntity: "Task",
            relatedEntityId: created.id,
          },
        ],
      });
    } catch (notifErr) {
      console.error("Failed to dispatch task assignment notification:", notifErr);
    }
  }

  return created;
}

/**
 * Updates task status, priority, due date, or assignee with strict authority checks.
 */
export async function updateInstitutionalTask({
  user,
  taskId,
  status,
  priority,
  taskType,
  dueDate,
  assigneeUserId,
  title,
  description,
}: {
  user: SessionUser;
  taskId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  dueDate?: string | Date | null;
  assigneeUserId?: string;
  title?: string;
  description?: string;
}) {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, institutionId: user.institutionId },
    include: {
      assigneeUser: true,
      createdByUser: true,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found or does not belong to your institution.");
  }

  const isAssignee = existingTask.assigneeUserId === user.id;
  const isCreator = existingTask.createdByUserId === user.id;
  const isBroadAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
    "HR_ADMIN",
  ].includes(user.roleCode);

  const [directReportIds, classPeers] = await Promise.all([
    getDirectReportUserIds(user.institutionId, user),
    getClassPeerTeachersForUser(user.institutionId, user),
  ]);

  const classPeerIds = classPeers.map((cp) => cp.userId);
  const isManagerOrCoordinator = existingTask.assigneeUserId
    ? directReportIds.includes(existingTask.assigneeUserId) || classPeerIds.includes(existingTask.assigneeUserId)
    : false;

  // General update permission check
  if (!isAssignee && !isCreator && !isManagerOrCoordinator && !isBroadAdmin) {
    throw new Error("Forbidden: You do not have permission to modify this task.");
  }

  const notificationsToDispatch: Array<() => Promise<any>> = [];

  const updated = await prisma.$transaction(
    async (tx) => {
      const updateData: any = {};
      const activitiesToCreate: Array<{
        actionType: string;
        details: string;
        fromValue?: string | null;
        toValue?: string | null;
      }> = [];

      if (title && title.trim() !== existingTask.title) {
        if (!isCreator && !isManagerOrCoordinator && !isBroadAdmin && !isAssignee) {
          throw new Error("Only task creator, assignee, or administrators can edit task title.");
        }
        updateData.title = title.trim();
        activitiesToCreate.push({
          actionType: "TITLE_CHANGED",
          fromValue: existingTask.title,
          toValue: title.trim(),
          details: `${user.fullName} updated title from "${existingTask.title}" to "${title.trim()}"`,
        });
      }

      if (description && description.trim() !== existingTask.description) {
        if (!isCreator && !isManagerOrCoordinator && !isBroadAdmin && !isAssignee) {
          throw new Error("Only task creator, assignee, or administrators can edit task description.");
        }
        updateData.description = description.trim();
        activitiesToCreate.push({
          actionType: "DESCRIPTION_CHANGED",
          details: `${user.fullName} updated task description`,
        });
      }

      if (taskType && taskType !== existingTask.taskType) {
        updateData.taskType = taskType;
        activitiesToCreate.push({
          actionType: "TYPE_CHANGED",
          fromValue: existingTask.taskType,
          toValue: taskType,
          details: `${user.fullName} changed task type from ${existingTask.taskType} to ${taskType}`,
        });
      }

      // Reassignment
      if (assigneeUserId && assigneeUserId !== existingTask.assigneeUserId) {
        if (!isAssignee && !isCreator && !isManagerOrCoordinator && !isBroadAdmin) {
          throw new Error("Forbidden: You do not have authority to reassign this task.");
        }

        const authCheck = await validateTaskAssignmentAuthority(user, assigneeUserId);
        if (!authCheck.allowed) {
          throw new Error(authCheck.reason || "Forbidden: You are not authorized to assign this task to this user.");
        }

        const newAssignee = authCheck.targetUser || (await tx.user.findFirst({
          where: { id: assigneeUserId, institutionId: user.institutionId },
        }));
        if (!newAssignee) {
          throw new Error("New assignee must belong to your institution.");
        }

        updateData.assigneeUserId = assigneeUserId;
        activitiesToCreate.push({
          actionType: "REASSIGNED",
          fromValue: existingTask.assigneeUser?.fullName || "Unassigned",
          toValue: newAssignee.fullName,
          details: `${user.fullName} reassigned task from ${existingTask.assigneeUser?.fullName || "Unassigned"} to ${newAssignee.fullName}`,
        });

        // Queue notification for new assignee (dispatched post-commit)
        if (assigneeUserId !== user.id) {
          notificationsToDispatch.push(() =>
            NotificationService.dispatch({
              inApp: [
                {
                  userId: assigneeUserId,
                  institutionId: user.institutionId,
                  title: "Task Reassigned to You",
                  message: `${user.fullName} reassigned task "${existingTask.title}" to you`,
                  type: "TASK",
                  linkUrl: "/tasks",
                  relatedEntity: "Task",
                  relatedEntityId: taskId,
                },
              ],
            })
          );
        }
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
          details: newDue
            ? `Due date set to ${newDue.toISOString().split("T")[0]}`
            : "Due date removed",
        });
      }

      // Status Change
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

          // Queue notification for creator if assignee completed it (dispatched post-commit)
          if (existingTask.createdByUserId !== user.id) {
            notificationsToDispatch.push(() =>
              NotificationService.dispatch({
                inApp: [
                  {
                    userId: existingTask.createdByUserId,
                    institutionId: user.institutionId,
                    title: "Task Completed",
                    message: `${user.fullName} completed the task: "${existingTask.title}"`,
                    type: "TASK",
                    linkUrl: "/tasks",
                    relatedEntity: "Task",
                    relatedEntityId: taskId,
                  },
                ],
              })
            );
          }
        } else if (
          existingTask.status === "COMPLETED" &&
          (status === "TODO" || status === "IN_PROGRESS")
        ) {
          if (!isCreator && !isManagerOrCoordinator && !isBroadAdmin) {
            throw new Error("Only task creator or managers can reopen a completed task.");
          }
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

      const taskUpdated = await tx.task.update({
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
          details: `Updated task '${taskUpdated.title}' (Status: ${taskUpdated.status}, Priority: ${taskUpdated.priority}).`,
        },
      });

      return taskUpdated;
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );

  // Dispatch all queued notifications after successful transaction commit
  for (const dispatchFn of notificationsToDispatch) {
    try {
      await dispatchFn();
    } catch (notifErr) {
      console.error("Failed to dispatch task update notification:", notifErr);
    }
  }

  return updated;
}

/**
 * Deletes a task with strict multi-tenancy and authorization checks.
 * Authorized actors: task creator, or institutional leadership (SUPER_ADMIN, ADMIN, PRINCIPAL, VICE_PRINCIPAL).
 */
export async function deleteInstitutionalTask({
  user,
  taskId,
}: {
  user: SessionUser;
  taskId: string;
}) {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, institutionId: user.institutionId },
  });

  if (!existingTask) {
    throw new Error("Task not found or does not belong to your institution.");
  }

  const isCreator = existingTask.createdByUserId === user.id;
  const isBroadAdmin = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRINCIPAL",
    "VICE_PRINCIPAL",
  ].includes(user.roleCode);

  if (!isCreator && !isBroadAdmin) {
    throw new Error("Forbidden: You do not have authority to delete this task.");
  }

  return await prisma.$transaction(
    async (tx) => {
      // Record permanent institutional audit log prior to cascade deletion
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "DELETE",
          entity: "Task",
          entityId: taskId,
          details: `Deleted task '${existingTask.title}' (Priority: ${existingTask.priority}, Status: ${existingTask.status}).`,
        },
      });

      // Delete task (Prisma schema cascades comments and activities automatically)
      await tx.task.delete({
        where: { id: taskId },
      });

      return { success: true };
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

/**
 * Duplicates/copies an existing task within the user's institution.
 */
export async function copyInstitutionalTask({
  user,
  taskId,
}: {
  user: SessionUser;
  taskId: string;
}) {
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, institutionId: user.institutionId },
  });

  if (!existingTask) {
    throw new Error("Task not found or does not belong to your institution.");
  }

  const newTitle = `Copy of ${existingTask.title}`;
  return await createInstitutionalTask({
    user,
    title: newTitle,
    description: existingTask.description,
    assigneeUserId: existingTask.assigneeUserId || user.id,
    departmentId: existingTask.departmentId,
    priority: existingTask.priority as TaskPriority,
    taskType: existingTask.taskType as TaskType,
    relatedEntity: existingTask.relatedEntity,
    relatedEntityId: existingTask.relatedEntityId,
    dueDate: existingTask.dueDate,
  });
}

