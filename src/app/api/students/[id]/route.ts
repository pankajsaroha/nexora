import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateStudentSchema = z.object({
  action: z.enum(["UPDATE", "DEACTIVATE", "RESTORE"]).optional().default("UPDATE"),
  deactivationReason: z.string().optional().nullable(),

  firstName: z.string().optional(),
  middleName: z.string().optional().nullable(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodGroup: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  aadhaarNumber: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  // Academic & Enrollment
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  rollNumber: z.string().optional().nullable(),
  admissionNumber: z.string().optional().nullable(),
  universityRegNumber: z.string().optional().nullable(),
  admissionType: z.string().optional().nullable(),
  previousSchool: z.string().optional().nullable(),
  previousQualification: z.string().optional().nullable(),
  batch: z.string().optional().nullable(),
  semester: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "DEACTIVATED", "ARCHIVED", "ALUMNI", "SUSPENDED"]).optional(),
  notes: z.string().optional().nullable(),

  // Primary Guardian
  guardianId: z.string().optional(),
  guardianFullName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")).nullable(),
  guardianOccupation: z.string().optional().nullable(),
  guardianAddress: z.string().optional().nullable(),

  // Secondary Guardian
  secondaryGuardianId: z.string().optional(),
  secondaryGuardianName: z.string().optional().nullable(),
  secondaryGuardianRelation: z.string().optional().nullable(),
  secondaryGuardianPhone: z.string().optional().nullable(),
  secondaryGuardianEmail: z.string().email().optional().or(z.literal("")).nullable(),

  // Custom Field Values
  customFieldValues: z.record(z.any()).optional(),
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

    const student = await prisma.student.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
      include: {
        currentClass: {
          include: {
            department: true,
          },
        },
        currentSection: {
          include: {
            classTeacher: true,
          },
        },
        academicYear: true,
        guardians: {
          include: {
            guardian: true,
          },
        },
        fees: {
          include: {
            feeStructure: {
              include: {
                feeCategory: true,
              },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 60,
        },
        customFieldValues: {
          include: {
            customField: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Compute real attendance statistics
    const totalAttendanceRecorded = student.attendance.length;
    const presentDays = student.attendance.filter(
      (a) => a.status === "PRESENT" || a.status === "HALF_DAY"
    ).length;
    const attendancePercentage =
      totalAttendanceRecorded > 0
        ? Math.round((presentDays / totalAttendanceRecorded) * 1000) / 10
        : null;

    // Compute real fee totals
    const totalFeesAmount = student.fees.reduce((acc, f) => acc + f.totalAmount, 0);
    const totalPaidAmount = student.fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalPendingAmount = student.fees.reduce((acc, f) => acc + f.pendingAmount, 0);

    return NextResponse.json({
      student: {
        ...student,
        computed: {
          attendancePercentage,
          totalAttendanceRecorded,
          presentDays,
          totalFeesAmount,
          totalPaidAmount,
          totalPendingAmount,
        },
      },
    });
  } catch (error: any) {
    console.error("Fetch student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch student profile" },
      { status: 500 }
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
    const json = await req.json();
    const parsed = updateStudentSchema.parse(json);

    // Verify student belongs to this tenant
    const existingStudent = await prisma.student.findFirst({
      where: { id, institutionId: user.institutionId },
      include: {
        guardians: {
          include: { guardian: true },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Handle DEACTIVATE lifecycle action
    if (parsed.action === "DEACTIVATE") {
      if (!hasPermission(user, PERMISSIONS.STUDENTS_DEACTIVATE) && !hasPermission(user, PERMISSIONS.STUDENTS_EDIT)) {
        return NextResponse.json({ error: "Forbidden. Insufficient permissions to deactivate student." }, { status: 403 });
      }

      const deactivatedStudent = await prisma.student.update({
        where: { id },
        data: {
          status: "DEACTIVATED",
          deactivatedAt: new Date(),
          deactivatedByUserId: user.id,
          deactivationReason: parsed.deactivationReason?.trim() || "Administrative deactivation",
        },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "DEACTIVATE",
        entity: "Student",
        entityId: id,
        details: `Deactivated student '${deactivatedStudent.fullName}' (Adm: ${deactivatedStudent.admissionNumber}). Reason: ${deactivatedStudent.deactivationReason}. Historical academic, attendance, and financial records preserved.`,
      });

      return NextResponse.json({
        success: true,
        message: `Student '${deactivatedStudent.fullName}' has been deactivated. Historical records have been preserved.`,
        student: deactivatedStudent,
      });
    }

    // Handle RESTORE lifecycle action
    if (parsed.action === "RESTORE") {
      if (!hasPermission(user, PERMISSIONS.STUDENTS_RESTORE) && !hasPermission(user, PERMISSIONS.STUDENTS_EDIT)) {
        return NextResponse.json({ error: "Forbidden. Insufficient permissions to restore student." }, { status: 403 });
      }

      const restoredStudent = await prisma.student.update({
        where: { id },
        data: {
          status: "ACTIVE",
          restoredAt: new Date(),
          restoredByUserId: user.id,
        },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "RESTORE",
        entity: "Student",
        entityId: id,
        details: `Restored deactivated student '${restoredStudent.fullName}' (Adm: ${restoredStudent.admissionNumber}) to ACTIVE status.`,
      });

      return NextResponse.json({
        success: true,
        message: `Student '${restoredStudent.fullName}' restored to active status.`,
        student: restoredStudent,
      });
    }

    // Standard EDIT
    if (!hasPermission(user, PERMISSIONS.STUDENTS_EDIT)) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 });
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      const studentUpdateData: any = {};

      if (parsed.firstName !== undefined || parsed.lastName !== undefined || parsed.middleName !== undefined) {
        const fName = parsed.firstName !== undefined ? parsed.firstName : existingStudent.firstName;
        const mName = parsed.middleName !== undefined ? parsed.middleName : existingStudent.middleName;
        const lName = parsed.lastName !== undefined ? parsed.lastName : existingStudent.lastName;
        studentUpdateData.firstName = fName;
        studentUpdateData.middleName = mName;
        studentUpdateData.lastName = lName;
        studentUpdateData.fullName = `${fName} ${mName ? mName + " " : ""}${lName}`.trim();
      }

      if (parsed.dateOfBirth) studentUpdateData.dateOfBirth = new Date(parsed.dateOfBirth);
      if (parsed.gender) studentUpdateData.gender = parsed.gender;
      if (parsed.bloodGroup !== undefined) studentUpdateData.bloodGroup = parsed.bloodGroup;
      if (parsed.nationality !== undefined) studentUpdateData.nationality = parsed.nationality;
      if (parsed.category !== undefined) studentUpdateData.category = parsed.category;
      if (parsed.aadhaarNumber !== undefined) studentUpdateData.aadhaarNumber = parsed.aadhaarNumber;
      if (parsed.email !== undefined) studentUpdateData.email = parsed.email;
      if (parsed.phone !== undefined) studentUpdateData.phone = parsed.phone;
      if (parsed.addressLine1 !== undefined) studentUpdateData.addressLine1 = parsed.addressLine1;
      if (parsed.addressLine2 !== undefined) studentUpdateData.addressLine2 = parsed.addressLine2;
      if (parsed.city !== undefined) studentUpdateData.city = parsed.city;
      if (parsed.state !== undefined) studentUpdateData.state = parsed.state;
      if (parsed.pincode !== undefined) studentUpdateData.pincode = parsed.pincode;
      if (parsed.country !== undefined) studentUpdateData.country = parsed.country;

      if (
        parsed.addressLine1 !== undefined ||
        parsed.city !== undefined ||
        parsed.state !== undefined
      ) {
        const parts = [
          parsed.addressLine1 ?? existingStudent.addressLine1,
          parsed.addressLine2 ?? existingStudent.addressLine2,
          parsed.city ?? existingStudent.city,
          parsed.state ?? existingStudent.state,
          parsed.pincode ?? existingStudent.pincode,
          parsed.country ?? existingStudent.country,
        ].filter(Boolean);
        studentUpdateData.address = parts.length > 0 ? parts.join(", ") : null;
      }

      // Roll Number and Identifiers
      if (parsed.rollNumber !== undefined) {
        studentUpdateData.rollNumber = parsed.rollNumber && parsed.rollNumber.trim() !== "" ? parsed.rollNumber.trim() : null;
      }
      if (parsed.admissionNumber !== undefined && parsed.admissionNumber && parsed.admissionNumber.trim() !== "") {
        studentUpdateData.admissionNumber = parsed.admissionNumber.trim();
      }
      if (parsed.universityRegNumber !== undefined) {
        studentUpdateData.universityRegNumber = parsed.universityRegNumber?.trim() || null;
      }

      // Academic & Enrollment
      if (parsed.classId) studentUpdateData.currentClassId = parsed.classId;
      if (parsed.sectionId) studentUpdateData.currentSectionId = parsed.sectionId;
      if (parsed.academicYearId) studentUpdateData.academicYearId = parsed.academicYearId;
      if (parsed.admissionType !== undefined) studentUpdateData.admissionType = parsed.admissionType;
      if (parsed.previousSchool !== undefined) studentUpdateData.previousSchool = parsed.previousSchool;
      if (parsed.previousQualification !== undefined) studentUpdateData.previousQualification = parsed.previousQualification;
      if (parsed.batch !== undefined) studentUpdateData.batch = parsed.batch;
      if (parsed.semester !== undefined) studentUpdateData.semester = parsed.semester;
      if (parsed.status) studentUpdateData.status = parsed.status;
      if (parsed.notes !== undefined) studentUpdateData.notes = parsed.notes;

      const updated = await tx.student.update({
        where: { id },
        data: studentUpdateData,
      });

      // 1. Update Primary Guardian
      if (parsed.guardianFullName || parsed.guardianPhone || parsed.guardianRelation) {
        const primaryLink = existingStudent.guardians.find((g) => g.isPrimary) || existingStudent.guardians[0];
        if (primaryLink) {
          await tx.guardian.update({
            where: { id: primaryLink.guardianId },
            data: {
              fullName: parsed.guardianFullName || undefined,
              relation: parsed.guardianRelation || undefined,
              phone: parsed.guardianPhone || undefined,
              email: parsed.guardianEmail !== undefined ? parsed.guardianEmail : undefined,
              occupation: parsed.guardianOccupation !== undefined ? parsed.guardianOccupation : undefined,
              address: parsed.guardianAddress !== undefined ? parsed.guardianAddress : undefined,
            },
          });
        } else if (parsed.guardianFullName && parsed.guardianPhone) {
          const newGuardian = await tx.guardian.create({
            data: {
              institutionId: user.institutionId,
              fullName: parsed.guardianFullName,
              relation: parsed.guardianRelation || "PARENT",
              phone: parsed.guardianPhone,
              email: parsed.guardianEmail || null,
              occupation: parsed.guardianOccupation || null,
              address: parsed.guardianAddress || null,
            },
          });
          await tx.studentGuardian.create({
            data: {
              studentId: id,
              guardianId: newGuardian.id,
              isPrimary: true,
            },
          });
        }
      }

      // 2. Update Secondary Guardian
      if (parsed.secondaryGuardianName && parsed.secondaryGuardianPhone) {
        const secondaryLink = existingStudent.guardians.find((g) => !g.isPrimary);
        if (secondaryLink) {
          await tx.guardian.update({
            where: { id: secondaryLink.guardianId },
            data: {
              fullName: parsed.secondaryGuardianName,
              relation: parsed.secondaryGuardianRelation || "MOTHER",
              phone: parsed.secondaryGuardianPhone,
              email: parsed.secondaryGuardianEmail || null,
            },
          });
        } else {
          const newSecGuardian = await tx.guardian.create({
            data: {
              institutionId: user.institutionId,
              fullName: parsed.secondaryGuardianName,
              relation: parsed.secondaryGuardianRelation || "MOTHER",
              phone: parsed.secondaryGuardianPhone,
              email: parsed.secondaryGuardianEmail || null,
            },
          });
          await tx.studentGuardian.create({
            data: {
              studentId: id,
              guardianId: newSecGuardian.id,
              isPrimary: false,
            },
          });
        }
      }

      // 3. Update Custom Field Values
      if (parsed.customFieldValues) {
        const customFields = await tx.studentCustomField.findMany({
          where: { institutionId: user.institutionId },
        });

        for (const [key, val] of Object.entries(parsed.customFieldValues)) {
          const field = customFields.find((cf) => cf.key === key);
          if (field) {
            const stringifiedVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
            await tx.studentCustomFieldValue.upsert({
              where: {
                studentId_customFieldId: {
                  studentId: id,
                  customFieldId: field.id,
                },
              },
              create: {
                studentId: id,
                customFieldId: field.id,
                value: stringifiedVal,
              },
              update: {
                value: stringifiedVal,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "UPDATE",
          entity: "Student",
          entityId: id,
          details: `Updated student record for '${updated.fullName}' (Adm: ${updated.admissionNumber}, Roll: ${updated.rollNumber || "Not assigned"}).`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Student record updated successfully.",
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update student." },
      { status: 400 }
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

    // Hard delete is restricted to SUPER_ADMIN with strict logging
    if (user.roleCode !== "SUPER_ADMIN" && !hasPermission(user, PERMISSIONS.STUDENTS_DELETE)) {
      return NextResponse.json(
        { error: "Forbidden. Permanent deletion is restricted to Super Administrators. Use 'Deactivate Student' instead." },
        { status: 403 }
      );
    }

    const { id } = params;

    const student = await prisma.student.findFirst({
      where: { id, institutionId: user.institutionId },
      include: {
        fees: { include: { payments: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify if paid financial transactions exist
    const hasPaidFees = student.fees.some((f) => f.paidAmount > 0 || f.payments.length > 0);
    if (hasPaidFees) {
      return NextResponse.json(
        { error: `Cannot permanently delete '${student.fullName}' because recorded fee payments exist in the ledger. Use 'Deactivate Student' to preserve regulatory audit compliance.` },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.studentCustomFieldValue.deleteMany({ where: { studentId: id } }),
      prisma.studentFee.deleteMany({ where: { studentId: id } }),
      prisma.studentAttendance.deleteMany({ where: { studentId: id } }),
      prisma.studentGuardian.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "DELETE",
          entity: "Student",
          entityId: id,
          details: `PERMANENT DELETE executed for student '${student.fullName}' (Adm: ${student.admissionNumber}) by ${user.fullName} (${user.roleCode}).`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Student '${student.fullName}' permanently deleted.`,
    });
  } catch (error: any) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete student." },
      { status: 500 }
    );
  }
}
