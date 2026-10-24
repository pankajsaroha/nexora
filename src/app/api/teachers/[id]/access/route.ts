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
    const body = await req.json().catch(() => ({}));
    const { roleCode, role, password, email } = body;

    const whereClause: any = { id };
    if (user.roleCode !== "SUPER_ADMIN") {
      whereClause.institutionId = user.institutionId;
    }

    const staff = await prisma.teacher.findFirst({
      where: whereClause,
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const assignedRole = roleCode || role || "TEACHER";
    const targetEmail = (email || staff.email).trim().toLowerCase();

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
        // Check if a user with this email already exists in the database
        const existingUser = await tx.user.findUnique({
          where: { email: targetEmail },
        });

        if (existingUser) {
          // Link existing user to this staff member
          const updateData: any = {
            roleCode: assignedRole,
            isActive: true,
          };
          if (password && password.trim()) {
            updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
          }
          userAccount = await tx.user.update({
            where: { id: existingUser.id },
            data: updateData,
          });

          await tx.teacher.update({
            where: { id: staff.id },
            data: { userId: existingUser.id },
          });
        } else {
          // Create new user account
          const passwordHash = await bcrypt.hash(password?.trim() || "Nexora@2026", 10);
          userAccount = await tx.user.create({
            data: {
              institutionId: staff.institutionId,
              email: targetEmail,
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
      }

      await tx.auditLog.create({
        data: {
          institutionId: staff.institutionId,
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

    const whereClause: any = { id };
    if (user.roleCode !== "SUPER_ADMIN") {
      whereClause.institutionId = user.institutionId;
    }

    const staff = await prisma.teacher.findFirst({
      where: whereClause,
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
          institutionId: staff.institutionId,
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
