"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  Plus,
  BookOpen,
  Layers,
  Search,
  Download,
  CreditCard,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  level: string;
  durationYears?: number | null;
  type?: string | null;
  departmentName?: string | null;
  departmentId?: string | null;
  academicYearName?: string | null;
  sections: Array<{
    id: string;
    name: string;
    roomNumber?: string | null;
    capacity: number;
    classTeacherName?: string | null;
    studentsCount: number;
  }>;
  feeStructures: Array<{
    id: string;
    categoryName: string;
    amount: number;
    frequency: string;
  }>;
  totalFee: number;
}

export function ClassesClient({
  classes,
  departments,
  academicYears,
}: {
  classes: ClassItem[];
  departments: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Program / Course Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: "SECONDARY", // PRIMARY, MIDDLE, SECONDARY, HIGHER_SECONDARY, UNDERGRADUATE, POSTGRADUATE
    departmentId: departments[0]?.id || "",
    durationYears: 1,
    type: "ANNUAL",
    sections: "A, B",
    academicYearId: academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || "",
    feeItems: [
      { categoryName: "Tuition Fee", amount: 60000, frequency: "ANNUAL" },
      { categoryName: "Examination Fee", amount: 5000, frequency: "ANNUAL" },
    ],
  });

  const router = useRouter();

  const totalSections = classes.reduce((acc, c) => acc + c.sections.length, 0);
  const totalEnrolled = classes.reduce(
    (acc, c) => acc + c.sections.reduce((sAcc, s) => sAcc + s.studentsCount, 0),
    0
  );

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.sections.some(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.classTeacherName && s.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = Array.from(new Set(classes.map((c) => c.level)));

  const handleExport = () => {
    const csvRows = [
      ["Program / Class Name", "Code", "Level", "Department", "Section", "Room", "Capacity", "Enrolled", "Tutor", "Total Annual Fee"],
    ];
    classes.forEach((c) => {
      c.sections.forEach((s) => {
        csvRows.push([
          c.name,
          c.code,
          c.level,
          c.departmentName || "General",
          s.name,
          s.roomNumber || "Main",
          String(s.capacity),
          String(s.studentsCount),
          s.classTeacherName || "Unassigned",
          String(c.totalFee),
        ]);
      });
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "academic_programs_blueprint.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddFeeItem = () => {
    setFormData({
      ...formData,
      feeItems: [
        ...formData.feeItems,
        { categoryName: "Lab / Activity Fee", amount: 10000, frequency: "ANNUAL" },
      ],
    });
  };

  const handleRemoveFeeItem = (idx: number) => {
    setFormData({
      ...formData,
      feeItems: formData.feeItems.filter((_, i) => i !== idx),
    });
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage("Program name and code are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const sectionArray = formData.sections
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          level: formData.level,
          departmentId: formData.departmentId || null,
          durationYears: Number(formData.durationYears) || 1,
          type: formData.type,
          sections: sectionArray.length > 0 ? sectionArray : ["A"],
          academicYearId: formData.academicYearId,
          feeItems: formData.feeItems.map((f) => ({
            categoryName: f.categoryName,
            amount: Number(f.amount) || 0,
            frequency: f.frequency,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create program.");
      }

      setIsAddModalOpen(false);
      setFormData({
        name: "",
        code: "",
        level: "SECONDARY",
        departmentId: departments[0]?.id || "",
        durationYears: 1,
        type: "ANNUAL",
        sections: "A, B",
        academicYearId: academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || "",
        feeItems: [
          { categoryName: "Tuition Fee", amount: 60000, frequency: "ANNUAL" },
          { categoryName: "Examination Fee", amount: 5000, frequency: "ANNUAL" },
        ],
      });
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <PageHeader
        eyebrow="ACADEMIC ARCHITECTURE"
        title="Programs, Courses & Cohorts"
        description="Configure institution programs (School grades & College degrees), department affiliations, batch sections, and assigned fee structures."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          leftIcon={<Download className="h-3.5 w-3.5 text-[#7A756B]" />}
        >
          Export CSV
        </Button>
        <Button
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5 text-[#D4B87C]" />}
          onClick={() => {
            setErrorMessage(null);
            setIsAddModalOpen(true);
          }}
        >
          Add Program / Course
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs hover:border-[#B89B62] transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Programs / Courses</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">{classes.length}</div>
          <div className="mt-0.5 text-[11px] text-[#555047] font-medium">Configured institution courses</div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs hover:border-[#B89B62] transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Total Sections</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">{totalSections}</div>
          <div className="mt-0.5 text-[11px] text-[#555047] font-medium">Operational cohorts</div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs hover:border-[#B89B62] transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Total Enrolled</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">{totalEnrolled}</div>
          <div className="mt-0.5 text-[11px] text-[#555047] font-medium">Admitted learners</div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs hover:border-[#B89B62] transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A756B] font-bold">Departments</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#171614] tracking-tight">{departments.length}</div>
          <div className="mt-0.5 text-[11px] text-[#555047] font-medium">Faculty divisions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-[#E5E0D5] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A756B]" />
          <input
            type="search"
            placeholder="Search programs, codes, departments, tutors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#7A756B] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          >
            <option value="ALL">All Academic Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#7A756B] font-mono border border-[#E5E0D5] rounded-3xl bg-white">
            No courses or programs match your search criteria.
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-2xs hover:border-[#B89B62] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#856D3B]">
                      {cls.code} • {cls.level}
                    </span>
                    <h3 className="text-base font-bold text-[#171614] mt-0.5">{cls.name}</h3>
                    {cls.departmentName && (
                      <p className="text-xs text-[#7A756B] mt-0.5">
                        Dept: <span className="font-semibold text-[#35322C]">{cls.departmentName}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/40">
                    {cls.totalFee > 0 ? `₹${cls.totalFee.toLocaleString("en-IN")}` : "No fee"}
                  </span>
                </div>

                {/* Sections / Batches */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                    Sections & Tutors ({cls.sections.length})
                  </span>
                  <div className="space-y-2">
                    {cls.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EFECE3] text-xs"
                      >
                        <div className="font-semibold text-[#171614]">
                          Section {sec.name}
                          <span className="text-[11px] text-[#7A756B] font-normal ml-1">
                            ({sec.classTeacherName || "Unassigned tutor"})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#555047]">
                          <strong className="text-[#171614]">{sec.studentsCount}</strong> / {sec.capacity} students
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fee Structure Breakdown */}
                {cls.feeStructures.length > 0 && (
                  <div className="pt-2 border-t border-[#EFECE3] space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-[#7A756B] uppercase tracking-wider font-bold">
                      Fee Blueprint
                    </span>
                    <div className="divide-y divide-[#EFECE3]">
                      {cls.feeStructures.map((fs) => (
                        <div key={fs.id} className="py-1 flex justify-between text-[11px]">
                          <span className="text-[#555047]">{fs.categoryName}</span>
                          <span className="font-mono font-bold text-[#171614]">₹{fs.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Program Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Institution Program / Course"
          description="Define a new academic course, grade level, sections, and associated fee structure."
          size="lg"
        >
          <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Program / Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grade 10, or B.Tech Computer Science"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Program Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. G10, or BTECH-CSE"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono uppercase text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Academic Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="PRIMARY">Primary (Grades 1-5)</option>
                  <option value="MIDDLE">Middle School (Grades 6-8)</option>
                  <option value="SECONDARY">Secondary (Grades 9-10)</option>
                  <option value="HIGHER_SECONDARY">Higher Secondary (11-12)</option>
                  <option value="UNDERGRADUATE">Undergraduate (College Degree)</option>
                  <option value="POSTGRADUATE">Postgraduate (Master&apos;s)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="">None / General</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Academic Structure
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="ANNUAL">Annual (School/Yearly)</option>
                  <option value="SEMESTER">Semester Based</option>
                  <option value="TRIMESTER">Trimester Based</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Sections / Batches (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sections}
                  onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                  placeholder="e.g. A, B, C or Batch 2026-A"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.durationYears}
                  onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            {/* Fee Structure Configuration */}
            <div className="rounded-2xl border border-[#E5E0D5] bg-[#FAF8F3] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171614]">
                  Associated Fee Structure (Annual / Term Blueprint)
                </span>
                <button
                  type="button"
                  onClick={handleAddFeeItem}
                  className="text-xs font-bold text-[#856D3B] hover:underline"
                >
                  + Add Fee Component
                </button>
              </div>

              <div className="space-y-2">
                {formData.feeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.categoryName}
                      onChange={(e) => {
                        const updated = [...formData.feeItems];
                        updated[idx].categoryName = e.target.value;
                        setFormData({ ...formData, feeItems: updated });
                      }}
                      placeholder="Fee Title (e.g. Tuition Fee, Lab Fee)"
                      className="flex-1 rounded-xl border border-[#DCD7CB] bg-white p-2 text-xs text-[#171614]"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7A756B]">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...formData.feeItems];
                          updated[idx].amount = Number(e.target.value);
                          setFormData({ ...formData, feeItems: updated });
                        }}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2 pl-6 text-xs font-mono font-bold text-[#171614]"
                      />
                    </div>
                    {formData.feeItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeeItem(idx)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EFECE3]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Course / Program
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
