"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Trash2 } from "lucide-react";

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    name: string;
    capacity: number;
    roomNumber?: string | null;
    classTeacherId?: string | null;
    programName?: string;
  };
  teachers?: Array<{ id: string; fullName: string; employeeId?: string; designation?: string | null }>;
  onSuccess: () => void;
  onDelete?: () => void;
}

export function EditSectionModal({
  isOpen,
  onClose,
  section,
  teachers = [],
  onSuccess,
  onDelete,
}: EditSectionModalProps) {
  const [name, setName] = useState(section.name || "");
  const [capacity, setCapacity] = useState(section.capacity || 40);
  const [roomNumber, setRoomNumber] = useState(section.roomNumber || "");
  const [classTeacherId, setClassTeacherId] = useState(section.classTeacherId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(section.name || "");
      setCapacity(section.capacity || 40);
      setRoomNumber(section.roomNumber || "");
      setClassTeacherId(section.classTeacherId || "");
      setError(null);
    }
  }, [isOpen, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Section name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().toUpperCase(),
          capacity: Number(capacity) || 40,
          roomNumber: roomNumber.trim() || null,
          classTeacherId: classTeacherId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update section.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update section.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Section ${section.name}`}
      description={`Update configuration, room allocation, capacity, and tutor for ${section.programName || "this section"}.`}
      size="md"
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
              Section Identifier <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="e.g. A, B, or Honors"
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono uppercase focus:ring-1 focus:ring-primary outline-hidden"
            />
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-foreground">Room / Venue</label>
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

        <div className="flex items-center justify-between pt-3 border-t border-border">
          {onDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Section
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Check className="w-3.5 h-3.5" />}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
