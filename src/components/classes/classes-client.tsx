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
  MoreVertical,
  Edit2,
  ExternalLink,
  Archive,
  AlertCircle,
  FolderOpen,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter } from "next/navigation";
import { ProgramManageDrawer, ProgramDetailData, ProgramSectionItem } from "./program-manage-drawer";
import { EditProgramModal } from "./edit-program-modal";
import { AddSectionModal } from "./add-section-modal";
import { EditSectionModal } from "./edit-section-modal";

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
  academicYearId?: string;
  isActive?: boolean;
  sections: Array<{
    id: string;
    name: string;
    roomNumber?: string | null;
    capacity: number;
    classTeacherId?: string | null;
    classTeacherName?: string | null;
    studentsCount: number;
    students?: Array<{
      id: string;
      admissionNumber: string;
      rollNumber?: string | null;
      fullName: string;
      email?: string | null;
      phone?: string | null;
      status: string;
      gender: string;
      batch?: string | null;
      semester?: string | null;
      sectionId?: string;
      sectionName?: string;
    }>;
  }>;
  allStudents?: Array<{
    id: string;
    admissionNumber: string;
    rollNumber?: string | null;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    status: string;
    gender: string;
    batch?: string | null;
    semester?: string | null;
    sectionId?: string;
    sectionName?: string;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    credits: number;
    type: string;
    assignedTeacherName?: string | null;
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
  teachers = [],
}: {
  classes: ClassItem[];
  departments: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  teachers?: Array<{ id: string; fullName: string; employeeId?: string; designation?: string | null }>;
}) {
  const router = useRouter();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Overflow Menus State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openSectionMenuId, setOpenSectionMenuId] = useState<string | null>(null);

  // Drawer and Modal States
  const [managingProgram, setManagingProgram] = useState<ProgramDetailData | null>(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState<"sections" | "students" | "subjects" | "fees">("sections");
  const [drawerInitialSectionFilter, setDrawerInitialSectionFilter] = useState<string>("ALL");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [editingProgram, setEditingProgram] = useState<ClassItem | null>(null);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [addSectionProgramId, setAddSectionProgramId] = useState<string>("");

  const [editingSection, setEditingSection] = useState<{
    section: ProgramSectionItem;
    programName: string;
  } | null>(null);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);

  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "program" | "section";
    id: string;
    name: string;
    extraInfo?: string;
  }>({
    isOpen: false,
    type: "program",
    id: "",
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add Program Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: "UNDERGRADUATE",
    departmentId: departments[0]?.id || "",
    durationYears: 1,
    type: "ANNUAL",
    sections: "",
    academicYearId: academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || "",
    feeItems: [
      { categoryName: "Tuition Fee", amount: 60000, frequency: "ANNUAL" },
      { categoryName: "Examination Fee", amount: 5000, frequency: "ANNUAL" },
    ],
  });

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
    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && c.isActive !== false) ||
      (selectedStatus === "INACTIVE" && c.isActive === false);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const levels = Array.from(new Set(classes.map((c) => c.level)));

  const handleExportAll = () => {
    const csvRows = [
      ["Program / Class Name", "Code", "Level", "Status", "Department", "Section", "Room", "Capacity", "Enrolled", "Tutor", "Total Annual Fee"],
    ];
    classes.forEach((c) => {
      if (c.sections.length === 0) {
        csvRows.push([
          c.name,
          c.code,
          c.level,
          c.isActive !== false ? "Active" : "Archived",
          c.departmentName || "General",
          "None",
          "—",
          "0",
          "0",
          "Unassigned",
          String(c.totalFee),
        ]);
      } else {
        c.sections.forEach((s) => {
          csvRows.push([
            c.name,
            c.code,
            c.level,
            c.isActive !== false ? "Active" : "Archived",
            c.departmentName || "General",
            s.name,
            s.roomNumber || "Main",
            String(s.capacity),
            String(s.studentsCount),
            s.classTeacherName || "Unassigned",
            String(c.totalFee),
          ]);
        });
      }
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "all_academic_programs_blueprint.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSingleProgram = (cls: ClassItem) => {
    const csvRows = [
      ["Program / Class Name", "Code", "Level", "Status", "Department", "Section", "Room", "Capacity", "Enrolled", "Tutor", "Total Annual Fee"],
    ];
    if (cls.sections.length === 0) {
      csvRows.push([
        cls.name,
        cls.code,
        cls.level,
        cls.isActive !== false ? "Active" : "Archived",
        cls.departmentName || "General",
        "None",
        "—",
        "0",
        "0",
        "Unassigned",
        String(cls.totalFee),
      ]);
    } else {
      cls.sections.forEach((s) => {
        csvRows.push([
          cls.name,
          cls.code,
          cls.level,
          cls.isActive !== false ? "Active" : "Archived",
          cls.departmentName || "General",
          s.name,
          s.roomNumber || "Main",
          String(s.capacity),
          String(s.studentsCount),
          s.classTeacherName || "Unassigned",
          String(cls.totalFee),
        ]);
      });
    }
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${cls.code.toLowerCase()}_program_blueprint.csv`);
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
          sections: sectionArray,
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

      setIsAddProgramModalOpen(false);
      setFormData({
        name: "",
        code: "",
        level: "UNDERGRADUATE",
        departmentId: departments[0]?.id || "",
        durationYears: 1,
        type: "ANNUAL",
        sections: "",
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

  const handleOpenManageDrawer = (
    cls: ClassItem,
    initialTab: "sections" | "students" | "subjects" | "fees" = "sections",
    sectionFilter: string = "ALL"
  ) => {
    const detailData: ProgramDetailData = {
      id: cls.id,
      name: cls.name,
      code: cls.code,
      level: cls.level,
      durationYears: cls.durationYears,
      type: cls.type,
      departmentId: cls.departmentId,
      departmentName: cls.departmentName,
      academicYearName: cls.academicYearName,
      academicYearId: cls.academicYearId,
      isActive: cls.isActive !== false,
      totalStudents: cls.sections.reduce((acc, s) => acc + s.studentsCount, 0),
      totalFee: cls.totalFee,
      sections: cls.sections.map((s) => ({
        id: s.id,
        name: s.name,
        roomNumber: s.roomNumber,
        capacity: s.capacity,
        classTeacherId: s.classTeacherId,
        classTeacherName: s.classTeacherName,
        studentsCount: s.studentsCount,
        students: s.students || [],
      })),
      subjects: cls.subjects || [],
      feeStructures: cls.feeStructures,
      allStudents: cls.allStudents || [],
    };
    setManagingProgram(detailData);
    setDrawerInitialTab(initialTab);
    setDrawerInitialSectionFilter(sectionFilter);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
    setOpenSectionMenuId(null);
  };

  const handleToggleProgramStatus = async (cls: ClassItem) => {
    const newStatus = cls.isActive === false;
    try {
      const res = await fetch(`/api/programs/${cls.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update program status.");
        return;
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update program status.");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (deleteDialog.type === "program") {
        const res = await fetch(`/api/programs/${deleteDialog.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete program.");
        }
      } else {
        const res = await fetch(`/api/sections/${deleteDialog.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete section.");
        }
      }

      setDeleteDialog({ isOpen: false, type: "program", id: "", name: "" });
      setIsEditSectionOpen(false);
      setIsDrawerOpen(false);
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || "Operation failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <PageHeader
        eyebrow="ACADEMIC ARCHITECTURE"
        title="Programs, Courses & Cohorts"
        description="Configure institution programs, department affiliations, cohort sections, faculty tutors, and assigned fee structures with full administrative lifecycle control."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          leftIcon={<Download className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          Export CSV
        </Button>
        <Button
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5 text-primary" />}
          onClick={() => {
            setErrorMessage(null);
            setIsAddProgramModalOpen(true);
          }}
        >
          Add Program / Course
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs hover:border-primary transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Programs / Courses</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{classes.length}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground font-medium">Configured institution courses</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs hover:border-primary transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Total Sections</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{totalSections}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground font-medium">Operational cohorts</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs hover:border-primary transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Total Enrolled</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{totalEnrolled}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground font-medium">Admitted learners</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs hover:border-primary transition-all">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Departments</div>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{departments.length}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground font-medium">Faculty divisions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-border shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search programs, codes, departments, sections, tutors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="ALL">All Academic Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Archived / Inactive</option>
          </select>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl bg-white space-y-3">
            <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground text-sm">No Programs or Courses Found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search criteria or add a new academic program.</p>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddProgramModalOpen(true)}
            >
              Add Program / Course
            </Button>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const programStudents = cls.sections.reduce((acc, s) => acc + s.studentsCount, 0);

            return (
              <div
                key={cls.id}
                onClick={() => handleOpenManageDrawer(cls, "sections")}
                className={`group cursor-pointer rounded-3xl border ${
                  cls.isActive === false ? "border-border/60 bg-muted/20 opacity-80" : "border-border bg-white"
                } p-6 shadow-2xs hover:border-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-4">
                  {/* Card Header with Level, Code, Name, Badges and 3-Dot Overflow Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                          {cls.code} • {cls.level}
                        </span>
                        {cls.isActive === false && (
                          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30 py-0">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {cls.name}
                      </h3>
                      {cls.departmentName && (
                        <p className="text-xs text-muted-foreground">
                          Dept: <span className="font-semibold text-foreground">{cls.departmentName}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl bg-warm/15 text-primary border border-warm/30 whitespace-nowrap">
                        {cls.totalFee > 0 ? `₹${cls.totalFee.toLocaleString("en-IN")}` : "No fee"}
                      </span>

                      {/* Single 3-Dot Overflow Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSectionMenuId(null);
                            setOpenMenuId(openMenuId === cls.id ? null : cls.id);
                          }}
                          className="p-1.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Program Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === cls.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            />
                            <div
                              className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white border border-border shadow-xl z-30 py-1.5 text-xs divide-y divide-border"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* PROGRAM ACTIONS */}
                              <div className="py-1">
                                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                  Program
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProgram(cls);
                                    setIsEditProgramOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                  Edit Program
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenManageDrawer(cls, "sections");
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                  Manage Sections ({cls.sections.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenManageDrawer(cls, "students");
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                  View Students ({programStudents})
                                </button>
                              </div>

                              {/* ACADEMICS */}
                              <div className="py-1">
                                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                  Academics
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenManageDrawer(cls, "subjects");
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                  Manage Subjects ({cls.subjects?.length || 0})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (cls.sections.length === 1) {
                                      setEditingSection({
                                        section: cls.sections[0],
                                        programName: cls.name,
                                      });
                                      setIsEditSectionOpen(true);
                                      setOpenMenuId(null);
                                    } else {
                                      handleOpenManageDrawer(cls, "sections");
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                  Assign Teachers
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenManageDrawer(cls, "fees");
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                                  Manage Fees
                                </button>
                              </div>

                              {/* DATA EXPORT */}
                              <div className="py-1">
                                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                  Data
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExportSingleProgram(cls);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                                  Export Program CSV
                                </button>
                              </div>

                              {/* LIFECYCLE */}
                              <div className="py-1">
                                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                  Lifecycle
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleProgramStatus(cls)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                                  {cls.isActive === false ? "Restore Program" : "Deactivate / Archive"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteDialog({
                                      isOpen: true,
                                      type: "program",
                                      id: cls.id,
                                      name: cls.name,
                                      extraInfo:
                                        cls.sections.length > 0 || programStudents > 0
                                          ? `This program has ${cls.sections.length} sections and ${programStudents} enrolled students. If historic dependencies exist, you can deactivate it instead.`
                                          : undefined,
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-destructive/10 text-destructive font-medium flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  Delete Program
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Counts */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium pb-1 border-b border-border/60">
                    <span>
                      <strong className="text-foreground font-mono">{cls.sections.length}</strong> Sections
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-foreground font-mono">{programStudents}</strong> Students Enrolled
                    </span>
                  </div>

                  {/* Sections List or Clean Empty State */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        Sections & Tutors
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddSectionProgramId(cls.id);
                          setIsAddSectionOpen(true);
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {cls.sections.length === 0 ? (
                      <div
                        className="p-3.5 rounded-2xl bg-card border border-dashed border-border text-center space-y-2 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddSectionProgramId(cls.id);
                          setIsAddSectionOpen(true);
                        }}
                      >
                        <p className="text-xs text-muted-foreground">No sections configured</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddSectionProgramId(cls.id);
                            setIsAddSectionOpen(true);
                          }}
                          className="h-7 text-[11px]"
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          Add Section
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cls.sections.map((sec) => (
                          <div
                            key={sec.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSection({
                                section: {
                                  id: sec.id,
                                  name: sec.name,
                                  capacity: sec.capacity,
                                  roomNumber: sec.roomNumber,
                                  classTeacherId: sec.classTeacherId,
                                  classTeacherName: sec.classTeacherName,
                                  studentsCount: sec.studentsCount,
                                  students: sec.students || [],
                                },
                                programName: cls.name,
                              });
                              setIsEditSectionOpen(true);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs group/sec hover:border-primary/60 hover:bg-muted/30 transition-all cursor-pointer"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-foreground flex items-center gap-1.5 group-hover/sec:text-primary transition-colors">
                                <span>Section {sec.name}</span>
                                {sec.roomNumber && (
                                  <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                                    {sec.roomNumber}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Tutor: <span className="text-foreground font-medium">{sec.classTeacherName || "Unassigned"}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <div className="text-[11px] font-mono text-muted-foreground text-right">
                                <strong className="text-foreground">{sec.studentsCount}</strong> / {sec.capacity}
                              </div>

                              {/* Section 3-Dot Menu */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setOpenSectionMenuId(openSectionMenuId === sec.id ? null : sec.id);
                                  }}
                                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-60 group-hover/sec:opacity-100 transition-opacity cursor-pointer"
                                  title="Section Actions"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openSectionMenuId === sec.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenSectionMenuId(null);
                                      }}
                                    />
                                    <div
                                      className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white border border-border shadow-lg z-30 py-1 text-xs divide-y divide-border"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="py-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSection({
                                              section: {
                                                id: sec.id,
                                                name: sec.name,
                                                capacity: sec.capacity,
                                                roomNumber: sec.roomNumber,
                                                classTeacherId: sec.classTeacherId,
                                                classTeacherName: sec.classTeacherName,
                                                studentsCount: sec.studentsCount,
                                                students: sec.students || [],
                                              },
                                              programName: cls.name,
                                            });
                                            setIsEditSectionOpen(true);
                                            setOpenSectionMenuId(null);
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                          Edit Section
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleOpenManageDrawer(cls, "students", sec.id);
                                            setOpenSectionMenuId(null);
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                          View Students ({sec.studentsCount})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSection({
                                              section: {
                                                id: sec.id,
                                                name: sec.name,
                                                capacity: sec.capacity,
                                                roomNumber: sec.roomNumber,
                                                classTeacherId: sec.classTeacherId,
                                                classTeacherName: sec.classTeacherName,
                                                studentsCount: sec.studentsCount,
                                                students: sec.students || [],
                                              },
                                              programName: cls.name,
                                            });
                                            setIsEditSectionOpen(true);
                                            setOpenSectionMenuId(null);
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                          Assign Teacher
                                        </button>
                                      </div>
                                      <div className="py-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenSectionMenuId(null);
                                            setDeleteDialog({
                                              isOpen: true,
                                              type: "section",
                                              id: sec.id,
                                              name: `Section ${sec.name}`,
                                              extraInfo: "Checking safety dependencies before deleting this cohort section.",
                                            });
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-destructive/10 text-destructive font-medium flex items-center gap-2 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                          Delete Section
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-over Drawer for Program Management */}
      <ProgramManageDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setManagingProgram(null);
        }}
        program={managingProgram}
        initialTab={drawerInitialTab}
        initialSectionFilter={drawerInitialSectionFilter}
        onEditProgram={(prog) => {
          const match = classes.find((c) => c.id === prog.id);
          if (match) {
            setEditingProgram(match);
            setIsEditProgramOpen(true);
          }
        }}
        onAddSection={(programId) => {
          setAddSectionProgramId(programId);
          setIsAddSectionOpen(true);
        }}
        onEditSection={(section, progName) => {
          setEditingSection({ section, programName: progName });
          setIsEditSectionOpen(true);
        }}
        onDeleteSection={(sectionId, sectionName) => {
          setDeleteDialog({
            isOpen: true,
            type: "section",
            id: sectionId,
            name: `Section ${sectionName}`,
            extraInfo: "Deleting this section will verify that no student enrollments, timetable slots, or attendance records depend on it.",
          });
        }}
      />

      {/* Edit Program Modal */}
      {editingProgram && (
        <EditProgramModal
          isOpen={isEditProgramOpen}
          onClose={() => {
            setIsEditProgramOpen(false);
            setEditingProgram(null);
          }}
          program={{
            id: editingProgram.id,
            name: editingProgram.name,
            code: editingProgram.code,
            level: editingProgram.level,
            durationYears: editingProgram.durationYears,
            type: editingProgram.type,
            departmentId: editingProgram.departmentId,
            isActive: editingProgram.isActive !== false,
            academicYearId: editingProgram.academicYearId,
          }}
          departments={departments}
          academicYears={academicYears}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => {
          setIsAddSectionOpen(false);
          setAddSectionProgramId("");
        }}
        programs={classes.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
        defaultProgramId={addSectionProgramId}
        teachers={teachers}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Edit Section Modal */}
      {editingSection && (
        <EditSectionModal
          isOpen={isEditSectionOpen}
          onClose={() => {
            setIsEditSectionOpen(false);
            setEditingSection(null);
          }}
          section={{
            id: editingSection.section.id,
            name: editingSection.section.name,
            capacity: editingSection.section.capacity,
            roomNumber: editingSection.section.roomNumber,
            classTeacherId: editingSection.section.classTeacherId,
            programName: editingSection.programName,
          }}
          teachers={teachers}
          onSuccess={() => {
            router.refresh();
          }}
          onDelete={() => {
            setDeleteDialog({
              isOpen: true,
              type: "section",
              id: editingSection.section.id,
              name: `Section ${editingSection.section.name}`,
              extraInfo: "Checking safety dependencies before deleting this cohort section.",
            });
          }}
        />
      )}

      {/* Add Program Modal */}
      {isAddProgramModalOpen && (
        <Modal
          isOpen={isAddProgramModalOpen}
          onClose={() => setIsAddProgramModalOpen(false)}
          title="Add Institution Program / Course"
          description="Define a new academic course, grade level, sections, and associated fee structure."
          size="lg"
        >
          <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Program / Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science, or Grade 10"
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Program Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BTECH-CSE, or G10"
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Academic Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold text-foreground"
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
                <label className="block font-bold text-foreground mb-1">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold text-foreground"
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
                <label className="block font-bold text-foreground mb-1">
                  Academic Structure
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold text-foreground"
                >
                  <option value="ANNUAL">Annual (School/Yearly)</option>
                  <option value="SEMESTER">Semester Based</option>
                  <option value="TRIMESTER">Trimester Based</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Initial Sections (Comma separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.sections}
                  onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                  placeholder="e.g. A, B, C (Leave blank to configure later)"
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.durationYears}
                  onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground"
                />
              </div>
            </div>

            {/* Fee Structure Configuration */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Associated Fee Structure (Annual / Term Blueprint)
                </span>
                <button
                  type="button"
                  onClick={handleAddFeeItem}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
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
                      className="flex-1 rounded-xl border border-border bg-white p-2 text-xs text-foreground"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...formData.feeItems];
                          updated[idx].amount = Number(e.target.value);
                          setFormData({ ...formData, feeItems: updated });
                        }}
                        className="w-full rounded-xl border border-border bg-white p-2 pl-6 text-xs font-mono font-bold text-foreground"
                      />
                    </div>
                    {formData.feeItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeeItem(idx)}
                        className="p-1 text-destructive hover:opacity-80 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddProgramModalOpen(false)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => {
          setDeleteDialog({ isOpen: false, type: "program", id: "", name: "" });
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteDialog.name}?`}
        message={
          deleteError
            ? `Cannot delete: ${deleteError}`
            : deleteDialog.extraInfo ||
              `Are you sure you want to permanently delete ${deleteDialog.name}? This operation is protected and will fail if active student or academic records depend on it.`
        }
        confirmText="Confirm Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
