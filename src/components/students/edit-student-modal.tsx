"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Users,
  GraduationCap,
  Sparkles,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock,
  Shield,
  FileText,
} from "lucide-react";
import { CustomFieldOption, ProgramOption, AcademicYearOption } from "./student-admission-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  programs?: ProgramOption[];
  academicYears?: AcademicYearOption[];
  customFields?: CustomFieldOption[];
  onSuccess: (updatedStudent: any) => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  programs = [],
  academicYears = [],
  customFields = [],
  onSuccess,
}: EditStudentModalProps) {
  const [activeTab, setActiveTab] = useState<
    "INFO" | "ADDRESS" | "GUARDIAN" | "ACADEMIC" | "CUSTOM" | "FEES"
  >("INFO");

  const primaryGuardian =
    student.guardians?.find((g: any) => g.isPrimary)?.guardian ||
    student.guardians?.[0]?.guardian;

  const secondaryGuardian =
    student.guardians?.find((g: any) => !g.isPrimary)?.guardian;

  // Initialize custom fields values map
  const initialCustomMap: Record<string, any> = {};
  if (student.customFieldValues && Array.isArray(student.customFieldValues)) {
    for (const cfv of student.customFieldValues) {
      if (cfv.customField?.key) {
        initialCustomMap[cfv.customField.key] = cfv.value;
      }
    }
  }

  const [formData, setFormData] = useState({
    // 1. Student Info
    firstName: student.firstName || "",
    middleName: student.middleName || "",
    lastName: student.lastName || "",
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: student.gender || "MALE",
    bloodGroup: student.bloodGroup || "",
    nationality: student.nationality || "Indian",
    category: student.category || "GENERAL",
    aadhaarNumber: student.aadhaarNumber || "",
    email: student.email || "",
    phone: student.phone || "",
    status: student.status || "ACTIVE",

    // 2. Address
    addressLine1: student.addressLine1 || "",
    addressLine2: student.addressLine2 || "",
    city: student.city || "",
    state: student.state || "",
    pincode: student.pincode || "",
    country: student.country || "India",

    // 3. Primary Guardian
    guardianFullName: primaryGuardian?.fullName || "",
    guardianRelation: primaryGuardian?.relation || "FATHER",
    guardianPhone: primaryGuardian?.phone || "",
    guardianEmail: primaryGuardian?.email || "",
    guardianOccupation: primaryGuardian?.occupation || "",
    guardianAddress: primaryGuardian?.address || "",

    // Secondary Guardian
    secondaryGuardianName: secondaryGuardian?.fullName || "",
    secondaryGuardianRelation: secondaryGuardian?.relation || "MOTHER",
    secondaryGuardianPhone: secondaryGuardian?.phone || "",
    secondaryGuardianEmail: secondaryGuardian?.email || "",

    // 4. Academic & Enrollment
    academicYearId: student.academicYearId || student.academicYear?.id || "",
    classId: student.currentClassId || student.currentClass?.id || "",
    sectionId: student.currentSectionId || student.currentSection?.id || "",
    rollNumber: student.rollNumber || "",
    admissionNumber: student.admissionNumber || "",
    universityRegNumber: student.universityRegNumber || "",
    admissionType: student.admissionType || "REGULAR",
    previousSchool: student.previousSchool || "",
    previousQualification: student.previousQualification || "",
    batch: student.batch || "",
    semester: student.semester || "",
    notes: student.notes || "",

    // 5. Custom Fields
    customFieldValues: initialCustomMap,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync available sections when class changes
  const selectedProgram = programs.find((p) => p.id === formData.classId);
  const availableSections = selectedProgram?.sections || [];

  const handleCustomFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate essential fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First Name and Last Name are required.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.dateOfBirth) {
      setError("Date of Birth is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE",
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim() || null,
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup || null,
          nationality: formData.nationality || "Indian",
          category: formData.category || null,
          aadhaarNumber: formData.aadhaarNumber.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          status: formData.status,

          addressLine1: formData.addressLine1.trim() || null,
          addressLine2: formData.addressLine2.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          pincode: formData.pincode.trim() || null,
          country: formData.country.trim() || "India",

          // Primary Guardian
          guardianFullName: formData.guardianFullName.trim() || undefined,
          guardianRelation: formData.guardianRelation,
          guardianPhone: formData.guardianPhone.trim() || undefined,
          guardianEmail: formData.guardianEmail.trim() || null,
          guardianOccupation: formData.guardianOccupation.trim() || null,
          guardianAddress: formData.guardianAddress.trim() || null,

          // Secondary Guardian
          secondaryGuardianName: formData.secondaryGuardianName.trim() || null,
          secondaryGuardianRelation: formData.secondaryGuardianRelation || null,
          secondaryGuardianPhone: formData.secondaryGuardianPhone.trim() || null,
          secondaryGuardianEmail: formData.secondaryGuardianEmail.trim() || null,

          // Academic & Enrollment
          academicYearId: formData.academicYearId || undefined,
          classId: formData.classId || undefined,
          sectionId: formData.sectionId || undefined,
          rollNumber: formData.rollNumber.trim() !== "" ? formData.rollNumber.trim() : null,
          admissionNumber: formData.admissionNumber.trim() || undefined,
          universityRegNumber: formData.universityRegNumber.trim() || null,
          admissionType: formData.admissionType || "REGULAR",
          previousSchool: formData.previousSchool.trim() || null,
          previousQualification: formData.previousQualification.trim() || null,
          batch: formData.batch.trim() || null,
          semester: formData.semester.trim() || null,
          notes: formData.notes.trim() || null,

          customFieldValues: formData.customFieldValues,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update student profile.");
      }

      onSuccess(data.student);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save student changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: Array<{ id: "INFO" | "ADDRESS" | "GUARDIAN" | "ACADEMIC" | "CUSTOM" | "FEES"; label: string; icon: any }> = [
    { id: "INFO", label: "Student Info", icon: User },
    { id: "ADDRESS", label: "Address", icon: MapPin },
    { id: "GUARDIAN", label: "Guardians", icon: Users },
    { id: "ACADEMIC", label: "Academic Enrollment", icon: GraduationCap },
    { id: "CUSTOM", label: `Custom Fields (${customFields.length})`, icon: Sparkles },
    { id: "FEES", label: "Fee Ledgers", icon: CreditCard },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Dossier — ${student.fullName}`}
      description="Update biographical data, guardian relationships, academic enrollment parameters, and custom fields."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E0D5] gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#171614] text-[#FAF8F3] shadow-xs"
                    : "text-[#7A756B] hover:text-[#171614] hover:bg-[#FAF8F3]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#8B3A3A]/10 border border-[#8B3A3A]/25 text-[#8B3A3A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* TAB 1: STUDENT INFO */}
        {activeTab === "INFO" && (
          <div className="space-y-4">
            <div className="border-b border-[#EFECE3] pb-2">
              <h4 className="text-sm font-bold text-[#171614]">Candidate Biographical & Identity Data</h4>
              <p className="text-xs text-[#7A756B]">Core personal identity fields saved in the institutional register.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="">Select (Optional)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Social Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="GENERAL">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Aadhaar / National ID</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Direct Student Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Direct Student Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Enrollment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-bold text-[#171614]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DEACTIVATED">Deactivated</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="ALUMNI">Alumni / Graduated</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESS */}
        {activeTab === "ADDRESS" && (
          <div className="space-y-4">
            <div className="border-b border-[#EFECE3] pb-2">
              <h4 className="text-sm font-bold text-[#171614]">Residential & Contact Location</h4>
              <p className="text-xs text-[#7A756B]">Official correspondence address for transport routes, postal circulars, and emergency contact.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="House / Flat No., Society / Building"
                className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Sector, Landmark, Area"
                className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5] text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-[#7A756B] block">
                Consolidated Location Preview
              </span>
              <p className="text-[#171614] font-medium mt-1">
                {[formData.addressLine1, formData.addressLine2, formData.city, formData.state, formData.pincode, formData.country]
                  .filter(Boolean)
                  .join(", ") || "No address entered yet"}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: GUARDIANS */}
        {activeTab === "GUARDIAN" && (
          <div className="space-y-6">
            {/* Primary Guardian */}
            <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#EFECE3] pb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B]">
                  Primary Legal Guardian
                </span>
                <span className="text-[10px] font-mono text-[#525E4B] bg-[#525E4B]/10 px-2 py-0.5 rounded font-bold">
                  Primary Contact
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Guardian Full Name *</label>
                  <input
                    type="text"
                    value={formData.guardianFullName}
                    onChange={(e) => setFormData({ ...formData, guardianFullName: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Relationship</label>
                  <select
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                    <option value="UNCLE">Uncle</option>
                    <option value="AUNT">Aunt</option>
                    <option value="GRANDPARENT">Grandparent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Primary Mobile Phone *</label>
                  <input
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono text-[#171614]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Occupation / Employer</label>
                  <input
                    type="text"
                    value={formData.guardianOccupation}
                    onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Guardian Residential Address</label>
                <input
                  type="text"
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            {/* Secondary Guardian */}
            <div className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-4 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                Secondary Guardian / Co-Parent (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Co-Parent Name</label>
                  <input
                    type="text"
                    value={formData.secondaryGuardianName}
                    onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Relationship</label>
                  <select
                    value={formData.secondaryGuardianRelation}
                    onChange={(e) => setFormData({ ...formData, secondaryGuardianRelation: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                  >
                    <option value="MOTHER">Mother</option>
                    <option value="FATHER">Father</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171614] mb-1">Secondary Mobile Phone</label>
                  <input
                    type="tel"
                    value={formData.secondaryGuardianPhone}
                    onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
                    className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono text-[#171614]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMIC ENROLLMENT */}
        {activeTab === "ACADEMIC" && (
          <div className="space-y-4">
            <div className="border-b border-[#EFECE3] pb-2">
              <h4 className="text-sm font-bold text-[#171614]">Institutional Program & Academic Register</h4>
              <p className="text-xs text-[#7A756B]">Academic cohort alignment, roll numbers, and official university registration identifiers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Academic Session *</label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-bold text-[#171614]"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? " (Current Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Program / Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => {
                    const newClassId = e.target.value;
                    const prog = programs.find((p) => p.id === newClassId);
                    setFormData({
                      ...formData,
                      classId: newClassId,
                      sectionId: prog?.sections[0]?.id || "",
                    });
                  }}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-bold text-[#171614]"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Assigned Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-bold text-[#171614]"
                >
                  {availableSections.length > 0 ? (
                    availableSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        Section {s.name} (Cap: {s.capacity})
                      </option>
                    ))
                  ) : (
                    <option value="">No sections defined</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Official Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 24-CSE-042 (Optional)"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Admission Number</label>
                <input
                  type="text"
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono font-bold text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">University Enrollment No.</label>
                <input
                  type="text"
                  value={formData.universityRegNumber}
                  onChange={(e) => setFormData({ ...formData, universityRegNumber: e.target.value })}
                  placeholder="e.g. UNV-2026-9912"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Admission Type</label>
                <select
                  value={formData.admissionType}
                  onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                >
                  <option value="REGULAR">Regular Admission</option>
                  <option value="LATERAL_ENTRY">Lateral Entry</option>
                  <option value="TRANSFER">Inter-Campus Transfer</option>
                  <option value="SCHOLARSHIP">Merit Scholarship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Previous School / College</label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  placeholder="e.g. St. Xavier's Senior School"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171614] mb-1">Previous Qualification</label>
                <input
                  type="text"
                  value={formData.previousQualification}
                  onChange={(e) => setFormData({ ...formData, previousQualification: e.target.value })}
                  placeholder="e.g. Class 10 CBSE Board (92%)"
                  className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171614] mb-1">Academic & Administrative Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special learning accommodations, sports achievements, or administrative remarks..."
                className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
              />
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM FIELDS */}
        {activeTab === "CUSTOM" && (
          <div className="space-y-4">
            <div className="border-b border-[#EFECE3] pb-2">
              <h4 className="text-sm font-bold text-[#171614]">Institution-Defined Custom Fields</h4>
              <p className="text-xs text-[#7A756B]">Tenant-scoped admission attributes configured specifically for your institution.</p>
            </div>

            {customFields.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F3] rounded-2xl border border-dashed border-[#E5E0D5]">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#856D3B]" />
                <p className="font-bold text-[#171614] text-xs">No Custom Fields Configured</p>
                <p className="text-[#7A756B] text-[11px] mt-0.5">
                  Institutions can define custom student fields in <strong>Settings $\rightarrow$ Student Fields</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customFields.map((field) => {
                  const val = formData.customFieldValues[field.key] ?? "";
                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#171614]">
                          {field.name} {field.isRequired && <span className="text-red-600">*</span>}
                        </label>
                        {field.helpText && (
                          <span className="text-[10px] text-[#7A756B]">{field.helpText}</span>
                        )}
                      </div>

                      {field.fieldType === "LONG_TEXT" ? (
                        <textarea
                          rows={2}
                          value={val}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                        />
                      ) : field.fieldType === "DROPDOWN" ? (
                        <select
                          value={val}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.fieldType === "BOOLEAN" ? (
                        <select
                          value={val}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                        >
                          <option value="">Select...</option>
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                        </select>
                      ) : (
                        <input
                          type={field.fieldType === "NUMBER" ? "number" : field.fieldType === "DATE" ? "date" : "text"}
                          value={val}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: FEES & FINANCIAL OVERVIEW */}
        {activeTab === "FEES" && (
          <div className="space-y-4">
            <div className="border-b border-[#EFECE3] pb-2">
              <h4 className="text-sm font-bold text-[#171614]">Assigned Fee Structure & Financial Ledger</h4>
              <p className="text-xs text-[#7A756B]">Historical invoices and fee balances are maintained in compliance with institutional financial accounting rules.</p>
            </div>

            {(!student.fees || student.fees.length === 0) ? (
              <div className="p-8 text-center bg-[#FAF8F3] rounded-2xl border border-dashed border-[#E5E0D5]">
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-[#856D3B]" />
                <p className="font-bold text-[#171614] text-xs">No Fee Structure Assigned Yet</p>
                <p className="text-[#7A756B] text-[11px] mt-0.5">
                  Fee structures are configured in the Finance module and associated with cohort programs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {student.fees.map((fee: any) => (
                  <div
                    key={fee.id}
                    className="p-4 rounded-2xl border border-[#E5E0D5] bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#856D3B]" />
                        <span className="font-bold text-[#171614] text-xs">
                          {fee.feeStructure?.feeCategory?.name || "Term Tuition Fee"}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          fee.status === "PAID"
                            ? "bg-[#525E4B]/10 text-[#525E4B]"
                            : fee.status === "PARTIAL"
                            ? "bg-[#B89B62]/10 text-[#B89B62]"
                            : "bg-[#8B3A3A]/10 text-[#8B3A3A]"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#FAF8F3] text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-[#7A756B] uppercase block">Total Invoiced</span>
                        <span className="font-bold text-[#171614]">{formatCurrency(fee.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#7A756B] uppercase block">Total Paid</span>
                        <span className="font-bold text-[#525E4B]">{formatCurrency(fee.paidAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#7A756B] uppercase block">Outstanding</span>
                        <span className="font-bold text-[#8B3A3A]">{formatCurrency(fee.pendingAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#7A756B]">
                      <span>Due Date: {formatDate(fee.dueDate)}</span>
                      <span>{fee.payments?.length || 0} Recorded Receipts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D5]">
          <span className="text-[11px] text-[#7A756B]">
            All updates generate tamper-evident institutional audit events.
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Dossier Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
