import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.email || body.identifier || "").trim();
    const { password } = body;

    if (!identifier || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Institutional email or Student Login ID and password are required to sign in." },
        { status: 400 }
      );
    }

    let user: any = null;
    let studentRecord: any = null;

    // 1. Check if the identifier matches an institution-issued student login ID (e.g., NX7K42P)
    const matchedStudent = await prisma.student.findFirst({
      where: {
        loginId: {
          equals: identifier,
          mode: "insensitive",
        },
      },
      include: {
        institution: true,
        user: true,
      },
    });

    if (matchedStudent) {
      if (matchedStudent.portalAccessStatus === "SUSPENDED") {
        return NextResponse.json(
          { error: "Student portal access is currently suspended. Please contact your institution administrator." },
          { status: 403 }
        );
      }

      if (matchedStudent.portalAccessStatus === "REVOKED" || matchedStudent.portalAccessStatus === "NOT_ENABLED") {
        return NextResponse.json(
          { error: "Student portal access has not been activated for this account. Please contact your administrator." },
          { status: 403 }
        );
      }

      if (!matchedStudent.user) {
        return NextResponse.json(
          { error: "No active login account provisioned for this Student Login ID." },
          { status: 401 }
        );
      }

      user = {
        ...matchedStudent.user,
        institution: matchedStudent.institution,
      };
      studentRecord = matchedStudent;
    } else {
      // 2. Lookup user by institutional email
      const cleanEmail = identifier.toLowerCase();
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: cleanEmail,
            mode: "insensitive",
          },
        },
        include: {
          institution: true,
          student: true,
        },
      });

      if (user?.roleCode === "STUDENT" && user.student) {
        if (user.student.portalAccessStatus === "SUSPENDED") {
          return NextResponse.json(
            { error: "Student portal access is currently suspended. Please contact your institution administrator." },
            { status: 403 }
          );
        }
        if (user.student.portalAccessStatus === "REVOKED") {
          return NextResponse.json(
            { error: "Student portal access has been revoked for this account." },
            { status: 403 }
          );
        }
        studentRecord = user.student;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this institutional email or Student Login ID. Please check your credentials." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This institutional account is inactive. Please contact your administrator." },
        { status: 403 }
      );
    }

    // Enforce institution lifecycle state for standard accounts
    if (user.roleCode !== "SUPER_ADMIN" && user.institution) {
      const instStatus = (user.institution as any).status || "ACTIVE";
      if (instStatus === "SUSPENDED") {
        const reason = (user.institution as any).statusReason || "Administrative hold";
        return NextResponse.json(
          {
            error: `Access Suspended: ${user.institution.name} is currently suspended by platform administration. Reason: ${reason}. Please contact your institution administrator.`,
          },
          { status: 403 }
        );
      }
      if (instStatus === "ARCHIVED") {
        return NextResponse.json(
          {
            error: `Institution Archived: ${user.institution.name} has been archived. All active logins and operations are disabled.`,
          },
          { status: 403 }
        );
      }
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch && password.trim() !== password) {
      isMatch = await bcrypt.compare(password.trim(), user.passwordHash);
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password for this account. Please verify your password." },
        { status: 401 }
      );
    }

    // If student was in SETUP_PENDING, activate portal access upon first successful sign in
    if (studentRecord && studentRecord.portalAccessStatus === "SETUP_PENDING") {
      await prisma.student.update({
        where: { id: studentRecord.id },
        data: { portalAccessStatus: "ACTIVE" },
      });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCode: user.roleCode,
        institutionName: user.institution.name,
      },
    });

    response.cookies.set("nexora_session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Also set on cookies() store for SSR consistency
    cookies().set("nexora_session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
    });

    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while signing you in. Please try again." },
      { status: 500 }
    );
  }
}
