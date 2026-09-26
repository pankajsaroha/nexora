"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export interface ProgramOption {
  id: string;
  name: string;
  code: string;
  level: string;
  durationYears?: number | null;
  department?: { id: string; name: string; code: string } | null;
  sections: Array<{ id: string; name: string; capacity: number }>;
  feeStructures: Array<{
    id: string;
    amount: number;
    frequency: string;
    dueDate: Date | string;
    feeCategory: { id: string; name: string };
  }>;
}

export interface AcademicYearOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface CustomFieldOption {
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
}

interface StudentAdmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  programs: ProgramOption[];
  academicYears: AcademicYearOption[];
  customFields?: CustomFieldOption[];
  onSuccess: (student: any) => void;
  onAssignRollNumber?: (studentId: string, currentRoll: string | null) => void;
}

export function StudentAdmissionDialog({
  isOpen,
  onClose,
  programs,
  academicYears,
  customFields = [],
  onSuccess,
  onAssignRollNumber,
}: StudentAdmissionDialogProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [admittedStudent, setAdmittedStudent] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Student Information
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE",
    bloodGroup: "",
    nationality: "Indian",
    category: "GENERAL",
    aadhaarNumber: "",
    email: "",
    phone: "",

    // Address
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",

    // Primary Guardian
    guardianFirstName: "",
    guardianLastName: "",
    guardianRelation: "FATHER",
    guardianPhone: "",
    guardianEmail: "",
    guardianOccupation: "",
    guardianAddressSameAsStudent: true,
    guardianAddress: "",

    // Secondary Guardian
    hasSecondaryGuardian: false,
    secondaryGuardianName: "",
    secondaryGuardianRelation: "MOTHER",
    secondaryGuardianPhone: "",
    secondaryGuardianEmail: "",

    // Academic & Admission
    admissionDate: new Date().toISOString().split("T")[0],
    academicYearId: academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || "",
    classId: programs[0]?.id || "",
    sectionId: programs[0]?.sections[0]?.id || "",
    admissionType: "REGULAR",
    previousSchool: "",
    previousQualification: "",
    rollNumber: "", // Explicitly empty/null - NOT auto-generated
    admissionNumber: "",
    universityRegNumber: "",
    notes: "",

    // Custom Fields dynamic values
    customFieldValues: {} as Record<string, any>,
  });

  useEffect(() => {
    if (formData.classId) {
      const selected = programs.find((p) => p.id === formData.classId);
      if (selected && selected.sections.length > 0) {
        if (!selected.sections.some((s) => s.id === formData.sectionId)) {
          setFormData((prev) => ({ ...prev, sectionId: selected.sections[0].id }));
        }
      } else {
        setFormData((prev) => ({ ...prev, sectionId: "" }));
      }
    }
  }, [formData.classId, programs]);

  const selectedProgram = programs.find((p) => p.id === formData.classId);
  const selectedYear = academicYears.find((y) => y.id === formData.academicYearId);
  const applicableFees = selectedProgram?.feeStructures || [];
  const totalFeeAmount = applicableFees.reduce((acc, f) => acc + f.amount, 0);

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "MALE",
      bloodGroup: "",
      nationality: "Indian",
      category: "GENERAL",
      aadhaarNumber: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      guardianFirstName: "",
      guardianLastName: "",
      guardianRelation: "FATHER",
      guardianPhone: "",
      guardianEmail: "",
      guardianOccupation: "",
      guardianAddressSameAsStudent: true,
      guardianAddress: "",
      hasSecondaryGuardian: false,
      secondaryGuardianName: "",
      secondaryGuardianRelation: "MOTHER",
      secondaryGuardianPhone: "",
      secondaryGuardianEmail: "",
      admissionDate: new Date().toISOString().split("T")[0],
      academicYearId: academicYears.find((y) => y.isCurrent)?.id || academicYears[0]?.id || "",
      classId: programs[0]?.id || "",
      sectionId: programs[0]?.sections[0]?.id || "",
      admissionType: "REGULAR",
      previousSchool: "",
      previousQualification: "",
      rollNumber: "",
      admissionNumber: "",
      universityRegNumber: "",
      notes: "",
      customFieldValues: {},
    });
    setActiveStep(1);
    setErrorMessage(null);
    setAdmittedStudent(null);
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!formData.firstName.trim()) {
        setErrorMessage("Student First Name is required.");
        return false;
      }
      if (!formData.lastName.trim()) {
        setErrorMessage("Student Last Name is required.");
        return false;
      }
      if (!formData.dateOfBirth) {
        setErrorMessage("Date of Birth is required.");
        return false;
      }
    } else if (step === 3) {
      if (!formData.guardianFirstName.trim()) {
        setErrorMessage("Primary Guardian First Name is required.");
        return false;
      }
      if (!formData.guardianPhone.trim()) {
        setErrorMessage("Primary Guardian Phone Number is required.");
        return false;
      }
    } else if (step === 4) {
      if (!formData.classId) {
        setErrorMessage("Please select a Program / Course.");
        return false;
      }
      // Check required custom fields
      for (const cf of customFields) {
        if (cf.isRequired) {
          const val = formData.customFieldValues[cf.key];
          if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
            setErrorMessage(`Custom field '${cf.name}' is mandatory.`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 5) as any);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setActiveStep((prev) => Math.max(prev - 1, 1) as any);
  };

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
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...formData,
        guardianAddress: formData.guardianAddressSameAsStudent
          ? [formData.addressLine1, formData.addressLine2, formData.city, formData.state, formData.pincode, formData.country].filter(Boolean).join(", ")
          : formData.guardianAddress,
        rollNumber: formData.rollNumber.trim() !== "" ? formData.rollNumber.trim() : null,
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete student admission.");
      }

      setAdmittedStudent(data.student);
      onSuccess(data.student);
    } catch (err: any) {
      console.error("Admission error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during admission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-[#E5E0D5] bg-[#FAF8F3] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EFECE3] bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171614] text-[#FAF8F3] shadow-xs">
              <UserPlus className="h-5 w-5 text-[#D4B87C]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171614]">
                New Student Admission
              </h3>
              <p className="text-xs text-[#7A756B]">
                Register candidate, establish guardian linkages, and assign institution course fee structures.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-xl p-2 text-[#7A756B] hover:bg-[#FAF8F3] hover:text-[#171614] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator (If not completed) */}
        {!admittedStudent && (
          <div className="border-b border-[#EFECE3] bg-[#FAF8F3] px-6 py-3">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: "Student Info", icon: FileText },
                { step: 2, label: "Address", icon: MapPin },
                { step: 3, label: "Guardian Details", icon: Users },
                { step: 4, label: "Academic Enrollment", icon: GraduationCap },
                { step: 5, label: "Fee & Confirmation", icon: CreditCard },
              ].map((s) => {
                const isCurrent = activeStep === s.step;
                const isDone = activeStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < activeStep) setActiveStep(s.step as any);
                    }}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                      isCurrent
                        ? "text-[#171614]"
                        : isDone
                        ? "text-[#856D3B]"
                        : "text-[#A8A295]"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold transition-all ${
                        isCurrent
                          ? "bg-[#171614] text-[#FAF8F3]"
                          : isDone
                          ? "bg-[#D4B87C] text-[#171614]"
                          : "bg-[#EFECE3] text-[#7A756B]"
                      }`}
                    >
                      {isDone ? "✓" : s.step}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {admittedStudent ? (
            /* SUCCESS VIEW */
            <div className="text-center py-6 space-y-6 max-w-lg mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF6ED] border border-[#D4B87C]/40 text-[#856D3B]">
                <CheckCircle2 className="h-9 w-9 text-[#856D3B]" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#856D3B] font-bold">
                  ADMISSION COMPLETED
                </span>
                <h4 className="text-xl font-extrabold text-[#171614] mt-1">
                  {admittedStudent.fullName}
                </h4>
                <p className="text-xs text-[#7A756B] mt-1">
                  Official Admission ID: <span className="font-mono font-bold text-[#171614]">{admittedStudent.admissionNumber}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E0D5] bg-white p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between">
                  <span className="text-[#7A756B]">Program / Course:</span>
                  <span className="font-bold text-[#171614]">{selectedProgram?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A756B]">Academic Year:</span>
                  <span className="font-mono font-bold text-[#171614]">{selectedYear?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A756B]">Roll Number:</span>
                  <span className={`font-mono font-bold ${admittedStudent.rollNumber ? "text-[#171614]" : "text-[#856D3B]"}`}>
                    {admittedStudent.rollNumber || "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A756B]">Assigned Fee:</span>
                  <span className="font-mono font-bold text-[#171614]">
                    {totalFeeAmount > 0 ? `₹${totalFeeAmount.toLocaleString("en-IN")}` : "No fee configured"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Admit Another Student
                </Button>
                {onAssignRollNumber && !admittedStudent.rollNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAssignRollNumber(admittedStudent.id, null);
                      resetForm();
                      onClose();
                    }}
                    className="w-full sm:w-auto"
                  >
                    Assign Roll Number
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                >
                  View Student Directory
                </Button>
              </div>
            </div>
          ) : (
            /* STEPPED ADMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: STUDENT PERSONAL INFO */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[#EFECE3] pb-2">
                    <h4 className="text-sm font-bold text-[#171614]">1. Candidate Information</h4>
                    <p className="text-xs text-[#7A756B]">Primary biographical and identity details of the applicant.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Ishaan"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        placeholder="Optional"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Verma"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Blood Group
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
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
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        placeholder="Indian"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Social Category
                      </label>
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
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Aadhaar / Government ID
                      </label>
                      <input
                        type="text"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        placeholder="XXXX-XXXX-XXXX (Optional)"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] font-mono focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Student Direct Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student@domain.com (Optional)"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Student Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX (Optional)"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] font-mono focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#EFECE3] pb-2">
                    <h4 className="text-sm font-bold text-[#171614]">2. Residential & Contact Address</h4>
                    <p className="text-xs text-[#7A756B]">Official correspondence and residential location for transport and emergency reach.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="Flat / House No., Building Name, Street"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        placeholder="Area, Landmark, Sector"
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Noida / New Delhi"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="e.g. Uttar Pradesh"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          PIN / Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="201301"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="India"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: GUARDIAN DETAILS */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-[#EFECE3] pb-2">
                    <h4 className="text-sm font-bold text-[#171614]">3. Guardian & Family Linkage</h4>
                    <p className="text-xs text-[#7A756B]">Establish verified parent records linked directly to the admitted candidate in the database.</p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E0D5] bg-white p-4 space-y-4 shadow-2xs">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                      Primary Guardian (Required)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.guardianFirstName}
                          onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                          placeholder="e.g. Ramesh"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.guardianLastName}
                          onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                          placeholder="e.g. Verma"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Relationship *
                        </label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Primary Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.guardianPhone}
                          onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.guardianEmail}
                          onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                          placeholder="parent@domain.com"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171614] mb-1">
                          Occupation / Designation
                        </label>
                        <input
                          type="text"
                          value={formData.guardianOccupation}
                          onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                          placeholder="e.g. Civil Engineer (Optional)"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Guardian Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#171614] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasSecondaryGuardian}
                        onChange={(e) => setFormData({ ...formData, hasSecondaryGuardian: e.target.checked })}
                        className="rounded border-[#DCD7CB] text-[#171614] focus:ring-[#B89B62]"
                      />
                      Add Secondary Guardian / Co-Parent (Optional)
                    </label>

                    {formData.hasSecondaryGuardian && (
                      <div className="mt-3 rounded-2xl border border-[#E5E0D5] bg-white p-4 space-y-4 shadow-2xs">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A756B] block">
                          Secondary Guardian
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#171614] mb-1">Full Name</label>
                            <input
                              type="text"
                              value={formData.secondaryGuardianName}
                              onChange={(e) => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                              placeholder="e.g. Sunita Verma"
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
                              <option value="GUARDIAN">Guardian</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#171614] mb-1">Phone</label>
                            <input
                              type="tel"
                              value={formData.secondaryGuardianPhone}
                              onChange={(e) => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-mono text-[#171614]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: ACADEMIC DETAILS & CUSTOM FIELDS */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-[#EFECE3] pb-2">
                    <h4 className="text-sm font-bold text-[#171614]">4. Academic Cohort & Custom Fields</h4>
                    <p className="text-xs text-[#7A756B]">Assign to institution-defined course/grade, section, and capture institution custom fields.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Academic Year *
                      </label>
                      <select
                        value={formData.academicYearId}
                        onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                      >
                        {academicYears.map((ay) => (
                          <option key={ay.id} value={ay.id}>
                            {ay.name} {ay.isCurrent ? "(Current)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Program / Course / Grade *
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code}) • {p.level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Section / Batch
                      </label>
                      <select
                        value={formData.sectionId}
                        onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                      >
                        {selectedProgram?.sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            Section {s.name} (Cap: {s.capacity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Admission Date *
                      </label>
                      <input
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs text-[#171614]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171614] mb-1">
                        Admission Type
                      </label>
                      <select
                        value={formData.admissionType}
                        onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                        className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-semibold text-[#171614]"
                      >
                        <option value="REGULAR">Regular Admission</option>
                        <option value="LATERAL_ENTRY">Lateral Entry</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="SCHOLARSHIP">Merit / Scholarship</option>
                      </select>
                    </div>
                  </div>

                  {/* ROLL NUMBER & ADMISSION NUMBER EXPLICIT FIELDS */}
                  <div className="rounded-2xl border border-[#D4B87C]/40 bg-[#FAF6ED] p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#856D3B]" />
                      <span className="text-xs font-bold text-[#171614]">
                        Institutional Identifiers (No Auto-Generation)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-[#171614] mb-1">
                          Official Roll Number
                        </label>
                        <input
                          type="text"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          placeholder="e.g. BTECH-CSE-2026-041 or leave blank"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                        />
                        <p className="text-[11px] text-[#7A756B] mt-1">
                          Leave empty to set as &quot;Not assigned&quot;. Nexora does not generate roll numbers.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-[#171614] mb-1">
                          Admission Number
                        </label>
                        <input
                          type="text"
                          value={formData.admissionNumber}
                          onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                          placeholder="Auto-assigned by institution sequence if empty"
                          className="w-full rounded-xl border border-[#DCD7CB] bg-white p-2.5 text-xs font-mono text-[#171614] focus:outline-none focus:ring-2 focus:ring-[#B89B62]"
                        />
                        <p className="text-[11px] text-[#7A756B] mt-1">
                          Institution serial identifier.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC INSTITUTION CUSTOM FIELDS */}
                  {customFields.length > 0 && (
                    <div className="rounded-2xl border border-[#E5E0D5] bg-white p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-[#EFECE3] pb-2">
                        <span className="text-xs font-bold text-[#171614]">
                          Additional Institutional Attributes
                        </span>
                        <span className="text-[10px] font-mono text-[#856D3B]">
                          Configured by Institution
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {customFields.map((field) => (
                          <div key={field.id} className={field.fieldType === "TEXTAREA" ? "sm:col-span-2" : ""}>
                            <label className="block font-bold text-[#171614] mb-1">
                              {field.name} {field.isRequired ? <span className="text-red-600">*</span> : ""}
                            </label>

                            {field.fieldType === "DROPDOWN" ? (
                              <select
                                value={formData.customFieldValues[field.key] || ""}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                              >
                                <option value="">Select Option</option>
                                {field.options.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : field.fieldType === "TEXTAREA" ? (
                              <textarea
                                value={formData.customFieldValues[field.key] || ""}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                placeholder={field.placeholder || ""}
                                rows={2}
                                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                              />
                            ) : field.fieldType === "BOOLEAN" ? (
                              <select
                                value={formData.customFieldValues[field.key] ?? ""}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value === "true")}
                                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs font-semibold text-[#171614]"
                              >
                                <option value="">Select Yes/No</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <input
                                type={field.fieldType === "NUMBER" ? "number" : field.fieldType === "DATE" ? "date" : "text"}
                                value={formData.customFieldValues[field.key] || ""}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                placeholder={field.placeholder || ""}
                                className="w-full rounded-xl border border-[#DCD7CB] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                              />
                            )}

                            {field.helpText && (
                              <p className="text-[10px] text-[#7A756B] mt-0.5">{field.helpText}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: FEE STRUCTURE RESOLUTION & REVIEW */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-[#EFECE3] pb-2">
                    <h4 className="text-sm font-bold text-[#171614]">5. Course Fee Structure & Review</h4>
                    <p className="text-xs text-[#7A756B]">Fees are automatically derived from the institution&apos;s configured fee blueprint for this course.</p>
                  </div>

                  {/* Dynamic Fee Structure Resolution Box */}
                  <div className="rounded-2xl border border-[#E5E0D5] bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171614]">
                        Assigned Fee Structure: {selectedProgram?.name} ({selectedYear?.name})
                      </span>
                      <span className="text-xs font-mono font-extrabold text-[#171614]">
                        Total: ₹{totalFeeAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {applicableFees.length === 0 ? (
                      <div className="rounded-xl bg-[#FAF8F3] p-3 text-center text-xs text-[#7A756B]">
                        No specific fee breakdown is pre-configured for this course. You can configure fee structures under Finance & Fees anytime.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EFECE3] text-xs">
                        {applicableFees.map((fee) => (
                          <div key={fee.id} className="py-2 flex items-center justify-between">
                            <span className="text-[#555047] font-medium">{fee.feeCategory.name}</span>
                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-[11px] text-[#7A756B]">{fee.frequency}</span>
                              <span className="font-bold text-[#171614]">₹{fee.amount.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Final Review Summary Card */}
                  <div className="rounded-2xl border border-[#DCD7CB] bg-[#FAF8F3] p-4 text-xs space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#856D3B] block">
                      Admission Summary
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <span className="text-[#7A756B] text-[11px]">Candidate:</span>
                        <p className="font-bold text-[#171614]">{formData.firstName} {formData.middleName} {formData.lastName}</p>
                      </div>
                      <div>
                        <span className="text-[#7A756B] text-[11px]">Program:</span>
                        <p className="font-bold text-[#171614]">{selectedProgram?.name}</p>
                      </div>
                      <div>
                        <span className="text-[#7A756B] text-[11px]">Primary Guardian:</span>
                        <p className="font-bold text-[#171614]">{formData.guardianFirstName} {formData.guardianLastName} ({formData.guardianRelation})</p>
                      </div>
                      <div>
                        <span className="text-[#7A756B] text-[11px]">Assigned Roll No:</span>
                        <p className="font-mono font-bold text-[#856D3B]">
                          {formData.rollNumber.trim() ? formData.rollNumber : "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#EFECE3]">
                {activeStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>

                  {activeStep < 5 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNext}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSubmitting}
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-[#D4B87C]" />}
                    >
                      Admit Student
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
