"use client";

import React, { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  GraduationCap,
  Plus,
  BookOpen,
  Layers,
  Search,
  CreditCard,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Calendar,
  UserCheck,
  UserX,
  Hash,
} from "lucide-react";
import Link from "next/link";

export interface ProgramStudentItem {
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
}

export interface ProgramSectionItem {
  id: string;
  name: string;
  roomNumber?: string | null;
  capacity: number;
  classTeacherId?: string | null;
  classTeacherName?: string | null;
  studentsCount: number;
  students?: ProgramStudentItem[];
}

export interface ProgramSubjectItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: string;
  assignedTeacherName?: string | null;
}

export interface ProgramFeeItem {
  id: string;
  categoryName: string;
  amount: number;
  frequency: string;
}

export interface ProgramDetailData {
  id: string;
  name: string;
  code: string;
  level: string;
  durationYears?: number | null;
  type?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  academicYearName?: string | null;
  academicYearId?: string;
  isActive: boolean;
  totalStudents: number;
  totalFee: number;
  sections: ProgramSectionItem[];
  subjects?: ProgramSubjectItem[];
  feeStructures: ProgramFeeItem[];
  allStudents?: ProgramStudentItem[];
}

interface ProgramManageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  program: ProgramDetailData | null;
  initialTab?: "sections" | "students" | "subjects" | "fees";
  initialSectionFilter?: string;
  onEditProgram: (program: ProgramDetailData) => void;
  onAddSection: (programId: string) => void;
  onEditSection: (section: ProgramSectionItem, programName: string) => void;
  onDeleteSection: (sectionId: string, sectionName: string) => void;
}

