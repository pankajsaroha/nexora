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
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StaffType, EmploymentType } from "@/lib/staff";

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
  departmentId?: string | null;
}

export interface SectionOption {
  id: string;
  name: string;
  className: string;
  classId: string;
}

export interface StaffOnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departments?: DepartmentOption[];
  subjects?: SubjectOption[];
  sections?: SectionOption[];
  academicYears?: Array<{ id: string; name: string; isCurrent?: boolean }>;
}

export function StaffOnboardingDialog({
  isOpen,
  onClose,
  onSuccess,
  departments = [],
  subjects = [],
  sections = [],
}: StaffOnboardingDialogProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    personalEmail: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    bloodGroup: "O+",
    nationality: "Indian",
    maritalStatus: "MARRIED",
    panNumber: "",
    aadhaarNumber: "",

    // Step 2: Addresses & Emergency Contacts
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    sameAsCurrentAddress: true,
    permAddressLine1: "",
    permAddressLine2: "",
    permCity: "",
    permState: "",
    permCountry: "India",
    permPincode: "",
    emergencyName: "",
    emergencyRelation: "SPOUSE",
    emergencyPhone: "",

    // Step 3: Employment
    employeeId: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    staffType: "TEACHING" as StaffType,
    designation: "Assistant Professor",
    departmentId: departments[0]?.id || "",
    employmentType: "PERMANENT" as EmploymentType,
    joiningDate: new Date().toISOString().split("T")[0],
    workLocation: "Main Campus",
    workShift: "GENERAL",
    basicSalary: 45000,
    bankAccountHolder: "",
    bankAccountNumber: "",
    bankName: "",
    bankIfsc: "",

    // Step 4: Qualifications & Experience
    qualifications: [
      { id: "q1", degree: "Master of Science (M.Sc)", specialization: "Computer Science", institution: "Delhi University", year: "2020", gradeScore: "First Class" },
      { id: "q2", degree: "Bachelor of Education (B.Ed)", specialization: "Mathematics & CS", institution: "State University", year: "2021", gradeScore: "Distinction" },
    ],
    experiences: [
      { id: "e1", organization: "Apex International School", designation: "Faculty", startDate: "2021-07-01", endDate: "2024-03-31", totalYears: "3 Years", description: "Taught Secondary & Higher Secondary Computer Science" },
    ],

    // Step 5: Academic Assignment (if Teaching)
    assignedSubjectIds: [] as string[],
    assignedSectionIds: [] as string[],
    homeroomSectionId: "",

    // Step 6: Portal Access
    grantPortalAccess: true,
    portalRole: "TEACHER",
    portalPassword: "Password@123",
  });

  const isTeaching = formData.staffType === "TEACHING";
  const totalSteps = isTeaching ? 6 : 5;

  const handleNext = () => {
    setErrorMessage(null);
    if (activeStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage("First Name and Last Name are required.");
        return;
      }
      if (!formData.email.trim()) {
        setErrorMessage("Official email address is required.");
        return;
      }
      if (!formData.phone.trim()) {
        setErrorMessage("Primary phone number is required.");
        return;
      }
    } else if (activeStep === 3) {
      if (!formData.employeeId.trim()) {
        setErrorMessage("Employee ID is required.");
        return;
      }
      if (!formData.designation.trim()) {
        setErrorMessage("Designation is required.");
        return;
      }
    }

    if (activeStep < totalSteps) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        personalEmail: formData.personalEmail,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,
        panNumber: formData.panNumber,
        aadhaarNumber: formData.aadhaarNumber,

        employeeId: formData.employeeId,
        staffType: formData.staffType,
        designation: formData.designation,
        departmentId: formData.departmentId || null,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        workLocation: formData.workLocation,
        workShift: formData.workShift,
        basicSalary: Number(formData.basicSalary) || 0,
        bankAccountHolder: formData.bankAccountHolder || `${formData.firstName} ${formData.lastName}`,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        bankIfsc: formData.bankIfsc,

        currentAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        },
        permanentAddress: formData.sameAsCurrentAddress
          ? {
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              pincode: formData.pincode,
            }
          : {
              addressLine1: formData.permAddressLine1,
              addressLine2: formData.permAddressLine2,
              city: formData.permCity,
              state: formData.permState,
              country: formData.permCountry,
              pincode: formData.permPincode,
            },
        sameAsCurrentAddress: formData.sameAsCurrentAddress,
        emergencyContacts: formData.emergencyName
          ? [
              {
                name: formData.emergencyName,
                relation: formData.emergencyRelation,
                phone: formData.emergencyPhone,
              },
            ]
          : [],

        qualifications: formData.qualifications,
        experiences: formData.experiences,

        assignedSubjectIds: isTeaching ? formData.assignedSubjectIds : [],
        assignedSectionIds: isTeaching ? formData.assignedSectionIds : [],
        homeroomSectionId: isTeaching && formData.homeroomSectionId ? formData.homeroomSectionId : null,

        grantPortalAccess: formData.grantPortalAccess,
        portalRole: formData.portalRole,
        portalPassword: formData.portalPassword,
      };

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to onboard staff member.");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { id: `q-${Date.now()}`, degree: "", specialization: "", institution: "", year: String(new Date().getFullYear()), gradeScore: "" },
      ],
    }));
  };

  const removeQualification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q.id !== id),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { id: `e-${Date.now()}`, organization: "", designation: "", startDate: "", endDate: "", totalYears: "", description: "" },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard Staff & Faculty"
      description="Create a comprehensive institutional employee record and configure role permissions."
      size="xl"
    >
      <div className="space-y-6 font-sans">
        {/* Stepper Progress Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          {[
            { step: 1, label: "Personal" },
            { step: 2, label: "Contact" },
            { step: 3, label: "Employment" },
            { step: 4, label: "Qualifications" },
            ...(isTeaching ? [{ step: 5, label: "Assignments" }] : []),
            { step: isTeaching ? 6 : 5, label: "Access & Security" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  activeStep === s.step
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : activeStep > s.step
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {activeStep > s.step ? "✓" : s.step}
              </span>
              <span
                className={`text-xs hidden sm:inline font-medium ${
                  activeStep === s.step ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Personal Information */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              1. Basic Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="e.g. Kumar"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Official Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul.sharma@institution.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Primary Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98100 00000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Aadhaar / Govt ID</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="12-digit number"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Addresses */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              2. Address & Emergency Contacts
            </h3>

            <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
              <h4 className="text-xs font-bold text-foreground">Current Residential Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
              <h4 className="text-xs font-bold text-foreground">Emergency Contact Person</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
                <select
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend / Guardian</option>
                </select>
                <input
                  type="tel"
                  placeholder="Emergency Phone Number"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              3. Employment & Institutional Setup
            </h3>

            {/* Staff Type Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, staffType: "TEACHING", portalRole: "TEACHER" })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.staffType === "TEACHING"
                    ? "border-primary bg-primary-subtle font-bold text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1 text-primary" />
                <p className="text-xs font-bold">Teaching Faculty</p>
                <p className="text-[11px] text-muted-foreground">Professors, Lecturers, Teachers & Instructors</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, staffType: "NON_TEACHING", portalRole: "STAFF" })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.staffType === "NON_TEACHING"
                    ? "border-primary bg-primary-subtle font-bold text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1 text-primary" />
                <p className="text-xs font-bold">Non-Teaching Staff</p>
                <p className="text-[11px] text-muted-foreground">Administration, Finance, IT, Support & Operations</p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g. EMP-2026-001"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Designation *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Assistant Professor / Accountant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">No Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="PERMANENT">Permanent / Full-Time</option>
                  <option value="CONTRACT">Contractual</option>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="VISITING">Visiting Faculty</option>
                  <option value="GUEST">Guest Lecturer</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="AD_HOC">Ad-Hoc</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Monthly Basic Salary (₹)</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground">Disbursement Bank Account</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. HDFC Bank)"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Qualifications & Experience */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                4. Academic Qualifications & Work History
              </h3>
              <button
                type="button"
                onClick={addQualification}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Qualification</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.qualifications.map((q, idx) => (
                <div key={q.id || idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Qualification #{idx + 1}</span>
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQualification(q.id)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Degree / Certificate (e.g. M.Tech, PhD, B.Ed)"
                      value={q.degree}
                      onChange={(e) => {
                        const next = [...formData.qualifications];
                        next[idx].degree = e.target.value;
                        setFormData({ ...formData, qualifications: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                    />
                    <input
                      type="text"
                      placeholder="Specialization (e.g. Computer Science)"
                      value={q.specialization}
                      onChange={(e) => {
                        const next = [...formData.qualifications];
                        next[idx].specialization = e.target.value;
                        setFormData({ ...formData, qualifications: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                    />
                    <input
                      type="text"
                      placeholder="University / Board"
                      value={q.institution}
                      onChange={(e) => {
                        const next = [...formData.qualifications];
                        next[idx].institution = e.target.value;
                        setFormData({ ...formData, qualifications: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2020)"
                      value={q.year}
                      onChange={(e) => {
                        const next = [...formData.qualifications];
                        next[idx].year = e.target.value;
                        setFormData({ ...formData, qualifications: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Past Work Experience</h4>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Experience</span>
                </button>
              </div>

              {formData.experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Organization Name"
                      value={exp.organization}
                      onChange={(e) => {
                        const next = [...formData.experiences];
                        next[idx].organization = e.target.value;
                        setFormData({ ...formData, experiences: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card"
                    />
                    <input
                      type="text"
                      placeholder="Designation / Role"
                      value={exp.designation}
                      onChange={(e) => {
                        const next = [...formData.experiences];
                        next[idx].designation = e.target.value;
                        setFormData({ ...formData, experiences: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card"
                    />
                    <input
                      type="text"
                      placeholder="Total Duration (e.g. 3 Years)"
                      value={exp.totalYears}
                      onChange={(e) => {
                        const next = [...formData.experiences];
                        next[idx].totalYears = e.target.value;
                        setFormData({ ...formData, experiences: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Academic Assignment (Teaching only) */}
        {activeStep === 5 && isTeaching && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              5. Teaching Assignments & Homeroom
            </h3>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Class Teacher / Homeroom Incharge Assignment
              </label>
              <select
                value={formData.homeroomSectionId}
                onChange={(e) => setFormData({ ...formData, homeroomSectionId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">None (Subject Faculty Only)</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className} - Section {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Assigning homeroom designates this faculty as primary class teacher for daily roll call and student remarks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground">Subjects Assigned to Teach</h4>
              <p className="text-[11px] text-muted-foreground">
                You can assign additional classes, sections, and subjects from the Staff Profile at any time.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {subjects.map((sub) => {
                  const isSelected = formData.assignedSubjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? formData.assignedSubjectIds.filter((id) => id !== sub.id)
                          : [...formData.assignedSubjectIds, sub.id];
                        setFormData({ ...formData, assignedSubjectIds: next });
                      }}
                      className={`p-2 rounded-lg text-left text-xs border transition-all ${
                        isSelected
                          ? "bg-primary-subtle border-primary text-foreground font-bold"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <p className="truncate font-semibold">{sub.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{sub.code}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step: Portal Access & Security */}
        {activeStep === (isTeaching ? 6 : 5) && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              {isTeaching ? "6" : "5"}. Nexora Portal Login & Account Security
            </h3>

            <div className="p-4 rounded-xl border border-border bg-card space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.grantPortalAccess}
                  onChange={(e) => setFormData({ ...formData, grantPortalAccess: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Grant Nexora Portal Login Access
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Enables this employee to log into Nexora using their official email address.
                  </span>
                </div>
              </label>

              {formData.grantPortalAccess && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/80">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Assigned System Role</label>
                    <select
                      value={formData.portalRole}
                      onChange={(e) => setFormData({ ...formData, portalRole: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="TEACHER">Faculty / Teacher</option>
                      <option value="HOD">Head of Department (HOD)</option>
                      <option value="ACCOUNTANT">Accountant / Bursar</option>
                      <option value="HR_ADMIN">HR Administrator</option>
                      <option value="STAFF">General Campus Staff</option>
                      <option value="VICE_PRINCIPAL">Vice Principal</option>
                      <option value="PRINCIPAL">Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Temporary Initial Password</label>
                    <input
                      type="text"
                      value={formData.portalPassword}
                      onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={activeStep === 1 ? onClose : handleBack}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            {activeStep === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            {isSubmitting
              ? "Saving..."
              : activeStep === totalSteps
              ? "Complete Onboarding"
              : "Continue"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
