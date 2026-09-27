import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { parseStaffMetadata, serializeStaffMetadata, ExtendedStaffData } from "@/lib/staff";
import { logAuditEvent } from "@/lib/audit";
import { getEmployeeLeaveSummary } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  alternatePhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  bloodGroup: z.string().optional(),
  nationality: z.string().default("Indian"),
  maritalStatus: z.string().optional(),
  panNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  personalEmail: z.string().optional(),

  // Employment
  employeeId: z.string().min(1, "Employee ID is required"),
  staffType: z.enum(["TEACHING", "NON_TEACHING"]).default("TEACHING"),
  designation: z.string().min(1, "Designation is required"),
  departmentId: z.string().optional().nullable(),
  employmentType: z.string().default("PERMANENT"),
  employmentStatus: z.string().default("ACTIVE"),
  joiningDate: z.string().optional(),
  workLocation: z.string().optional(),
  workShift: z.string().optional(),
  reportingManager: z.string().optional(),
  probationEndDate: z.string().optional(),
  confirmationDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),

  // Compensation
  basicSalary: z.number().min(0).optional(),
  bankAccountHolder: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),

  // Address
  currentAddress: z.object({
    addressLine1: z.string().default(""),
    addressLine2: z.string().optional(),
    city: z.string().default(""),
    state: z.string().default(""),
    country: z.string().default("India"),
    pincode: z.string().default(""),
  }).optional(),
  permanentAddress: z.object({
    addressLine1: z.string().default(""),
    addressLine2: z.string().optional(),
    city: z.string().default(""),
    state: z.string().default(""),
    country: z.string().default("India"),
    pincode: z.string().default(""),
  }).optional(),
  sameAsCurrentAddress: z.boolean().default(true),

  // Emergency Contacts
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relation: z.string(),
    phone: z.string(),
    alternatePhone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  })).optional(),

  // Qualifications & Experience
  qualifications: z.array(z.any()).optional(),
  experiences: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),
  customFields: z.record(z.any()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const staff = await prisma.teacher.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
      include: {
        department: true,
        campus: true,
        user: {
          select: {
            id: true,
            email: true,
            roleCode: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        sectionsAsClassTeacher: {
          include: {
            class: true,
            _count: { select: { students: true } },
          },
        },
        teacherAssignments: {
          include: {
            subject: true,
            section: { include: { class: true } },
            academicYear: true,
          },
        },
        timetableSlots: {
          include: {
            subject: true,
            section: { include: { class: true } },
          },
          orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        payrolls: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 12,
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Monthly attendance records
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [attendanceMonth, auditLogs] = await Promise.all([
      prisma.staffAttendance.findMany({
        where: {
          teacherId: staff.id,
          date: { gte: startOfMonth },
        },
        orderBy: { date: "desc" },
      }),
      prisma.auditLog.findMany({
        where: {
          institutionId: user.institutionId,
          entity: "Teacher",
          entityId: staff.id,
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

    const parsedMetadata = parseStaffMetadata(staff.qualification);

    // Permission check for sensitive payroll info
    const canViewPayroll =
      user.roleCode === "SUPER_ADMIN" ||
      user.roleCode === "PRINCIPAL" ||
      user.roleCode === "ACCOUNTANT" ||
      user.roleCode === "HR_ADMIN" ||
      user.teacherId === staff.id;

    // Mask bank account number if viewer does not have payroll permission
    const bankAccountNumber = canViewPayroll
      ? (staff.bankAccountNumber || parsedMetadata.bankDetails?.accountNumber)
      : staff.bankAccountNumber
      ? `••••••••${staff.bankAccountNumber.slice(-4)}`
      : null;

    const panNumber = canViewPayroll
      ? parsedMetadata.panNumber
      : parsedMetadata.panNumber
      ? `••••••${parsedMetadata.panNumber.slice(-4)}`
      : null;

    const aadhaarNumber = canViewPayroll
      ? parsedMetadata.aadhaarNumber
      : parsedMetadata.aadhaarNumber
      ? `••••••••${parsedMetadata.aadhaarNumber.slice(-4)}`
      : null;

    let leaveSummary = null;
    try {
      leaveSummary = await getEmployeeLeaveSummary({
        institutionId: user.institutionId,
        teacherId: staff.id,
      });
    } catch (e) {
      console.warn("Could not fetch leaveSummary for staff:", e);
    }

    return NextResponse.json({
      staff: {
        id: staff.id,
        employeeId: staff.employeeId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phone,
        designation: staff.designation,
        departmentId: staff.departmentId,
        departmentName: staff.department?.name || "Unassigned",
        departmentCode: staff.department?.code,
        joiningDate: staff.joiningDate,
        employmentStatus: staff.employmentStatus,
        basicSalary: canViewPayroll ? staff.basicSalary : 0,
        bankAccountNumber,
        bankIfsc: canViewPayroll ? staff.bankIfsc : null,
        bankAccountHolder: canViewPayroll ? parsedMetadata.bankAccountHolder : null,
        bankName: canViewPayroll ? parsedMetadata.bankName : null,
        bankBranch: canViewPayroll ? parsedMetadata.bankBranch : null,
        pfNumber: canViewPayroll ? parsedMetadata.pfNumber : null,
        esiNumber: canViewPayroll ? parsedMetadata.esiNumber : null,
        photoUrl: staff.photoUrl,
        casualLeaveBalance: staff.casualLeaveBalance,
        sickLeaveBalance: staff.sickLeaveBalance,
        earnedLeaveBalance: staff.earnedLeaveBalance,
        leaveSummary,
        user: staff.user,
        sectionsAsClassTeacher: staff.sectionsAsClassTeacher,
        teacherAssignments: staff.teacherAssignments,
        timetableSlots: staff.timetableSlots,
        leaveRequests: staff.leaveRequests,
        payrolls: canViewPayroll ? staff.payrolls : [],
        attendanceMonth,
        auditLogs,
        metadata: {
          ...parsedMetadata,
          panNumber,
          aadhaarNumber,
        },
        canViewPayroll,
      },
    });
  } catch (error: any) {
    console.error("GET /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch staff details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.TEACHERS_EDIT)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit staff records." },
        { status: 403 }
      );
    }

    const { id } = params;
    const json = await req.json();
    const parsed = updateStaffSchema.parse(json);

    const existingStaff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { user: true },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Check duplicate employee ID or email
    if (parsed.employeeId !== existingStaff.employeeId) {
      const duplicateEmp = await prisma.teacher.findFirst({
        where: {
          institutionId: user.institutionId,
          employeeId: parsed.employeeId.trim(),
          id: { not: id },
        },
      });
      if (duplicateEmp) {
        return NextResponse.json(
          { error: `An employee with ID '${parsed.employeeId}' already exists.` },
          { status: 400 }
        );
      }
    }

    const fullName = [parsed.firstName, parsed.middleName, parsed.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    // Preserve existing documents & custom fields if not modified
    const currentMeta = parseStaffMetadata(existingStaff.qualification);
    const updatedMetadata: ExtendedStaffData = {
      ...currentMeta,
      staffType: parsed.staffType,
      employmentType: parsed.employmentType as any,
      middleName: parsed.middleName?.trim() || undefined,
      dateOfBirth: parsed.dateOfBirth,
      gender: parsed.gender,
      bloodGroup: parsed.bloodGroup?.trim() || undefined,
      nationality: parsed.nationality || "Indian",
      maritalStatus: parsed.maritalStatus as any,
      panNumber: parsed.panNumber?.trim() || currentMeta.panNumber,
      aadhaarNumber: parsed.aadhaarNumber?.trim() || currentMeta.aadhaarNumber,
      personalEmail: parsed.personalEmail?.trim() || undefined,
      alternatePhone: parsed.alternatePhone?.trim() || undefined,
      currentAddress: parsed.currentAddress || currentMeta.currentAddress,
      permanentAddress: parsed.sameAsCurrentAddress ? parsed.currentAddress : (parsed.permanentAddress || currentMeta.permanentAddress),
      sameAsCurrentAddress: parsed.sameAsCurrentAddress,
      emergencyContacts: parsed.emergencyContacts || currentMeta.emergencyContacts || [],
      reportingManager: parsed.reportingManager?.trim() || undefined,
      workLocation: parsed.workLocation?.trim() || undefined,
      workShift: parsed.workShift?.trim() || undefined,
      probationEndDate: parsed.probationEndDate || undefined,
      confirmationDate: parsed.confirmationDate || undefined,
      contractStartDate: parsed.contractStartDate || undefined,
      contractEndDate: parsed.contractEndDate || undefined,
      bankAccountHolder: parsed.bankAccountHolder?.trim() || currentMeta.bankAccountHolder,
      bankName: parsed.bankName?.trim() || currentMeta.bankName,
      bankBranch: parsed.bankBranch?.trim() || currentMeta.bankBranch,
      pfNumber: parsed.pfNumber?.trim() || currentMeta.pfNumber,
      esiNumber: parsed.esiNumber?.trim() || currentMeta.esiNumber,
      qualifications: parsed.qualifications || currentMeta.qualifications || [],
      experiences: parsed.experiences || currentMeta.experiences || [],
      documents: parsed.documents || currentMeta.documents || [],
      customFields: parsed.customFields || currentMeta.customFields || {},
    };

    const qualificationPayload = serializeStaffMetadata(updatedMetadata);

    const updatedStaff = await prisma.$transaction(async (tx) => {
      // 1. Update Teacher
      const staff = await tx.teacher.update({
        where: { id },
        data: {
          employeeId: parsed.employeeId.trim(),
          firstName: parsed.firstName.trim(),
          lastName: parsed.lastName.trim(),
          fullName,
          email: parsed.email.trim().toLowerCase(),
          phone: parsed.phone.trim(),
          designation: parsed.designation.trim(),
          departmentId: parsed.departmentId || null,
          qualification: qualificationPayload,
          joiningDate: parsed.joiningDate ? new Date(parsed.joiningDate) : existingStaff.joiningDate,
          employmentStatus: parsed.employmentStatus || existingStaff.employmentStatus,
          basicSalary: parsed.basicSalary !== undefined ? parsed.basicSalary : existingStaff.basicSalary,
          bankAccountNumber: parsed.bankAccountNumber !== undefined ? parsed.bankAccountNumber.trim() : existingStaff.bankAccountNumber,
          bankIfsc: parsed.bankIfsc !== undefined ? parsed.bankIfsc.trim() : existingStaff.bankIfsc,
        },
      });

      // 2. Update linked User account name/phone/email if exists
      if (existingStaff.userId) {
        await tx.user.update({
          where: { id: existingStaff.userId },
          data: {
            fullName,
            email: parsed.email.trim().toLowerCase(),
            phone: parsed.phone.trim(),
          },
        });
      }

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STAFF_UPDATED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Updated staff profile for ${fullName} (${staff.employeeId})`,
        },
      });

      return staff;
    });

    return NextResponse.json({
      success: true,
      message: `Staff record '${fullName}' updated successfully.`,
      staff: updatedStaff,
    });
  } catch (error: any) {
    console.error("PUT /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update staff member" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { action, reason, status } = body;

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (action === "DEACTIVATE") {
      if (!hasPermission(user, PERMISSIONS.TEACHERS_DEACTIVATE)) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to deactivate staff." },
          { status: 403 }
        );
      }

      const meta = parseStaffMetadata(staff.qualification);
      meta.deactivationReason = reason || "Administrative deactivation";
      meta.deactivatedAt = new Date().toISOString();
      meta.deactivatedBy = user.fullName;

      await prisma.$transaction(async (tx) => {
        // 1. Update teacher status
        await tx.teacher.update({
          where: { id },
          data: {
            employmentStatus: "DEACTIVATED",
            qualification: serializeStaffMetadata(meta),
          },
        });

        // 2. Disable linked portal account
        if (staff.userId) {
          await tx.user.update({
            where: { id: staff.userId },
            data: { isActive: false },
          });
        }

        // 3. Audit Log
        await tx.auditLog.create({
          data: {
            institutionId: user.institutionId,
            userId: user.id,
            userName: user.fullName,
            userEmail: user.email,
            action: "STAFF_DEACTIVATED",
            entity: "Teacher",
            entityId: staff.id,
            details: `Deactivated staff ${staff.fullName} (${staff.employeeId}). Reason: ${reason || "N/A"}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Staff member '${staff.fullName}' has been deactivated.`,
      });
    }

    if (action === "RESTORE") {
      if (!hasPermission(user, PERMISSIONS.TEACHERS_RESTORE)) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to restore staff." },
          { status: 403 }
        );
      }

      const meta = parseStaffMetadata(staff.qualification);
      meta.deactivationReason = undefined;
      meta.deactivatedAt = undefined;
      meta.deactivatedBy = undefined;

      await prisma.$transaction(async (tx) => {
        await tx.teacher.update({
          where: { id },
          data: {
            employmentStatus: "ACTIVE",
            qualification: serializeStaffMetadata(meta),
          },
        });

        if (staff.userId) {
          await tx.user.update({
            where: { id: staff.userId },
            data: { isActive: true },
          });
        }

        await tx.auditLog.create({
          data: {
            institutionId: user.institutionId,
            userId: user.id,
            userName: user.fullName,
            userEmail: user.email,
            action: "STAFF_RESTORED",
            entity: "Teacher",
            entityId: staff.id,
            details: `Restored staff member ${staff.fullName} (${staff.employeeId}) to Active status`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Staff member '${staff.fullName}' has been restored to Active status.`,
      });
    }

    if (action === "UPDATE_STATUS") {
      if (!hasPermission(user, PERMISSIONS.TEACHERS_EDIT)) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to update staff status." },
          { status: 403 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.teacher.update({
          where: { id },
          data: { employmentStatus: status },
        });

        if (status === "RESIGNED" || status === "RETIRED" || status === "TERMINATED") {
          if (staff.userId) {
            await tx.user.update({
              where: { id: staff.userId },
              data: { isActive: false },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            institutionId: user.institutionId,
            userId: user.id,
            userName: user.fullName,
            userEmail: user.email,
            action: "STAFF_STATUS_CHANGED",
            entity: "Teacher",
            entityId: staff.id,
            details: `Updated status for ${staff.fullName} to ${status}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Employment status updated to '${status}'.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update staff status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Super Admin can permanently delete
    if (user.roleCode !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error:
            "Forbidden: Permanent deletion of employee records is restricted to Super Administrators only. Please use 'Deactivate' instead.",
        },
        { status: 403 }
      );
    }

    const { id } = params;

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
      include: {
        payrolls: true,
        attendanceRecords: true,
        assignments: true,
        timetableSlots: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Dependency inspection guard
    const hasPayrolls = staff.payrolls.length > 0;
    const hasAttendance = staff.attendanceRecords.length > 0;

    if (hasPayrolls || hasAttendance) {
      return NextResponse.json(
        {
          error: `Cannot permanently delete staff member '${staff.fullName}' because active historical records exist (${staff.payrolls.length} payroll entries, ${staff.attendanceRecords.length} attendance records). Deactivate the employee to preserve financial audit compliance.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Unlink Homeroom incharge
      await tx.section.updateMany({
        where: { classTeacherId: staff.id },
        data: { classTeacherId: null },
      });

      // 2. Delete assignments & timetable
      await tx.teacherAssignment.deleteMany({ where: { teacherId: staff.id } });
      await tx.timetableSlot.deleteMany({ where: { teacherId: staff.id } });
      await tx.classTeacher.deleteMany({ where: { teacherId: staff.id } });
      await tx.leaveRequest.deleteMany({ where: { teacherId: staff.id } });

      // 3. Delete Teacher
      await tx.teacher.delete({ where: { id: staff.id } });

      // 4. Delete linked user account if only used for this teacher
      if (staff.userId) {
        await tx.user.delete({ where: { id: staff.userId } });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STAFF_PERMANENTLY_DELETED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Super Admin permanently deleted staff record ${staff.fullName} (${staff.employeeId})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Staff member '${staff.fullName}' (${staff.employeeId}) was permanently removed.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete staff record" },
      { status: 500 }
    );
  }
}
