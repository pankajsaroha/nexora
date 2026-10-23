import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
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
        { error: "Forbidden: Only Super Administrators can modify institution lifecycle states." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { action, reason } = body;

    if (!["SUSPEND", "REACTIVATE", "ARCHIVE"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Supported actions: SUSPEND, REACTIVATE, ARCHIVE" },
        { status: 400 }
      );
    }

    if ((action === "SUSPEND" || action === "ARCHIVE") && (!reason || reason.trim().length < 5)) {
      return NextResponse.json(
        { error: "A valid reason (minimum 5 characters) is required for suspension or archival." },
        { status: 400 }
      );
    }

    const target = await prisma.institution.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    }

    // Safety rule: Prevent suspending or archiving the only active institution
    if (action === "SUSPEND" || action === "ARCHIVE") {
      const activeCount = await prisma.institution.count({
        where: {
          id: { not: id },
          status: "ACTIVE",
        },
      });

      if (activeCount === 0 && (target as any).status === "ACTIVE") {
        return NextResponse.json(
          {
            error: "Cannot suspend or archive the only active institution in the platform. At least one institution must remain active.",
          },
          { status: 400 }
        );
      }
    }

    let updateData: any = {};
    let auditAction = "";

    if (action === "SUSPEND") {
      updateData = {
        status: "SUSPENDED",
        statusReason: reason.trim(),
        suspendedAt: new Date(),
      };
      auditAction = "INSTITUTION_SUSPENDED";
    } else if (action === "REACTIVATE") {
      updateData = {
        status: "ACTIVE",
        statusReason: null,
        suspendedAt: null,
        archivedAt: null,
      };
      auditAction = "INSTITUTION_REACTIVATED";
    } else if (action === "ARCHIVE") {
      updateData = {
        status: "ARCHIVED",
        statusReason: reason.trim(),
        archivedAt: new Date(),
      };
      auditAction = "INSTITUTION_ARCHIVED";
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: updateData,
    });

    try {
      await logAuditEvent({
        institutionId: id,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action: auditAction,
        entity: "Institution",
        entityId: id,
        details: {
          previousStatus: (target as any).status || "ACTIVE",
          newStatus: updateData.status,
          reason: reason || "Administrative action",
          institutionName: target.name,
        },
      });
    } catch {
      // Non-blocking audit
    }

    return NextResponse.json({
      success: true,
      institution: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        status: (updated as any).status,
        statusReason: (updated as any).statusReason,
        suspendedAt: (updated as any).suspendedAt,
        archivedAt: (updated as any).archivedAt,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/institutions/[id]/status error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
