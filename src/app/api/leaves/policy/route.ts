import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentLeaveYear, ensureInstitutionLeavePolicy } from "@/lib/leave/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePolicyRulesSchema = z.object({
  rules: z.array(
    z.object({
      id: z.string().optional(),
      leaveTypeId: z.string(),
      annualEntitlement: z.number().min(0),
      accrualFrequency: z.enum(["ANNUAL", "MONTHLY", "QUARTERLY"]).default("ANNUAL"),
      proRataEnabled: z.boolean().default(true),
      proRataBasis: z.enum(["JOINING_DATE", "CONFIRMATION_DATE", "WORKING_DAYS"]).default("JOINING_DATE"),
      roundingRule: z.enum(["EXACT", "NEAREST_HALF", "NEAREST_ONE", "FLOOR", "CEILING"]).default("NEAREST_HALF"),
      allowCarryForward: z.boolean().default(false),
      maxCarryForwardDays: z.number().min(0).default(0),
      requiresProof: z.boolean().default(false),
    })
  ),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveYear = await getOrCreateCurrentLeaveYear(user.institutionId);
    const policy = await ensureInstitutionLeavePolicy(user.institutionId, leaveYear.id);

    const fullPolicy = await prisma.leavePolicy.findUnique({
      where: { id: policy.id },
      include: {
        rules: {
          include: { leaveType: true },
        },
      },
    });

    return NextResponse.json({ policy: fullPolicy });
  } catch (error: any) {
    console.error("GET /api/leaves/policy error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch leave policy" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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
    const parsed = updatePolicyRulesSchema.parse(json);

    const leaveYear = await getOrCreateCurrentLeaveYear(user.institutionId);
    const policy = await ensureInstitutionLeavePolicy(user.institutionId, leaveYear.id);

    await prisma.$transaction(async (tx) => {
      for (const rule of parsed.rules) {
        await tx.leavePolicyRule.upsert({
          where: {
            policyId_leaveTypeId: {
              policyId: policy.id,
              leaveTypeId: rule.leaveTypeId,
            },
          },
          update: {
            annualEntitlement: rule.annualEntitlement,
            accrualFrequency: rule.accrualFrequency,
            proRataEnabled: rule.proRataEnabled,
            proRataBasis: rule.proRataBasis,
            roundingRule: rule.roundingRule,
            allowCarryForward: rule.allowCarryForward,
            maxCarryForwardDays: rule.maxCarryForwardDays,
            requiresProof: rule.requiresProof,
          },
          create: {
            policyId: policy.id,
            leaveTypeId: rule.leaveTypeId,
            annualEntitlement: rule.annualEntitlement,
            accrualFrequency: rule.accrualFrequency,
            proRataEnabled: rule.proRataEnabled,
            proRataBasis: rule.proRataBasis,
            roundingRule: rule.roundingRule,
            allowCarryForward: rule.allowCarryForward,
            maxCarryForwardDays: rule.maxCarryForwardDays,
            requiresProof: rule.requiresProof,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Leave policy rules updated successfully.",
    });
  } catch (error: any) {
    console.error("PUT /api/leaves/policy error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update leave policy" },
      { status: 400 }
    );
  }
}
