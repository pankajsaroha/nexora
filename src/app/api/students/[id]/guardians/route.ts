import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  linkStudentGuardian,
  unlinkStudentGuardian,
  canManageStudentPortal,
} from "@/lib/portal/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const student = await prisma.student.findFirst({
      where: { id, institutionId: user.institutionId },
      include: {
        guardians: {
          include: {
            guardian: {
              include: {
                user: {
                  select: { id: true, email: true, isActive: true, lastLoginAt: true },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      guardians: student.guardians.map((sg) => ({
        id: sg.guardian.id,
        fullName: sg.guardian.fullName,
        relation: sg.guardian.relation,
        phone: sg.guardian.phone,
        email: sg.guardian.email,
        isPrimary: sg.isPrimary,
        hasPortalAccount: !!sg.guardian.user,
        portalUser: sg.guardian.user,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/students/[id]/guardians error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch student guardians" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageStudentPortal(user)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to link guardians." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));

    const result = await linkStudentGuardian(id, body, user);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/students/[id]/guardians error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to link guardian" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageStudentPortal(user)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to unlink guardians." },
        { status: 403 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const guardianId = searchParams.get("guardianId");

    if (!guardianId) {
      return NextResponse.json(
        { error: "Guardian ID is required in query parameters." },
        { status: 400 }
      );
    }

    await unlinkStudentGuardian(id, guardianId, user);

    return NextResponse.json({
      success: true,
      message: "Guardian successfully unlinked from student.",
    });
  } catch (error: any) {
    console.error("DELETE /api/students/[id]/guardians error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to unlink guardian" },
      { status: 500 }
    );
  }
}
