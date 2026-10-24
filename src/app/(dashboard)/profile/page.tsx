import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentSelfProfile } from "@/components/portal/student-self-profile";
import { TeacherSelfProfile } from "@/components/portal/teacher-self-profile";
import { AdminSelfProfile } from "@/components/portal/admin-self-profile";
import { ChangePasswordCard } from "@/components/portal/change-password-card";
import { Users, GraduationCap, Phone, Mail, ShieldCheck, CheckCircle2, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. STUDENT PROFILE & ACCOUNT SETTINGS
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }, { id: user.studentId }],
        institutionId: user.institutionId,
      },
      include: {
        currentClass: true,
        currentSection: {
          include: { classTeacher: true },
        },
        academicYear: true,
        guardians: {
          include: { guardian: true },
        },
        attendance: true,
        fees: true,
      },
    });

    if (!student) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Student profile record not found for this institution.
        </div>
      );
    }

    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE" || a.status === "HALF_DAY"
    ).length;
    const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const totalFee = student.fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const paidFee = student.fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const pendingFee = student.fees.reduce((sum, f) => sum + f.pendingAmount, 0);

    return (
      <StudentSelfProfile
        student={{
          id: student.id,
          admissionNumber: student.admissionNumber,
          rollNumber: student.rollNumber,
          loginId: student.loginId,
          portalAccessStatus: student.portalAccessStatus,
          fullName: student.fullName,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phone: student.phone,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          category: student.category,
          nationality: student.nationality,
          address: student.address,
          city: student.city,
          state: student.state,
          pincode: student.pincode,
          admissionDate: student.admissionDate,
          status: student.status,
          className: student.currentClass?.name || "General",
          classCode: student.currentClass?.code || "GEN",
          sectionName: student.currentSection?.name || "A",
          academicYearName: student.academicYear?.name || "2026-2027",
          classTeacherName: student.currentSection?.classTeacher?.fullName,
          classTeacherEmail: student.currentSection?.classTeacher?.email,
          emergencyContactName: student.emergencyContactName,
          emergencyContactPhone: student.emergencyContactPhone,
          guardians: student.guardians.map((sg) => ({
            id: sg.guardian.id,
            fullName: sg.guardian.fullName,
            relation: sg.guardian.relation,
            phone: sg.guardian.phone,
            email: sg.guardian.email,
            isPrimary: sg.isPrimary,
          })),
          attendanceSummary: {
            total: totalDays,
            present: presentDays,
            percentage: pct,
          },
          feeSummary: {
            total: totalFee,
            paid: paidFee,
            pending: pendingFee,
          },
        }}
      />
    );
  }

  // 2. TEACHER / FACULTY PROFILE & ACCOUNT SETTINGS
  if (user.roleCode === "TEACHER") {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
        institutionId: user.institutionId,
      },
      include: {
        department: true,
        institution: true,
        sectionsAsClassTeacher: {
          include: { class: true },
        },
        teacherAssignments: {
          include: {
            subject: true,
            section: { include: { class: true } },
          },
        },
      },
    });

    if (!teacher) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-3">
            <h2 className="text-lg font-bold text-foreground">{user.fullName}</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Faculty Account • Email: {user.email} • Institution: {user.institutionName}
            </p>
          </div>
          <ChangePasswordCard />
        </div>
      );
    }

    const casual = teacher.casualLeaveBalance || 0;
    const sick = teacher.sickLeaveBalance || 0;
    const earned = teacher.earnedLeaveBalance || 0;
    const totalAvail = casual + sick + earned;

    return (
      <TeacherSelfProfile
        teacher={{
          id: teacher.id,
          employeeId: teacher.employeeId,
          fullName: teacher.fullName,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          designation: teacher.designation,
          departmentName: teacher.department?.name || "General Department",
          employmentStatus: teacher.employmentStatus,
          joiningDate: teacher.joiningDate,
          institutionName: teacher.institution.name,
          classTeacherOf: teacher.sectionsAsClassTeacher.map((s) => ({
            id: s.id,
            name: s.class.name,
            section: s.name,
            roomNumber: s.roomNumber,
          })),
          assignments: teacher.teacherAssignments.map((a) => ({
            id: a.id,
            subjectName: a.subject.name,
            className: a.section.class.name,
            sectionName: a.section.name,
          })),
          leaveBalances: {
            casual,
            sick,
            earned,
            totalAvailable: totalAvail,
          },
        }}
      />
    );
  }

  // 3. PARENT / GUARDIAN PROFILE & ACCOUNT SETTINGS
  if (user.roleCode === "PARENT") {
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
        institutionId: user.institutionId,
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                currentClass: true,
                currentSection: true,
                academicYear: true,
              },
            },
          },
        },
      },
    });

    const children = guardian?.students?.map((sg) => sg.student) || [];

    return (
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Banner */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-xs">
              {user.fullName ? user.fullName[0] : "P"}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{user.fullName}</h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Role: Verified Parent / Guardian • Institution: {user.institutionName}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Email: {user.email}</p>
            </div>
          </div>
        </div>

        {/* Linked Children Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Linked Children at this Institution</h3>
          </div>

          {children.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground font-mono text-xs">
              No students currently linked to this verified guardian account.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {children.map((child) => (
                <div key={child.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-xs">{child.fullName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border font-bold">
                      {child.currentClass?.name} ({child.currentSection?.name})
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono space-y-0.5">
                    <p>Admission ID: {child.admissionNumber}</p>
                    <p>Roll Number: {child.rollNumber || "Unassigned"}</p>
                    {child.loginId && <p>Student Login ID: {child.loginId}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Password Management */}
        <ChangePasswordCard />
      </div>
    );
  }

  // 4. PRINCIPAL, ADMIN, SUPER_ADMIN & OTHER ADMINISTRATIVE STAFF
  const institution = await prisma.institution.findUnique({
    where: { id: user.institutionId },
  });

  return (
    <AdminSelfProfile
      user={{
        id: user.id,
        fullName: user.fullName || "Administrator",
        email: user.email,
        phone: user.phone,
        roleCode: user.roleCode || "ADMIN",
        roleName:
          user.roleCode === "SUPER_ADMIN"
            ? "Super Administrator"
            : user.roleCode === "PRINCIPAL"
            ? "Principal"
            : user.roleCode === "ADMIN"
            ? "Institution Administrator"
            : user.roleCode === "ACCOUNTANT"
            ? "Financial Accountant"
            : user.roleCode === "HR_ADMIN"
            ? "Human Resources Administrator"
            : "Staff Member",
        institutionId: user.institutionId,
        institutionName: user.institutionName || institution?.name || "Nexora Institution",
        institutionCode: institution?.code,
        isSuperAdmin: user.roleCode === "SUPER_ADMIN",
      }}
    />
  );
}
