import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.CLASSES_MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to manage academic assignments." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { action, subjectId, sectionId, academicYearId } = body;

    const teacher = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Resolve academic year if not passed
    let yearId = academicYearId;
    if (!yearId) {
      const curYear = await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId, isCurrent: true },
      }) || await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId },
      });
      yearId = curYear?.id;
    }

    if (!yearId) {
      return NextResponse.json({ error: "No academic year configured." }, { status: 400 });
    }

    if (action === "ASSIGN_HOMEROOM") {
      if (!sectionId) {
        return NextResponse.json({ error: "Section ID is required." }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.section.update({
          where: { id: sectionId },
          data: { classTeacherId: teacher.id },
        });

        await tx.classTeacher.create({
          data: {
            sectionId,
            teacherId: teacher.id,
            academicYearId: yearId!,
            isCurrent: true,
            startDate: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            institutionId: user.institutionId,
            userId: user.id,
            userName: user.fullName,
            userEmail: user.email,
            action: "CLASS_TEACHER_ASSIGNED",
            entity: "Teacher",
            entityId: teacher.id,
            details: `Assigned ${teacher.fullName} as Class Teacher for section ${sectionId}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Assigned as Class Teacher successfully.`,
      });
    }

    if (action === "ASSIGN_SUBJECT") {
      if (!subjectId || !sectionId) {
        return NextResponse.json(
          { error: "Subject ID and Section ID are required." },
          { status: 400 }
        );
      }

      const assignment = await prisma.teacherAssignment.upsert({
        where: {
          teacherId_subjectId_sectionId_academicYearId: {
            teacherId: teacher.id,
            subjectId,
            sectionId,
            academicYearId: yearId!,
          },
        },
        update: {},
        create: {
          teacherId: teacher.id,
          subjectId,
          sectionId,
          academicYearId: yearId!,
        },
        include: {
          subject: true,
          section: { include: { class: true } },
        },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "TEACHER_SUBJECT_ASSIGNED",
        entity: "Teacher",
        entityId: teacher.id,
        details: `Assigned subject ${assignment.subject.name} in ${assignment.section.class.name} (${assignment.section.name}) to ${teacher.fullName}`,
      });

      return NextResponse.json({
        success: true,
        message: `Subject '${assignment.subject.name}' assigned to ${teacher.fullName}.`,
        assignment,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/teachers/[id]/assignments error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update academic assignments" },
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

    if (!hasPermission(user, PERMISSIONS.CLASSES_MANAGE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to remove academic assignments." },
        { status: 403 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const homeroomSectionId = searchParams.get("homeroomSectionId");

    const teacher = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    if (homeroomSectionId) {
      await prisma.$transaction(async (tx) => {
        await tx.section.update({
          where: { id: homeroomSectionId },
          data: { classTeacherId: null },
        });

        await tx.classTeacher.updateMany({
          where: { sectionId: homeroomSectionId, teacherId: teacher.id },
          data: { isCurrent: false, endDate: new Date() },
        });

        await tx.auditLog.create({
          data: {
            institutionId: user.institutionId,
            userId: user.id,
            userName: user.fullName,
            userEmail: user.email,
            action: "CLASS_TEACHER_REMOVED",
            entity: "Teacher",
            entityId: teacher.id,
            details: `Removed ${teacher.fullName} as Class Teacher for section ${homeroomSectionId}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Class Teacher assignment removed.",
      });
    }

    if (assignmentId) {
      await prisma.teacherAssignment.delete({
        where: { id: assignmentId },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "TEACHER_SUBJECT_REMOVED",
        entity: "Teacher",
        entityId: teacher.id,
        details: `Removed teaching assignment ${assignmentId} from ${teacher.fullName}`,
      });

      return NextResponse.json({
        success: true,
        message: "Teaching assignment removed.",
      });
    }

    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("DELETE /api/teachers/[id]/assignments error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
