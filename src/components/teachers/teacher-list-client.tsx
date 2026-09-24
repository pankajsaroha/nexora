"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Calendar,
  Eye,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface TeacherRecord {
  id: string;
  employeeId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  departmentName?: string | null;
  joiningDate: Date | string;
  employmentStatus: string;
  basicSalary: number;
  casualLeaveBalance: number;
  sickLeaveBalance: number;
  earnedLeaveBalance: number;
  classTeacherOf?: string | null;
}

export function TeacherListClient({
  teachers,
  departments,
  canManage,
  canViewSalary,
}: {
  teachers: TeacherRecord[];
  departments: Array<{ id: string; name: string; code: string }>;
  canManage: boolean;
  canViewSalary: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "academic" | "leave">("overview");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "Senior Faculty",
    departmentId: departments[0]?.id || "",
    salary: "55000",
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchQuery =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      t.designation.toLowerCase().includes(search.toLowerCase());

    const matchDept =
      selectedDept === "ALL" ||
      (t.departmentName && t.departmentName.toLowerCase().includes(selectedDept.toLowerCase()));

    return matchQuery && matchDept;
  });

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "TEACHERS",
          rows: [
            {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              designation: formData.designation,
              department:
                departments.find((d) => d.id === formData.departmentId)?.name || "Science",
              salary: formData.salary,
            },
          ],
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Create teacher error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Page Header */}
      <PageHeader
        category="ACADEMIC FACULTY & STAFF"
        title="Teachers & Staff"
        description="Faculty directory, class incharge allocations, departmental affiliations, and leave quotas."
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/import">
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
                Import CSV
              </Button>
            </Link>
            {canManage && (
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
              >
                Add Faculty Member
              </Button>
            )}
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E8E7DF] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search by teacher name, employee ID, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-lg border border-[#E8E7DF] bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E8E7DF] bg-[#FAF9F5] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Faculty Member</th>
                <th className="py-3 px-4 font-bold">Department & Role</th>
                <th className="py-3 px-4 font-bold">Class Incharge</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                {canViewSalary && <th className="py-3 px-4 font-bold">Monthly Compensation</th>}
                <th className="py-3 px-4 font-bold">Leave Balance</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E7DF]">
              {filteredTeachers.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[#FAF9F5] transition-editorial"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">
                      {t.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">
                      {t.designation}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {t.departmentName || "General Faculty"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.classTeacherOf ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#1E3A8A] font-bold border border-blue-200">
                        {t.classTeacherOf}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>{t.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.phone}</div>
                  </td>
                  {canViewSalary && (
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {formatCurrency(t.basicSalary)}
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-mono font-bold text-emerald-700">
                      {t.casualLeaveBalance + t.sickLeaveBalance}
                    </span>{" "}
                    days
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTeacher(t)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#0F172A] transition-colors"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#E8E7DF] text-xs text-slate-500 flex items-center justify-between bg-[#FAF9F5]/40">
          <span className="font-mono text-[11px]">
            Showing {filteredTeachers.length} Faculty Members
          </span>
          <span className="text-[11px] text-slate-400">
            Northstar International Academy · Biometric Sync Active
          </span>
        </div>
      </div>

      {/* Faculty Profile Drawer */}
      {selectedTeacher && (
        <Drawer
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          title={selectedTeacher.fullName}
          subtitle={`Employee ID: ${selectedTeacher.employeeId} • ${selectedTeacher.designation}`}
          width="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400 font-mono">Institutional Faculty Dossier</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeacher(null)}
              >
                Close Drawer
              </Button>
            </div>
          }
        >
          {/* Drawer Tab Navigation */}
          <div className="flex border-b border-[#E8E7DF] pb-2 gap-2">
            {[
              { id: "overview", label: "Profile & Identity" },
              { id: "academic", label: "Classes & Timetable" },
              { id: "leave", label: "Leave & Payroll" },
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
                  {selectedTeacher.fullName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0F172A]">{selectedTeacher.fullName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      {selectedTeacher.employmentStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1E3A8A] mt-0.5">
                    {selectedTeacher.designation}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Department of {selectedTeacher.departmentName || "Science"}</p>
                </div>
              </div>

              {/* Contact and Service Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Professional Credentials & Contact
                </span>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-[#E8E7DF] bg-white text-xs shadow-2xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Official Email:</span>
                    <p className="font-mono text-[#0F172A] truncate mt-0.5">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Direct Phone:</span>
                    <p className="font-mono text-[#0F172A] mt-0.5">{selectedTeacher.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Joining Date:</span>
                    <p className="font-semibold text-[#0F172A] mt-0.5">{formatDate(selectedTeacher.joiningDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Academic Qualification:</span>
                    <p className="font-semibold text-[#0F172A] mt-0.5">M.Sc., B.Ed., NET Certified</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & CLASSES */}
          {drawerTab === "academic" && (
            <div className="space-y-6">
              {/* Class Teacher Allocation */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Class Incharge Responsibility</span>
                <div className="text-lg font-bold text-[#0F172A]">
                  {selectedTeacher.classTeacherOf || "Grade 8A"}
                </div>
                <p className="text-[11px] text-slate-500">35 Enrolled Students • Room 104 • Term 1 Attendance Custodian</p>
              </div>

              {/* Today's Timetable Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Lecture Schedule
                </span>
                <div className="space-y-2 text-xs">
                  {[
                    { period: "Period 1 (08:30 - 09:15)", subject: "Mathematics", class: "Grade 8A", room: "Room 104" },
                    { period: "Period 3 (10:15 - 11:00)", subject: "Advanced Algebra", class: "Grade 10B", room: "Room 201" },
                    { period: "Period 5 (12:30 - 01:15)", subject: "Applied Mathematics", class: "Grade 11 Science", room: "Lab 2" },
                    { period: "Period 6 (01:15 - 02:00)", subject: "Doubt Clearance", class: "Grade 8A", room: "Room 104" },
                  ].map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white shadow-2xs">
                      <div>
                        <p className="font-bold text-[#0F172A]">{slot.subject}</p>
                        <p className="text-[11px] text-slate-400">{slot.period}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">{slot.class}</span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE & PAYROLL */}
          {drawerTab === "leave" && (
            <div className="space-y-6">
              {/* Salary KPI */}
              {canViewSalary && (
                <div className="p-4 rounded-xl bg-white border border-[#E8E7DF] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Monthly Compensation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">Disbursed via HDFC</span>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A]">
                    {formatCurrency(selectedTeacher.basicSalary)}
                  </div>
                  <p className="text-[11px] text-slate-500">Basic Pay + Academic Allowance + PF Contribution</p>
                </div>
              )}

              {/* Leave Quota Matrix */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Institutional Leave Balances
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Casual Leave</span>
                    <div className="text-xl font-bold text-[#0F172A] mt-1">{selectedTeacher.casualLeaveBalance}</div>
                    <span className="text-[10px] text-slate-400 font-mono">Days Left</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Sick Leave</span>
                    <div className="text-xl font-bold text-[#0F172A] mt-1">{selectedTeacher.sickLeaveBalance}</div>
                    <span className="text-[10px] text-slate-400 font-mono">Days Left</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E8E7DF] bg-white shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Earned Leave</span>
                    <div className="text-xl font-bold text-[#0F172A] mt-1">{selectedTeacher.earnedLeaveBalance}</div>
                    <span className="text-[10px] text-slate-400 font-mono">Days Left</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/attendance/leaves" className="block">
                  <Button className="w-full">
                    Manage Leave Records & Applications
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Drawer>
      )}

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Faculty Member"
          description="Create employee profile and system credentials for a new educator."
          size="md"
        >
          <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@northstar.edu.in"
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98100 00000"
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Faculty - Mathematics"
                className="w-full rounded-lg border border-[#E8E7DF] bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
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
                Save Faculty Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
