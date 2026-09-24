import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  admissionNumber: z.string().optional(),
  rollNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  parentName: z.string().optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  parentEmail: z.string().optional().or(z.literal("")),
  emergencyPhone: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createStudentSchema.parse(json);

    // Auto-generate admission number if not provided
    const admissionNo =
      parsed.admissionNumber ||
      `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check collision
    const existing = await prisma.student.findFirst({
      where: {
        admissionNumber: admissionNo,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A student with admission number '${admissionNo}' already exists.` },
        { status: 400 }
      );
    }

    // Get current academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { institutionId: user.institutionId, isCurrent: true },
    }) || await prisma.academicYear.findFirst({
      where: { institutionId: user.institutionId },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found for institution." },
        { status: 400 }
      );
    }

    const student = await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          institutionId: user.institutionId,
          admissionNumber: admissionNo,
          rollNumber: parsed.rollNumber || "01",
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          fullName: `${parsed.firstName} ${parsed.lastName}`.trim(),
          dateOfBirth: new Date(parsed.dateOfBirth),
          gender: parsed.gender,
          bloodGroup: parsed.bloodGroup || null,
          email: parsed.email || null,
          phone: parsed.phone || null,
          currentClassId: parsed.classId,
          currentSectionId: parsed.sectionId,
          academicYearId: academicYear.id,
          emergencyContactPhone: parsed.emergencyPhone || parsed.parentPhone || null,
          status: "ACTIVE",
        },
      });

      // If parent information supplied, create guardian link
      if (parsed.parentName && parsed.parentPhone) {
        const guardian = await tx.guardian.create({
          data: {
            institutionId: user.institutionId,
            fullName: parsed.parentName,
            phone: parsed.parentPhone,
            email: parsed.parentEmail || null,
            relation: "PARENT",
          },
        });

        await tx.studentGuardian.create({
          data: {
            studentId: createdStudent.id,
            guardianId: guardian.id,
            isPrimary: true,
          },
        });
      }

      // Initialize default tuition fee record
      const feeStructure = await tx.feeStructure.findFirst({
        where: { classId: parsed.classId },
      });

      if (feeStructure) {
        await tx.studentFee.create({
          data: {
            studentId: createdStudent.id,
            feeStructureId: feeStructure.id,
            academicYearId: academicYear.id,
            totalAmount: feeStructure.amount,
            pendingAmount: feeStructure.amount,
            paidAmount: 0,
            dueDate: feeStructure.dueDate,
            status: "PENDING",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STUDENT_ADMITTED",
          entity: "Student",
          entityId: createdStudent.id,
          details: `Admitted ${createdStudent.fullName} (${createdStudent.admissionNumber}) to section ${createdStudent.currentSectionId}`,
        },
      });

      return createdStudent;
    });

    return NextResponse.json({
      success: true,
      message: `Student '${student.fullName}' admitted successfully with Roll #${student.rollNumber}.`,
      student,
    });
  } catch (error: any) {
    console.error("Student admission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to admit student." },
      { status: 400 }
    );
  }
}
