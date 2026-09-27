import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createLeaveAdjustment } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adjustmentSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  leaveTypeId: z.string().min(1, "Leave Type ID is required"),
  leaveYearId: z.string().optional(),
  days: z.number().refine((val) => val !== 0, "Adjustment days cannot be 0"),
  remarks: z.string().min(3, "Audit reason/remarks are required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "HR_ADMIN"].includes(user.roleCode || "");
    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to perform manual leave balance adjustments." },
        { status: 403 }
      );
    }

    const json = await req.json();
    const parsed = adjustmentSchema.parse(json);

    const result = await createLeaveAdjustment({
      institutionId: user.institutionId,
      teacherId: parsed.teacherId,
      leaveTypeId: parsed.leaveTypeId,
      leaveYearId: parsed.leaveYearId,
      days: parsed.days,
      remarks: parsed.remarks,
      actorUserId: user.id,
      actorName: user.fullName,
      actorEmail: user.email,
    });

    return NextResponse.json({
      success: true,
      message: `Audited adjustment of ${parsed.days > 0 ? "+" : ""}${parsed.days} days recorded successfully.`,
      result,
    });
  } catch (error: any) {
    console.error("POST /api/leaves/adjust error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create leave adjustment" },
      { status: 400 }
    );
  }
}
