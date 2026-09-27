"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Check,
  Plus,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { CustomFieldOption } from "./student-admission-dialog";

interface AddCustomFieldValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  availableCustomFields: CustomFieldOption[];
  existingValues: Record<string, any>;
  initialFieldKey?: string | null;
  onSuccess: () => void;
  onOpenManageFields: () => void;
}

export function AddCustomFieldValueModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  availableCustomFields,
  existingValues,
  initialFieldKey,
  onSuccess,
  onOpenManageFields,
}: AddCustomFieldValueModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [value, setValue] = useState<any>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFields = availableCustomFields;

  useEffect(() => {
    if (isOpen) {
      const defaultKey = initialFieldKey || (activeFields.length > 0 ? activeFields[0].key : "");
      setSelectedKey(defaultKey);
      if (defaultKey) {
        setValue(existingValues[defaultKey] ?? "");
      } else {
        setValue("");
      }
      setError(null);
    }
  }, [isOpen, initialFieldKey, availableCustomFields, existingValues]);

  const handleFieldChange = (key: string) => {
    setSelectedKey(key);
    setValue(existingValues[key] ?? "");
    setError(null);
  };

  const currentField = activeFields.find((f) => f.key === selectedKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !currentField) {
      setError("Please select a custom field.");
      return;
    }

    if (currentField.isRequired && (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))) {
      setError(`Field '${currentField.name}' is mandatory.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customFieldValues: {
            [selectedKey]: value,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update custom field value");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save field value.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Custom Field — ${studentName}`}
      description="Assign or update institutional custom field values for this student."
      size="md"
    >
      <div className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeFields.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-border bg-card text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">No Custom Fields Configured</h4>
              <p className="text-muted-foreground text-xs mt-1">
                No custom field definitions have been created yet for your institution.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenManageFields();
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Custom Field
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-foreground">
                Select Custom Field <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedKey}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
              >
                {activeFields.map((f) => (
                  <option key={f.id} value={f.key}>
                    {f.name} {f.isRequired ? "(Required)" : ""}
                  </option>
                ))}
              </select>
              {currentField?.helpText && (
                <p className="text-[11px] text-muted-foreground">{currentField.helpText}</p>
              )}
            </div>

            {/* Value Input Based on Type */}
            {currentField && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-foreground">
                  {currentField.name} Value {currentField.isRequired && <span className="text-destructive">*</span>}
                </label>

                {currentField.fieldType === "DROPDOWN" ? (
                  <select
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
                  >
                    <option value="">-- Select {currentField.name} --</option>
                    {currentField.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : currentField.fieldType === "MULTI_SELECT" ? (
                  <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
                    <div className="flex flex-wrap gap-2">
                      {currentField.options?.map((opt) => {
                        let selectedArr: string[] = [];
                        try {
                          selectedArr = Array.isArray(value)
                            ? value
                            : typeof value === "string" && value.startsWith("[")
                            ? JSON.parse(value)
                            : value ? [value] : [];
                        } catch {
                          selectedArr = [];
                        }
                        const isChecked = selectedArr.includes(opt);

                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                              isChecked
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...selectedArr, opt]
                                  : selectedArr.filter((x) => x !== opt);
                                setValue(next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : currentField.fieldType === "BOOLEAN" ? (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setValue("true")}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        value === "true" || value === true
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Yes / Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("false")}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        value === "false" || value === false
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      No / Disabled
                    </button>
                  </div>
                ) : currentField.fieldType === "TEXTAREA" ? (
                  <textarea
                    rows={3}
                    placeholder={currentField.placeholder || `Enter ${currentField.name}...`}
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                ) : currentField.fieldType === "NUMBER" ? (
                  <input
                    type="number"
                    placeholder={currentField.placeholder || "0"}
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden font-mono"
                  />
                ) : currentField.fieldType === "DATE" ? (
                  <input
                    type="date"
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                ) : currentField.fieldType === "EMAIL" ? (
                  <input
                    type="email"
                    placeholder={currentField.placeholder || "email@domain.com"}
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={currentField.placeholder || `Enter ${currentField.name}...`}
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Save Field Value
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
