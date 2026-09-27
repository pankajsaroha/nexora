"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Users, Check } from "lucide-react";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Array<{ id: string; name: string; code: string }>;
  defaultProgramId?: string;
  teachers?: Array<{ id: string; fullName: string; employeeId?: string; designation?: string | null }>;
  onSuccess: () => void;
}

export function AddSectionModal({
  isOpen,
  onClose,
  programs,
  defaultProgramId,
  teachers = [],
  onSuccess,
}: AddSectionModalProps) {
  const [classId, setClassId] = useState(defaultProgramId || programs[0]?.id || "");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [roomNumber, setRoomNumber] = useState("");
  const [classTeacherId, setClassTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setClassId(defaultProgramId || programs[0]?.id || "");
      setName("");
      setCapacity(40);
      setRoomNumber("");
      setClassTeacherId("");
      setError(null);
    }
  }, [isOpen, defaultProgramId, programs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setError("Please select a program / class.");
      return;
    }
    if (!name.trim()) {
      setError("Section name is required (e.g. A, B, or Honors).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          name: name.trim().toUpperCase(),
          capacity: Number(capacity) || 40,
          roomNumber: roomNumber.trim() || null,
          classTeacherId: classTeacherId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create section.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create section.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProgram = programs.find((p) => p.id === classId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedProgram ? `Add Section to ${selectedProgram.name}` : "Add Academic Section"}
      description="Create a new student section/cohort with seat capacity, designated room, and assigned tutor."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!defaultProgramId && (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">
              Select Program / Course <span className="text-destructive">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">
              Section Name / Identifier <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="e.g. A, B, C, or CSE-1"
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
            <span className="text-[10px] text-muted-foreground">Unique identifier within this program.</span>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">
              Student Capacity <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={300}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 40)}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono focus:ring-1 focus:ring-primary outline-hidden"
            />
            <span className="text-[10px] text-muted-foreground">Maximum enrollment intake limit.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Assigned Room / Venue</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Room 302, Lab 4"
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Class Teacher / Tutor</label>
            <select
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer font-medium"
            >
              <option value="">-- Unassigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} {t.employeeId ? `(${t.employeeId})` : ""} {t.designation ? `— ${t.designation}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-3.5 h-3.5" />} >
            Create Section
          </Button>
        </div>
      </form>
    </Modal>
  );
}
