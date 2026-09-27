import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSectionSchema = z.object({
  name: z.string().min(1, "Section name is required").optional(),
  capacity: z.number().int().min(1).optional(),
  roomNumber: z.string().optional().nullable(),
  classTeacherId: z.string().optional().nullable(),
});

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
    const parsed = updateSectionSchema.parse(json);

    const existing = await prisma.section.findFirst({
      where: {
        id,
        class: {
          institutionId: user.institutionId,
        },
      },
      include: {
        class: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    // Check duplicate name within the same class if name is changing
    if (parsed.name && parsed.name.trim().toUpperCase() !== existing.name) {
      const cleanName = parsed.name.trim().toUpperCase();
      const duplicate = await prisma.section.findFirst({
        where: {
          classId: existing.classId,
          name: cleanName,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Another section named '${cleanName}' already exists in this program.` },
          { status: 400 }
        );
      }
    }

    // Validate teacher if provided
    if (parsed.classTeacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          id: parsed.classTeacherId,
          institutionId: user.institutionId,
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Selected Class Teacher not found for your institution." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.section.update({
      where: { id },
      data: {
        name: parsed.name !== undefined ? parsed.name.trim().toUpperCase() : undefined,
        capacity: parsed.capacity !== undefined ? parsed.capacity : undefined,
        roomNumber: parsed.roomNumber !== undefined ? parsed.roomNumber?.trim() || null : undefined,
        classTeacherId: parsed.classTeacherId !== undefined ? parsed.classTeacherId : undefined,
      },
      include: {
        classTeacher: true,
        class: true,
        _count: {
          select: { students: true },
        },
      },
    });

    // Update ClassTeacher mapping if changed
    if (parsed.classTeacherId !== undefined) {
      // Mark old as not current
      await prisma.classTeacher.updateMany({
        where: { sectionId: id, isCurrent: true },
        data: { isCurrent: false, endDate: new Date() },
      });

      if (parsed.classTeacherId) {
        await prisma.classTeacher.create({
          data: {
            sectionId: id,
            teacherId: parsed.classTeacherId,
            academicYearId: existing.class.academicYearId,
            isCurrent: true,
          },
        });
      }
    }

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "UPDATE",
      entity: "Section",
      entityId: id,
      details: `Updated section '${updated.name}' in program '${existing.class.name}' (Capacity: ${updated.capacity}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Section '${updated.name}' updated successfully.`,
      section: updated,
    });
  } catch (error: any) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update section." },
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

    const existing = await prisma.section.findFirst({
      where: {
        id,
        class: {
          institutionId: user.institutionId,
        },
      },
      include: {
        class: true,
        _count: {
          select: {
            students: true,
            attendance: true,
            timetableSlots: true,
            teacherAssignments: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    const studentCount = existing._count.students;
    const attendanceCount = existing._count.attendance;
    const timetableCount = existing._count.timetableSlots;
    const assignmentsCount = existing._count.teacherAssignments;

    if (studentCount > 0 || attendanceCount > 0 || timetableCount > 0 || assignmentsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete Section '${existing.name}' because it contains ${studentCount} enrolled students, ${attendanceCount} attendance records, and ${timetableCount} timetable slots. Reassign or remove dependent records first.`,
        },
        { status: 400 }
      );
    }

    await prisma.section.delete({
      where: { id },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "DELETE",
      entity: "Section",
      entityId: id,
      details: `Deleted unused section '${existing.name}' from program '${existing.class.name}'.`,
    });

    return NextResponse.json({
      success: true,
      message: `Section '${existing.name}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete section." },
      { status: 500 }
    );
  }
}
