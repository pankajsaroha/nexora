import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
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
        { error: "Forbidden: Super Administrator access required." },
        { status: 403 }
      );
    }

    const { id } = params;

    const institution = await prisma.institution.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    }

    const [
      usersCount,
      studentsCount,
      guardiansCount,
      teachersCount,
      classesCount,
      sectionsCount,
      examsCount,
      marksCount,
      studentAttendanceCount,
      staffAttendanceCount,
      assignmentsCount,
      feeStructuresCount,
      feePaymentsCount,
      tasksCount,
      announcementsCount,
      auditLogsCount,
      totalInstitutionsCount,
    ] = await Promise.all([
      prisma.user.count({ where: { institutionId: id } }),
      prisma.student.count({ where: { institutionId: id } }),
      prisma.guardian.count({ where: { institutionId: id } }),
      prisma.teacher.count({ where: { institutionId: id } }),
      prisma.class.count({ where: { institutionId: id } }),
      prisma.section.count({ where: { class: { institutionId: id } } }),
      prisma.exam.count({ where: { institutionId: id } }),
      prisma.studentMark.count({ where: { student: { institutionId: id } } }),
      prisma.studentAttendance.count({ where: { student: { institutionId: id } } }),
      prisma.staffAttendance.count({ where: { teacher: { institutionId: id } } }),
      prisma.assignment.count({ where: { institutionId: id } }),
      prisma.feeStructure.count({ where: { institutionId: id } }),
      prisma.feePayment.count({ where: { student: { institutionId: id } } }),
      prisma.task.count({ where: { institutionId: id } }),
      prisma.announcement.count({ where: { institutionId: id } }),
      prisma.auditLog.count({ where: { institutionId: id } }),
      prisma.institution.count(),
    ]);

    const isLastRemaining = totalInstitutionsCount <= 1;
    const isCurrentActiveTenant = id === user.institutionId;
    const hasFinancialRecords = feePaymentsCount > 0;
    const isProtectedInzivoo = id === "04625961-2d1e-4bf8-8013-5c16040751bc";

    let safeToDelete = true;
    const deletionBlockers: string[] = [];

    if (isLastRemaining) {
      safeToDelete = false;
      deletionBlockers.push("This is the only remaining institution tenant in the system. The platform requires at least one configured institution.");
    }

    if (isProtectedInzivoo) {
      safeToDelete = false;
      deletionBlockers.push("Inzivoo Group of Colleges is the core verified institutional tenant and is protected from permanent deletion.");
    }

    if (hasFinancialRecords) {
      safeToDelete = false;
      deletionBlockers.push(`Institution possesses ${feePaymentsCount} financial payment records. Financial regulations require archiving instead of destructive deletion.`);
    }

    return NextResponse.json({
      institution,
      dependencies: {
        users: usersCount,
        students: studentsCount,
        guardians: guardiansCount,
        teachers: teachersCount,
        classes: classesCount,
        sections: sectionsCount,
        exams: examsCount,
        marks: marksCount,
        studentAttendance: studentAttendanceCount,
        staffAttendance: staffAttendanceCount,
        assignments: assignmentsCount,
        feeStructures: feeStructuresCount,
        feePayments: feePaymentsCount,
        tasks: tasksCount,
        announcements: announcementsCount,
        auditLogs: auditLogsCount,
      },
      retentionAssessment: {
        safeToDelete,
        isLastRemaining,
        isCurrentActiveTenant,
        hasFinancialRecords,
        isProtectedInzivoo,
        blockers: deletionBlockers,
      },
    });
  } catch (error: any) {
    console.error("GET /api/institutions/[id]/dependencies error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to inspect institution dependencies" },
      { status: 500 }
    );
  }
}
