import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { NotificationService } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.ATTENDANCE_MARK)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to record attendance" },
        { status: 403 }
      );
    }

    const { sectionId, date, records } = await req.json();

    if (!sectionId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Section ID and valid student attendance records are required" },
        { status: 400 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    let savedCount = 0;
    const absentAlerts: Array<{ phone: string; name: string }> = [];

    for (const rec of records) {
      const { studentId, status, remarks } = rec;
      if (!studentId || !status) continue;

      await prisma.studentAttendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: attendanceDate,
          },
        },
        update: {
          status,
          remarks: remarks || null,
          markedByUserId: user.id,
        },
        create: {
          studentId,
          sectionId,
          date: attendanceDate,
          status,
          remarks: remarks || null,
          markedByUserId: user.id,
        },
      });

      savedCount++;

      // If absent, queue mock notification for parents
      if (status === "ABSENT") {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          include: {
            guardians: {
              include: { guardian: true },
            },
          },
        });
        if (student?.guardians?.[0]?.guardian) {
          const g = student.guardians[0].guardian;
          absentAlerts.push({
            phone: g.phone,
            name: g.fullName,
          });
        }
      }
    }

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "ATTENDANCE_RECORDED",
      entity: "StudentAttendance",
      entityId: sectionId,
      details: {
        date: attendanceDate.toISOString(),
        studentsCount: savedCount,
        absentCount: absentAlerts.length,
      },
    });

    if (absentAlerts.length > 0) {
      await NotificationService.dispatch({
        whatsapp: {
          institutionId: user.institutionId,
          recipients: absentAlerts,
          templateName: "student_absent_alert",
          messageContent: `Dear Parent, your child was marked ABSENT for today's classes (${attendanceDate.toLocaleDateString()}). Please contact the school if this was an emergency.`,
          relatedEntity: "StudentAttendance",
          relatedEntityId: sectionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Attendance saved for ${savedCount} students.`,
      savedCount,
      absentAlertsCount: absentAlerts.length,
    });
  } catch (error: any) {
    console.error("Attendance API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save attendance" },
      { status: 500 }
    );
  }
}
