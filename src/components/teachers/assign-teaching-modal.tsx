"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, Award, Loader2, Sparkles } from "lucide-react";

interface AssignTeachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: string;
  };
  onSuccess: () => void;
}

export function AssignTeachingModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: AssignTeachingModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available classes & subjects in institution
  const [classes, setClasses] = useState<any[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);
  const [currentClassTeacherOf, setCurrentClassTeacherOf] = useState<any[]>([]);

  // Form states for adding a subject assignment
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Form states for assigning as Class Teacher
  const [homeroomClassId, setHomeroomClassId] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, staff.id]);

  const loadData = async () => {
    try {
      setFetching(true);
      setErrorMessage(null);
      // Fetch classes & subjects
      const classRes = await fetch("/api/academics/classes");
      if (classRes.ok) {
        const clsData = await classRes.json();
        setClasses(clsData.data || clsData || []);
      }

      // Fetch current assignments for this teacher
      const assignRes = await fetch(`/api/teachers/${staff.id}/assignments`);
      if (assignRes.ok) {
        const data = await assignRes.json();
        setCurrentAssignments(data.assignments || []);
        setCurrentClassTeacherOf(data.classTeacherOf || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load academic records");
    } finally {
      setFetching(false);
    }
  };

  const selectedClassObj = classes.find((c) => c.id === selectedClassId);

  const handleAddAssignment = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      setErrorMessage("Please select both a class and a subject");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_SUBJECT",
          classId: selectedClassId,
          subjectId: selectedSubjectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign subject");

      setSelectedClassId("");
      setSelectedSubjectId("");
      loadData();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to assign subject");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_SUBJECT",
          assignmentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove assignment");

      loadData();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHomeroom = async () => {
    if (!homeroomClassId) {
      setErrorMessage("Please select a class for homeroom incharge");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_HOMEROOM",
          classId: homeroomClassId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign homeroom");

      setHomeroomClassId("");
      loadData();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to assign homeroom");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHomeroom = async (classId: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/teachers/${staff.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_HOMEROOM",
          classId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove homeroom assignment");

      loadData();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove homeroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academic & Teaching Assignments"
      description={`Manage subject teaching and homeroom incharge duties for ${staff.fullName}.`}
      size="lg"
    >
      {fetching ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading academic relationships...</p>
        </div>
      ) : (
        <div className="space-y-5 py-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Section 1: Homeroom / Class Teacher */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Class Teacher / Homeroom Incharge</span>
            </div>

            {currentClassTeacherOf.length > 0 ? (
              <div className="space-y-2">
                {currentClassTeacherOf.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">
                        {c.name} {c.section ? `• Sec ${c.section}` : ""}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        (Room: {c.roomNumber || "N/A"})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHomeroom(c.id)}
                      disabled={loading}
                      className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Not currently assigned as homeroom teacher for any class.
              </p>
            )}

            <div className="flex items-end gap-2 pt-2 border-t border-border/50">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Assign Class / Section Incharge
                </label>
                <select
                  value={homeroomClassId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHomeroomClassId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select class/section</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.section ? `(Sec ${cls.section})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAssignHomeroom}
                disabled={!homeroomClassId || loading}
                className="h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Assign
              </Button>
            </div>
          </div>

          {/* Section 2: Subject Assignments */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Subject & Course Allocations</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {currentAssignments.length} Assigned
              </span>
            </div>

            {currentAssignments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">
                        {a.subject?.name || "Subject"}
                      </span>
                      <span className="font-mono text-muted-foreground ml-1.5">
                        ({a.subject?.code || "SUB"})
                      </span>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Class: {a.class?.name} {a.class?.section ? `(Sec ${a.class.section})` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.id)}
                      disabled={loading}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active subject teaching assignments found for this staff member.
              </p>
            )}

            {/* Add New Subject Assignment */}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Add New Teaching Assignment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSubjectId("");
                  }}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground font-semibold"
                >
                  <option value="">1. Select Class/Program</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.section ? `(Sec ${cls.section})` : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubjectId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubjectId(e.target.value)}
                  disabled={!selectedClassId}
                  className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground font-semibold disabled:opacity-50"
                >
                  <option value="">
                    {selectedClassId ? "2. Select Subject" : "Select class first"}
                  </option>
                  {selectedClassObj?.subjects &&
                    selectedClassObj.subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddAssignment}
                  disabled={!selectedClassId || !selectedSubjectId || loading}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Subject Assignment
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
