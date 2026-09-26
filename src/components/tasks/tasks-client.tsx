"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Building,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  History,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface TaskActivityItem {
  id: string;
  userName: string;
  actionType: string;
  details: string;
  fromValue?: string | null;
  toValue?: string | null;
  createdAt: Date | string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
  dueDate?: Date | string | null;
  assigneeUserId?: string | null;
  assigneeName?: string | null;
  assigneeRole?: string | null;
  creatorName: string;
  departmentName?: string | null;
  createdAt?: Date | string;
  completedAt?: Date | string | null;
  reopenedAt?: Date | string | null;
  comments: Array<{
    id: string;
    userName: string;
    comment: string;
    createdAt: Date | string;
  }>;
  activities?: TaskActivityItem[];
}

export function TasksClient({
  tasks,
  staffList,
  departments,
  canCreate,
  canReassign = true,
}: {
  tasks: TaskItem[];
  staffList: Array<{ id: string; fullName: string; roleCode: string }>;
  departments: Array<{ id: string; name: string }>;
  canCreate: boolean;
  canReassign?: boolean;
}) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reassignUserId, setReassignUserId] = useState("");
  const [activeTab, setActiveTab] = useState<"DETAILS" | "ACTIVITY" | "COMMENTS">("DETAILS");
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeUserId: staffList[0]?.id || "",
    departmentId: departments[0]?.id || "",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const columns: Array<"TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"> = [
    "TODO",
    "IN_PROGRESS",
    "BLOCKED",
    "COMPLETED",
  ];

  const colMeta: Record<string, { label: string; num: string; badge: "neutral" | "warning" | "danger" | "success" }> = {
    TODO: { label: "To Do", num: "01", badge: "neutral" },
    IN_PROGRESS: { label: "In Progress", num: "02", badge: "warning" },
    BLOCKED: { label: "Blocked / Review", num: "03", badge: "danger" },
    COMPLETED: { label: "Completed", num: "04", badge: "success" },
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: newStatus as any,
            activities: data.task.activities
              ? data.task.activities.map((a: any) => ({
                  id: a.id,
                  userName: a.user?.fullName || "Staff",
                  actionType: a.actionType,
                  details: a.details,
                  fromValue: a.fromValue,
                  toValue: a.toValue,
                  createdAt: a.createdAt,
                }))
              : selectedTask.activities,
          });
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, priority: newPriority }),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            priority: newPriority as any,
            activities: data.task.activities
              ? data.task.activities.map((a: any) => ({
                  id: a.id,
                  userName: a.user?.fullName || "Staff",
                  actionType: a.actionType,
                  details: a.details,
                  fromValue: a.fromValue,
                  toValue: a.toValue,
                  createdAt: a.createdAt,
                }))
              : selectedTask.activities,
          });
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Priority update error:", err);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !reassignUserId) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selectedTask.id, assigneeUserId: reassignUserId }),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        const newAssignee = staffList.find((s) => s.id === reassignUserId);
        setSelectedTask({
          ...selectedTask,
          assigneeUserId: reassignUserId,
          assigneeName: newAssignee?.fullName || selectedTask.assigneeName,
          assigneeRole: newAssignee?.roleCode || selectedTask.assigneeRole,
          activities: data.task.activities
            ? data.task.activities.map((a: any) => ({
                id: a.id,
                userName: a.user?.fullName || "Staff",
                actionType: a.actionType,
                details: a.details,
                fromValue: a.fromValue,
                toValue: a.toValue,
                createdAt: a.createdAt,
              }))
            : selectedTask.activities,
        });
        setReassignUserId("");
        router.refresh();
      }
    } catch (err) {
      console.error("Reassign error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    try {
      const res = await fetch("/api/tasks/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTask({
          ...selectedTask,
          comments: [
            ...selectedTask.comments,
            {
              id: data.comment.id,
              userName: data.comment.user?.fullName || "Staff",
              comment: data.comment.comment,
              createdAt: data.comment.createdAt,
            },
          ],
        });
        setNewComment("");
        router.refresh();
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setFormData({
          title: "",
          description: "",
          assigneeUserId: staffList[0]?.id || "",
          departmentId: departments[0]?.id || "",
          priority: "HIGH",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <PageHeader
        category="Operational Governance"
        title="Management & Academic Tasks"
        description="Coordinate institutional workflows, department action items, assessment blueprints, and faculty deliverables with full lifecycle auditing."
        actions={
          canCreate ? (
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create Task
            </Button>
          ) : undefined
        }
      />

      {/* Task Board Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const meta = colMeta[col];

          return (
            <div
              key={col}
              className="space-y-3 flex flex-col min-h-[550px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#65705B]">
                    {meta.num}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#171614]">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#171614] bg-[#FAF8F3] border border-[#E5E0D5] px-2 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-center text-xs text-[#65705B]">
                    No tasks in this lane.
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTask(t);
                        setReassignUserId(t.assigneeUserId || "");
                      }}
                      className="cursor-pointer rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs hover:border-[#171614] transition-colors space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            t.priority === "URGENT" || t.priority === "HIGH"
                              ? "bg-[#8B3A3A]/10 text-[#8B3A3A] border border-[#8B3A3A]/20"
                              : t.priority === "MEDIUM"
                              ? "bg-[#B89B62]/10 text-[#B89B62] border border-[#B89B62]/20"
                              : "bg-[#FAF8F3] text-[#65705B] border border-[#E5E0D5]"
                          }`}
                        >
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-[10px] font-mono text-[#65705B]">
                            Due {formatDate(t.dueDate, "dd MMM")}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#171614] leading-snug group-hover:text-[#B89B62] transition-colors">
                        {t.title}
                      </h4>

                      <p className="text-[11px] text-[#65705B] line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D5] text-[11px] text-[#65705B] font-medium">
                        <span className="truncate">{t.assigneeName || "Unassigned"}</span>
                        <div className="flex items-center gap-2">
                          {t.activities && t.activities.length > 0 && (
                            <span className="flex items-center gap-0.5 font-mono text-[10px] text-[#65705B]">
                              <History className="h-3 w-3" />
                              {t.activities.length}
                            </span>
                          )}
                          {t.comments.length > 0 && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-[#65705B]">
                              <MessageSquare className="h-3 w-3" />
                              {t.comments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details, Activity & Reassignment Drawer */}
      {selectedTask && (
        <Drawer
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          subtitle={`Created by ${selectedTask.creatorName} • Due ${formatDate(selectedTask.dueDate)}`}
          width="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {selectedTask.status !== "COMPLETED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#525E4B] text-[#525E4B] hover:bg-[#525E4B]/10"
                    onClick={() => handleStatusChange(selectedTask.id, "COMPLETED")}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    Mark as Completed
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedTask.id, "IN_PROGRESS")}
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Reopen Task
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                Close Panel
              </Button>
            </div>
          }
        >
          <div className="space-y-6 text-xs">
            {/* Drawer Tabs */}
            <div className="flex border-b border-[#E5E0D5] gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("DETAILS")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                  activeTab === "DETAILS"
                    ? "border-[#171614] text-[#171614]"
                    : "border-transparent text-[#7A756B] hover:text-[#171614]"
                }`}
              >
                Overview & Assignment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ACTIVITY")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "ACTIVITY"
                    ? "border-[#171614] text-[#171614]"
                    : "border-transparent text-[#7A756B] hover:text-[#171614]"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activity Timeline ({selectedTask.activities?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("COMMENTS")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "COMMENTS"
                    ? "border-[#171614] text-[#171614]"
                    : "border-transparent text-[#7A756B] hover:text-[#171614]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Remarks ({selectedTask.comments.length})</span>
              </button>
            </div>

            {activeTab === "DETAILS" && (
              <div className="space-y-6">
                {/* Status & Priority Control Bar */}
                <div className="p-4 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#7A756B] font-bold block mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                      className="w-full rounded-lg border border-[#E5E0D5] bg-white px-2.5 py-1.5 text-xs font-bold text-[#171614]"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked / Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#7A756B] font-bold block mb-1">
                      Task Priority
                    </label>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => handlePriorityChange(selectedTask.id, e.target.value)}
                      className="w-full rounded-lg border border-[#E5E0D5] bg-white px-2.5 py-1.5 text-xs font-bold text-[#171614]"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Reassignment Section */}
                {canReassign && (
                  <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#856D3B]" />
                        <h5 className="font-bold text-[#171614] uppercase font-mono text-[10px] tracking-wider">
                          Assignee & Delegation
                        </h5>
                      </div>
                      <span className="text-[11px] text-[#7A756B]">
                        Current: <strong className="text-[#171614]">{selectedTask.assigneeName || "Unassigned"}</strong>
                      </span>
                    </div>

                    <form onSubmit={handleReassign} className="flex gap-2 items-center">
                      <select
                        value={reassignUserId || selectedTask.assigneeUserId || ""}
                        onChange={(e) => setReassignUserId(e.target.value)}
                        className="flex-1 rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] px-3 py-2 text-xs text-[#171614]"
                      >
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.fullName} ({st.roleCode})
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={!reassignUserId || reassignUserId === selectedTask.assigneeUserId}
                      >
                        Reassign
                      </Button>
                    </form>
                  </div>
                )}

                {/* Scope of Work */}
                <div className="space-y-1.5">
                  <h5 className="font-bold text-[#171614] uppercase font-mono text-[10px] tracking-wider">
                    Scope of Work & Deliverables
                  </h5>
                  <div className="p-4 rounded-xl border border-[#E5E0D5] bg-white leading-relaxed text-[#171614] shadow-xs">
                    {selectedTask.description}
                  </div>
                </div>

                {/* Meta Details */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] text-[11px]">
                  <div>
                    <span className="text-[#7A756B] block">Created By</span>
                    <span className="font-bold text-[#171614]">{selectedTask.creatorName}</span>
                  </div>
                  <div>
                    <span className="text-[#7A756B] block">Target Due Date</span>
                    <span className="font-bold text-[#171614]">{formatDate(selectedTask.dueDate)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ACTIVITY" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-2">
                  <h5 className="font-bold text-[#171614] uppercase font-mono text-[10px] tracking-wider">
                    Task Lifecycle & Activity Timeline
                  </h5>
                  <span className="text-[10px] font-mono text-[#7A756B]">Append-only institutional log</span>
                </div>

                {(!selectedTask.activities || selectedTask.activities.length === 0) ? (
                  <div className="p-6 text-center text-xs text-[#7A756B] bg-[#FAF8F3] rounded-xl border border-[#E5E0D5]">
                    <History className="w-5 h-5 mx-auto mb-1.5 text-[#A8A398]" />
                    <p className="font-medium text-[#555047]">No lifecycle events recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTask.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-white border border-[#E5E0D5] space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                act.actionType === "COMPLETED"
                                  ? "bg-[#525E4B]"
                                  : act.actionType === "REASSIGNED"
                                  ? "bg-[#856D3B]"
                                  : act.actionType === "PRIORITY_CHANGED"
                                  ? "bg-[#8B3A3A]"
                                  : "bg-[#171614]"
                              }`}
                            />
                            <span className="font-bold text-[#171614] text-xs">
                              {act.actionType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#7A756B]">
                            {formatDate(act.createdAt, "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                        <p className="text-xs text-[#555047] pl-4">{act.details}</p>
                        <div className="pl-4 text-[10px] font-mono text-[#7A756B]">
                          Logged by: <strong className="text-[#171614]">{act.userName}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "COMMENTS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-2">
                  <h5 className="font-bold text-[#171614] uppercase font-mono text-[10px] tracking-wider">
                    Discussion & Activity Trail ({selectedTask.comments.length})
                  </h5>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-xs text-[#65705B] py-2">No remarks logged yet.</p>
                  ) : (
                    selectedTask.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg bg-white border border-[#E5E0D5] space-y-1 shadow-xs"
                      >
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#171614]">{c.userName}</span>
                          <span className="text-[10px] font-mono text-[#65705B]">
                            {formatDate(c.createdAt, "dd MMM, HH:mm")}
                          </span>
                        </div>
                        <p className="text-[#171614] leading-relaxed">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Post operational remark or deliverable update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                  />
                  <Button size="sm" type="submit" leftIcon={<Send className="h-3 w-3" />}>
                    Post Remark
                  </Button>
                </form>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Management Task"
          description="Assign institutional task to faculty member or department head."
          size="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#171614] mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Grade 10 Pre-Board Assessment Blueprint"
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Assignee Faculty *</label>
                <select
                  value={formData.assigneeUserId}
                  onChange={(e) => setFormData({ ...formData, assigneeUserId: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.roleCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#171614] mb-1">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#171614] mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171614] mb-1">Scope of Work & Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Scope of work, deliverables, and departmental guidelines..."
                className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Create & Assign Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
