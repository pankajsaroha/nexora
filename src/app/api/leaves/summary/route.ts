import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getEmployeeLeaveSummary } from "@/lib/leave/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let targetTeacherId = searchParams.get("teacherId");
    const leaveYearId = searchParams.get("leaveYearId") || undefined;

    // If no teacherId provided, attempt to resolve from authenticated user
    if (!targetTeacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: {
          institutionId: user.institutionId,
          OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher ID required or no linked faculty record found." },
          { status: 400 }
        );
      }
      targetTeacherId = teacher.id;
    } else {
      // If querying another teacher, verify authorization and tenant boundary
      const canManage = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "HR_ADMIN"].includes(user.roleCode || "");
      if (!canManage) {
        const myTeacher = await prisma.teacher.findFirst({
          where: {
            institutionId: user.institutionId,
            OR: [{ userId: user.id }, { email: user.email }, { id: user.teacherId }],
          },
        });
        if (myTeacher?.id !== targetTeacherId) {
          return NextResponse.json({ error: "Forbidden: Cross-tenant or unauthorized leave query." }, { status: 403 });
        }
      }
    }

    const summary = await getEmployeeLeaveSummary({
      institutionId: user.institutionId,
      teacherId: targetTeacherId,
      leaveYearId,
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("GET /api/leaves/summary error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch leave summary" },
      { status: 500 }
    );
  }
}
