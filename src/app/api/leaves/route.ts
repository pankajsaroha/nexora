import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitLeaveRequest } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createLeaveRequestSchema = z.object({
  teacherId: z.string().optional(),
  leaveTypeId: z.string().min(1, "Leave Type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  totalDays: z.number().int().min(1).optional(),
  reason: z.string().min(3, "Reason is required"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherIdParam = searchParams.get("teacherId");
    const statusParam = searchParams.get("status");

    const canManage = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "HR_ADMIN"].includes(user.roleCode || "");

    let targetTeacherId = teacherIdParam;
    if (!canManage) {
      const myTeacher = await prisma.teacher.findFirst({
        where: {
          institutionId: user.institutionId,
          OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
        },
      });
      if (!myTeacher) {
        return NextResponse.json({ leaveRequests: [] });
      }
      targetTeacherId = myTeacher.id;
    }

    const where: any = {
      institutionId: user.institutionId,
    };

    if (targetTeacherId) {
      where.teacherId = targetTeacherId;
    }

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            designation: true,
            department: { select: { name: true, code: true } },
          },
        },
        leaveTypeRel: true,
        transactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leaveRequests });
  } catch (error: any) {
    console.error("GET /api/leaves error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createLeaveRequestSchema.parse(json);

    let effectiveTeacherId = parsed.teacherId;
    if (!effectiveTeacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          institutionId: user.institutionId,
          OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
        },
      });
      if (!teacher) {
        return NextResponse.json(
          { error: "Could not identify employee profile for current user." },
          { status: 400 }
        );
      }
      effectiveTeacherId = teacher.id;
    }

    const sDate = new Date(parsed.startDate);
    const eDate = new Date(parsed.endDate);
    const calculatedDays = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const finalDays = parsed.totalDays || calculatedDays;

    const createdRequest = await submitLeaveRequest({
      institutionId: user.institutionId,
      teacherId: effectiveTeacherId,
      leaveTypeId: parsed.leaveTypeId,
      startDate: sDate,
      endDate: eDate,
      totalDays: finalDays,
      reason: parsed.reason,
    });

    return NextResponse.json({
      success: true,
      message: `Leave application for ${finalDays} day(s) submitted successfully.`,
      leaveRequest: createdRequest,
    });
  } catch (error: any) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit leave request" },
      { status: 400 }
    );
  }
}
