import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { logAuditEvent } from "@/lib/audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid institutional email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in database
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      include: { institution: true },
    });

    if (user && user.isActive) {
      try {
        const origin =
          req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectTo = `${origin}/reset-password`;

        const supabase = createAdminSupabaseClient();

        // 1. Generate Supabase Auth password recovery link
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email: cleanEmail,
          options: {
            redirectTo,
          },
        });

        const actionLink = linkData?.properties?.action_link;

        // 2. If user exists and actionLink is generated, send via Resend if configured
        if (actionLink && process.env.RESEND_API_KEY) {
          await sendPasswordResetEmail({
            to: cleanEmail,
            userName: user.fullName || "Administrator",
            resetLink: actionLink,
            expiresInMinutes: 15,
          });
        } else {
          // Trigger standard Supabase Auth recovery email as provider fallback
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo,
          });
        }

        // Server-side audit without exposing secrets
        const domain = cleanEmail.split("@")[1] || "unknown";
        console.log(`[Auth] Password recovery initiated for institutional domain: ${domain}`);

        await logAuditEvent({
          institutionId: user.institutionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          action: "PASSWORD_RESET_REQUESTED",
          entity: "User",
          entityId: user.id,
          details: "Password recovery link initiated",
        });
      } catch (err: any) {
        console.error("Password recovery link generation error:", err.message || err);
      }
    }

    // Always return safe, generic response to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, we have sent instructions to reset your password.",
    });
  } catch (error: any) {
    console.error("Forgot password route error:", error.message || error);
    return NextResponse.json(
      { error: "Unable to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
