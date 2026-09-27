"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, Briefcase, GraduationCap, MapPin, CreditCard, Shield } from "lucide-react";
import { StaffType, EmploymentType, ExtendedStaffData } from "@/lib/staff";

export interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  staff: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    departmentId?: string | null;
    basicSalary: number;
    bankAccountNumber?: string | null;
    bankIfsc?: string | null;
    joiningDate?: string | Date;
    employmentStatus: string;
    metadata?: ExtendedStaffData;
  } | null;
  departments?: Array<{ id: string; name: string; code: string }>;
}

export function EditStaffModal({
  isOpen,
  onClose,
  onSuccess,
  staff,
  departments = [],
}: EditStaffModalProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "contact" | "compensation">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

    employeeId: "",
    staffType: "TEACHING" as StaffType,
    designation: "",
    departmentId: "",
    employmentType: "PERMANENT" as EmploymentType,
    employmentStatus: "ACTIVE",
    joiningDate: "",
    workLocation: "",
    workShift: "GENERAL",
    reportingManager: "",

    basicSalary: 45000,
    bankAccountHolder: "",
    bankAccountNumber: "",
    bankName: "",
    bankIfsc: "",
    bankBranch: "",
    pfNumber: "",
    esiNumber: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  useEffect(() => {
    if (staff) {
      const meta = staff.metadata || {} as ExtendedStaffData;
      setFormData({
        firstName: staff.firstName || "",
        middleName: meta.middleName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        alternatePhone: meta.alternatePhone || "",
        personalEmail: meta.personalEmail || "",
        dateOfBirth: meta.dateOfBirth || "",
        gender: (meta.gender as any) || "MALE",
        bloodGroup: meta.bloodGroup || "O+",
        nationality: meta.nationality || "Indian",
        maritalStatus: (meta.maritalStatus as any) || "MARRIED",
        panNumber: meta.panNumber || "",
        aadhaarNumber: meta.aadhaarNumber || "",

        employeeId: staff.employeeId || "",
        staffType: meta.staffType || "TEACHING",
        designation: staff.designation || "",
        departmentId: staff.departmentId || "",
        employmentType: meta.employmentType || "PERMANENT",
        employmentStatus: staff.employmentStatus || "ACTIVE",
        joiningDate: staff.joiningDate ? new Date(staff.joiningDate).toISOString().split("T")[0] : "",
        workLocation: meta.workLocation || "Main Campus",
        workShift: meta.workShift || "GENERAL",
        reportingManager: meta.reportingManager || "",

        basicSalary: staff.basicSalary || 0,
        bankAccountHolder: meta.bankAccountHolder || `${staff.firstName} ${staff.lastName}`,
        bankAccountNumber: staff.bankAccountNumber || meta.bankDetails?.accountNumber || "",
        bankName: meta.bankDetails?.bankName || meta.bankName || "",
        bankIfsc: staff.bankIfsc || meta.bankDetails?.ifscCode || meta.bankIfsc || "",
        bankBranch: meta.bankDetails?.branch || meta.bankBranch || "",
        pfNumber: meta.pfNumber || "",
        esiNumber: meta.esiNumber || "",

        addressLine1: meta.currentAddress?.addressLine1 || "",
        addressLine2: meta.currentAddress?.addressLine2 || "",
        city: meta.currentAddress?.city || "",
        state: meta.currentAddress?.state || "",
        country: meta.currentAddress?.country || "India",
        pincode: meta.currentAddress?.pincode || "",
      });
    }
  }, [staff]);

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/teachers/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basicSalary: Number(formData.basicSalary) || 0,
          currentAddress: {
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff record.");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Staff Profile — ${staff.fullName}`}
      description={`Update institutional profile and parameters for Employee ${staff.employeeId}.`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border gap-2 pb-1 overflow-x-auto">
          {[
            { id: "personal", label: "Personal Info", icon: User },
            { id: "employment", label: "Employment", icon: Briefcase },
            { id: "contact", label: "Address & Contact", icon: MapPin },
            { id: "compensation", label: "Payroll & Bank", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary-subtle text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Personal */}
        {activeTab === "personal" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Aadhaar / Government ID</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment */}
        {activeTab === "employment" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Designation *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
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
                <label className="block text-xs font-medium text-foreground mb-1">Staff Type</label>
                <select
                  value={formData.staffType}
                  onChange={(e) => setFormData({ ...formData, staffType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                >
                  <option value="TEACHING">Teaching Faculty</option>
                  <option value="NON_TEACHING">Non-Teaching Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
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
                <label className="block text-xs font-medium text-foreground mb-1">Employment Status</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="RESIGNED">Resigned</option>
                  <option value="RETIRED">Retired</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Work Location</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  placeholder="e.g. Science Block / Main Campus"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Work Shift</label>
                <select
                  value={formData.workShift}
                  onChange={(e) => setFormData({ ...formData, workShift: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                >
                  <option value="GENERAL">General Shift (08:30 - 16:00)</option>
                  <option value="MORNING">Morning Shift</option>
                  <option value="EVENING">Evening Shift</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact */}
        {activeTab === "contact" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Official Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Primary Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-foreground">Current Residential Address</h4>
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Compensation */}
        {activeTab === "compensation" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Monthly Basic Salary (₹)</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-foreground">Bank Account Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-mono"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground uppercase font-mono"
                />
                <input
                  type="text"
                  placeholder="Bank Branch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="text-xs bg-primary hover:bg-primary-hover text-primary-foreground">
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
