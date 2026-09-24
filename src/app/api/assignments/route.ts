import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { NotificationService } from "@/lib/notifications/service";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    const subjectId = searchParams.get("subjectId");

    const whereClause: any = {
      institutionId: user.institutionId,
    };

    if (sectionId) whereClause.sectionId = sectionId;
    if (subjectId) whereClause.subjectId = subjectId;

    // Student scope
    if (user.roleCode === "STUDENT" && user.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: user.studentId },
      });
      if (student) {
        whereClause.sectionId = student.currentSectionId;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        subject: true,
        teacher: true,
        section: {
          include: { class: true },
        },
        submissions: true,
      },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to create assignments" },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      sectionId,
      subjectId,
      dueDate,
      priority,
      maxMarks,
    } = await req.json();

    if (!title || !description || !sectionId || !subjectId || !dueDate) {
      return NextResponse.json(
        { error: "Title, description, section, subject, and due date are required" },
        { status: 400 }
      );
    }

    let teacherId = user.teacherId;
    if (!teacherId) {
      const firstTeacher = await prisma.teacher.findFirst({
        where: { institutionId: user.institutionId },
      });
      teacherId = firstTeacher?.id;
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: "No teacher profile associated to publish assignment" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        institutionId: user.institutionId,
        sectionId,
        subjectId,
        teacherId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || "MEDIUM",
        maxMarks: Number(maxMarks) || 50,
        status: "PUBLISHED",
      },
      include: {
        subject: true,
        section: { include: { class: true } },
      },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "ASSIGNMENT_PUBLISHED",
      entity: "Assignment",
      entityId: assignment.id,
      details: {
        title,
        class: `${assignment.section.class.name} ${assignment.section.name}`,
        subject: assignment.subject.name,
      },
    });

    // Notify parents of students in section
    const students = await prisma.student.findMany({
      where: { currentSectionId: sectionId },
      include: {
        guardians: { include: { guardian: true } },
      },
    });

    const parentRecipients = students
      .map((s) => {
        const g = s.guardians?.[0]?.guardian;
        return g?.phone ? { phone: g.phone, name: g.fullName } : null;
      })
      .filter(Boolean) as Array<{ phone: string; name: string }>;

    if (parentRecipients.length > 0) {
      await NotificationService.dispatch({
        whatsapp: {
          institutionId: user.institutionId,
          recipients: parentRecipients.slice(0, 5), // simulate top recipients
          templateName: "assignment_posted_alert",
          messageContent: `New ${assignment.subject.name} assignment ('${title}') has been posted for ${assignment.section.class.name} ${assignment.section.name}. Due date: ${formatDate(dueDate)}.`,
          relatedEntity: "Assignment",
          relatedEntityId: assignment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${assignment.subject.name} assignment published to ${assignment.section.class.name} ${assignment.section.name}.`,
      assignment,
    });
  } catch (error: any) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create assignment" },
      { status: 500 }
    );
  }
}
