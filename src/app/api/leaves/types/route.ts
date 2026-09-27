import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentLeaveYear, ensureInstitutionLeavePolicy } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(10),
  isPaid: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveYear = await getOrCreateCurrentLeaveYear(user.institutionId);
    await ensureInstitutionLeavePolicy(user.institutionId, leaveYear.id);

    const leaveTypes = await prisma.leaveType.findMany({
      where: { institutionId: user.institutionId },
      include: {
        policyRules: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ leaveTypes });
  } catch (error: any) {
    console.error("GET /api/leaves/types error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch leave types" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "HR_ADMIN"].includes(user.roleCode || "");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = createTypeSchema.parse(json);

    const existing = await prisma.leaveType.findFirst({
      where: {
        institutionId: user.institutionId,
        code: parsed.code.trim().toUpperCase(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A leave type with code '${parsed.code.toUpperCase()}' already exists.` },
        { status: 400 }
      );
    }

    const created = await prisma.leaveType.create({
      data: {
        institutionId: user.institutionId,
        name: parsed.name.trim(),
        code: parsed.code.trim().toUpperCase(),
        isPaid: parsed.isPaid,
        description: parsed.description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Leave type '${created.name}' created successfully.`,
      leaveType: created,
    });
  } catch (error: any) {
    console.error("POST /api/leaves/types error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create leave type" },
      { status: 400 }
    );
  }
}
