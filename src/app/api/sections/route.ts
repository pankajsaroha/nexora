import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const createSectionSchema = z.object({
  classId: z.string().min(1, "Class/Program ID is required"),
  name: z.string().min(1, "Section name is required"),
  capacity: z.number().int().min(1).default(40),
  roomNumber: z.string().optional().nullable(),
  classTeacherId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createSectionSchema.parse(json);

    // Verify parent Class belongs to institution
    const parentClass = await prisma.class.findFirst({
      where: {
        id: parsed.classId,
        institutionId: user.institutionId,
      },
    });

    if (!parentClass) {
      return NextResponse.json(
        { error: "Selected Program / Class not found for your institution." },
        { status: 404 }
      );
    }

    const cleanSectionName = parsed.name.trim().toUpperCase();

    // Check duplicate section name within this class
    const existing = await prisma.section.findFirst({
      where: {
        classId: parsed.classId,
        name: cleanSectionName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Section '${cleanSectionName}' already exists in ${parentClass.name}.` },
        { status: 400 }
      );
    }

    // Verify teacher if assigned
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

    const section = await prisma.section.create({
      data: {
        classId: parsed.classId,
        name: cleanSectionName,
        capacity: parsed.capacity || 40,
        roomNumber: parsed.roomNumber?.trim() || null,
        classTeacherId: parsed.classTeacherId || null,
      },
      include: {
        classTeacher: true,
        class: true,
        _count: {
          select: { students: true },
        },
      },
    });

    // Also link ClassTeacher history record if teacher assigned
    if (parsed.classTeacherId) {
      await prisma.classTeacher.create({
        data: {
          sectionId: section.id,
          teacherId: parsed.classTeacherId,
          academicYearId: parentClass.academicYearId,
          isCurrent: true,
        },
      });
    }

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "CREATE",
      entity: "Section",
      entityId: section.id,
      details: `Created section '${section.name}' in program '${parentClass.name}' (Capacity: ${section.capacity}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Section '${section.name}' created successfully in ${parentClass.name}.`,
      section,
    });
  } catch (error: any) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create section." },
      { status: 400 }
    );
  }
}
