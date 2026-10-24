import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to update credentials." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and password confirmation do not match." },
        { status: 400 }
      );
    }

    // Retrieve database user with current password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    // Verify current password against database hash
    const isCurrentValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "The current password you entered is incorrect." },
        { status: 400 }
      );
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword.trim(), 10);

    // Update database record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        updatedAt: new Date(),
      },
    });

    // Synchronize Supabase Auth if applicable
    try {
      const supabase = createAdminSupabaseClient();
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === dbUser.email.toLowerCase()
      );

      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
          password: newPassword.trim(),
        });
      }
    } catch (sbErr) {
      console.warn("Supabase Auth password sync error:", sbErr);
    }

    // Audit log entry
    await logAuditEvent({
      institutionId: dbUser.institutionId,
      userId: dbUser.id,
      userEmail: dbUser.email,
      userName: dbUser.fullName,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: dbUser.id,
      details: "User updated account credentials via Account Settings",
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
