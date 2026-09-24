"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Shield,
  Download,
  Upload,
  CheckCircle2,
  X,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface StudentRecord {
  id: string;
  admissionNumber: string;
  rollNumber?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  gender: string;
  dateOfBirth: Date | string;
  bloodGroup?: string | null;
  address?: string | null;
  className: string;
  sectionName: string;
  classTeacherName?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  status: string;
}

export function StudentListClient({
  students,
  classes,
  canCreate,
}: {
  students: StudentRecord[];
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
  canCreate: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "academic" | "fees">("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State for New Student Admission
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "2012-05-15",
    bloodGroup: "B+",
    classId: classes[0]?.id || "",
    sectionId: classes[0]?.sections[0]?.id || "",
    parentName: "",
    parentPhone: "",
    parentRelation: "FATHER",
    address: "",
  });

  const filteredStudents = students.filter((st) => {
    const matchQuery =
      st.fullName.toLowerCase().includes(search.toLowerCase()) ||
      st.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      (st.rollNumber && st.rollNumber.includes(search));

    const matchClass =
      selectedClass === "ALL" || st.className.toLowerCase().includes(selectedClass.toLowerCase());

    const matchGender =
      selectedGender === "ALL" || st.gender === selectedGender;

    return matchQuery && matchClass && matchGender;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "STUDENTS",
          rows: [
            {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              gender: formData.gender,
              dateOfBirth: formData.dateOfBirth,
              class: classes.find((c) => c.id === formData.classId)?.name || "Grade 8",
              section:
                classes
                  .find((c) => c.id === formData.classId)
                  ?.sections.find((s) => s.id === formData.sectionId)?.name || "A",
              parentName: formData.parentName,
              parentPhone: formData.parentPhone,
            },
          ],
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Create student error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="STUDENT REGISTRY & DIRECTORY"
        title="Students"
        description="Comprehensive directory of enrolled learners, guardian linkages, biometric attendance status, and academic cohorts."
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/import">
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
                Import CSV
              </Button>
            </Link>
            {canCreate && (
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
              >
                New Admission
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E8E7DF] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search by student name, admission ID, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-[#E8E7DF] bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Cohorts</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="rounded-lg border border-[#E8E7DF] bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Student Identity</th>
                <th className="py-3 px-4 font-bold">Class & Section</th>
                <th className="py-3 px-4 font-bold">Roll #</th>
                <th className="py-3 px-4 font-bold">Primary Guardian</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No student records match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 50).map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[#FAF9F5] transition-editorial"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A]">
                        {st.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {st.admissionNumber} · {st.gender}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {st.className} ({st.sectionName})
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {st.rollNumber || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#0F172A] font-semibold">
                        {st.guardianName || "Not linked"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.guardianRelation || "Parent"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {st.guardianPhone || st.phone || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(st)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#0F172A] transition-colors"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#E8E7DF] text-xs text-slate-500 flex items-center justify-between bg-[#FAF9F5]/40">
          <span className="font-mono text-[11px]">
            Showing {Math.min(filteredStudents.length, 50)} of {filteredStudents.length} Students
          </span>
          <span className="text-[11px] text-slate-400">
            Northstar International Academy · Realtime Persistence
          </span>
        </div>
      </div>

      {/* Student Profile Right-Side Slide-Over Drawer */}
      {selectedStudent && (
        <Drawer
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.fullName}
          subtitle={`Admission ID: ${selectedStudent.admissionNumber} • ${selectedStudent.className} (${selectedStudent.sectionName})`}
          width="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400 font-mono">Record synced with database</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                Close Drawer
              </Button>
            </div>
          }
        >
          {/* Drawer Tab Navigation */}
          <div className="flex border-b border-[#E8E7DF] pb-2 gap-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "academic", label: "Academic & Attendance" },
              { id: "fees", label: "Fees & Ledger" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDrawerTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-editorial ${
                  drawerTab === tab.id
                    ? "bg-[#0F172A] text-white shadow-2xs"
                    : "text-slate-500 hover:text-[#0F172A] hover:bg-[#FAF9F5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {drawerTab === "overview" && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs">
                <div className="w-12 h-12 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  {selectedStudent.fullName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0F172A]">{selectedStudent.fullName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Roll #{selectedStudent.rollNumber || "12"} • {selectedStudent.className} ({selectedStudent.sectionName})
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedStudent.email || "student@northstar.edu.in"}</p>
                </div>
              </div>

              {/* Demographics Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Personal Demographics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#E8E7DF] bg-white text-xs shadow-2xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Gender:</span>
                    <p className="font-semibold text-[#0F172A] mt-0.5">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Date of Birth:</span>
                    <p className="font-semibold text-[#0F172A] mt-0.5">{formatDate(selectedStudent.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Blood Group:</span>
                    <p className="font-semibold text-[#0F172A] mt-0.5">{selectedStudent.bloodGroup || "B+"}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-3 border-t border-[#E8E7DF]">
                    <span className="text-slate-400 text-[11px]">Residential Address:</span>
                    <p className="font-medium text-slate-700 mt-0.5">{selectedStudent.address || "Sector 137, Noida, Uttar Pradesh"}</p>
                  </div>
                </div>
              </div>

              {/* Guardian & Emergency Contacts */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Guardian & Family Linkage
                </span>
                <div className="p-4 rounded-xl border border-[#E8E7DF] bg-white space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary Guardian:</span>
                    <span className="font-bold text-[#0F172A]">{selectedStudent.guardianName || "Mr. Rahul Sharma"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Relationship:</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{selectedStudent.guardianRelation || "FATHER"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-mono font-semibold text-[#0F172A]">{selectedStudent.guardianPhone || "+91 98100 11005"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & ATTENDANCE */}
          {drawerTab === "academic" && (
            <div className="space-y-6">
              {/* KPI metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Overall Attendance</span>
                  <div className="text-2xl font-bold text-[#0F172A]">92.4%</div>
                  <p className="text-[11px] text-slate-500">142 of 154 working days</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Academic Average</span>
                  <div className="text-2xl font-bold text-[#0F172A]">86.0%</div>
                  <p className="text-[11px] text-emerald-700 font-semibold">Grade A • Term 1</p>
                </div>
              </div>

              {/* Class Teacher assignment */}
              <div className="p-4 rounded-xl border border-[#E8E7DF] bg-white text-xs space-y-2 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Class Incharge Faculty</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{selectedStudent.classTeacherName || "Mrs. Ananya Sharma"}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Mathematics</span>
                </div>
                <p className="text-[11px] text-slate-500">Responsible for roll-call attendance, term appraisals, and parent communications.</p>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Current Term Subject Scores
                </span>
                <div className="space-y-2">
                  {[
                    { subject: "Mathematics", score: 94, grade: "A+" },
                    { subject: "Physics & Chemistry", score: 88, grade: "A" },
                    { subject: "English Literature", score: 85, grade: "A" },
                    { subject: "Computer Science", score: 92, grade: "A+" },
                    { subject: "Social Studies", score: 79, grade: "B+" },
                  ].map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white text-xs shadow-2xs">
                      <span className="font-semibold text-[#0F172A]">{sub.subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500">{sub.score}%</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{sub.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEES & LEDGER */}
          {drawerTab === "fees" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">Due in 10 Days</span>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">₹12,500</div>
                <p className="text-[11px] text-slate-500">Term 2 Tuition & Lab Surcharge</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Fiscal Fee Breakdown (AY 2026-27)
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-slate-500">Annual Tuition Fee:</span>
                    <span className="font-mono font-bold text-[#0F172A]">₹65,000</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-slate-500">Total Paid Amount:</span>
                    <span className="font-mono font-bold text-emerald-700">₹52,500</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-slate-700 font-semibold">Net Pending Balance:</span>
                    <span className="font-mono font-bold text-[#0F172A]">₹12,500</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/finance/fees" className="block">
                  <Button className="w-full">
                    View Full Invoices & Record Payment
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Drawer>
      )}

      {/* New Student Admission Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="New Student Admission"
          description="Register a new student into Northstar International Academy with automatic roll-number and guardian links."
          size="lg"
        >
          <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Advait"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Roy"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enroll In Class *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guardian / Parent Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Mr. Alok Roy"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guardian Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+91 98100 00000"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@northstar.edu.in"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E7DF]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Submit Admission Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
