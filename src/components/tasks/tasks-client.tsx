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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
  dueDate?: Date | string | null;
  assigneeName?: string | null;
  assigneeRole?: string | null;
  creatorName: string;
  departmentName?: string | null;
  comments: Array<{
    id: string;
    userName: string;
    comment: string;
    createdAt: Date | string;
  }>;
}

export function TasksClient({
  tasks,
  staffList,
  departments,
  canCreate,
}: {
  tasks: TaskItem[];
  staffList: Array<{ id: string; fullName: string; roleCode: string }>;
  departments: Array<{ id: string; name: string }>;
  canCreate: boolean;
}) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeUserId: staffList[0]?.id || "",
    departmentId: departments[0]?.id || "",
    priority: "HIGH",
    dueDate: "2026-10-10",
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
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      router.refresh();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus as any });
      }
    } catch (err) {
      console.error("Task update error:", err);
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
              userName: data.comment.user.fullName,
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
        router.refresh();
      }
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="OPERATIONAL GOVERNANCE"
        title="Management & Academic Tasks"
        description="Coordinate institutional workflows, department action items, assessment blueprints, and faculty deliverables."
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

      {/* Editorial Task Board Matrix */}
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
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E7DF]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {meta.num}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-[#FAF9F5] border border-[#E8E7DF] px-2 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#E8E7DF] text-center text-xs text-slate-400">
                    No tasks in this lane.
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="cursor-pointer rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs hover:border-slate-400 transition-editorial space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            t.priority === "URGENT" || t.priority === "HIGH"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : t.priority === "MEDIUM"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Due {formatDate(t.dueDate, "dd MMM")}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#0F172A] leading-snug group-hover:text-[#1E3A8A] transition-colors">
                        {t.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E7DF]/70 text-[11px] text-slate-500 font-medium">
                        <span className="truncate">{t.assigneeName || "Unassigned"}</span>
                        {t.comments.length > 0 && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            {t.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details & Comments Drawer */}
      {selectedTask && (
        <Drawer
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          subtitle={`Created by ${selectedTask.creatorName} • Due ${formatDate(selectedTask.dueDate)}`}
          width="xl"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
              Close Panel
            </Button>
          }
        >
          <div className="space-y-6 text-xs">
            {/* Status & Assignee Bar */}
            <div className="p-4 rounded-xl border border-[#E8E7DF] bg-[#FAF9F5] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Workflow Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                  className="rounded-lg border border-[#E8E7DF] bg-white px-2.5 py-1 text-xs font-bold text-[#0F172A]"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400">Assigned To: </span>
                <span className="font-bold text-[#0F172A]">
                  {selectedTask.assigneeName} ({selectedTask.assigneeRole})
                </span>
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-[#0F172A] uppercase font-mono text-[10px] tracking-wider">
                Scope of Work & Deliverables
              </h5>
              <div className="p-4 rounded-xl border border-[#E8E7DF] bg-white leading-relaxed text-slate-700 shadow-2xs">
                {selectedTask.description}
              </div>
            </div>

            {/* Discussion & Activity Trail */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-2">
                <h5 className="font-bold text-[#0F172A] uppercase font-mono text-[10px] tracking-wider">
                  Activity Trail & Remarks ({selectedTask.comments.length})
                </h5>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedTask.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No remarks logged yet.</p>
                ) : (
                  selectedTask.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-white border border-[#E8E7DF] space-y-1 shadow-2xs"
                    >
                      <div className="flex justify-between font-semibold">
                        <span className="text-[#0F172A]">{c.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDate(c.createdAt, "dd MMM, HH:mm")}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{c.comment}</p>
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
                  className="flex-1 rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
                <Button size="sm" type="submit" leftIcon={<Send className="h-3 w-3" />}>
                  Post Remark
                </Button>
              </form>
            </div>
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
              <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Grade 10 Pre-Board Assessment Blueprint"
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignee Faculty *</label>
                <select
                  value={formData.assigneeUserId}
                  onChange={(e) => setFormData({ ...formData, assigneeUserId: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.roleCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scope of Work & Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Scope of work, deliverables, and departmental guidelines..."
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E7DF]">
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
