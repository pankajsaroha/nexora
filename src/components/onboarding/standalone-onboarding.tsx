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

  const validateStep = (step: number) => {
    if (step === 2) {
      if (!formData.name.trim()) return "Please enter the legal name of your institution.";
      if (!formData.code.trim()) return "Please enter a unique institution code (e.g., NIA, BITS, DPS).";
      if (!formData.email.trim()) return "Please enter the official administrative email.";
    }
    if (step === 3) {
      if (formData.classesList.length === 0) return "Please configure at least one academic cohort or department.";
    }
    if (step === 4) {
      if (!formData.adminName.trim()) return "Please enter the administrator's full name.";
      if (!formData.adminEmail.trim()) return "Please enter the administrator's login email.";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
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
    setIsSubmitting(true);
    setErrorMsg(null);
    setProvisionProgress("Initializing multi-tenant database partitioning...");

    try {
      setTimeout(() => setProvisionProgress("Configuring primary campus & academic session terms..."), 500);
      setTimeout(() => setProvisionProgress("Generating timetable grids, fee categories & root administrator..."), 1100);

      const res = await fetch("/api/institution/onboard", {
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Provisioning failed.");
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
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans flex flex-col md:flex-row">
      {/* LEFT RAIL: Dark Editorial Brand & Step Journey */}
      <div className="w-full md:w-80 lg:w-96 bg-[#0F172A] text-white p-8 sm:p-10 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-10">
          {/* Logo & Top Link */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-md bg-white text-[#0F172A] flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                NX
              </div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-slate-200 transition-colors">
                NEXORA
              </span>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white mt-6">
              Build your institution
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
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
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-white text-[#0F172A] ring-4 ring-white/10"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {isDone ? "✓" : `0${s.id}`}
                    </div>
                    {s.id !== 5 && (
                      <div
                        className={`w-px h-8 my-1 transition-colors ${
                          isDone ? "bg-emerald-500/50" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold leading-none ${
                        isCurrent ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{s.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security / Isolation Footer */}
        <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Tenant isolation active. Your data stays partitioned.</span>
        </div>
      </div>

      {/* RIGHT CANVAS: Clean Warm Ivory Form Area */}
      <div className="flex-1 p-6 sm:p-12 lg:p-16 flex flex-col justify-between max-w-4xl">
        <div className="space-y-8">
          {/* Step Indicator Header */}
          {!isCompleted && (
            <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                Step 0{currentStep} of 05
              </span>
              <span className="text-xs font-medium text-slate-600">
                {STEPS[currentStep - 1]?.title}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: INSTITUTION TYPE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  What are you building?
                </h2>
                <p className="text-xs text-slate-600 mt-1">
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
                      className={`cursor-pointer p-5 rounded-xl border transition-editorial flex items-center justify-between ${
                        isSelected
                          ? "border-[#0F172A] bg-white shadow-xs"
                          : "border-[#E8E7DF] bg-white hover:border-slate-400"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#0F172A]">{opt.title}</h3>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{opt.desc}</p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "text-[#0F172A] translate-x-1" : "text-slate-300"
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
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Institution Profile & Headquarters
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Official identity rendered on fee receipts, student identity cards, and academic transcripts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-name" className="text-xs font-semibold">
                    Legal Institution Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="inst-name"
                    placeholder="e.g. Cambridge International Academy"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-code" className="text-xs font-semibold">
                    Unique Institution Code <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="inst-code"
                    placeholder="e.g. CIA-GLOBAL"
                    value={formData.code}
                    onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                    className="h-10 text-xs font-mono uppercase border-[#E8E7DF] bg-white"
                  />
                  <span className="text-[10px] text-slate-600">Used for tenant isolation and roll number prefixes.</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-email" className="text-xs font-semibold">
                    Official Administrative Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="inst-email"
                    type="email"
                    placeholder="admin@cambridge.edu.in"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-phone" className="text-xs font-semibold">
                    Official Contact Number
                  </Label>
                  <Input
                    id="inst-phone"
                    placeholder="+91 98100 00000"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-web" className="text-xs font-semibold">
                    Official Website URL
                  </Label>
                  <Input
                    id="inst-web"
                    placeholder="https://www.cambridge.edu.in"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-address" className="text-xs font-semibold">
                    Campus Address
                  </Label>
                  <Input
                    id="inst-address"
                    placeholder="Plot No. 14, Institutional Area, Knowledge Park III"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-city" className="text-xs font-semibold">
                    City
                  </Label>
                  <Input
                    id="inst-city"
                    placeholder="Greater Noida"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-state" className="text-xs font-semibold">
                    State / Province
                  </Label>
                  <Input
                    id="inst-state"
                    placeholder="Uttar Pradesh"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACADEMIC STRUCTURE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Academic Framework & Cohorts
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Configure the active academic session and define initial classes or departments.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E8E7DF] bg-white flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Active Academic Session</h4>
                  <p className="text-[11px] text-slate-500">Current fiscal and academic enrollment period</p>
                </div>
                <Input
                  value={formData.academicYearName}
                  onChange={(e) => updateField("academicYearName", e.target.value)}
                  className="w-40 h-9 text-xs font-semibold border-[#E8E7DF]"
                  placeholder="2026-2027"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                  <span>{formData.institutionType === "COLLEGE" ? "Initial Programs / Departments" : "Initial Classes / Grades"}</span>
                  <span className="text-[11px] text-slate-500">{formData.classesList.length} defined</span>
                </Label>

                <div className="flex gap-2">
                  <Input
                    placeholder={formData.institutionType === "COLLEGE" ? "e.g. Master of Computer Applications" : "e.g. Grade 11 Commerce"}
                    value={formData.newClassInput}
                    onChange={(e) => updateField("newClassInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addClassItem())}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
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
                      className="flex items-center justify-between p-3 rounded-lg border border-[#E8E7DF] bg-white text-xs font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-600 font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[#0F172A] font-semibold">{cls}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeClassItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Master Executive Administrator
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  This root credential holds governance access across all modules, academic rosters, and fee ledgers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="admin-name" className="text-xs font-semibold">
                    Administrator Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="admin-name"
                    placeholder="e.g. Dr. Rajeshwar Sen"
                    value={formData.adminName}
                    onChange={(e) => updateField("adminName", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold">
                    Login Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="superadmin@cambridge.edu.in"
                    value={formData.adminEmail}
                    onChange={(e) => updateField("adminEmail", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-phone" className="text-xs font-semibold">
                    Direct Contact Phone
                  </Label>
                  <Input
                    id="admin-phone"
                    placeholder="+91 98111 22233"
                    value={formData.adminPhone}
                    onChange={(e) => updateField("adminPhone", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="admin-pass" className="text-xs font-semibold">
                    Initial Master Password
                  </Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => updateField("adminPassword", e.target.value)}
                    className="h-10 text-xs border-[#E8E7DF] bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Can be updated anytime after initial security login.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PROVISION */}
          {currentStep === 5 && !isCompleted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Review & Confirm Deployment
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Inspect institutional configuration before committing records to the multi-tenant database cluster.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#E8E7DF] bg-white space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#F4F3ED]">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Institution Name</span>
                    <p className="font-bold text-[#0F172A] text-sm mt-0.5">{formData.name || "—"}</p>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">Code: {formData.code || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Archetype</span>
                    <p className="font-bold text-[#1E3A8A] text-sm mt-0.5">{formData.institutionType}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Session: {formData.academicYearName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#F4F3ED]">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Administrative Contact</span>
                    <p className="font-medium text-slate-800 mt-0.5">{formData.email}</p>
                    <p className="text-slate-500 text-[11px]">{formData.city}, {formData.state}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Root Administrator</span>
                    <p className="font-medium text-slate-800 mt-0.5">{formData.adminName}</p>
                    <p className="text-slate-500 text-[11px]">{formData.adminEmail}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-2">
                    Configured Academic Cohorts ({formData.classesList.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.classesList.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#F4F3ED] border border-[#E8E7DF] text-[11px] font-semibold text-slate-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isSubmitting && (
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center gap-3 text-xs">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                  <span className="font-medium">{provisionProgress || "Provisioning database schema..."}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: SUCCESS STATE */}
          {isCompleted && (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                  PROVISIONING COMPLETED
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                  Your institution is ready.
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  <strong>{formData.name}</strong> has been configured with campus records, academic session hierarchies, and root executive permissions.
                </p>
              </div>

              <div className="p-5 max-w-md mx-auto bg-white rounded-xl border border-[#E8E7DF] text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution Code:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{formData.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrator Login:</span>
                  <span className="font-semibold text-slate-800">{formData.adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenancy Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active & Operational
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs h-11 px-6 font-bold shadow-xs"
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
          <div className="mt-10 pt-6 border-t border-[#E8E7DF] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className="text-xs h-10 px-4 border-[#E8E7DF]"
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
                  className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs h-10 px-6 font-semibold"
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
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-10 px-6 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Creating Institution...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
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
