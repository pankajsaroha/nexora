import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

export const dynamic = "force-dynamic";

const programSchema = z.object({
  name: z.string().min(1, "Program/Course name is required"),
  code: z.string().min(1, "Program/Course code is required"),
  level: z.string().default("UNDERGRADUATE"), // PRIMARY, MIDDLE, SECONDARY, HIGHER_SECONDARY, UNDERGRADUATE, POSTGRADUATE
  departmentId: z.string().optional().nullable(),
  durationYears: z.number().int().min(1).default(1),
  type: z.enum(["ANNUAL", "SEMESTER", "TRIMESTER"]).default("ANNUAL"),
  sections: z.array(z.string()).default(["A"]),
  academicYearId: z.string().optional(),

  // Optional Fee Structure Breakdown
  feeItems: z.array(
    z.object({
      categoryName: z.string().min(1),
      amount: z.number().min(0),
      frequency: z.string().default("ANNUAL"),
      dueDate: z.string().optional(),
    })
  ).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [programs, departments, academicYears, feeCategories] = await Promise.all([
      prisma.class.findMany({
        where: { institutionId: user.institutionId },
        include: {
          department: true,
          sections: {
            include: {
              classTeacher: true,
              _count: { select: { students: true } },
            },
          },
          feeStructures: {
            include: {
              feeCategory: true,
            },
          },
          _count: { select: { students: true } },
        },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.department.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { name: "asc" },
      }),
      prisma.academicYear.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { startDate: "desc" },
      }),
      prisma.feeCategory.findMany({
        where: { institutionId: user.institutionId },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      programs,
      departments,
      academicYears,
      feeCategories,
    });
  } catch (error: any) {
    console.error("Fetch programs error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch programs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = programSchema.parse(json);

    // Resolve academic year
    let academicYearId = parsed.academicYearId;
    if (!academicYearId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId, isCurrent: true },
      }) || await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId },
      });

      if (!currentYear) {
        const createdYear = await prisma.academicYear.create({
          data: {
            institutionId: user.institutionId,
            name: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            startDate: new Date(new Date().getFullYear(), 3, 1),
            endDate: new Date(new Date().getFullYear() + 1, 2, 31),
            isCurrent: true,
          },
        });
        academicYearId = createdYear.id;
      } else {
        academicYearId = currentYear.id;
      }
    }

    // Check duplicate code
    const existing = await prisma.class.findFirst({
      where: {
        institutionId: user.institutionId,
        code: parsed.code.trim().toUpperCase(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A Program/Course with code '${parsed.code}' already exists.` },
        { status: 400 }
      );
    }

    const count = await prisma.class.count({
      where: { institutionId: user.institutionId },
    });

    const program = await prisma.$transaction(async (tx) => {
      // Create Class/Program
      const createdProgram = await tx.class.create({
        data: {
          institutionId: user.institutionId,
          name: parsed.name.trim(),
          code: parsed.code.trim().toUpperCase(),
          level: parsed.level,
          departmentId: parsed.departmentId || null,
          academicYearId: academicYearId!,
          durationYears: parsed.durationYears || 1,
          type: parsed.type || "ANNUAL",
          orderIndex: count + 1,
        },
      });

      // Create Sections / Batches
      const sectionNames = parsed.sections.length > 0 ? parsed.sections : ["A"];
      for (const sName of sectionNames) {
        await tx.section.create({
          data: {
            classId: createdProgram.id,
            name: sName.trim().toUpperCase(),
            capacity: 40,
          },
        });
      }

      // Create Fee Structures if provided
      if (parsed.feeItems && parsed.feeItems.length > 0) {
        for (const item of parsed.feeItems) {
          // Find or create FeeCategory
          let category = await tx.feeCategory.findFirst({
            where: {
              institutionId: user.institutionId,
              name: item.categoryName.trim(),
            },
          });

          if (!category) {
            category = await tx.feeCategory.create({
              data: {
                institutionId: user.institutionId,
                name: item.categoryName.trim(),
              },
            });
          }

          const dueDate = item.dueDate ? new Date(item.dueDate) : new Date(new Date().getFullYear(), 8, 30);

          await tx.feeStructure.create({
            data: {
              institutionId: user.institutionId,
              feeCategoryId: category.id,
              classId: createdProgram.id,
              academicYearId: academicYearId!,
              amount: item.amount,
              frequency: item.frequency || "ANNUAL",
              dueDate,
            },
          });
        }
      }

      return createdProgram;
    });

    return NextResponse.json({
      success: true,
      message: `Program / Course '${program.name}' created successfully.`,
      program,
    });
  } catch (error: any) {
    console.error("Create program error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create program/course." },
      { status: 400 }
    );
  }
}
