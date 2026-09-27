"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, GraduationCap, Sparkles } from "lucide-react";

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: {
    id: string;
    name: string;
    code: string;
    level: string;
    durationYears?: number | null;
    type?: string | null;
    departmentId?: string | null;
    isActive?: boolean;
    academicYearId?: string;
  };
  departments: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  onSuccess: () => void;
}

export function EditProgramModal({
  isOpen,
  onClose,
  program,
  departments,
  academicYears,
  onSuccess,
}: EditProgramModalProps) {
  const [formData, setFormData] = useState({
    name: program.name || "",
    code: program.code || "",
    level: program.level || "UNDERGRADUATE",
    departmentId: program.departmentId || "",
    durationYears: program.durationYears || 1,
    type: program.type || "ANNUAL",
    isActive: program.isActive ?? true,
    academicYearId: program.academicYearId || academicYears[0]?.id || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: program.name || "",
        code: program.code || "",
        level: program.level || "UNDERGRADUATE",
        departmentId: program.departmentId || "",
        durationYears: program.durationYears || 1,
        type: program.type || "ANNUAL",
        isActive: program.isActive ?? true,
        academicYearId: program.academicYearId || academicYears[0]?.id || "",
      });
      setError(null);
    }
  }, [isOpen, program, academicYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError("Program name and code are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          level: formData.level,
          departmentId: formData.departmentId || null,
          durationYears: Number(formData.durationYears) || 1,
          type: formData.type,
          isActive: formData.isActive,
          academicYearId: formData.academicYearId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update program.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save program changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Program — ${program.name}`}
      description="Update academic title, code, department affiliation, level, and operational status."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">
              Program / Course Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. B.Tech Computer Science or Grade 10"
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">
              Program Code <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BTECH-CSE or G10"
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Academic Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              <option value="PRIMARY">Primary (Grades 1-5)</option>
              <option value="MIDDLE">Middle School (Grades 6-8)</option>
              <option value="SECONDARY">Secondary (Grades 9-10)</option>
              <option value="HIGHER_SECONDARY">Higher Secondary (11-12)</option>
              <option value="UNDERGRADUATE">Undergraduate (Degree)</option>
              <option value="POSTGRADUATE">Postgraduate (Master&apos;s)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Department</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              <option value="">-- General / No Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Curriculum Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              <option value="ANNUAL">Annual Academic Term</option>
              <option value="SEMESTER">Semester Model</option>
              <option value="TRIMESTER">Trimester Model</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Program Duration (Years)</label>
            <input
              type="number"
              min={1}
              max={6}
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Operational Status</label>
            <select
              value={formData.isActive ? "ACTIVE" : "INACTIVE"}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "ACTIVE" })}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              <option value="ACTIVE">Active (Available for Enrollment)</option>
              <option value="INACTIVE">Inactive / Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Check className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
