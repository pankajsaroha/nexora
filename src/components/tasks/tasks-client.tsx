"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  MessageSquare,
  User,
  Send,
  Calendar,
  UserCheck,
  History,
  Search,
  AlertTriangle,
  GraduationCap,
  X,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Loader2,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  TaskItem,
  TaskActivityItem,
  TaskCommentItem,
  AssignableUserOption,
  TaskPriority,
  TaskStatus,
  TaskType,
  TASK_TYPES,
  TASK_PRIORITIES,
} from "@/lib/tasks/service";

export interface TasksClientProps {
  tasks: TaskItem[];
  assignableUsers: AssignableUserOption[];
  departments: Array<{ id: string; name: string }>;
  canCreate: boolean;
  canReassign?: boolean;
  currentUser: {
    id: string;
    fullName: string;
    roleCode: string;
  };
}

export function TasksClient({
  tasks: initialTasks,
  assignableUsers,
  departments,
  canCreate,
  canReassign = true,
  currentUser,
}: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reassignment state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState<TaskItem | null>(null);
  const [reassignSearch, setReassignSearch] = useState("");
  const [selectedReassignUser, setSelectedReassignUser] = useState<string>("");

  // Card overflow menus state
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [cardMenuSubmenu, setCardMenuSubmenu] = useState<"STATUS" | "PRIORITY" | null>(null);
  const [isDrawerMenuOpen, setIsDrawerMenuOpen] = useState(false);

  // Collapsible Activity section in Task Detail Drawer
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Inline editing inside Drawer
  const [isInlineEditingDesc, setIsInlineEditingDesc] = useState(false);
  const [inlineDescValue, setInlineDescValue] = useState("");
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "ASSIGNED_TO_ME" | "CREATED_BY_ME" | "MY_TEAM">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("ALL");

  // Banners & Notifications
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [reassignErrorMessage, setReassignErrorMessage] = useState<string | null>(null);

  // Create Form State
  const defaultAssignee = assignableUsers[0]?.id || currentUser.id;
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    assigneeUserId: defaultAssignee,
    departmentId: departments[0]?.id || "",
    priority: "MEDIUM" as TaskPriority,
    taskType: "GENERAL" as TaskType,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    taskType: "GENERAL" as TaskType,
    dueDate: "",
  });

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openCardMenuId) {
        setOpenCardMenuId(null);
        setCardMenuSubmenu(null);
      }
      if (isDrawerMenuOpen) setIsDrawerMenuOpen(false);
    };
    if (openCardMenuId || isDrawerMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openCardMenuId, isDrawerMenuOpen]);

  const columns: Array<TaskStatus> = ["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"];

  const colMeta: Record<
    TaskStatus,
    { label: string; num: string; dotColor: string }
  > = {
    TODO: { label: "To Do", num: "01", dotColor: "bg-muted-foreground/60" },
    IN_PROGRESS: { label: "In Progress", num: "02", dotColor: "bg-warning" },
    BLOCKED: { label: "Blocked / Review", num: "03", dotColor: "bg-destructive" },
    COMPLETED: { label: "Completed", num: "04", dotColor: "bg-success" },
  };

  // Group assignable users by groupLabel for categorized dropdowns
  const groupedAssignableUsers = useMemo(() => {
    const groups: Record<string, AssignableUserOption[]> = {};
    for (const u of assignableUsers) {
      const groupKey = u.groupLabel || "Other";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(u);
    }
    return groups;
  }, [assignableUsers]);

  // Filtered assignable users for Reassign modal
  const reassignFilteredGroups = useMemo(() => {
    const q = reassignSearch.trim().toLowerCase();
    const recommended: AssignableUserOption[] = [];
    const otherFaculty: AssignableUserOption[] = [];

    for (const u of assignableUsers) {
      if (q) {
        const matchName = u.fullName.toLowerCase().includes(q);
        const matchRole = u.roleCode.toLowerCase().includes(q);
        const matchDept = u.departmentName?.toLowerCase().includes(q);
        const matchContext = u.contextLabel?.toLowerCase().includes(q);
        const matchSubject = u.subjectName?.toLowerCase().includes(q);
        const matchClass = u.className?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchDept && !matchContext && !matchSubject && !matchClass) {
          continue;
        }
      }

      if (u.relationship === "CLASS_PEER" || u.relationship === "DIRECT_REPORT" || u.relationship === "SELF") {
        recommended.push(u);
      } else {
        otherFaculty.push(u);
      }
    }

    return { recommended, otherFaculty };
  }, [assignableUsers, reassignSearch]);

  const hasTeamOptions = assignableUsers.some(
    (u) => u.relationship === "DIRECT_REPORT" || u.relationship === "CLASS_PEER"
  );

  // Permission helpers
  const canDeleteTask = (task: TaskItem) => {
    if (task.createdByUserId === currentUser.id) return true;
    return ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"].includes(currentUser.roleCode);
  };

  const canEditTask = (task: TaskItem) => {
    if (task.createdByUserId === currentUser.id) return true;
    if (task.assigneeUserId === currentUser.id) return true;
    return ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"].includes(currentUser.roleCode);
  };

  // Filter tasks in memory
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (scopeFilter === "ASSIGNED_TO_ME" && t.assigneeUserId !== currentUser.id) return false;
      if (scopeFilter === "CREATED_BY_ME" && t.createdByUserId !== currentUser.id) return false;
      if (scopeFilter === "MY_TEAM") {
        const teamUserIds = assignableUsers
          .filter((u) => u.relationship === "DIRECT_REPORT" || u.relationship === "CLASS_PEER")
          .map((u) => u.id);
        if (!t.assigneeUserId || !teamUserIds.includes(t.assigneeUserId)) return false;
      }

      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (taskTypeFilter !== "ALL" && t.taskType !== taskTypeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchAssignee = t.assigneeName?.toLowerCase().includes(q);
        const matchCreator = t.creatorName.toLowerCase().includes(q);
        const matchType = t.taskType.toLowerCase().includes(q);
        const matchClass = t.academicContext?.className?.toLowerCase().includes(q);
        const matchSubject = t.academicContext?.subjectName?.toLowerCase().includes(q);
        if (
          !matchTitle &&
          !matchDesc &&
          !matchAssignee &&
          !matchCreator &&
          !matchType &&
          !matchClass &&
          !matchSubject
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, scopeFilter, priorityFilter, taskTypeFilter, searchQuery, currentUser.id, assignableUsers]);

  // Overall Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const overdue = tasks.filter((t) => t.isOverdue).length;
    return { total, todo, inProgress, blocked, completed, overdue };
  }, [tasks]);

  const refreshTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        const freshList: TaskItem[] = data.tasks || [];
        setTasks(freshList);
        if (selectedTask) {
          const fresh = freshList.find((x) => x.id === selectedTask.id);
          if (fresh) {
            setSelectedTask(fresh);
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
    }
  };

  // Status Change with Optimistic UI & Rollback on Failure
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const taskIndex = tasks.findIndex((x) => x.id === taskId);
    if (taskIndex === -1) return;
    const previousStatus = tasks[taskIndex].status;
    if (previousStatus === newStatus) return; // Same column drop does nothing

    if (isUpdatingStatus[taskId]) return; // Prevent concurrent submissions

    setActionErrorMessage(null);
    setIsUpdatingStatus((prev) => ({ ...prev, [taskId]: true }));

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update task status.");
      }
      await refreshTasks();
    } catch (err: any) {
      console.error("Status update error:", err);
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
      );
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, status: previousStatus } : null));
      }
      setActionErrorMessage(err.message || "Failed to update status. Rolled back changes.");
    } finally {
      setIsUpdatingStatus((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  };

  // Priority Change
  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      setActionErrorMessage(null);
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, priority: newPriority }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update priority.");
      }

      await refreshTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, priority: newPriority } : null));
      }
    } catch (err: any) {
      console.error("Priority update error:", err);
      setActionErrorMessage(err.message || "Failed to update priority.");
    }
  };

  // Open Reassign Modal
  const openReassignModal = (task: TaskItem) => {
    setTaskToReassign(task);
    setReassignErrorMessage(null);
    setReassignSearch("");
    setSelectedReassignUser(task.assigneeUserId || currentUser.id);
    setIsReassignModalOpen(true);
  };

  // Handle Reassign Submit
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToReassign || !selectedReassignUser) return;

    try {
      setIsSubmitting(true);
      setReassignErrorMessage(null);
      setActionErrorMessage(null);

      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: taskToReassign.id,
          assigneeUserId: selectedReassignUser,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reassign task.");
      }

      await refreshTasks();
      const newAssignee = assignableUsers.find((s) => s.id === selectedReassignUser);
      if (selectedTask && selectedTask.id === taskToReassign.id) {
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                assigneeUserId: selectedReassignUser,
                assigneeName: newAssignee?.fullName || prev.assigneeName,
                assigneeRole: newAssignee?.roleCode || prev.assigneeRole,
              }
            : null
        );
      }
      setIsReassignModalOpen(false);
      setTaskToReassign(null);
    } catch (err: any) {
      console.error("Reassign error:", err);
      setReassignErrorMessage(err.message || "Failed to reassign task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (task: TaskItem) => {
    setTaskToEdit(task);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority,
      taskType: task.taskType as TaskType,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
    setEditErrorMessage(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit) return;

    try {
      setIsSubmitting(true);
      setEditErrorMessage(null);
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: taskToEdit.id,
          title: editFormData.title.trim(),
          description: editFormData.description.trim(),
          priority: editFormData.priority,
          taskType: editFormData.taskType,
          dueDate: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update task.");
      }

      setIsEditModalOpen(false);
      setTaskToEdit(null);
      await refreshTasks();
    } catch (err: any) {
      console.error("Edit task error:", err);
      setEditErrorMessage(err.message || "Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline Scope Description save in Drawer
  const handleSaveInlineDesc = async () => {
    if (!selectedTask) return;
    try {
      setIsSavingInline(true);
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          description: inlineDescValue.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update description.");
      }
      setSelectedTask((prev) =>
        prev ? { ...prev, description: inlineDescValue.trim() } : null
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, description: inlineDescValue.trim() } : t
        )
      );
      setIsInlineEditingDesc(false);
      await refreshTasks();
    } catch (err: any) {
      console.error("Inline edit error:", err);
      setActionErrorMessage(err.message || "Failed to save description.");
    } finally {
      setIsSavingInline(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (task: TaskItem) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks?taskId=${taskToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete task.");
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      if (selectedTask?.id === taskToDelete.id) {
        setSelectedTask(null);
      }
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      await refreshTasks();
    } catch (err: any) {
      console.error("Delete task error:", err);
      setActionErrorMessage(err.message || "Failed to delete task.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplicate / Copy Task
  const handleDuplicateTask = async (task: TaskItem) => {
    try {
      setActionErrorMessage(null);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DUPLICATE",
          taskId: task.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to duplicate task.");
      }
      await refreshTasks();
    } catch (err: any) {
      console.error("Duplicate task error:", err);
      setActionErrorMessage(err.message || "Failed to duplicate task.");
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    try {
      const res = await fetch("/api/tasks/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          comment: newComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add remark.");
      }

      const addedComment: TaskCommentItem = {
        id: data.comment.id,
        userName: data.comment.user?.fullName || currentUser.fullName,
        comment: data.comment.comment,
        createdAt: data.comment.createdAt,
      };

      const addedActivity: TaskActivityItem | null = data.activity
        ? {
            id: data.activity.id,
            actionType: data.activity.actionType,
            details: data.activity.details,
            userName: data.activity.userName,
            createdAt: data.activity.createdAt,
          }
        : null;

      setSelectedTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, addedComment],
          activities: addedActivity
            ? [addedActivity, ...(prev.activities || [])]
            : prev.activities,
        };
      });

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === selectedTask.id) {
            return {
              ...t,
              comments: [...t.comments, addedComment],
              activities: addedActivity
                ? [addedActivity, ...(t.activities || [])]
                : t.activities,
            };
          }
          return t;
        })
      );

      setNewComment("");
      await refreshTasks();
    } catch (err: any) {
      console.error("Comment error:", err);
      setActionErrorMessage(err.message || "Failed to add remark.");
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateErrorMessage(null);
    try {
      const selectedOption = assignableUsers.find((u) => u.id === createFormData.assigneeUserId);
      const payload: any = {
        ...createFormData,
      };

      if (selectedOption?.classId) {
        payload.academicContext = {
          className: selectedOption.className,
          sectionName: selectedOption.sectionName,
          subjectName: selectedOption.subjectName,
          classId: selectedOption.classId,
          sectionId: selectedOption.sectionId,
          subjectId: selectedOption.subjectId,
        };
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create task.");
      }

      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        description: "",
        assigneeUserId: defaultAssignee,
        departmentId: departments[0]?.id || "",
        priority: "MEDIUM",
        taskType: "GENERAL",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      await refreshTasks();
    } catch (err: any) {
      console.error("Create task error:", err);
      setCreateErrorMessage(err.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Priority indicator helper
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return "text-destructive bg-destructive-subtle border-destructive-border";
      case "HIGH":
        return "text-warning bg-warning-subtle border-warning-border";
      case "MEDIUM":
        return "text-foreground/80 bg-secondary border-border";
      case "LOW":
      default:
        return "text-muted-foreground bg-muted border-border-subtle";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        category="Institutional Workflows"
        title={currentUser.roleCode === "TEACHER" ? "My Tasks" : "Management & Academic Tasks"}
        description="Plan academic deliverables, assessment blueprints, and faculty action items with institution-scoped delegation and append-only activity auditing."
        actions={
          canCreate ? (
            <Button
              size="sm"
              onClick={() => {
                setCreateErrorMessage(null);
                setIsCreateModalOpen(true);
              }}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create Task
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {actionErrorMessage && (
        <div className="p-3 rounded-lg bg-destructive-subtle text-destructive border border-destructive-border flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">{actionErrorMessage}</span>
          </div>
          <button
            onClick={() => setActionErrorMessage(null)}
            className="text-destructive/80 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Restrained KPI Row (Calm, Warm-Neutral, Minimal Elevation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
            Total Tasks
          </span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">{stats.total}</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" /> To Do
          </span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">{stats.todo}</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" /> In Progress
          </span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">{stats.inProgress}</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Blocked
          </span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">{stats.blocked}</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Completed
          </span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">{stats.completed}</div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-destructive" /> Overdue
          </span>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              stats.overdue > 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-2.5 rounded-lg border border-border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks by title, class, subject, or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-md border border-border bg-secondary/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Scope: All</option>
            <option value="ASSIGNED_TO_ME">Assigned to Me</option>
            <option value="CREATED_BY_ME">Created by Me</option>
            {hasTeamOptions && <option value="MY_TEAM">My Team & Class Peers</option>}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Priority: All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Task Type Filter */}
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Type: All</option>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Kanban Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col);
          const meta = colMeta[col];
          const isDragOver = dragOverCol === col;

          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverCol !== col) {
                  setDragOverCol(col);
                }
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverCol(null);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOverCol(null);
                const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
                if (!taskId) return;
                const droppedTask = tasks.find((t) => t.id === taskId);
                if (!droppedTask || droppedTask.status === col) return;
                await handleStatusChange(taskId, col);
              }}
              className={`flex flex-col min-h-[520px] rounded-xl border p-2.5 transition-colors min-w-0 ${
                isDragOver
                  ? "border-primary/50 bg-primary-subtle/30 ring-1 ring-primary/20"
                  : "border-border/70 bg-muted/30"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                  <span className="text-xs font-semibold text-foreground tracking-tight">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 border border-border-subtle px-1.5 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  /* Reduced, concise empty state as requested */
                  <div className="py-8 px-2 text-center text-xs text-muted-foreground/60">
                    <span>No tasks</span>
                  </div>
                ) : (
                  colTasks.map((t) => {
                    const isOverdue = t.isOverdue;
                    const isAssignee = t.assigneeUserId === currentUser.id;
                    const isCardDragging = draggedTaskId === t.id;
                    const isSaving = isUpdatingStatus[t.id];
                    const isMenuOpen = openCardMenuId === t.id;
                    const isCompleted = t.status === "COMPLETED";

                    return (
                      <div
                        key={t.id}
                        draggable={!isSaving}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", t.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedTaskId(t.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverCol(null);
                        }}
                        onClick={() => {
                          setActionErrorMessage(null);
                          setSelectedTask(t);
                          setIsInlineEditingDesc(false);
                        }}
                        className={`group relative cursor-grab active:cursor-grabbing rounded-lg border bg-card p-3 shadow-2xs transition-all duration-150 space-y-2 hover:border-border hover:shadow-xs ${
                          isCardDragging
                            ? "opacity-30 scale-[0.98] border-dashed border-primary"
                            : "border-border"
                        } ${isCompleted ? "opacity-85 bg-card/75 border-border/70" : ""} ${
                          isSaving ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        {/* Top Line: Category / Priority / Overdue / Menu */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                              {t.taskType}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityBadge(
                                t.priority as TaskPriority
                              )}`}
                            >
                              {t.priority}
                            </span>
                            {isOverdue && !isCompleted && (
                              <span className="text-[9px] font-mono font-medium text-destructive flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {t.daysOverdue ? `${t.daysOverdue}d overdue` : "Overdue"}
                              </span>
                            )}
                          </div>

                          {/* Compact Overflow Action Menu */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (isMenuOpen) {
                                  setOpenCardMenuId(null);
                                  setCardMenuSubmenu(null);
                                } else {
                                  setOpenCardMenuId(t.id);
                                  setCardMenuSubmenu(null);
                                }
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Task actions"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu with Nested Submenus */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-6 z-30 w-44 rounded-lg border border-border bg-popover shadow-sm p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCardMenuId(null);
                                    setCardMenuSubmenu(null);
                                    setSelectedTask(t);
                                    setIsInlineEditingDesc(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>Open Task</span>
                                </button>

                                {canEditTask(t) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      setCardMenuSubmenu(null);
                                      openEditModal(t);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>Edit Task</span>
                                  </button>
                                )}

                                {canReassign && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenCardMenuId(null);
                                      setCardMenuSubmenu(null);
                                      openReassignModal(t);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>Reassign</span>
                                  </button>
                                )}

                                {/* Move to Lane Submenu Toggle */}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCardMenuSubmenu(
                                        cardMenuSubmenu === "STATUS" ? null : "STATUS"
                                      )
                                    }
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span>Move to...</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  </button>

                                  {cardMenuSubmenu === "STATUS" && (
                                    <div className="pl-6 pr-2 py-1 space-y-0.5 bg-secondary/30 rounded-md my-0.5">
                                      {columns
                                        .filter((c) => c !== t.status)
                                        .map((targetCol) => (
                                          <button
                                            key={targetCol}
                                            type="button"
                                            onClick={() => {
                                              setOpenCardMenuId(null);
                                              setCardMenuSubmenu(null);
                                              handleStatusChange(t.id, targetCol);
                                            }}
                                            className="w-full flex items-center gap-1.5 py-1 px-1.5 text-[11px] rounded hover:bg-muted text-foreground text-left"
                                          >
                                            <span
                                              className={`w-1.5 h-1.5 rounded-full ${colMeta[targetCol].dotColor}`}
                                            />
                                            <span>{colMeta[targetCol].label}</span>
                                          </button>
                                        ))}
                                    </div>
                                  )}
                                </div>

                                {/* Change Priority Submenu Toggle */}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCardMenuSubmenu(
                                        cardMenuSubmenu === "PRIORITY" ? null : "PRIORITY"
                                      )
                                    }
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span>Change Priority</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  </button>

                                  {cardMenuSubmenu === "PRIORITY" && (
                                    <div className="pl-6 pr-2 py-1 space-y-0.5 bg-secondary/30 rounded-md my-0.5">
                                      {TASK_PRIORITIES.filter((p) => p !== t.priority).map((p) => (
                                        <button
                                          key={p}
                                          type="button"
                                          onClick={() => {
                                            setOpenCardMenuId(null);
                                            setCardMenuSubmenu(null);
                                            handlePriorityChange(t.id, p);
                                          }}
                                          className="w-full py-1 px-1.5 text-[11px] rounded hover:bg-muted text-foreground text-left"
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenCardMenuId(null);
                                    setCardMenuSubmenu(null);
                                    handleDuplicateTask(t);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>Duplicate</span>
                                </button>

                                {canDeleteTask(t) && (
                                  <div className="border-t border-border/60 pt-0.5 my-0.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenCardMenuId(null);
                                        setCardMenuSubmenu(null);
                                        openDeleteModal(t);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-destructive hover:bg-destructive-subtle transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Task</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title (Wrapped cleanly, clear typography) */}
                        <h4
                          className={`text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors ${
                            isCompleted ? "text-foreground/75" : "text-foreground"
                          }`}
                        >
                          {t.title}
                        </h4>

                        {/* Short Description */}
                        {t.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}

                        {/* Academic Context (Subtle tag, only if linked) */}
                        {t.academicContext && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate">
                            <GraduationCap className="w-3 h-3 text-muted-foreground/80 shrink-0" />
                            <span className="truncate">
                              {t.academicContext.className}
                              {t.academicContext.sectionName
                                ? ` · ${t.academicContext.sectionName}`
                                : ""}
                              {t.academicContext.subjectName
                                ? ` · ${t.academicContext.subjectName}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {/* Bottom Metadata Line: Assignee, Comments, Due Date */}
                        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="truncate flex items-center gap-1.5 max-w-[130px]">
                            <User className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">
                              {isAssignee ? "You" : t.assigneeName || "Unassigned"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {t.comments.length > 0 && (
                              <span
                                className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
                                title="Comments"
                              >
                                <MessageSquare className="w-3 h-3 text-muted-foreground/70" />
                                {t.comments.length}
                              </span>
                            )}

                            {t.dueDate && (
                              <span
                                className={`text-[10px] font-mono ${
                                  isOverdue && !isCompleted
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatDate(t.dueDate, "dd MMM")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* In-Flight Saving State */}
                        {isSaving && (
                          <div className="absolute inset-0 bg-card/60 backdrop-blur-2xs rounded-lg flex items-center justify-center text-[10px] text-primary gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Unified Task Detail Side Panel (Right-Side Drawer) */}
      {selectedTask && (
        <Drawer
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setIsInlineEditingDesc(false);
          }}
          title={selectedTask.title}
          subtitle={
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {selectedTask.taskType}
              </span>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityBadge(
                  selectedTask.priority as TaskPriority
                )}`}
              >
                {selectedTask.priority}
              </span>
            </div>
          }
          width="lg"
          headerActions={
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsDrawerMenuOpen(!isDrawerMenuOpen)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Secondary actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Compact secondary actions menu */}
              {isDrawerMenuOpen && (
                <div className="absolute right-0 top-8 z-30 w-36 rounded-lg border border-border bg-popover shadow-sm p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerMenuOpen(false);
                      handleDuplicateTask(selectedTask);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-foreground hover:bg-muted transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Duplicate</span>
                  </button>
                </div>
              )}
            </div>
          }
          footer={
            /* Footer Actions: Edit, Reassign, Delete (when authorized) and Close */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {canEditTask(selectedTask) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(selectedTask)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                )}
                {canReassign && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReassignModal(selectedTask)}
                    leftIcon={<UserCheck className="w-3.5 h-3.5 text-muted-foreground" />}
                  >
                    Reassign
                  </Button>
                )}
                {canDeleteTask(selectedTask) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive-subtle hover:border-destructive"
                    onClick={() => openDeleteModal(selectedTask)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTask(null);
                  setIsInlineEditingDesc(false);
                }}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Primary Information: Status, Assignee, Due Date, Creator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border bg-secondary/30 text-xs">
              {/* Status */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-medium block">
                  Status
                </span>
                <select
                  value={selectedTask.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTask.id, e.target.value as TaskStatus)
                  }
                  className="mt-0.5 w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked / Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-medium block">
                  Assignee
                </span>
                <div className="flex items-center justify-between gap-1 mt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate font-medium text-foreground">
                      {selectedTask.assigneeUserId === currentUser.id
                        ? "You"
                        : selectedTask.assigneeName || "Unassigned"}
                    </span>
                  </div>
                  {canReassign && (
                    <button
                      type="button"
                      onClick={() => openReassignModal(selectedTask)}
                      className="text-[10px] text-primary hover:underline font-medium shrink-0"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-medium block">
                  Due Date
                </span>
                <div className="flex items-center gap-1.5 mt-1 font-medium text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span className={selectedTask.isOverdue ? "text-destructive font-semibold" : ""}>
                    {selectedTask.dueDate
                      ? formatDate(selectedTask.dueDate, "dd MMM yyyy")
                      : "No Due Date"}
                  </span>
                </div>
              </div>

              {/* Creator */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-medium block">
                  Creator
                </span>
                <span className="block mt-1 font-medium text-foreground truncate">
                  {selectedTask.creatorName}
                </span>
              </div>
            </div>

            {/* Main Content: Scope & Deliverables */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Scope & Deliverables
                </span>
                {canEditTask(selectedTask) && !isInlineEditingDesc && (
                  <button
                    type="button"
                    onClick={() => {
                      setInlineDescValue(selectedTask.description);
                      setIsInlineEditingDesc(true);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-2.5 h-2.5" /> Edit
                  </button>
                )}
              </div>

              {isInlineEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={inlineDescValue}
                    onChange={(e) => setInlineDescValue(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setIsInlineEditingDesc(false)}
                      disabled={isSavingInline}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      onClick={handleSaveInlineDesc}
                      isLoading={isSavingInline}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-border bg-card text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedTask.description || (
                    <span className="text-muted-foreground italic">No description provided.</span>
                  )}
                </div>
              )}
            </div>

            {/* Academic Context (only when linked) */}
            {selectedTask.academicContext && (
              <div className="p-3 rounded-lg border border-border bg-secondary/30 text-foreground space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Academic Context</span>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  {selectedTask.academicContext.className && (
                    <div>
                      Class:{" "}
                      <strong className="text-foreground font-medium">
                        {selectedTask.academicContext.className}
                        {selectedTask.academicContext.sectionName
                          ? ` · ${selectedTask.academicContext.sectionName}`
                          : ""}
                      </strong>
                    </div>
                  )}
                  {selectedTask.academicContext.subjectName && (
                    <div>
                      Subject:{" "}
                      <strong className="text-foreground font-medium">
                        {selectedTask.academicContext.subjectName}
                      </strong>
                    </div>
                  )}
                  {selectedTask.academicContext.examName && (
                    <div>
                      Exam:{" "}
                      <strong className="text-foreground font-medium">
                        {selectedTask.academicContext.examName}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Secondary Sections: Comments & Collapsible Activity Timeline */}
            <div className="pt-2 space-y-4 border-t border-border-subtle">
              {/* Comments Section */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Comments ({selectedTask.comments.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground py-2 italic">
                      No comments yet. Post an operational note below.
                    </p>
                  ) : (
                    selectedTask.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg border border-border bg-card space-y-1"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-foreground">{c.userName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {formatDate(c.createdAt, "dd MMM, HH:mm")}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-xs">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a remark or update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button size="xs" type="submit" leftIcon={<Send className="h-3 w-3" />}>
                    Send
                  </Button>
                </form>
              </div>

              {/* Collapsible Activity History */}
              <div className="border border-border/70 rounded-lg overflow-hidden bg-card">
                <button
                  type="button"
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-foreground bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Activity History ({selectedTask.activities?.length || 0})
                    </span>
                  </div>
                  {isActivityOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                {isActivityOpen && (
                  <div className="p-3 border-t border-border/60 space-y-2 max-h-64 overflow-y-auto">
                    {!selectedTask.activities || selectedTask.activities.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground py-1 italic">
                        No activity recorded yet.
                      </p>
                    ) : (
                      selectedTask.activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-2 rounded-md border border-border/60 bg-secondary/20 space-y-0.5 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground">
                              {act.actionType.replace(/_/g, " ")}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {formatDate(act.createdAt, "dd MMM yyyy, HH:mm")}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {act.details}
                          </p>
                          <div className="text-[10px] text-muted-foreground">
                            Actor: <span className="text-foreground font-medium">{act.userName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* 6. Edit Task Modal */}
      {isEditModalOpen && taskToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setTaskToEdit(null);
          }}
          title="Edit Task"
          description="Update task details, target schedule, and priority."
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
            {editErrorMessage && (
              <div className="p-2.5 rounded-md bg-destructive-subtle text-destructive border border-destructive-border flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{editErrorMessage}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-foreground mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Task Type *</label>
                <select
                  value={editFormData.taskType}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, taskType: e.target.value as TaskType })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                >
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Priority *</label>
                <select
                  value={editFormData.priority}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Scope & Deliverables *
              </label>
              <textarea
                rows={3}
                required
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setTaskToEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Delete Task Confirmation Modal */}
      {isDeleteModalOpen && taskToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
          }}
          title="Delete Task"
          description="Confirm institutional task deletion and archival."
          size="sm"
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-md border border-destructive-border bg-destructive-subtle text-destructive space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Confirm Deletion</span>
              </div>
              <p className="leading-relaxed">
                Delete task <strong className="font-semibold">"{taskToDelete.title}"</strong>?
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                Related remarks and timeline activities will be purged and an institutional audit entry archived.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTaskToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDeleteConfirm}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Searchable Reassign Task Modal */}
      {isReassignModalOpen && taskToReassign && (
        <Modal
          isOpen={isReassignModalOpen}
          onClose={() => {
            setIsReassignModalOpen(false);
            setTaskToReassign(null);
          }}
          title="Reassign Task"
          description={`Delegate or reassign "${taskToReassign.title}" to an authorized colleague.`}
          size="sm"
        >
          <form onSubmit={handleReassignSubmit} className="space-y-3.5 text-xs">
            {reassignErrorMessage && (
              <div className="p-2.5 rounded-md bg-destructive-subtle text-destructive border border-destructive-border flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{reassignErrorMessage}</span>
              </div>
            )}

            {/* Search faculty input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search faculty by name, subject, or role..."
                value={reassignSearch}
                onChange={(e) => setReassignSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Faculty selector list */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 border border-border rounded-lg p-2 bg-secondary/30">
              {/* Recommended Section */}
              {reassignFilteredGroups.recommended.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase font-semibold text-muted-foreground px-1">
                    Recommended
                  </div>
                  {reassignFilteredGroups.recommended.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                        selectedReassignUser === u.id
                          ? "border-primary bg-primary-subtle text-foreground"
                          : "border-border/60 bg-card hover:border-border text-foreground"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-medium text-xs text-foreground truncate">
                          {u.fullName} {u.id === currentUser.id ? "(Myself)" : ""}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {u.contextLabel ||
                            `${u.roleCode.replace(/_/g, " ")}${
                              u.departmentName ? ` · ${u.departmentName}` : ""
                            }`}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="reassignTarget"
                        value={u.id}
                        checked={selectedReassignUser === u.id}
                        onChange={() => setSelectedReassignUser(u.id)}
                        className="text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* All Faculty Section */}
              {reassignFilteredGroups.otherFaculty.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase font-semibold text-muted-foreground px-1">
                    All Faculty
                  </div>
                  {reassignFilteredGroups.otherFaculty.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                        selectedReassignUser === u.id
                          ? "border-primary bg-primary-subtle text-foreground"
                          : "border-border/60 bg-card hover:border-border text-foreground"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-medium text-xs text-foreground truncate">{u.fullName}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {u.contextLabel ||
                            `${u.roleCode.replace(/_/g, " ")}${
                              u.departmentName ? ` · ${u.departmentName}` : ""
                            }`}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="reassignTarget"
                        value={u.id}
                        checked={selectedReassignUser === u.id}
                        onChange={() => setSelectedReassignUser(u.id)}
                        className="text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                    </label>
                  ))}
                </div>
              )}

              {reassignFilteredGroups.recommended.length === 0 &&
                reassignFilteredGroups.otherFaculty.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No matching faculty members found.
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setTaskToReassign(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                disabled={
                  !selectedReassignUser ||
                  selectedReassignUser === taskToReassign.assigneeUserId
                }
              >
                Assign
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 9. Create Task Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Task"
          description="Create and assign an institutional task within authorized coordination scope."
          size="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
            {createErrorMessage && (
              <div className="p-2.5 rounded-md bg-destructive-subtle text-destructive border border-destructive-border flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createErrorMessage}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-foreground mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, title: e.target.value })
                }
                placeholder="e.g. Update Class 8-A Physics marks"
                className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Assign To *</label>
                <select
                  value={createFormData.assigneeUserId}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, assigneeUserId: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground font-medium"
                >
                  {Object.entries(groupedAssignableUsers).map(([groupTitle, userList]) => (
                    <optgroup key={groupTitle} label={groupTitle}>
                      {userList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} {st.contextLabel ? `— ${st.contextLabel}` : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Task Type *</label>
                <select
                  value={createFormData.taskType}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, taskType: e.target.value as TaskType })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                >
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Priority *</label>
                <select
                  value={createFormData.priority}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, dueDate: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Scope & Deliverables *
              </label>
              <textarea
                rows={3}
                required
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, description: e.target.value })
                }
                placeholder="Describe deliverables, guidelines, and context..."
                className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
