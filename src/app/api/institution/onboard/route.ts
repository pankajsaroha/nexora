import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      institutionType = "SCHOOL",
      name,
      code,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      website,
      currency = "INR",
      currencySymbol = "₹",
      timezone = "Asia/Kolkata",
      academicYearName,
      classesOrPrograms = [],
      adminName,
      adminEmail,
      adminPhone,
      adminPassword = "Password@123",
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Institution Legal Name is required." },
        { status: 400 }
      );
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Unique Institution Code is required." },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid official administrative email is required." },
        { status: 400 }
      );
    }

    if (!adminEmail || !adminEmail.trim() || !adminEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid administrator login email is required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanAdminEmail = adminEmail.trim().toLowerCase();

    // Check existing institution
    const existingInst = await prisma.institution.findUnique({
      where: { code: cleanCode },
    });

    if (existingInst) {
      return NextResponse.json(
        {
          success: false,
          error: `Institution code '${cleanCode}' is already registered. Please choose a unique code.`,
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanAdminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: `An administrator account with email '${cleanAdminEmail}' already exists. Please choose a different login email.`,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword || "Password@123", 10);
    const year = academicYearName?.trim() || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // 1. Create Institution with nested Campus, AcademicYear and Admin User
    const inst = await prisma.institution.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        type: institutionType === "COLLEGE" || institutionType === "UNIVERSITY" ? "COLLEGE" : "SCHOOL",
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "+91 00000 00000",
        address: address?.trim() || "Campus Main Gate",
        city: city?.trim() || "New Delhi",
        state: state?.trim() || "Delhi",
        pincode: pincode?.trim() || "110001",
        website: website?.trim() || "",
        currency,
        currencySymbol,
        timezone,
        brandingColor: "#171614",
        campuses: {
          create: {
            name: "Main Campus",
            code: "MAIN",
            address: address?.trim() || "Campus Main Gate",
            contactEmail: email.trim().toLowerCase(),
            contactPhone: phone?.trim() || "+91 00000 00000",
          },
        },
        academicYears: {
          create: {
            name: year,
            startDate: new Date(`${new Date().getFullYear()}-04-01`),
            endDate: new Date(`${new Date().getFullYear() + 1}-03-31`),
            isCurrent: true,
          },
        },
        users: {
          create: {
            email: cleanAdminEmail,
            passwordHash: hashedPassword,
            fullName: adminName?.trim() || "Administrator",
            roleCode: "SUPER_ADMIN",
            phone: adminPhone?.trim() || phone || "+91 00000 00000",
            isActive: true,
          },
        },
      },
      include: {
        academicYears: true,
        users: true,
      },
    });

    const acadYearId = inst.academicYears[0]?.id;
    const adminUser = inst.users[0];

    // Sync admin identity into Supabase Auth for seamless recovery and unified identity
    try {
      const supabase = createAdminSupabaseClient();
      await supabase.auth.admin.createUser({
        email: cleanAdminEmail,
        password: adminPassword || "Password@123",
        email_confirm: true,
        user_metadata: {
          fullName: adminName?.trim() || "Administrator",
          roleCode: "SUPER_ADMIN",
          institutionId: inst.id,
          prismaUserId: adminUser?.id,
        },
      });
    } catch (sbErr) {
      console.warn("Supabase Auth sync during onboarding warning:", sbErr);
    }

    // 2. Create Classes with nested Sections
    const classesList =
      Array.isArray(classesOrPrograms) && classesOrPrograms.length > 0
        ? classesOrPrograms
        : inst.type === "COLLEGE"
        ? ["B.Tech Computer Science", "B.Tech Electronics", "BBA", "B.Com"]
        : ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

    if (acadYearId) {
      for (let i = 0; i < classesList.length; i++) {
        const item = classesList[i];
        const className = typeof item === "string" ? item : item.name;
        const classCode = typeof item === "string" ? `CLS-${i + 1}` : (item.code || `CLS-${i + 1}`);

        await prisma.class.create({
          data: {
            institutionId: inst.id,
            name: className,
            code: classCode,
            academicYearId: acadYearId,
            level: inst.type === "COLLEGE" ? "UNDERGRADUATE" : "SECONDARY",
            orderIndex: i + 1,
            sections: {
              create: {
                name: "A",
                roomNumber: `Room-${101 + i}`,
                capacity: 40,
              },
            },
          },
        });
      }
    }

    // 3. Create Audit Log
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          institutionId: inst.id,
          userId: adminUser.id,
          userEmail: adminUser.email,
          userName: adminUser.fullName,
          action: "INSTITUTION_PROVISIONED",
          entity: "Institution",
          entityId: inst.id,
          details: JSON.stringify({
            name: inst.name,
            code: inst.code,
            type: inst.type,
            adminEmail: adminUser.email,
          }),
        },
      });
    }

    const res = NextResponse.json({
      success: true,
      message: `Institution '${inst.name}' successfully provisioned.`,
      institution: {
        id: inst.id,
        name: inst.name,
        code: inst.code,
        type: inst.type,
        adminEmail: adminUser?.email || cleanAdminEmail,
      },
    });

    if (adminUser) {
      res.cookies.set("nexora_session_user_id", adminUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return res;
  } catch (error: any) {
    console.error("Institution onboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to provision institution. Please try again.",
      },
      { status: 500 }
    );
  }
}
