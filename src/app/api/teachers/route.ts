import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  designation: z.string().default("Faculty Member"),
  departmentId: z.string().optional().or(z.literal("")),
  qualification: z.string().optional().or(z.literal("")),
  basicSalary: z.number().optional().default(45000),
  employeeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createTeacherSchema.parse(json);

    const empId =
      parsed.employeeId ||
      `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const existing = await prisma.teacher.findFirst({
      where: {
        OR: [{ email: parsed.email }, { employeeId: empId }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Faculty with email '${parsed.email}' or ID '${empId}' already exists.` },
        { status: 400 }
      );
    }

    const teacher = await prisma.$transaction(async (tx) => {
      // 1. Create User account for the teacher
      const passwordHash = await bcrypt.hash("Teacher@123", 10);
      const userRecord = await tx.user.create({
        data: {
          institutionId: user.institutionId,
          email: parsed.email,
          fullName: `${parsed.firstName} ${parsed.lastName}`.trim(),
          passwordHash,
          roleCode: "TEACHER",
          phone: parsed.phone,
          isActive: true,
        },
      });

      // 2. Create Teacher record linked to user
      const createdTeacher = await tx.teacher.create({
        data: {
          institutionId: user.institutionId,
          userId: userRecord.id,
          employeeId: empId,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          fullName: `${parsed.firstName} ${parsed.lastName}`.trim(),
          email: parsed.email,
          phone: parsed.phone,
          designation: parsed.designation,
          departmentId: parsed.departmentId || null,
          qualification: parsed.qualification || "M.Sc, B.Ed",
          basicSalary: parsed.basicSalary,
          employmentStatus: "ACTIVE",
        },
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "FACULTY_ONBOARDED",
          entity: "Teacher",
          entityId: createdTeacher.id,
          details: `Onboarded faculty ${createdTeacher.fullName} (${createdTeacher.employeeId})`,
        },
      });

      return createdTeacher;
    });

    return NextResponse.json({
      success: true,
      message: `Faculty '${teacher.fullName}' onboarded successfully with Employee ID ${teacher.employeeId}.`,
      teacher,
    });
  } catch (error: any) {
    console.error("Teacher creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to onboard faculty member." },
      { status: 400 }
    );
  }
}
