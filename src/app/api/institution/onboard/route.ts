import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      institutionType,
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

    if (!name || !code || !email || !adminEmail) {
      return NextResponse.json(
        { error: "Institution Name, Code, Email and Admin Email are required." },
        { status: 400 }
      );
    }

    // Check if institution code already exists
    const existing = await prisma.institution.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Institution with code '${code}' already exists. Please choose a unique identifier.` },
        { status: 400 }
      );
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create institution with transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Institution
      const inst = await tx.institution.create({
        data: {
          name,
          code: code.toUpperCase(),
          type: institutionType === "COLLEGE" || institutionType === "UNIVERSITY" ? "COLLEGE" : "SCHOOL",
          email,
          phone: phone || "+91 00000 00000",
          address: address || "Campus Main Gate",
          city: city || "New Delhi",
          state: state || "Delhi",
          pincode: pincode || "110001",
          website: website || "",
          currency,
          currencySymbol,
          timezone,
          brandingColor: "#4f46e5",
        },
      });

      // 2. Campus Main
      const campus = await tx.campus.create({
        data: {
          institutionId: inst.id,
          name: "Main Campus",
          code: "MAIN",
          address: inst.address,
          contactEmail: inst.email,
          contactPhone: inst.phone,
        },
      });

      // 3. Academic Year
      const year = academicYearName || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      const acadYear = await tx.academicYear.create({
        data: {
          institutionId: inst.id,
          name: year,
          startDate: new Date(`${new Date().getFullYear()}-04-01`),
          endDate: new Date(`${new Date().getFullYear() + 1}-03-31`),
          isCurrent: true,
        },
      });

      // 4. Classes / Departments & Sections
      if (Array.isArray(classesOrPrograms) && classesOrPrograms.length > 0) {
        for (let i = 0; i < classesOrPrograms.length; i++) {
          const item = classesOrPrograms[i];
          const className = typeof item === "string" ? item : item.name;
          const classCode = typeof item === "string" ? `CLS-${i + 1}` : (item.code || `CLS-${i + 1}`);

          const createdClass = await tx.class.create({
            data: {
              institutionId: inst.id,
              name: className,
              code: classCode,
              academicYearId: acadYear.id,
              level: inst.type === "COLLEGE" ? "UNDERGRADUATE" : "SECONDARY",
              orderIndex: i + 1,
            },
          });

          // Create default section A
          await tx.section.create({
            data: {
              classId: createdClass.id,
              name: "A",
              roomNumber: `Room-${101 + i}`,
              capacity: 40,
            },
          });
        }
      } else {
        // Create default starter classes
        const defaultClasses = inst.type === "COLLEGE" 
          ? ["B.Tech Computer Science", "B.Tech Electronics", "BBA", "B.Com"]
          : ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

        for (let i = 0; i < defaultClasses.length; i++) {
          const cName = defaultClasses[i];
          const createdClass = await tx.class.create({
            data: {
              institutionId: inst.id,
              name: cName,
              code: `C${i + 1}`,
              academicYearId: acadYear.id,
              level: inst.type === "COLLEGE" ? "UNDERGRADUATE" : "SECONDARY",
              orderIndex: i + 1,
            },
          });

          await tx.section.create({
            data: {
              classId: createdClass.id,
              name: "A",
              roomNumber: `Room-${101 + i}`,
              capacity: 40,
            },
          });
        }
      }

      // 5. Admin User
      const [fName, ...lParts] = (adminName || "Administrator").split(" ");
      const lName = lParts.join(" ") || "Admin";

      const adminUser = await tx.user.create({
        data: {
          institutionId: inst.id,
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: adminName || "Administrator",
          roleCode: "SUPER_ADMIN",
          phone: adminPhone || inst.phone,
          isActive: true,
        },
      });

      // 6. Audit Log
      await tx.auditLog.create({
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

      return { institution: inst, campus, academicYear: acadYear, admin: adminUser };
    });

    return NextResponse.json({
      success: true,
      message: `Institution '${result.institution.name}' successfully provisioned.`,
      institution: {
        id: result.institution.id,
        name: result.institution.name,
        code: result.institution.code,
        type: result.institution.type,
        adminEmail: result.admin.email,
      },
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to provision institution." },
      { status: 500 }
    );
  }
}
