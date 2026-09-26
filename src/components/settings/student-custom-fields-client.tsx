"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  ArrowLeft,
  Sliders,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface CustomFieldItem {
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

export function StudentCustomFieldsClient({
  fields: initialFields,
}: {
  fields: CustomFieldItem[];
}) {
  const [fields, setFields] = useState<CustomFieldItem[]>(initialFields);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const router = useRouter();

  const handleOpenAddModal = () => {
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: CustomFieldItem) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      key: field.key,
      fieldType: field.fieldType,
      optionsText: field.options.join(", "),
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      isRequired: field.isRequired,
      isVisibleToAdmin: field.isVisibleToAdmin,
      isVisibleToTeacher: field.isVisibleToTeacher,
      isVisibleToParent: field.isVisibleToParent,
      isVisibleToStudent: field.isVisibleToStudent,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
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
        if (!res.ok) throw new Error(data.error || "Failed to update field.");

        setFields((prev) =>
          prev.map((f) => (f.id === editingField.id ? data.customField : f))
        );
      } else {
        // Create
        const res = await fetch("/api/students/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            key: formData.key.trim().toLowerCase(),
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
        if (!res.ok) throw new Error(data.error || "Failed to create field.");

        setFields((prev) => [...prev, data.customField]);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (field: CustomFieldItem) => {
    try {
      const res = await fetch(`/api/students/custom-fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !field.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setFields((prev) =>
          prev.map((f) => (f.id === field.id ? { ...f, isActive: !field.isActive } : f))
        );
      }
    } catch (err) {
      console.error("Toggle field status error:", err);
    }
  };

  const handleDeleteField = async (field: CustomFieldItem) => {
    if (!confirm(`Are you sure you want to remove '${field.name}'? Existing student values will be preserved.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/custom-fields/${field.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFields((prev) => prev.filter((f) => f.id !== field.id));
        router.refresh();
      }
    } catch (err) {
      console.error("Delete field error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A756B] hover:text-[#171614] mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Global Settings</span>
        </Link>

        <PageHeader
          eyebrow="INSTITUTIONAL SCHEMA EXTENSIONS"
          title="Student Custom Fields"
          description="Configure custom biographical, academic, and statutory attributes collected during student admission."
        >
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="h-3.5 w-3.5 text-[#D4B87C]" />}
          >
            Create Custom Field
          </Button>
        </PageHeader>
      </div>

      {/* Core vs Custom Fields Explanation Card */}
      <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#856D3B]" />
          <h3 className="text-sm font-bold text-[#171614]">Hybrid Field Architecture</h3>
        </div>
        <p className="text-xs text-[#7A756B] leading-relaxed">
          Nexora combines <strong>Fixed Strongly-Typed Core Fields</strong> (Names, DOB, Gender, Guardians, Cohorts, Roll Numbers) with <strong>Institution-Specific Custom Attributes</strong> (e.g. APAAR ID, Scholarship Tier, Transport Stop, Hostel Needs). Configured fields appear seamlessly in the New Student Admission workflow and student dossiers.
        </p>
      </div>

      {/* Custom Fields List */}
      <div className="rounded-3xl border border-[#E5E0D5] bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#EFECE3] bg-[#FAF8F3] flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A756B]">
            Configured Fields ({fields.length})
          </span>
          <span className="text-[11px] text-[#7A756B]">
            Tenant Isolated • Scope: Active Institution
          </span>
        </div>

        {fields.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7A756B] font-mono space-y-3">
            <p>No custom fields configured yet for this institution.</p>
            <Button size="sm" variant="outline" onClick={handleOpenAddModal}>
              + Define First Custom Field
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE3]">
            {fields.map((field) => (
              <div
                key={field.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-[#171614]">{field.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/30 font-bold">
                      {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
                    </span>
                    {field.isRequired ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF8F3] text-[#7A756B] border border-[#DCD7CB]">
                        Optional
                      </span>
                    )}
                    {!field.isActive && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A756B] font-mono">
                    Key: <strong className="text-[#171614]">{field.key}</strong>
                    {field.placeholder ? ` · Placeholder: "${field.placeholder}"` : ""}
                  </p>
                  {field.options && field.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {field.options.map((opt, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E0D5] text-[#35322C]"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(field)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                      field.isActive
                        ? "bg-[#F4F6F1] text-[#525E4B] border-[#65705B]/30"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {field.isActive ? "Active" : "Disabled"}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditModal(field)}
                    leftIcon={<Edit2 className="h-3 w-3" />}
                  >
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(field)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Field Definition Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingField ? `Edit '${editingField.name}'` : "Create Student Custom Field"}
          description="Define a new institution-scoped candidate attribute for admission workflows."
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Field Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      name: val,
                      key: editingField ? formData.key : generateKeyFromName(val),
                    });
                  }}
                  placeholder="e.g. APAAR ID or Hostel Required"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Field Database Key *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingField}
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g. apaar_id"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono text-[#171614] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Field Input Type *
                </label>
                <select
                  value={formData.fieldType}
                  onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="TEXTAREA">Long Text / Paragraph</option>
                  <option value="NUMBER">Number</option>
                  <option value="DATE">Date Picker</option>
                  <option value="DROPDOWN">Single Select Dropdown</option>
                  <option value="MULTI_SELECT">Multi-Select Checkboxes</option>
                  <option value="BOOLEAN">Yes / No Toggle</option>
                  <option value="PHONE">Phone Number</option>
                  <option value="EMAIL">Email Address</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="e.g. Enter 12-digit ID"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            {(formData.fieldType === "DROPDOWN" || formData.fieldType === "MULTI_SELECT") && (
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Dropdown Choices (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.optionsText}
                  onChange={(e) => setFormData({ ...formData, optionsText: e.target.value })}
                  placeholder="e.g. Day Scholar, Hostel Resident, Transport Route A"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-[#171614] mb-1">
                Help / Context Subtext
              </label>
              <input
                type="text"
                value={formData.helpText}
                onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                placeholder="e.g. Issued by Ministry of Education"
                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
              />
            </div>

            <div className="pt-2 border-t border-[#EFECE3] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#171614]">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded border-[#DCD7CB] text-[#171614] focus:ring-[#B89B62]"
                />
                Mandatory Field (Required for Admission Completion)
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[#555047]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToTeacher}
                    onChange={(e) => setFormData({ ...formData, isVisibleToTeacher: e.target.checked })}
                    className="rounded border-[#DCD7CB] text-[#171614]"
                  />
                  Visible to Faculty & Teachers
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisibleToParent}
                    onChange={(e) => setFormData({ ...formData, isVisibleToParent: e.target.checked })}
                    className="rounded border-[#DCD7CB] text-[#171614]"
                  />
                  Visible in Parent Portal
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EFECE3]">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                {editingField ? "Save Changes" : "Create Field"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