export function ProgramManageDrawer({
  isOpen,
  onClose,
  program,
  initialTab = "sections",
  initialSectionFilter = "ALL",
  onEditProgram,
  onAddSection,
  onEditSection,
  onDeleteSection,
}: ProgramManageDrawerProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "students" | "subjects" | "fees">(initialTab);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState(initialSectionFilter);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "sections");
      setSelectedSectionFilter(initialSectionFilter || "ALL");
      setStudentSearch("");
    }
  }, [isOpen, initialTab, initialSectionFilter]);

  if (!program) return null;

  // Aggregate all enrolled students across sections
  const allStudents: ProgramStudentItem[] =
    program.allStudents ||
    program.sections.flatMap((sec) =>
      (sec.students || []).map((st) => ({
        ...st,
        sectionId: sec.id,
        sectionName: sec.name,
      }))
    );

  const filteredStudents = allStudents.filter((st) => {
    const matchesSection = selectedSectionFilter === "ALL" || st.sectionId === selectedSectionFilter;
    const q = studentSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      st.fullName.toLowerCase().includes(q) ||
      st.admissionNumber.toLowerCase().includes(q) ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(q));
    return matchesSection && matchesSearch;
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={program.name}
      description={`${program.code} • ${program.level} • Department of ${program.departmentName || "General"}`}
      size="xl"
    >
      <div className="space-y-6 text-xs font-sans">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{program.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[10px] font-bold border border-border">
                  {program.code}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {program.level}
                </Badge>
                {!program.isActive && (
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                    Archived
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {program.type || "Annual"} Curriculum • {program.durationYears || 1} Year Duration • Academic Year: {program.academicYearName || "Current"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditProgram(program)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Program
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddSection(program.id)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Section
            </Button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
              Sections
            </span>
            <div className="text-lg font-bold text-foreground font-mono">{program.sections.length}</div>
            <span className="text-[10px] text-muted-foreground">Configured cohorts</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
              Enrolled Students
            </span>
            <div className="text-lg font-bold text-foreground font-mono">{allStudents.length}</div>
            <span className="text-[10px] text-muted-foreground">Active learner roster</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
              Subjects / Courses
            </span>
            <div className="text-lg font-bold text-foreground font-mono">{program.subjects?.length || 0}</div>
            <span className="text-[10px] text-muted-foreground">Curriculum units</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
              Fee Blueprint
            </span>
            <div className="text-lg font-bold text-foreground font-mono">
              {program.totalFee > 0 ? `₹${program.totalFee.toLocaleString("en-IN")}` : "No fee"}
            </div>
            <span className="text-[10px] text-muted-foreground">Annual program dues</span>
          </div>
        </div>

        {/* Management Tabs Navigation */}
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sections"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sections ({program.sections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "students"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({allStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "subjects"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Subjects ({program.subjects?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fees")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "fees"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Fee Blueprint</span>
          </button>
        </div>

        {/* TAB 1: SECTIONS MANAGEMENT */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Operational Cohort Sections</h4>
                <p className="text-[11px] text-muted-foreground">
                  Manage section divisions, student capacity limits, room allocations, and assigned tutors.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onAddSection(program.id)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Section
              </Button>
            </div>

            {program.sections.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-border bg-card text-center space-y-3 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">No Sections Configured</h4>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-1">
                    No operational sections have been added to this program yet.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAddSection(program.id)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create First Section
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border shadow-2xs">
                {program.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">Section {sec.name}</span>
                        {sec.roomNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono border border-border">
                            {sec.roomNumber}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Capacity: <strong className="text-foreground">{sec.studentsCount}</strong> / {sec.capacity}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Class Teacher:{" "}
                        <span className="font-semibold text-foreground">
                          {sec.classTeacherName || "Unassigned tutor"}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSectionFilter(sec.id);
                          setActiveTab("students");
                        }}
                        className="h-8 px-2.5 text-xs"
                      >
                        View Students ({sec.studentsCount})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSection(sec, program.name)}
                        className="h-8 px-2.5 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteSection(sec.id, sec.name)}
                        className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS DIRECTORY */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  Enrolled Students ({filteredStudents.length})
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Learners currently registered in this program cohort.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:ring-1 focus:ring-primary outline-hidden"
                >
                  <option value="ALL">All Sections</option>
                  {program.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} ({s.studentsCount})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-border bg-card text-center space-y-2">
                <Users className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="font-bold text-foreground text-xs">No Enrolled Students Found</p>
                <p className="text-[11px] text-muted-foreground">
                  No student records match the selected filter criteria.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="p-3 font-bold">Candidate Name</th>
                      <th className="p-3 font-bold">Admission ID</th>
                      <th className="p-3 font-bold">Roll Number</th>
                      <th className="p-3 font-bold">Section</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">{st.fullName}</td>
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {st.admissionNumber}
                        </td>
                        <td className="p-3 font-mono text-foreground font-semibold">
                          {st.rollNumber || "—"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[10px] font-bold border border-border">
                            {st.sectionName ? `Sec ${st.sectionName}` : "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={
                              st.status === "ACTIVE"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                                : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                            }
                          >
                            {st.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/students/${st.id}`} target="_blank">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" rightIcon={<ExternalLink className="w-3 h-3" />}>
                              Profile
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBJECTS */}
        {activeTab === "subjects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Curriculum Subjects</h4>
                <p className="text-[11px] text-muted-foreground">
                  Department subjects mapped to this academic structure.
                </p>
              </div>
            </div>

            {(!program.subjects || program.subjects.length === 0) ? (
              <div className="p-8 rounded-3xl border border-dashed border-border bg-card text-center space-y-2">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="font-bold text-foreground text-xs">No Curriculum Subjects Assigned</p>
                <p className="text-[11px] text-muted-foreground">
                  Subjects are defined in the Subject Catalog and assigned via Faculty Timetable.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border shadow-2xs">
                {program.subjects.map((sub) => (
                  <div key={sub.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{sub.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                          {sub.code}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {sub.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Credits: <span className="font-mono font-bold text-foreground">{sub.credits}</span> • Assigned Teacher: {sub.assignedTeacherName || "Department Roster"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FEES */}
        {activeTab === "fees" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Configured Fee Structure Blueprint</h4>
                <p className="text-[11px] text-muted-foreground">
                  Automated billing fee schedule applied to admitted candidates in this program.
                </p>
              </div>
              <Link href="/finance/fees">
                <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Manage Fee Desk
                </Button>
              </Link>
            </div>

            {program.feeStructures.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-border bg-card text-center space-y-2">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="font-bold text-foreground text-xs">No Fee Structure Configured</p>
                <p className="text-[11px] text-muted-foreground">
                  Configure fee components under Finance & Fees module.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border shadow-2xs">
                {program.feeStructures.map((fee) => (
                  <div key={fee.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{fee.categoryName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Frequency: {fee.frequency}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-foreground text-sm">
                      ₹{fee.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
