"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  GraduationCap, 
  School, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  UserCheck, 
  Loader2,
  Plus,
  Trash2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 1, title: "Institution Type", desc: "Select organizational model" },
  { id: 2, title: "Profile & Contact", desc: "Legal identity & campus details" },
  { id: 3, title: "Academic Structure", desc: "Grades, departments & terms" },
  { id: 4, title: "Administrator", desc: "Root executive credential" },
  { id: 5, title: "Review & Provision", desc: "Instant database deployment" },
];

export function OnboardingWizard() {
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
      if (!formData.name.trim()) return "Please enter institution legal name.";
      if (!formData.code.trim()) return "Please enter a unique institution code (e.g., NIA, BITS, DPS).";
      if (!formData.email.trim()) return "Please enter official administrative email.";
    }
    if (step === 3) {
      if (formData.classesList.length === 0) return "Please configure at least one academic class or department.";
    }
    if (step === 4) {
      if (!formData.adminName.trim()) return "Please enter administrator full name.";
      if (!formData.adminEmail.trim()) return "Please enter administrator email address.";
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
    setProvisionProgress("Initializing multi-tenant schema isolation...");

    try {
      setTimeout(() => setProvisionProgress("Creating primary campus & academic hierarchies..."), 600);
      setTimeout(() => setProvisionProgress("Configuring default sections, timetable grids & fee ledgers..."), 1200);

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
    <div className="max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Enterprise Setup Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Onboard New Educational Institution
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Provision a dedicated high-performance tenancy with automated academic structures, fee frameworks, and root administrator credentials.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STEPS.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id || isCompleted;
            return (
              <div
                key={step.id}
                className={`flex flex-col gap-1 p-2.5 rounded-lg transition-all ${
                  isCurrent
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800"
                    : isDone
                    ? "bg-slate-50 dark:bg-slate-800/40"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {isDone ? "✓" : step.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Step {step.id}
                  </span>
                </div>
                <p
                  className={`text-xs font-semibold mt-1 truncate ${
                    isCurrent
                      ? "text-indigo-900 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
        {/* STEP 1: INSTITUTION TYPE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Choose Institutional Architecture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nexora automatically tunes timetable grids, attendance policies, and terminology based on the selected institution archetype.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "SCHOOL",
                  title: "K-12 School / Academy",
                  desc: "Classes, sections, daily attendance, class teacher assignments & CBSE/ICSE/IB report card workflows.",
                  icon: School,
                  badge: "Most Popular",
                },
                {
                  id: "COLLEGE",
                  title: "College / Degree Institute",
                  desc: "Departments, multi-year degree programs, semester credit courses, subject faculty & GPA grading.",
                  icon: GraduationCap,
                  badge: "Higher Ed",
                },
                {
                  id: "UNIVERSITY",
                  title: "University / Group",
                  desc: "Multi-faculty governance, constituent colleges, research programs & cross-departmental operations.",
                  icon: Building2,
                  badge: "Enterprise",
                },
              ].map((item) => {
                const isSelected = formData.institutionType === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeSelect(item.id)}
                    className={`text-left p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                          {item.badge}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                      <span className={isSelected ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-slate-400"}>
                        {isSelected ? "Selected Model" : "Click to Select"}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE & CONTACT */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Institutional Profile & Headquarters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official details rendered on fee receipts, student identity cards, and academic transcripts.
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-code" className="text-xs font-semibold">
                  Institution Unique Code <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="inst-code"
                  placeholder="e.g. CIA-GLOBAL"
                  value={formData.code}
                  onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                  className="h-9 text-xs font-mono uppercase"
                />
                <span className="text-[10px] text-slate-400">Used for tenant isolation and roll number prefixes.</span>
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-phone" className="text-xs font-semibold">
                  Official Phone Contact
                </Label>
                <Input
                  id="inst-phone"
                  placeholder="+91 98100 00000"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-web" className="text-xs font-semibold">
                  Website URL
                </Label>
                <Input
                  id="inst-web"
                  placeholder="https://www.cambridge.edu.in"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="h-9 text-xs"
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
                  className="h-9 text-xs"
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
                  className="h-9 text-xs"
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
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC STRUCTURE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Academic Framework & Classes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set active session terms and provision default classes/cohorts. You can add or modify sections anytime after onboarding.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Active Academic Session</h4>
                  <p className="text-[11px] text-slate-500">Current fiscal and academic enrollment period</p>
                </div>
              </div>
              <Input
                value={formData.academicYearName}
                onChange={(e) => updateField("academicYearName", e.target.value)}
                className="w-40 h-8 text-xs font-semibold"
                placeholder="2026-2027"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{formData.institutionType === "COLLEGE" ? "Initial Programs / Departments" : "Initial Classes / Grades"}</span>
                <span className="text-[11px] font-normal text-slate-400">{formData.classesList.length} defined</span>
              </Label>

              <div className="flex gap-2">
                <Input
                  placeholder={formData.institutionType === "COLLEGE" ? "e.g. Master of Computer Applications" : "e.g. Grade 11 Commerce"}
                  value={formData.newClassInput}
                  onChange={(e) => updateField("newClassInput", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addClassItem())}
                  className="h-9 text-xs"
                />
                <Button type="button" onClick={addClassItem} variant="outline" size="sm" className="h-9 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
                {formData.classesList.map((cls, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {idx + 1}
                      </span>
                      <span>{cls}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClassItem(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ADMINISTRATOR */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Master Executive Administrator Account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This root administrator will have full governance permissions across all institution modules, financial ledgers, and staff configurations.
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-semibold">
                  Administrator Email / Login ID <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="superadmin@cambridge.edu.in"
                  value={formData.adminEmail}
                  onChange={(e) => updateField("adminEmail", e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-phone" className="text-xs font-semibold">
                  Direct Contact Number
                </Label>
                <Input
                  id="admin-phone"
                  placeholder="+91 98111 22233"
                  value={formData.adminPhone}
                  onChange={(e) => updateField("adminPhone", e.target.value)}
                  className="h-9 text-xs"
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
                  className="h-9 text-xs"
                />
                <span className="text-[10px] text-slate-400">Can be reset immediately after first security login.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & PROVISION */}
        {currentStep === 5 && !isCompleted && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Review & Confirm Deployment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect institutional configuration before committing records to the live database cluster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Institution Name</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{formData.name || "—"}</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">Code: {formData.code || "—"}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Operating Archetype</span>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">{formData.institutionType}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Session: {formData.academicYearName}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Official Contact</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{formData.email}</p>
                <p className="text-slate-500 text-[11px]">{formData.city}, {formData.state}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Root Administrator</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{formData.adminName}</p>
                <p className="text-slate-500 text-[11px]">{formData.adminEmail}</p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Configured Academic Cohorts ({formData.classesList.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.classesList.map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {isSubmitting && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  {provisionProgress || "Provisioning institution schema..."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {isCompleted && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Institution Successfully Provisioned!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                <strong>{formData.name}</strong> has been configured with campus records, academic hierarchies, and root executive permissions.
              </p>
            </div>

            <div className="p-4 max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Institution Code:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formData.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Administrator:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tenancy Status:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active & Operational
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
              >
                Launch Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isCompleted && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className="text-xs h-9"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Provisioning Database...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Provision Institution Now
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
