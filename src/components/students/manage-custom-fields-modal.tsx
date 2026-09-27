"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  HelpCircle,
  Lock,
  Layers,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { CustomFieldOption } from "./student-admission-dialog";

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  fieldType: string;
  options: string[];
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  isVisibleToAdmin: boolean;
  isVisibleToTeacher: boolean;
  isVisibleToParent: boolean;
  isVisibleToStudent: boolean;
  orderIndex: number;
  isActive: boolean;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: "Short Text",
  TEXTAREA: "Long Text / Notes",
  NUMBER: "Numeric Value",
  DATE: "Date Picker",
  DROPDOWN: "Single Select Dropdown",
  MULTI_SELECT: "Multi-Select Options",
  BOOLEAN: "Yes / No Toggle",
  PHONE: "Phone Number",
  EMAIL: "Email Address",
};

interface ManageCustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldsUpdated?: () => void;
  initialCreateMode?: boolean;
}

export function ManageCustomFieldsModal({
  isOpen,
  onClose,
  onFieldsUpdated,
  initialCreateMode = false,
}: ManageCustomFieldsModalProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(initialCreateMode);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    fieldType: "TEXT",
    optionsText: "Option 1, Option 2, Option 3",
    placeholder: "",
    helpText: "",
    isRequired: false,
    isVisibleToAdmin: true,
    isVisibleToTeacher: true,
    isVisibleToParent: false,
    isVisibleToStudent: false,
  });

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/students/custom-fields");
      if (res.ok) {
        const data = await res.json();
        setFields(data.customFields || []);
      }
    } catch (err) {
      console.error("Failed to load custom fields:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFields();
      if (initialCreateMode) {
        handleOpenAdd();
      } else {
        setIsEditorOpen(false);
        setEditingField(null);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialCreateMode]);

  const handleOpenAdd = () => {
    setEditingField(null);
    setFormData({
      name: "",
      key: "",
      fieldType: "TEXT",
      optionsText: "Option 1, Option 2, Option 3",
      placeholder: "",
      helpText: "",
      isRequired: false,
      isVisibleToAdmin: true,
      isVisibleToTeacher: true,
      isVisibleToParent: false,
      isVisibleToStudent: false,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      key: field.key,
      fieldType: field.fieldType,
      optionsText: Array.isArray(field.options) ? field.options.join(", ") : "",
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      isRequired: field.isRequired,
      isVisibleToAdmin: field.isVisibleToAdmin,
      isVisibleToTeacher: field.isVisibleToTeacher,
      isVisibleToParent: field.isVisibleToParent,
      isVisibleToStudent: field.isVisibleToStudent,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditorOpen(true);
  };

  const generateKeyFromName = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const optionsArray =
        formData.fieldType === "DROPDOWN" || formData.fieldType === "MULTI_SELECT"
          ? formData.optionsText
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : [];

      if (editingField) {
        // Update
        const res = await fetch(`/api/students/custom-fields/${editingField.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            fieldType: formData.fieldType,
            options: optionsArray,
            placeholder: formData.placeholder.trim() || null,
            helpText: formData.helpText.trim() || null,
            isRequired: formData.isRequired,
            isVisibleToAdmin: formData.isVisibleToAdmin,
            isVisibleToTeacher: formData.isVisibleToTeacher,
            isVisibleToParent: formData.isVisibleToParent,
            isVisibleToStudent: formData.isVisibleToStudent,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update custom field");

        setSuccessMessage(`Field '${formData.name}' updated successfully.`);
      } else {
        // Create
        const keyToUse = formData.key.trim() || generateKeyFromName(formData.name);
        if (!keyToUse) throw new Error("A unique field key is required.");

        const res = await fetch("/api/students/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            key: keyToUse,
            fieldType: formData.fieldType,
            options: optionsArray,
            placeholder: formData.placeholder.trim() || null,
            helpText: formData.helpText.trim() || null,
            isRequired: formData.isRequired,
            isVisibleToAdmin: formData.isVisibleToAdmin,
            isVisibleToTeacher: formData.isVisibleToTeacher,
            isVisibleToParent: formData.isVisibleToParent,
            isVisibleToStudent: formData.isVisibleToStudent,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create custom field");

        setSuccessMessage(`Custom field '${formData.name}' created successfully.`);
      }

      setIsEditorOpen(false);
      await fetchFields();
      if (onFieldsUpdated) onFieldsUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process custom field request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (field: CustomFieldDefinition) => {
    try {
      const res = await fetch(`/api/students/custom-fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !field.isActive }),
      });

      if (res.ok) {
        await fetchFields();
        if (onFieldsUpdated) onFieldsUpdated();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (field: CustomFieldDefinition) => {
    if (!confirm(`Are you sure you want to remove or deactivate field '${field.name}'? Existing student values will remain safely preserved.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/custom-fields/${field.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || `Custom field '${field.name}' processed.`);
        await fetchFields();
        if (onFieldsUpdated) onFieldsUpdated();
      } else {
        alert(data.error || "Failed to delete custom field");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Student Custom Fields"
      description="Configure institutional custom fields for student records, enrollment forms, and dossiers."
      size="xl"
    >
      <div className="space-y-6 text-xs">
        {/* Notification alerts */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Editor Form View */}
        {isEditorOpen ? (
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-foreground text-sm">
                  {editingField ? `Edit Field: ${editingField.name}` : "Create New Custom Field"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-foreground">
                    Field Label Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Transport Route, House, APAAR ID"
                    value={formData.name}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name: nameVal,
                        key: !editingField ? generateKeyFromName(nameVal) : prev.key,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-foreground">
                    Unique System Key <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingField}
                    placeholder="e.g. transport_route, apaar_id"
                    value={formData.key}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-mono disabled:opacity-60 focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-foreground">Data Type</label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fieldType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
                  >
                    {Object.entries(FIELD_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-foreground">Placeholder Hint</label>
                  <input
                    type="text"
                    placeholder="e.g. Select your designated bus route"
                    value={formData.placeholder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, placeholder: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Options for Dropdown / Multi-Select */}
              {(formData.fieldType === "DROPDOWN" || formData.fieldType === "MULTI_SELECT") && (
                <div className="space-y-1 p-3 rounded-xl bg-card border border-border">
                  <label className="block text-[11px] font-bold text-foreground">
                    Choice Options (Comma separated) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Route 1, Route 2, Route 3, Route 4"
                    value={formData.optionsText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, optionsText: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Separate each selectable choice with a comma.
                  </span>
                </div>
              )}

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded text-primary border-border focus:ring-primary"
                  />
                  <span className="font-semibold text-foreground">Mandatory / Required Field</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToTeacher}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isVisibleToTeacher: e.target.checked }))}
                    className="rounded text-primary border-border focus:ring-primary"
                  />
                  <span className="text-foreground">Visible to Class Teachers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToParent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isVisibleToParent: e.target.checked }))}
                    className="rounded text-primary border-border focus:ring-primary"
                  />
                  <span className="text-foreground">Visible to Parents</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {editingField ? "Save Field" : "Create Field"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* List of Custom Field Definitions */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Configured Institutional Fields ({fields.length})
                </span>
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenAdd}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Custom Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-card text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">No Custom Fields Configured</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-1">
                    Add custom fields like Transport Route, Student House, Previous School, or Scholarship Status to extend student records.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create First Custom Field
                </Button>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-card">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground">{field.name}</span>
                        <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground">
                          {field.key}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
                        </Badge>
                        {field.isRequired && (
                          <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {!field.isActive && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      {field.options && field.options.length > 0 && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          Options: {field.options.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(field)}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        {field.isActive ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <EyeOff className="w-3 h-3" /> Deactivate
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Eye className="w-3 h-3" /> Activate
                          </span>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(field)}
                        className="h-7 w-7 p-0"
                        title="Edit Field Definition"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(field)}
                        className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                        title="Delete / Deactivate"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground">
            Custom fields are scoped securely to your institution and apply to all student records.
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
