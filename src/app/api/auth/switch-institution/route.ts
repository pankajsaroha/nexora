import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.roleCode !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Administrators can switch institutional context." },
        { status: 403 }
      );
    }

    const { institutionId } = await req.json();
    if (!institutionId) {
      return NextResponse.json({ error: "Institution ID is required." }, { status: 400 });
    }

    const targetInstitution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!targetInstitution) {
      return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    }

    // Update the super admin's active institution context
    await prisma.user.update({
      where: { id: user.id },
      data: { institutionId: targetInstitution.id },
    });

    try {
      await logAuditEvent({
        institutionId: targetInstitution.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action: "SUPER_ADMIN_SWITCH_INSTITUTION",
        entity: "Institution",
        entityId: targetInstitution.id,
        details: { institutionName: targetInstitution.name },
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      institution: {
        id: targetInstitution.id,
        name: targetInstitution.name,
        code: targetInstitution.code,
      },
    });
  } catch (error: any) {
    console.error("switch-institution error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
