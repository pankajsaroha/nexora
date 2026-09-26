import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const admissionSchema = z.object({
  // Student Personal Details
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  bloodGroup: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  aadhaarNumber: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),

  // Student Contact & Address
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  country: z.string().optional().default("India"),

  // Primary Guardian Details
  guardianFirstName: z.string().min(1, "Primary guardian first name is required"),
  guardianLastName: z.string().optional().nullable(),
  guardianRelation: z.string().default("FATHER"),
  guardianPhone: z.string().min(5, "Primary guardian phone is required"),
  guardianEmail: z.string().email().optional().or(z.literal("")).nullable(),
  guardianOccupation: z.string().optional().nullable(),
  guardianAddress: z.string().optional().nullable(),

  // Secondary Guardian (Optional)
  secondaryGuardianName: z.string().optional().nullable(),
  secondaryGuardianRelation: z.string().optional().nullable(),
  secondaryGuardianPhone: z.string().optional().nullable(),
  secondaryGuardianEmail: z.string().email().optional().or(z.literal("")).nullable(),

  // Academic & Admission Details
  admissionDate: z.string().optional(),
  academicYearId: z.string().optional(),
  classId: z.string().min(1, "Program / Class is required"),
  sectionId: z.string().optional().nullable(),
  admissionType: z.string().optional().default("REGULAR"),
  previousSchool: z.string().optional().nullable(),
  previousQualification: z.string().optional().nullable(),
  rollNumber: z.string().optional().nullable(), // Explicitly optional - NOT auto-generated
  admissionNumber: z.string().optional().nullable(),
  universityRegNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Custom Field Values
  customFieldValues: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const classId = searchParams.get("classId");
    const status = searchParams.get("status") || "ACTIVE";

    const whereClause: any = {
      institutionId: user.institutionId,
    };

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (classId && classId !== "ALL") {
      whereClause.currentClassId = classId;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { admissionNumber: { contains: search, mode: "insensitive" } },
        { rollNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        currentClass: {
          include: { department: true },
        },
        currentSection: {
          include: { classTeacher: true },
        },
        academicYear: true,
        guardians: {
          include: { guardian: true },
        },
        fees: {
          include: { feeStructure: { include: { feeCategory: true } } },
        },
        customFieldValues: {
          include: { customField: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error("Fetch students error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.STUDENTS_CREATE)) {
      return NextResponse.json({ error: "Forbidden. You do not have permission to admit students." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = admissionSchema.parse(json);

    // Validate institution's active required custom fields
    const activeCustomFields = await prisma.studentCustomField.findMany({
      where: { institutionId: user.institutionId, isActive: true },
    });

    const submittedCustomValues = parsed.customFieldValues || {};
    for (const field of activeCustomFields) {
      if (field.isRequired) {
        const val = submittedCustomValues[field.key];
        if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
          return NextResponse.json(
            { error: `Custom field '${field.name}' is required for admission.` },
            { status: 400 }
          );
        }
      }
    }

    // Resolve Academic Year
    let academicYearId = parsed.academicYearId;
    if (!academicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId, isCurrent: true },
      }) || await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId },
      });

      if (!activeYear) {
        const createdYear = await prisma.academicYear.create({
          data: {
            institutionId: user.institutionId,
            name: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            startDate: new Date(new Date().getFullYear(), 3, 1),
            endDate: new Date(new Date().getFullYear() + 1, 2, 31),
            isCurrent: true,
          },
        });
        academicYearId = createdYear.id;
      } else {
        academicYearId = activeYear.id;
      }
    }

    // Resolve Class/Program and Section
    const selectedClass = await prisma.class.findFirst({
      where: { id: parsed.classId, institutionId: user.institutionId },
      include: { sections: true, feeStructures: true },
    });

    if (!selectedClass) {
      return NextResponse.json({ error: "Selected Program/Class does not exist for your institution." }, { status: 400 });
    }

    let sectionId = parsed.sectionId;
    if (!sectionId || sectionId.trim() === "") {
      if (selectedClass.sections.length > 0) {
        sectionId = selectedClass.sections[0].id;
      } else {
        const createdSection = await prisma.section.create({
          data: {
            classId: selectedClass.id,
            name: "A",
            capacity: 40,
          },
        });
        sectionId = createdSection.id;
      }
    }

    // Resolve Admission Number
    let finalAdmissionNumber = parsed.admissionNumber?.trim();
    if (!finalAdmissionNumber) {
      const inst = await prisma.institution.findUnique({
        where: { id: user.institutionId },
        select: { code: true },
      });
      const count = await prisma.student.count({
        where: { institutionId: user.institutionId },
      });
      const instCode = (inst?.code || "NEX").toUpperCase();
      const currentYear = new Date().getFullYear();
      finalAdmissionNumber = `${instCode}-${currentYear}-${String(count + 1).padStart(4, "0")}`;
    }

    // Check admission number collision
    const existingAdm = await prisma.student.findFirst({
      where: {
        institutionId: user.institutionId,
        admissionNumber: finalAdmissionNumber,
      },
    });

    if (existingAdm) {
      return NextResponse.json(
        { error: `Admission Number '${finalAdmissionNumber}' is already in use by another student.` },
        { status: 400 }
      );
    }

    // Roll number: strictly user-entered or null (never auto-incremented or forced)
    const finalRollNumber = parsed.rollNumber && parsed.rollNumber.trim() !== "" ? parsed.rollNumber.trim() : null;

    // Build consolidated full address
    const addressParts = [
      parsed.addressLine1,
      parsed.addressLine2,
      parsed.city,
      parsed.state,
      parsed.pincode,
      parsed.country,
    ].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

    const primaryGuardianFullName = `${parsed.guardianFirstName} ${parsed.guardianLastName || ""}`.trim();

    // Execute atomic admission transaction
    const student = await prisma.$transaction(async (tx) => {
      // 1. Create Student
      const createdStudent = await tx.student.create({
        data: {
          institutionId: user.institutionId,
          admissionNumber: finalAdmissionNumber!,
          rollNumber: finalRollNumber,
          firstName: parsed.firstName.trim(),
          middleName: parsed.middleName?.trim() || null,
          lastName: parsed.lastName.trim(),
          fullName: `${parsed.firstName.trim()} ${parsed.middleName ? parsed.middleName.trim() + " " : ""}${parsed.lastName.trim()}`.trim(),
          email: parsed.email?.trim() || null,
          phone: parsed.phone?.trim() || null,
          dateOfBirth: new Date(parsed.dateOfBirth),
          gender: parsed.gender,
          bloodGroup: parsed.bloodGroup?.trim() || null,
          nationality: parsed.nationality?.trim() || "Indian",
          category: parsed.category?.trim() || null,
          aadhaarNumber: parsed.aadhaarNumber?.trim() || null,
          photoUrl: parsed.photoUrl || null,
          address: fullAddress,
          addressLine1: parsed.addressLine1?.trim() || null,
          addressLine2: parsed.addressLine2?.trim() || null,
          city: parsed.city?.trim() || null,
          state: parsed.state?.trim() || null,
          pincode: parsed.pincode?.trim() || null,
          country: parsed.country?.trim() || "India",
          admissionDate: parsed.admissionDate ? new Date(parsed.admissionDate) : new Date(),
          admissionType: parsed.admissionType || "REGULAR",
          previousSchool: parsed.previousSchool?.trim() || null,
          previousQualification: parsed.previousQualification?.trim() || null,
          universityRegNumber: parsed.universityRegNumber?.trim() || null,
          currentClassId: selectedClass.id,
          currentSectionId: sectionId!,
          academicYearId: academicYearId!,
          emergencyContactName: primaryGuardianFullName,
          emergencyContactPhone: parsed.guardianPhone.trim(),
          notes: parsed.notes?.trim() || null,
          status: "ACTIVE",
        },
      });

      // 2. Create Primary Guardian & Link via StudentGuardian
      const primaryGuardian = await tx.guardian.create({
        data: {
          institutionId: user.institutionId,
          firstName: parsed.guardianFirstName.trim(),
          lastName: parsed.guardianLastName?.trim() || null,
          fullName: primaryGuardianFullName,
          relation: parsed.guardianRelation || "FATHER",
          phone: parsed.guardianPhone.trim(),
          email: parsed.guardianEmail?.trim() || null,
          occupation: parsed.guardianOccupation?.trim() || null,
          address: parsed.guardianAddress?.trim() || fullAddress,
        },
      });

      await tx.studentGuardian.create({
        data: {
          studentId: createdStudent.id,
          guardianId: primaryGuardian.id,
          isPrimary: true,
        },
      });

      // 3. Optional Secondary Guardian
      if (parsed.secondaryGuardianName && parsed.secondaryGuardianPhone) {
        const secondaryGuardian = await tx.guardian.create({
          data: {
            institutionId: user.institutionId,
            fullName: parsed.secondaryGuardianName.trim(),
            relation: parsed.secondaryGuardianRelation || "MOTHER",
            phone: parsed.secondaryGuardianPhone.trim(),
            email: parsed.secondaryGuardianEmail?.trim() || null,
            address: fullAddress,
          },
        });

        await tx.studentGuardian.create({
          data: {
            studentId: createdStudent.id,
            guardianId: secondaryGuardian.id,
            isPrimary: false,
          },
        });
      }

      // 4. Resolve and Assign Configured Fee Structure
      const feeStructures = await tx.feeStructure.findMany({
        where: {
          institutionId: user.institutionId,
          classId: selectedClass.id,
        },
      });

      if (feeStructures.length > 0) {
        for (const fs of feeStructures) {
          await tx.studentFee.create({
            data: {
              studentId: createdStudent.id,
              feeStructureId: fs.id,
              academicYearId: academicYearId!,
              totalAmount: fs.amount,
              pendingAmount: fs.amount,
              paidAmount: 0,
              dueDate: fs.dueDate,
              status: "PENDING",
            },
          });
        }
      }

      // 5. Save Custom Field Values
      for (const field of activeCustomFields) {
        const rawVal = submittedCustomValues[field.key];
        if (rawVal !== undefined && rawVal !== null) {
          const stringifiedVal = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal);
          await tx.studentCustomFieldValue.create({
            data: {
              studentId: createdStudent.id,
              customFieldId: field.id,
              value: stringifiedVal,
            },
          });
        }
      }

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "CREATE",
          entity: "Student",
          entityId: createdStudent.id,
          details: `Admitted student ${createdStudent.fullName} (Adm: ${createdStudent.admissionNumber}) to program ${selectedClass.name}. Guardian: ${primaryGuardian.fullName} (${primaryGuardian.phone}).`,
        },
      });

      return createdStudent;
    });

    return NextResponse.json({
      success: true,
      message: `Student '${student.fullName}' admitted successfully.`,
      student,
    });
  } catch (error: any) {
    console.error("Student admission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete student admission." },
      { status: 400 }
    );
  }
}
