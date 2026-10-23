import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const PROTECTED_INZIVOO_ID = "04625961-2d1e-4bf8-8013-5c16040751bc";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.roleCode !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can permanently delete an institution." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { confirmationCode, reason } = body;

    // 1. Resolve exact target institution
    const target = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            users: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    }

    // 2. Strong confirmation validation
    if (!confirmationCode || confirmationCode.trim().toUpperCase() !== target.code.trim().toUpperCase()) {
      return NextResponse.json(
        {
          error: `Verification failed. You must enter the exact institution code ("${target.code}") to authorize permanent deletion.`,
        },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 8) {
      return NextResponse.json(
        {
          error: "A documented audit justification (minimum 8 characters) is required for permanent deletion.",
        },
        { status: 400 }
      );
    }

    // 3. Absolute Protection Guards
    if (id === PROTECTED_INZIVOO_ID) {
      return NextResponse.json(
        {
          error: "Safety Violation: Inzivoo Group of Colleges is the core verified institutional tenant and cannot be deleted.",
        },
        { status: 403 }
      );
    }

    const totalInstitutions = await prisma.institution.count();
    if (totalInstitutions <= 1) {
      return NextResponse.json(
        {
          error: "Safety Violation: Cannot delete the only remaining institution tenant in the system.",
        },
        { status: 400 }
      );
    }

    // 4. Financial & Retention Pre-Check
    const paymentCount = await prisma.feePayment.count({
      where: { student: { institutionId: id } },
    });

    if (paymentCount > 0) {
      return NextResponse.json(
        {
          error: `Regulatory Retention Violation: This institution contains ${paymentCount} fiscal payment ledgers. By law and audit compliance, financial records cannot be permanently destroyed. Please use the Archive workflow instead.`,
        },
        { status: 400 }
      );
    }

    // 5. Pre-Deletion Audit Snapshot
    const institutionSnapshot = {
      id: target.id,
      name: target.name,
      code: target.code,
      type: target.type,
      deletedByEmail: user.email,
      reason: reason.trim(),
      deletedAt: new Date().toISOString(),
    };

    console.log(`[LIFECYCLE PERMANENT DELETE] Initiating deletion of ${target.name} (${target.code}) by ${user.email}`);

    // 6. Safe Topological Deletion
    const candidateIdList = [id];

    // Tasks
    const taskIds = (await prisma.task.findMany({
      where: { institutionId: id },
      select: { id: true },
    })).map((t) => t.id);

    await prisma.taskActivity.deleteMany({ where: { taskId: { in: taskIds } } });
    await prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } });
    await prisma.task.deleteMany({ where: { institutionId: id } });

    // Students and dependencies
    const studentIds = (await prisma.student.findMany({
      where: { institutionId: id },
      select: { id: true },
    })).map((s) => s.id);

    await prisma.studentCustomFieldValue.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentMark.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentAttendance.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.assignmentSubmission.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.feePayment.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentFee.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentGuardian.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.bookIssue.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentTransport.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.hostelAllocation.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.student.deleteMany({ where: { institutionId: id } });
    await prisma.guardian.deleteMany({ where: { institutionId: id } });

    // Staff
    const teacherIds = (await prisma.teacher.findMany({
      where: { institutionId: id },
      select: { id: true },
    })).map((t) => t.id);

    await prisma.staffAttendance.deleteMany({ where: { teacherId: { in: teacherIds } } });
    await prisma.teacherAssignment.deleteMany({ where: { teacherId: { in: teacherIds } } });
    await prisma.classTeacher.deleteMany({ where: { teacherId: { in: teacherIds } } });
    await prisma.leaveRequest.deleteMany({ where: { institutionId: id } });
    await prisma.employeeLeaveAccount.deleteMany({ where: { institutionId: id } });
    await prisma.teacher.deleteMany({ where: { institutionId: id } });

    // Academics & Fees
    await prisma.examSubject.deleteMany({ where: { exam: { institutionId: id } } });
    await prisma.exam.deleteMany({ where: { institutionId: id } });
    await prisma.assignment.deleteMany({ where: { institutionId: id } });
    await prisma.feeStructure.deleteMany({ where: { institutionId: id } });
    await prisma.feeCategory.deleteMany({ where: { institutionId: id } });
    await prisma.timetableSlot.deleteMany({ where: { section: { class: { institutionId: id } } } });
    await prisma.section.deleteMany({ where: { class: { institutionId: id } } });
    await prisma.class.deleteMany({ where: { institutionId: id } });
    await prisma.subject.deleteMany({ where: { institutionId: id } });

    // Leave configs
    await prisma.leavePolicyRule.deleteMany({ where: { policy: { institutionId: id } } });
    await prisma.leavePolicy.deleteMany({ where: { institutionId: id } });
    await prisma.leaveType.deleteMany({ where: { institutionId: id } });
    await prisma.leaveYear.deleteMany({ where: { institutionId: id } });

    // Organization
    await prisma.term.deleteMany({ where: { academicYear: { institutionId: id } } });
    await prisma.academicYear.deleteMany({ where: { institutionId: id } });
    await prisma.department.deleteMany({ where: { institutionId: id } });
    await prisma.campus.deleteMany({ where: { institutionId: id } });

    // General modules
    await prisma.book.deleteMany({ where: { institutionId: id } });
    await prisma.routeStop.deleteMany({ where: { route: { institutionId: id } } });
    await prisma.route.deleteMany({ where: { institutionId: id } });
    await prisma.vehicle.deleteMany({ where: { institutionId: id } });
    await prisma.hostelRoom.deleteMany({ where: { hostel: { institutionId: id } } });
    await prisma.hostel.deleteMany({ where: { institutionId: id } });
    await prisma.calendarEvent.deleteMany({ where: { institutionId: id } });
    await prisma.payroll.deleteMany({ where: { institutionId: id } });
    await prisma.studentCustomField.deleteMany({ where: { institutionId: id } });

    // Communications & Logs
    await prisma.announcement.deleteMany({ where: { institutionId: id } });
    await prisma.notification.deleteMany({ where: { institutionId: id } });
    await prisma.whatsAppMessageLog.deleteMany({ where: { institutionId: id } });
    await prisma.auditLog.deleteMany({ where: { institutionId: id } });

    // Users belonging strictly to this institution
    await prisma.user.deleteMany({ where: { institutionId: id } });

    // Finally delete institution record
    await prisma.institution.delete({ where: { id } });

    // 7. System Audit Log in Super Admin Context
    try {
      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action: "INSTITUTION_PERMANENTLY_DELETED",
        entity: "Institution",
        entityId: id,
        details: institutionSnapshot,
      });
    } catch {
      // Non-blocking audit
    }

    return NextResponse.json({
      success: true,
      message: `Institution "${target.name}" and its dependent records have been permanently deleted.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/institutions/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during institution deletion." },
      { status: 500 }
    );
  }
}
