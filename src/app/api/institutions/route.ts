import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.roleCode !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Super Administrator access required." },
        { status: 403 }
      );
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
            classes: true,
            guardians: true,
            auditLogs: true,
          },
        },
      },
    });

    const formatted = institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      code: inst.code,
      type: inst.type,
      status: (inst as any).status || "ACTIVE",
      statusReason: (inst as any).statusReason || null,
      suspendedAt: (inst as any).suspendedAt || null,
      archivedAt: (inst as any).archivedAt || null,
      address: inst.address,
      city: inst.city,
      state: inst.state,
      phone: inst.phone,
      email: inst.email,
      website: inst.website,
      createdAt: inst.createdAt,
      updatedAt: inst.updatedAt,
      isCurrentContext: inst.id === user.institutionId,
      counts: {
        users: inst._count.users,
        students: inst._count.students,
        teachers: inst._count.teachers,
        classes: inst._count.classes,
        guardians: inst._count.guardians,
        auditLogs: inst._count.auditLogs,
      },
    }));

    return NextResponse.json({ institutions: formatted });
  } catch (error: any) {
    console.error("GET /api/institutions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}
