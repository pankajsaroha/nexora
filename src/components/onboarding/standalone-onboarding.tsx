"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  School,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 1, title: "Institution Type", subtitle: "Organizational Model" },
  { id: 2, title: "Profile & Campus", subtitle: "Legal Identity & Contact" },
  { id: 3, title: "Academic Framework", subtitle: "Terms & Grade Cohorts" },
  { id: 4, title: "Root Administrator", subtitle: "Master Executive Credential" },
  { id: 5, title: "Review & Provision", subtitle: "Instant Database Creation" },
];

export function StandaloneOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    institutionType: "SCHOOL", // SCHOOL, COLLEGE, UNIVERSITY
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    website: "",
    currency: "INR",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata",
    academicYearName: "2026-2027",
    classesList: [
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11 Science", "Grade 12 Science"
    ],
    newClassInput: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "Password@123",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const handleTypeSelect = (type: string) => {
    let defaultClasses = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    if (type === "COLLEGE") {
      defaultClasses = ["B.Tech Computer Science", "B.Tech Electronics", "B.Sc Mathematics", "BBA", "B.Com Honors"];
    } else if (type === "UNIVERSITY") {
      defaultClasses = ["Faculty of Engineering", "School of Business", "School of Law", "School of Medicine"];
    }
    setFormData((prev) => ({
      ...prev,
      institutionType: type,
      classesList: defaultClasses,
    }));
  };

  const addClassItem = () => {
    if (formData.newClassInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        classesList: [...prev.classesList, prev.newClassInput.trim()],
        newClassInput: "",
      }));
    }
  };

  const removeClassItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      classesList: prev.classesList.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.institutionType) return "Please select an institution type.";
    }
    if (currentStep === 2) {
      if (!formData.name.trim()) return "Institution Name is required.";
      if (!formData.code.trim()) return "Institution Code is required.";
      if (!formData.email.trim() || !formData.email.includes("@")) return "A valid contact email is required.";
    }
    if (currentStep === 3) {
      if (!formData.academicYearName.trim()) return "Academic session name is required.";
      if (formData.classesList.length === 0) return "At least one class/program must be configured.";
    }
    if (currentStep === 4) {
      if (!formData.adminName.trim()) return "Administrator name is required.";
      if (!formData.adminEmail.trim() || !formData.adminEmail.includes("@")) return "A valid admin login email is required.";
      if (formData.adminPassword.length < 6) return "Password must be at least 6 characters.";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleProvision = async () => {
    const error = validateStep();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setProvisionProgress("Initializing isolated institutional tenant...");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionType: formData.institutionType,
          name: formData.name,
          code: formData.code,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          website: formData.website,
          currency: formData.currency,
          currencySymbol: formData.currencySymbol,
          timezone: formData.timezone,
          academicYearName: formData.academicYearName,
          classesOrPrograms: formData.classesList,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPhone: formData.adminPhone,
          adminPassword: formData.adminPassword,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Expected JSON response but received:", {
          status: res.status,
          contentType,
          bodySnippet: text.slice(0, 500),
        });
        throw new Error(
          `Server returned an unexpected response format (${res.status}). Please check network connection or try again.`
        );
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Failed to create institution (${res.status}).`);
      }

      setProvisionProgress("Institution provisioned successfully!");
      setIsCompleted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during database provisioning.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171614] font-sans flex flex-col md:flex-row">
      {/* LEFT RAIL: Dark Editorial Brand & Step Journey */}
      <div className="w-full md:w-80 lg:w-96 bg-[#171614] text-white p-8 sm:p-10 flex flex-col justify-between shrink-0 border-r border-[#2C2924]">
        <div className="space-y-10">
          {/* Logo & Top Link */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-md bg-white text-[#171614] flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                NX
              </div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#B89B62] transition-colors">
                NEXORA
              </span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white mt-6">
              Build your institution
            </h1>
            <p className="text-xs text-[#E5E0D5]/70 mt-1.5 leading-relaxed">
              Provision a dedicated workspace with tailored terms, classes, fee structures, and root governance.
            </p>
          </div>

          {/* Vertical Progress Tracker */}
          <div className="space-y-6">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.id && !isCompleted;
              const isDone = currentStep > s.id || isCompleted;
              return (
                <div key={s.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                        isDone
                          ? "bg-[#65705B] text-white"
                          : isCurrent
                          ? "bg-white text-[#171614] ring-4 ring-white/10"
                          : "bg-[#2C2924] text-[#E5E0D5]/50 border border-[#3C3831]"
                      }`}
                    >
                      {isDone ? "✓" : `0${s.id}`}
                    </div>
                    {s.id !== 5 && (
                      <div
                        className={`w-px h-8 my-1 transition-colors ${
                          isDone ? "bg-[#65705B]/50" : "bg-[#2C2924]"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold leading-none ${
                        isCurrent ? "text-white" : isDone ? "text-[#E5E0D5]" : "text-[#E5E0D5]/50"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="text-[11px] text-[#E5E0D5]/60 mt-1">{s.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security / Isolation Footer */}
        <div className="pt-8 border-t border-[#2C2924] text-[11px] text-[#E5E0D5]/60 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#B89B62] shrink-0" />
          <span>Tenant isolation active. Your data stays partitioned.</span>
        </div>
      </div>

      {/* RIGHT CANVAS: Clean Warm Ivory Form Area */}
      <div className="flex-1 p-6 sm:p-12 lg:p-16 flex flex-col justify-between max-w-4xl">
        <div className="space-y-8">
          {/* Step Indicator Header */}
          {!isCompleted && (
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#65705B] font-semibold">
                Step 0{currentStep} of 05
              </span>
              <span className="text-xs font-medium text-[#171614]">
                {STEPS[currentStep - 1]?.title}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-[#8B3A3A]/10 border border-[#8B3A3A]/20 text-[#8B3A3A] text-xs flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B3A3A] animate-ping shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: INSTITUTION TYPE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171614]">
                  What are you building?
                </h2>
                <p className="text-xs text-[#65705B] mt-1">
                  Nexora will tailor your timetable grids, attendance policies, and terminology based on the selected institution archetype.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "SCHOOL",
                    title: "K-12 School / Academy",
                    desc: "Classes, sections, daily attendance roll call, class teacher incharge assignments & term report cards.",
                  },
                  {
                    id: "COLLEGE",
                    title: "College / Degree Institute",
                    desc: "Academic departments, multi-year degree programs, semester credit courses, subject faculty & GPA grading.",
                  },
                  {
                    id: "UNIVERSITY",
                    title: "University / Institute Group",
                    desc: "Multi-faculty governance, constituent schools, research programs & cross-departmental operations.",
                  },
                ].map((opt) => {
                  const isSelected = formData.institutionType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleTypeSelect(opt.id)}
                      className={`cursor-pointer p-5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#171614] bg-white shadow-xs"
                          : "border-[#E5E0D5] bg-white hover:border-[#171614]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#171614]">{opt.title}</h3>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#B89B62]" />
                          )}
                        </div>
                        <p className="text-xs text-[#65705B] leading-relaxed font-normal">{opt.desc}</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "text-[#171614] translate-x-1" : "text-[#E5E0D5]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE & CAMPUS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171614]">
                  Institution Profile & Headquarters
                </h2>
                <p className="text-xs text-[#65705B] mt-1">
                  Official identity rendered on fee receipts, student identity cards, and academic transcripts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-name" className="text-xs font-semibold text-[#171614]">
                    Legal Institution Name <span className="text-[#8B3A3A]">*</span>
                  </Label>
                  <Input
                    id="inst-name"
                    placeholder="e.g. Cambridge International Academy"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-code" className="text-xs font-semibold text-[#171614]">
                    Unique Institution Code <span className="text-[#8B3A3A]">*</span>
                  </Label>
                  <Input
                    id="inst-code"
                    placeholder="e.g. CIA-GLOBAL"
                    value={formData.code}
                    onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                    className="h-10 text-xs font-mono uppercase border-[#E5E0D5] bg-white text-[#171614]"
                  />
                  <span className="text-[10px] text-[#65705B]">Used for tenant isolation and roll number prefixes.</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-email" className="text-xs font-semibold text-[#171614]">
                    Official Administrative Email <span className="text-[#8B3A3A]">*</span>
                  </Label>
                  <Input
                    id="inst-email"
                    type="email"
                    placeholder="admin@cambridge.edu.in"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-phone" className="text-xs font-semibold text-[#171614]">
                    Official Contact Number
                  </Label>
                  <Input
                    id="inst-phone"
                    placeholder="+91 98100 00000"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-web" className="text-xs font-semibold text-[#171614]">
                    Official Website URL
                  </Label>
                  <Input
                    id="inst-web"
                    placeholder="https://www.cambridge.edu.in"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-address" className="text-xs font-semibold text-[#171614]">
                    Campus Address
                  </Label>
                  <Input
                    id="inst-address"
                    placeholder="Plot No. 14, Institutional Area, Knowledge Park III"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-city" className="text-xs font-semibold text-[#171614]">
                    City
                  </Label>
                  <Input
                    id="inst-city"
                    placeholder="Greater Noida"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-state" className="text-xs font-semibold text-[#171614]">
                    State / Province
                  </Label>
                  <Input
                    id="inst-state"
                    placeholder="Uttar Pradesh"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACADEMIC FRAMEWORK */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171614]">
                  Academic Session & Grade Cohorts
                </h2>
                <p className="text-xs text-[#65705B] mt-1">
                  Define your initial academic calendar year and cohorts. You can add more sections and subjects later.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="session-name" className="text-xs font-semibold text-[#171614]">
                      Current Academic Session Name <span className="text-[#8B3A3A]">*</span>
                    </Label>
                    <Input
                      id="session-name"
                      placeholder="2026-2027"
                      value={formData.academicYearName}
                      onChange={(e) => updateField("academicYearName", e.target.value)}
                      className="h-10 text-xs font-mono border-[#E5E0D5] bg-white text-[#171614]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs font-semibold text-[#171614]">
                      Base Ledger Currency
                    </Label>
                    <Input
                      id="currency"
                      value={`${formData.currency} (${formData.currencySymbol})`}
                      disabled
                      className="h-10 text-xs font-mono border-[#E5E0D5] bg-[#FAF8F3] text-[#65705B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-[#171614]">
                    Active Classes / Programs ({formData.classesList.length})
                  </Label>
                  <p className="text-[11px] text-[#65705B]">
                    These cohorts will be seeded in your timetable and student enrollment engine.
                  </p>
                </div>

                {/* Add Cohort Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Grade 11 Commerce"
                    value={formData.newClassInput}
                    onChange={(e) => updateField("newClassInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addClassItem())}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                  <Button type="button" onClick={addClassItem} variant="outline" size="sm" className="h-10 px-4 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
                  {formData.classesList.map((cls, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#E5E0D5] bg-white text-xs font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-[#FAF8F3] border border-[#E5E0D5] flex items-center justify-center text-[10px] font-mono text-[#65705B] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[#171614] font-semibold">{cls}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeClassItem(idx)}
                        className="text-[#65705B] hover:text-[#8B3A3A] transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ROOT ADMINISTRATOR */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171614]">
                  Master Executive Administrator
                </h2>
                <p className="text-xs text-[#65705B] mt-1">
                  This root credential holds governance access across all modules, academic rosters, and fee ledgers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="admin-name" className="text-xs font-semibold text-[#171614]">
                    Administrator Full Name <span className="text-[#8B3A3A]">*</span>
                  </Label>
                  <Input
                    id="admin-name"
                    placeholder="e.g. Dr. Rajeshwar Sen"
                    value={formData.adminName}
                    onChange={(e) => updateField("adminName", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold text-[#171614]">
                    Login Email Address <span className="text-[#8B3A3A]">*</span>
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="superadmin@cambridge.edu.in"
                    value={formData.adminEmail}
                    onChange={(e) => updateField("adminEmail", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-phone" className="text-xs font-semibold text-[#171614]">
                    Direct Contact Phone
                  </Label>
                  <Input
                    id="admin-phone"
                    placeholder="+91 98111 22233"
                    value={formData.adminPhone}
                    onChange={(e) => updateField("adminPhone", e.target.value)}
                    className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="admin-pass" className="text-xs font-semibold text-[#171614]">
                    Initial Master Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-pass"
                      type={showAdminPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      onChange={(e) => updateField("adminPassword", e.target.value)}
                      className="h-10 text-xs border-[#E5E0D5] bg-white text-[#171614] pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      tabIndex={-1}
                      aria-label={showAdminPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A756B] hover:text-[#171614] transition-colors p-0.5 focus:outline-none"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#65705B]">Can be updated anytime after initial security login.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PROVISION */}
          {currentStep === 5 && !isCompleted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171614]">
                  Review & Confirm Deployment
                </h2>
                <p className="text-xs text-[#65705B] mt-1">
                  Inspect institutional configuration before committing records to the multi-tenant database cluster.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#E5E0D5] bg-white space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E5E0D5]">
                  <div>
                    <span className="text-[#65705B] uppercase tracking-wider text-[10px] font-bold">Institution Name</span>
                    <p className="font-bold text-[#171614] text-sm mt-0.5">{formData.name || "—"}</p>
                    <p className="text-[#65705B] font-mono text-[11px] mt-0.5">Code: {formData.code || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[#65705B] uppercase tracking-wider text-[10px] font-bold">Archetype</span>
                    <p className="font-bold text-[#B89B62] text-sm mt-0.5">{formData.institutionType}</p>
                    <p className="text-[#65705B] text-[11px] mt-0.5">Session: {formData.academicYearName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E5E0D5]">
                  <div>
                    <span className="text-[#65705B] uppercase tracking-wider text-[10px] font-bold">Administrative Contact</span>
                    <p className="font-medium text-[#171614] mt-0.5">{formData.email}</p>
                    <p className="text-[#65705B] text-[11px]">{formData.city}, {formData.state}</p>
                  </div>
                  <div>
                    <span className="text-[#65705B] uppercase tracking-wider text-[10px] font-bold">Root Administrator</span>
                    <p className="font-medium text-[#171614] mt-0.5">{formData.adminName}</p>
                    <p className="text-[#65705B] text-[11px]">{formData.adminEmail}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[#65705B] uppercase tracking-wider text-[10px] font-bold block mb-2">
                    Configured Academic Cohorts ({formData.classesList.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.classesList.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#FAF8F3] border border-[#E5E0D5] text-[11px] font-semibold text-[#171614]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isSubmitting && (
                <div className="p-4 rounded-xl bg-[#171614] text-white flex items-center gap-3 text-xs">
                  <Loader2 className="w-4 h-4 text-[#B89B62] animate-spin shrink-0" />
                  <span className="font-medium">{provisionProgress || "Provisioning database schema..."}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: SUCCESS STATE */}
          {isCompleted && (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#65705B] font-bold block">
                  PROVISIONING COMPLETED
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171614]">
                  Your institution is ready.
                </h2>
                <p className="text-xs text-[#65705B] max-w-md mx-auto">
                  <strong>{formData.name}</strong> has been configured with campus records, academic session hierarchies, and root executive permissions.
                </p>
              </div>

              <div className="p-5 max-w-md mx-auto bg-white rounded-xl border border-[#E5E0D5] text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#65705B]">Institution Code:</span>
                  <span className="font-mono font-bold text-[#171614]">{formData.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65705B]">Administrator Login:</span>
                  <span className="font-semibold text-[#171614]">{formData.adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65705B]">Tenancy Status:</span>
                  <span className="text-[#65705B] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#65705B]" />
                    Active & Operational
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs h-11 px-6 font-bold shadow-xs"
                >
                  Enter Nexora Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isCompleted && (
          <div className="mt-10 pt-6 border-t border-[#E5E0D5] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className="text-xs h-10 px-4 border-[#E5E0D5]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="text-xs h-10 px-6 font-semibold"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleProvision}
                  disabled={isSubmitting}
                  className="text-xs h-10 px-6 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Creating Institution...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#B89B62]" />
                      Create Institution Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
