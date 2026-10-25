import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { reviewLeaveRequest } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "CANCEL"]).optional(),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]).optional(),
  reason: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const json = await req.json();
    const parsed = reviewSchema.parse(json);

    // Normalize action / status
    let targetStatus: "APPROVED" | "REJECTED" | "CANCELLED" = "APPROVED";
    if (parsed.status) {
      targetStatus = parsed.status;
    } else if (parsed.action) {
      targetStatus =
        parsed.action === "APPROVE"
          ? "APPROVED"
          : parsed.action === "REJECT"
          ? "REJECTED"
          : "CANCELLED";
    }

    const effectiveReason = parsed.reason || parsed.rejectionReason || "";

    const canApprove =
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "HR_ADMIN", "DIRECTOR", "DEAN"].includes(
        user.roleCode || ""
      ) || hasPermission(user, PERMISSIONS.LEAVE_APPROVE);

    const isSuperAdmin = user.roleCode === "SUPER_ADMIN";

    // Fetch existing request to verify institution and ownership
    const existingReq = await prisma.leaveRequest.findFirst({
      where: isSuperAdmin ? { id } : { id, institutionId: user.institutionId },
      include: { teacher: true },
    });

    if (!existingReq) {
      return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
    }

    const { parseStaffMetadata } = await import("@/lib/staff");
    const teacherMeta = parseStaffMetadata(existingReq.teacher.qualification);
    const isReportingManager =
      !!teacherMeta.reportingManager &&
      (teacherMeta.reportingManager === user.id ||
        teacherMeta.reportingManager === user.email ||
        (user.teacherId && teacherMeta.reportingManager === user.teacherId) ||
        teacherMeta.reportingManager.toLowerCase() === user.fullName.toLowerCase());

    const hasApprovalAuthority = canApprove || isReportingManager;

    // If teacher is cancelling their own request
    const isOwnerTeacher =
      user.teacherId === existingReq.teacherId ||
      existingReq.teacher.userId === user.id ||
      existingReq.teacher.email === user.email;

    if (targetStatus === "CANCELLED" && (hasApprovalAuthority || isOwnerTeacher)) {
      // Allowed cancellation
    } else if (!hasApprovalAuthority) {
      return NextResponse.json(
        { error: "Forbidden: You do not have authority to approve or reject this leave request." },
        { status: 403 }
      );
    }

    const result = await reviewLeaveRequest({
      institutionId: existingReq.institutionId,
      requestId: id,
      reviewerUserId: user.id,
      reviewerName: user.fullName,
      reviewerEmail: user.email,
      status: targetStatus,
      rejectionReason: effectiveReason,
    });

    return NextResponse.json({
      success: true,
      message: `Leave request has been ${targetStatus.toLowerCase()} successfully.`,
      result,
    });
  } catch (error: any) {
    console.error("PATCH /api/leaves/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process leave request" },
      { status: 400 }
    );
  }
}
