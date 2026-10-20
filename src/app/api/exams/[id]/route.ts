import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatExamTypeName,
  getExamDetail,
  updateExamStatus,
  scheduleExamTimetable,
  safeDeleteExam,
  canUserPerformExamAction,
} from "@/lib/exams/service";

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

    const exam = await getExamDetail(params.id, user.institutionId);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: any) {
    console.error("GET /api/exams/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch exam details" },
      { status: 500 }
    );
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

    const body = await req.json();

    // 1. Paper Timetable Scheduling / Rescheduling
    if (body.papers && Array.isArray(body.papers)) {
      const scheduled = await scheduleExamTimetable({
        examId: params.id,
        institutionId: user.institutionId,
        user,
        startDate: body.startDate,
        endDate: body.endDate,
        papers: body.papers,
        reason: body.reason,
        isReschedule: Boolean(body.isReschedule),
      });

      return NextResponse.json({
        success: true,
        message: body.isReschedule
          ? "Examination timetable rescheduled successfully."
          : "Examination timetable configured and scheduled successfully.",
        exam: scheduled,
      });
    }

    // 2. Standard Lifecycle Status Transition
    if (body.status) {
      const updated = await updateExamStatus({
        examId: params.id,
        status: body.status,
        institutionId: user.institutionId,
        user,
        reason: body.reason,
        startDate: body.startDate,
        endDate: body.endDate,
      });

      return NextResponse.json({
        success: true,
        message: `Assessment status updated to ${body.status}.`,
        exam: updated,
      });
    }

    // Otherwise standard update for title/name/config
    const existingExam = await prisma.exam.findUnique({
      where: { id: params.id, institutionId: user.institutionId },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const editCheck = canUserPerformExamAction(user, existingExam, "EDIT_CONFIG");
    if (!editCheck.allowed) {
      return NextResponse.json({ error: editCheck.reason }, { status: 403 });
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updated = await prisma.exam.update({
      where: {
        id: params.id,
        institutionId: user.institutionId,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Assessment updated successfully.",
      exam: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/exams/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update assessment" },
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

    const deleted = await safeDeleteExam({
      examId: params.id,
      institutionId: user.institutionId,
      user,
    });

    return NextResponse.json({
      success: true,
      message: "Draft assessment deleted successfully.",
      exam: deleted,
    });
  } catch (error: any) {
    console.error("DELETE /api/exams/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete assessment" },
      { status: 400 }
    );
  }
}
