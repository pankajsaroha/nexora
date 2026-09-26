import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { newPassword, confirmPassword, email, accessToken } = body;

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    let targetEmail: string | null = email ? email.trim().toLowerCase() : null;

    // Verify recovery access token from Supabase Auth if provided
    if (accessToken && typeof accessToken === "string") {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
        if (!userError && userData?.user?.email) {
          targetEmail = userData.user.email.toLowerCase();
        }
      } catch (sbErr) {
        console.warn("Supabase token verification error:", sbErr);
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Invalid or expired password reset session. Please request a new recovery link." },
        { status: 400 }
      );
    }

    // Locate the user in Prisma
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: targetEmail,
          mode: "insensitive",
        },
      },
      include: { institution: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Institutional user record not found. Please contact support." },
        { status: 404 }
      );
    }

    // 1. Ensure Supabase Auth user password is updated
    try {
      const { data: userList } = await supabase.auth.admin.listUsers();
      const authUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === targetEmail
      );

      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
          password: newPassword,
          email_confirm: true,
        });
      }
    } catch (sbErr) {
      console.warn("Supabase Auth password sync error:", sbErr);
    }

    // 2. Synchronize database password hash
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        updatedAt: new Date(),
      },
    });

    // 3. Clear session cookie to require a fresh, clean sign-in
    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully. Please sign in with your new credentials.",
    });

    response.cookies.delete("nexora_session_user_id");
    cookies().delete("nexora_session_user_id");

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "PASSWORD_RESET_COMPLETED",
      entity: "User",
      entityId: user.id,
      details: "Password rotated via verified Supabase recovery link",
    });

    return response;
  } catch (error: any) {
    console.error("Reset password route error:", error.message || error);
    return NextResponse.json(
      { error: "Unable to update password. Please try again." },
      { status: 500 }
    );
  }
}
