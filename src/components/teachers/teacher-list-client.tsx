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
import { PremiumPagination } from "@/components/ui/premium-pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
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

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        eyebrow="FACULTY & ACADEMIC STAFF DOSSIERS"
        title="Teachers & Staff"
        description="Comprehensive directory of institutional faculty, department leads, homeroom incharge allocations, and leave ledgers."
      >
        <Link href="/import">
          <Button variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5 text-[#7A756B]" />}>
            Import CSV
          </Button>
        </Link>
        {canManage && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="h-3.5 w-3.5 text-[#D4B87C]" />}
          >
            Onboard Faculty
          </Button>
        )}
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-[#E5E0D5] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A756B]" />
          <input
            type="search"
            placeholder="Search by faculty name, designation, or employee code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#7A756B] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Registry Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#EFECE3] bg-[#FAF8F3] text-[#7A756B] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Faculty Member</th>
                <th className="py-3.5 px-4 font-bold">Designation & Department</th>
                <th className="py-3.5 px-4 font-bold">Homeroom Incharge</th>
                <th className="py-3.5 px-4 font-bold">Contact Credentials</th>
                <th className="py-3.5 px-4 font-bold">Employment Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A756B] font-mono text-xs">
                    No faculty records match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#FAF8F3] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#171614]">
                        {t.fullName}
                      </div>
                      <div className="text-[11px] text-[#7A756B] font-mono mt-0.5">
                        Code: {t.employeeId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#171614]">{t.designation}</p>
                      <p className="text-[11px] text-[#7A756B] font-mono">{t.departmentName || "General Faculty"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.classTeacherOf ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF6ED] text-[#856D3B] border border-[#D4B87C]/50">
                          {t.classTeacherOf}
                        </span>
                      ) : (
                        <span className="text-[#7A756B] font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#7A756B]">
                      <p className="text-[#171614]">{t.email}</p>
                      <p className="text-[#7A756B] mt-0.5">{t.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F4F6F1] text-[#525E4B] border border-[#65705B]/30">
                        {t.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacher(t)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#856D3B] hover:text-[#171614] transition-colors"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-2 bg-[#FAF8F3]/50">
          <PremiumPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTeachers.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Teacher Profile Right-Side Slide-Over Drawer */}
      {selectedTeacher && (
        <Drawer
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          title={selectedTeacher.fullName}
          description={`Employee Code: ${selectedTeacher.employeeId} • ${selectedTeacher.designation}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Drawer Tab Navigation */}
            <div className="flex border-b border-[#EFECE3] pb-2 gap-2">
              {[
                { id: "overview", label: "Overview" },
                { id: "academic", label: "Lecture Allocations" },
                { id: "leave", label: "Leave & Compensation" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    drawerTab === tab.id
                      ? "bg-[#1B1916] text-[#FAF8F3] shadow-xs"
                      : "text-[#7A756B] hover:text-[#171614] hover:bg-[#FAF8F3]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {drawerTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                  <div className="w-12 h-12 rounded-xl bg-[#1B1916] text-[#FAF8F3] flex items-center justify-center font-bold text-lg shadow-xs">
                    {selectedTeacher.fullName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#171614]">{selectedTeacher.fullName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F4F6F1] text-[#525E4B] border border-[#65705B]/30 font-bold">
                        {selectedTeacher.employmentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A756B] mt-0.5">
                      {selectedTeacher.designation} • {selectedTeacher.departmentName || "General Faculty"}
                    </p>
                    <p className="text-[11px] text-[#7A756B] font-mono mt-0.5">{selectedTeacher.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                    Institutional Record
                  </span>
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border border-[#E5E0D5] bg-white text-xs shadow-2xs">
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Employee ID:</span>
                      <p className="font-bold text-[#171614] font-mono mt-0.5">{selectedTeacher.employeeId}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Date of Joining:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{formatDate(selectedTeacher.joiningDate)}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Contact Telephone:</span>
                      <p className="font-bold text-[#171614] font-mono mt-0.5">{selectedTeacher.phone}</p>
                    </div>
                    <div>
                      <span className="text-[#7A756B] text-[11px]">Homeroom Charge:</span>
                      <p className="font-bold text-[#171614] mt-0.5">{selectedTeacher.classTeacherOf || "None Allocated"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEAVE & COMPENSATION */}
            {drawerTab === "leave" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">Casual</span>
                    <div className="text-xl font-extrabold text-[#171614] mt-1">{selectedTeacher.casualLeaveBalance} Days</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">Sick</span>
                    <div className="text-xl font-extrabold text-[#171614] mt-1">{selectedTeacher.sickLeaveBalance} Days</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">Earned</span>
                    <div className="text-xl font-extrabold text-[#171614] mt-1">{selectedTeacher.earnedLeaveBalance} Days</div>
                  </div>
                </div>

                {canViewSalary && (
                  <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-2 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">Monthly Gross Remuneration</span>
                    <div className="text-2xl font-extrabold text-[#171614]">{formatCurrency(selectedTeacher.basicSalary)}</div>
                    <p className="text-[11px] text-[#7A756B]">Includes statutory Provident Fund (PF) and House Rent Allowance (HRA) provisions.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* New Teacher Onboarding Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard Faculty Member"
          description="Create a dedicated educator profile with institutional email, subject portfolio, and system credentials."
          size="lg"
        >
          <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Ananya"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Mathematics Lead"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@northstar.edu.in"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171614] mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98100 00000"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
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
                Onboard Faculty
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
