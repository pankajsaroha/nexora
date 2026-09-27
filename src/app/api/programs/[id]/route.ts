import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateProgramSchema = z.object({
  name: z.string().min(1, "Program/Course name is required").optional(),
  code: z.string().min(1, "Program/Course code is required").optional(),
  level: z.string().optional(),
  departmentId: z.string().optional().nullable(),
  durationYears: z.number().int().min(1).optional(),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER"]).optional(),
  isActive: z.boolean().optional(),
  academicYearId: z.string().optional(),
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

    const program = await prisma.class.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
      include: {
        department: {
          include: {
            subjects: true,
          },
        },
        academicYear: true,
        sections: {
          include: {
            classTeacher: true,
            students: {
              select: {
                id: true,
                admissionNumber: true,
                rollNumber: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                gender: true,
                batch: true,
                semester: true,
              },
              orderBy: { firstName: "asc" },
            },
            teacherAssignments: {
              include: {
                subject: true,
                teacher: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
        feeStructures: {
          include: {
            feeCategory: true,
          },
        },
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program / Course not found." }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error("Get program error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch program details" }, { status: 500 });
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
    const parsed = updateProgramSchema.parse(json);

    const existing = await prisma.class.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program / Course not found." }, { status: 404 });
    }

    // If code is being updated, check duplicates
    if (parsed.code && parsed.code.trim().toUpperCase() !== existing.code) {
      const duplicate = await prisma.class.findFirst({
        where: {
          institutionId: user.institutionId,
          code: parsed.code.trim().toUpperCase(),
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Another Program / Course with code '${parsed.code}' already exists.` },
          { status: 400 }
        );
      }
    }

    // If departmentId is updated, check if department belongs to institution
    if (parsed.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: parsed.departmentId, institutionId: user.institutionId },
      });
      if (!dept) {
        return NextResponse.json({ error: "Selected Department does not exist." }, { status: 400 });
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: parsed.name !== undefined ? parsed.name.trim() : undefined,
        code: parsed.code !== undefined ? parsed.code.trim().toUpperCase() : undefined,
        level: parsed.level !== undefined ? parsed.level : undefined,
        departmentId: parsed.departmentId !== undefined ? parsed.departmentId : undefined,
        durationYears: parsed.durationYears !== undefined ? parsed.durationYears : undefined,
        type: parsed.type !== undefined ? parsed.type : undefined,
        isActive: parsed.isActive !== undefined ? parsed.isActive : undefined,
        academicYearId: parsed.academicYearId !== undefined ? parsed.academicYearId : undefined,
      },
      include: {
        department: true,
        academicYear: true,
        sections: {
          include: {
            classTeacher: true,
          },
        },
        feeStructures: {
          include: {
            feeCategory: true,
          },
        },
      },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "UPDATE",
      entity: "Class",
      entityId: id,
      details: `Updated program/course '${updated.name}' (${updated.code}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Program '${updated.name}' updated successfully.`,
      program: updated,
    });
  } catch (error: any) {
    console.error("Update program error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update program." },
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

    const { id } = params;

    const existing = await prisma.class.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
      include: {
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
        sections: {
          include: {
            _count: {
              select: {
                students: true,
                attendance: true,
                timetableSlots: true,
                teacherAssignments: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program / Course not found." }, { status: 404 });
    }

    const totalStudents = existing._count.students;
    const hasActiveDependencies =
      totalStudents > 0 ||
      existing.sections.some(
        (s) =>
          s._count.students > 0 ||
          s._count.attendance > 0 ||
          s._count.timetableSlots > 0 ||
          s._count.teacherAssignments > 0
      );

    // If program has historical students or records, do not hard delete; deactivate instead
    if (hasActiveDependencies) {
      await prisma.class.update({
        where: { id },
        data: { isActive: false },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "DEACTIVATE",
        entity: "Class",
        entityId: id,
        details: `Deactivated program '${existing.name}' (${existing.code}) due to ${totalStudents} existing student/cohort dependencies.`,
      });

      return NextResponse.json({
        success: true,
        message: `Program '${existing.name}' has active student or academic records. It has been deactivated and archived to preserve institutional history.`,
      });
    }

    // If completely unused, safe to delete
    await prisma.class.delete({
      where: { id },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "DELETE",
      entity: "Class",
      entityId: id,
      details: `Permanently deleted unused program '${existing.name}' (${existing.code}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Program '${existing.name}' permanently deleted.`,
    });
  } catch (error: any) {
    console.error("Delete program error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete program." },
      { status: 500 }
    );
  }
}
