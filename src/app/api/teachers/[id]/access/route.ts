import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.USERS_MANAGE) && user.roleCode !== "SUPER_ADMIN" && user.roleCode !== "PRINCIPAL") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to manage portal access." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { roleCode, password } = body;

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const assignedRole = roleCode || "TEACHER";

    const updatedStaff = await prisma.$transaction(async (tx) => {
      let userAccount = staff.user;

      if (userAccount) {
        // Update existing user account
        const updateData: any = {
          roleCode: assignedRole,
          isActive: true,
        };
        if (password && password.trim()) {
          updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
        }
        userAccount = await tx.user.update({
          where: { id: userAccount.id },
          data: updateData,
        });
      } else {
        // Create new user account
        const passwordHash = await bcrypt.hash(password?.trim() || "Nexora@2026", 10);
        userAccount = await tx.user.create({
          data: {
            institutionId: user.institutionId,
            email: staff.email.trim().toLowerCase(),
            fullName: staff.fullName,
            passwordHash,
            roleCode: assignedRole,
            phone: staff.phone,
            isActive: true,
          },
        });

        await tx.teacher.update({
          where: { id: staff.id },
          data: { userId: userAccount.id },
        });
      }

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "PORTAL_ACCESS_GRANTED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Granted portal login access to ${staff.fullName} with role ${assignedRole}`,
        },
      });

      return { ...staff, user: userAccount };
    });

    return NextResponse.json({
      success: true,
      message: `Portal login access granted for '${staff.fullName}' (${assignedRole}).`,
      user: updatedStaff.user,
    });
  } catch (error: any) {
    console.error("POST /api/teachers/[id]/access error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to grant portal access" },
      { status: 500 }
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

    if (!hasPermission(user, PERMISSIONS.USERS_MANAGE) && user.roleCode !== "SUPER_ADMIN" && user.roleCode !== "PRINCIPAL") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to revoke portal access." },
        { status: 403 }
      );
    }

    const { id } = params;

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (!staff.userId) {
      return NextResponse.json(
        { message: "Staff member already has no active portal access account." },
        { status: 200 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Disable user login
      await tx.user.update({
        where: { id: staff.userId! },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "PORTAL_ACCESS_REVOKED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Revoked portal login access for ${staff.fullName} (${staff.employeeId})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Portal access for '${staff.fullName}' has been revoked. Employee record is retained.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/teachers/[id]/access error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to revoke portal access" },
      { status: 500 }
    );
  }
}
