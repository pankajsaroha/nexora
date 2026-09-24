import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DEMO_ACCOUNTS_MAP: Record<string, { roleCode: string; fullName: string; email: string }> = {
  "principal@nexora.demo": { roleCode: "PRINCIPAL", fullName: "Dr. Arvind Menon", email: "principal@nexora.demo" },
  "teacher@nexora.demo": { roleCode: "TEACHER", fullName: "Mrs. Ananya Sharma", email: "teacher@nexora.demo" },
  "student@nexora.demo": { roleCode: "STUDENT", fullName: "Aarav Sharma", email: "student@nexora.demo" },
  "parent@nexora.demo": { roleCode: "PARENT", fullName: "Mr. Rajesh Sharma", email: "parent@nexora.demo" },
  "accountant@nexora.demo": { roleCode: "ACCOUNTANT", fullName: "Mr. Vikram Malhotra", email: "accountant@nexora.demo" },
  "admin@nexora.demo": { roleCode: "SUPER_ADMIN", fullName: "System Administrator", email: "admin@nexora.demo" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "principal@nexora.demo";
    const requestedRole = body.role;

    // 1. Try to find user by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          ...(requestedRole ? [{ roleCode: requestedRole.toUpperCase() }] : []),
        ],
      },
      include: { institution: true },
    });

    // 2. If user doesn't exist, ensure Institution & Demo User exist
    if (!user) {
      let institution = await prisma.institution.findFirst();
      if (!institution) {
        institution = await prisma.institution.create({
          data: {
            name: "Northstar International Academy",
            code: "NORTHSTAR-2026",
            type: "SCHOOL",
            address: "Plot 12, Knowledge Park III",
            city: "Greater Noida",
            state: "Uttar Pradesh",
            pincode: "201306",
            phone: "+91 98100 11000",
            email: "admissions@northstar.edu.in",
            timezone: "Asia/Kolkata",
            currency: "INR",
            currencySymbol: "₹",
            workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
            workingHours: "08:00 - 15:30",
            brandingColor: "#0F172A",
          },
        });
      }

      const preset = DEMO_ACCOUNTS_MAP[email.toLowerCase()] || {
        roleCode: requestedRole?.toUpperCase() || "PRINCIPAL",
        fullName: "Demo " + (requestedRole || "User"),
        email: email.toLowerCase(),
      };

      const passwordHash = await bcrypt.hash("demo123", 10);

      user = await prisma.user.create({
        data: {
          institutionId: institution.id,
          email: preset.email,
          fullName: preset.fullName,
          roleCode: preset.roleCode,
          passwordHash,
          isActive: true,
        },
        include: { institution: true },
      });
    }

    // Set session cookie
    cookies().set("nexora_session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    try {
      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action: "DEMO_ROLE_SWITCH",
        entity: "User",
        entityId: user.id,
        details: { roleCode: user.roleCode },
      });
    } catch {
      // Non-blocking audit
    }

    const response = NextResponse.json({
      success: true,
      redirectUrl: "/dashboard",
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

    return response;
  } catch (error: any) {
    console.error("demo-switch error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

