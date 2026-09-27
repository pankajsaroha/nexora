import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { parseStaffMetadata, serializeStaffMetadata, ExtendedStaffData } from "@/lib/staff";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const createStaffSchema = z.object({
  // Personal
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

  // Compensation & Bank
  basicSalary: z.number().min(0).default(45000),
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
  })).optional(),

  // Qualifications & Experience
  qualifications: z.array(z.object({
    id: z.string(),
    degree: z.string(),
    specialization: z.string().optional(),
    institution: z.string(),
    year: z.union([z.string(), z.number()]),
    gradeScore: z.string().optional(),
    isHighest: z.boolean().optional(),
  })).optional(),
  experiences: z.array(z.object({
    id: z.string(),
    organization: z.string(),
    designation: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    totalYears: z.string().optional(),
    description: z.string().optional(),
  })).optional(),

  // Academic Assignments (for Teaching Staff)
  assignedSubjectIds: z.array(z.string()).optional(),
  assignedSectionIds: z.array(z.string()).optional(),
  homeroomSectionId: z.string().optional().nullable(),

  // Portal Login Access
  grantPortalAccess: z.boolean().default(true),
  portalRole: z.string().default("TEACHER"), // TEACHER, ACCOUNTANT, HOD, HR_ADMIN, STAFF
  portalPassword: z.string().optional(),

  // Documents & Custom Fields
  documents: z.array(z.any()).optional(),
  customFields: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const staffType = searchParams.get("staffType") || "ALL";
    const departmentId = searchParams.get("departmentId") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      institutionId: user.institutionId,
    };

    if (search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: "insensitive" } },
        { employeeId: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { designation: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (departmentId !== "ALL") {
      where.departmentId = departmentId;
    }

    if (status !== "ALL") {
      where.employmentStatus = status;
    }

    const [rawTeachers, totalCount, departments, leaveRequestsCount] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          department: true,
          user: {
            select: { id: true, email: true, roleCode: true, isActive: true },
          },
          sectionsAsClassTeacher: {
            include: { class: true },
          },
          teacherAssignments: {
            include: { subject: true, section: { include: { class: true } } },
          },
          attendanceRecords: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
            take: 1,
          },
        },
        orderBy: [{ employmentStatus: "asc" }, { employeeId: "asc" }],
        skip,
        take: limit,
      }),
      prisma.teacher.count({ where }),
      prisma.department.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { name: "asc" },
      }),
      prisma.leaveRequest.count({
        where: { institutionId: user.institutionId, status: "PENDING" },
      }),
    ]);

    // Format and parse metadata
    const teachers = rawTeachers.map((t) => {
      const meta = parseStaffMetadata(t.qualification);
      const todayAttendance = t.attendanceRecords[0]?.status || "NOT_MARKED";

      return {
        id: t.id,
        employeeId: t.employeeId,
        firstName: t.firstName,
        lastName: t.lastName,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        designation: t.designation,
        departmentId: t.departmentId,
        departmentName: t.department?.name || "Unassigned",
        departmentCode: t.department?.code,
        joiningDate: t.joiningDate,
        employmentStatus: t.employmentStatus,
        basicSalary: t.basicSalary,
        staffType: meta.staffType || "TEACHING",
        employmentType: meta.employmentType || "PERMANENT",
        photoUrl: t.photoUrl,
        hasPortalAccess: !!t.userId && !!t.user?.isActive,
        portalRole: t.user?.roleCode || null,
        classTeacherOf: t.sectionsAsClassTeacher[0]
          ? `${t.sectionsAsClassTeacher[0].class.name} (${t.sectionsAsClassTeacher[0].name})`
          : null,
        assignmentsCount: t.teacherAssignments.length,
        todayAttendance,
        casualLeaveBalance: t.casualLeaveBalance,
        sickLeaveBalance: t.sickLeaveBalance,
        earnedLeaveBalance: t.earnedLeaveBalance,
      };
    });

    // Filter by staffType in memory if requested
    const filteredTeachers = staffType === "ALL"
      ? teachers
      : teachers.filter((t) => t.staffType === staffType);

    // Compute HR Summary stats
    const allStaff = await prisma.teacher.findMany({
      where: { institutionId: user.institutionId },
      select: { qualification: true, employmentStatus: true },
    });

    let teachingCount = 0;
    let nonTeachingCount = 0;
    let onLeaveCount = 0;

    allStaff.forEach((s) => {
      const m = parseStaffMetadata(s.qualification);
      if (m.staffType === "NON_TEACHING") {
        nonTeachingCount++;
      } else {
        teachingCount++;
      }
      if (s.employmentStatus === "ON_LEAVE") {
        onLeaveCount++;
      }
    });

    return NextResponse.json({
      teachers: filteredTeachers,
      departments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalStaff: allStaff.length,
        teachingCount,
        nonTeachingCount,
        onLeaveCount,
        pendingLeavesCount: leaveRequestsCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/teachers error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.TEACHERS_CREATE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to onboard staff." },
        { status: 403 }
      );
    }

    const json = await req.json();
    const parsed = createStaffSchema.parse(json);

    // Check duplicate employee ID or email
    const existing = await prisma.teacher.findFirst({
      where: {
        institutionId: user.institutionId,
        OR: [
          { employeeId: parsed.employeeId.trim() },
          { email: parsed.email.trim().toLowerCase() },
        ],
      },
    });

    if (existing) {
      if (existing.employeeId.toLowerCase() === parsed.employeeId.trim().toLowerCase()) {
        return NextResponse.json(
          { error: `An employee with ID '${parsed.employeeId}' already exists in your institution.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `An employee with email '${parsed.email}' already exists.` },
        { status: 400 }
      );
    }

    // Build serialized metadata
    const metadata: ExtendedStaffData = {
      staffType: parsed.staffType,
      employmentType: parsed.employmentType as any,
      middleName: parsed.middleName?.trim() || undefined,
      dateOfBirth: parsed.dateOfBirth,
      gender: parsed.gender,
      bloodGroup: parsed.bloodGroup?.trim() || undefined,
      nationality: parsed.nationality || "Indian",
      maritalStatus: parsed.maritalStatus as any,
      panNumber: parsed.panNumber?.trim() || undefined,
      aadhaarNumber: parsed.aadhaarNumber?.trim() || undefined,
      personalEmail: parsed.personalEmail?.trim() || undefined,
      alternatePhone: parsed.alternatePhone?.trim() || undefined,
      currentAddress: parsed.currentAddress,
      permanentAddress: parsed.sameAsCurrentAddress ? parsed.currentAddress : parsed.permanentAddress,
      sameAsCurrentAddress: parsed.sameAsCurrentAddress,
      emergencyContacts: parsed.emergencyContacts || [],
      reportingManager: parsed.reportingManager?.trim() || undefined,
      workLocation: parsed.workLocation?.trim() || undefined,
      workShift: parsed.workShift?.trim() || undefined,
      probationEndDate: parsed.probationEndDate || undefined,
      confirmationDate: parsed.confirmationDate || undefined,
      contractStartDate: parsed.contractStartDate || undefined,
      contractEndDate: parsed.contractEndDate || undefined,
      bankAccountHolder: parsed.bankAccountHolder?.trim() || undefined,
      bankName: parsed.bankName?.trim() || undefined,
      bankBranch: parsed.bankBranch?.trim() || undefined,
      pfNumber: parsed.pfNumber?.trim() || undefined,
      esiNumber: parsed.esiNumber?.trim() || undefined,
      qualifications: parsed.qualifications || [],
      experiences: parsed.experiences || [],
      documents: parsed.documents || [],
      customFields: parsed.customFields || {},
    };

    const qualificationPayload = serializeStaffMetadata(metadata);
    const fullName = [parsed.firstName, parsed.middleName, parsed.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const createdStaff = await prisma.$transaction(async (tx) => {
      let createdUserId: string | null = null;

      // Create Portal User Account if requested
      if (parsed.grantPortalAccess) {
        const existingUser = await tx.user.findUnique({
          where: { email: parsed.email.trim().toLowerCase() },
        });

        if (existingUser) {
          createdUserId = existingUser.id;
        } else {
          const passwordHash = await bcrypt.hash(parsed.portalPassword || "Nexora@2026", 10);
          const newUser = await tx.user.create({
            data: {
              institutionId: user.institutionId,
              email: parsed.email.trim().toLowerCase(),
              fullName,
              passwordHash,
              roleCode: parsed.portalRole || (parsed.staffType === "TEACHING" ? "TEACHER" : "STAFF"),
              phone: parsed.phone.trim(),
              isActive: true,
            },
          });
          createdUserId = newUser.id;
        }
      }

      // Create Teacher record
      const joiningDate = parsed.joiningDate ? new Date(parsed.joiningDate) : new Date();

      const staff = await tx.teacher.create({
        data: {
          institutionId: user.institutionId,
          userId: createdUserId,
          employeeId: parsed.employeeId.trim(),
          firstName: parsed.firstName.trim(),
          lastName: parsed.lastName.trim(),
          fullName,
          email: parsed.email.trim().toLowerCase(),
          phone: parsed.phone.trim(),
          designation: parsed.designation.trim(),
          departmentId: parsed.departmentId || null,
          qualification: qualificationPayload,
          joiningDate,
          employmentStatus: parsed.employmentStatus || "ACTIVE",
          basicSalary: parsed.basicSalary,
          bankAccountNumber: parsed.bankAccountNumber?.trim() || null,
          bankIfsc: parsed.bankIfsc?.trim() || null,
        },
      });

      // Homeroom / Class Teacher Assignment if provided
      if (parsed.homeroomSectionId && parsed.staffType === "TEACHING") {
        await tx.section.update({
          where: { id: parsed.homeroomSectionId },
          data: { classTeacherId: staff.id },
        });

        const currentAcademicYear = await tx.academicYear.findFirst({
          where: { institutionId: user.institutionId, isCurrent: true },
        });

        if (currentAcademicYear) {
          await tx.classTeacher.create({
            data: {
              sectionId: parsed.homeroomSectionId,
              teacherId: staff.id,
              academicYearId: currentAcademicYear.id,
              isCurrent: true,
              startDate: new Date(),
            },
          });
        }
      }

      // Academic Subjects Assignment if provided
      if (
        parsed.assignedSubjectIds &&
        parsed.assignedSectionIds &&
        parsed.assignedSubjectIds.length > 0 &&
        parsed.assignedSectionIds.length > 0 &&
        parsed.staffType === "TEACHING"
      ) {
        const currentYear = await tx.academicYear.findFirst({
          where: { institutionId: user.institutionId, isCurrent: true },
        }) || await tx.academicYear.findFirst({
          where: { institutionId: user.institutionId },
        });

        if (currentYear) {
          for (const subjectId of parsed.assignedSubjectIds) {
            for (const sectionId of parsed.assignedSectionIds) {
              await tx.teacherAssignment.upsert({
                where: {
                  teacherId_subjectId_sectionId_academicYearId: {
                    teacherId: staff.id,
                    subjectId,
                    sectionId,
                    academicYearId: currentYear.id,
                  },
                },
                update: {},
                create: {
                  teacherId: staff.id,
                  subjectId,
                  sectionId,
                  academicYearId: currentYear.id,
                },
              });
            }
          }
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STAFF_ONBOARDED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Onboarded ${parsed.staffType} staff member ${fullName} (${parsed.employeeId} - ${parsed.designation})`,
        },
      });

      return staff;
    });

    return NextResponse.json({
      success: true,
      message: `Staff member '${fullName}' onboarded successfully.`,
      staff: createdStaff,
    });
  } catch (error: any) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to onboard staff member" },
      { status: 400 }
    );
  }
}
