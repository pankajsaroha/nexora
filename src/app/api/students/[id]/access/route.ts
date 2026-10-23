import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getStudentPortalAccess,
  provisionStudentPortalAccess,
  suspendStudentPortalAccess,
  restoreStudentPortalAccess,
  revokeStudentPortalAccess,
  resetStudentPassword,
  canManageStudentPortal,
} from "@/lib/portal/service";

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

    if (!canManageStudentPortal(user)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view portal access details." },
        { status: 403 }
      );
    }

    const { id } = params;
    const accessData = await getStudentPortalAccess(id, user);

    return NextResponse.json(accessData);
  } catch (error: any) {
    console.error("GET /api/students/[id]/access error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve student portal access" },
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
        { error: "Forbidden: You do not have permission to manage portal access." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { action, password, customLoginId, reason, newPassword } = body;

    switch (action) {
      case "ENABLE":
      case "PROVISION": {
        const result = await provisionStudentPortalAccess(id, user, {
          password,
          customLoginId,
          status: body.setupPending ? "SETUP_PENDING" : "ACTIVE",
        });
        return NextResponse.json({
          ...result,
          message: `Portal access successfully provisioned for ${result.student.fullName} with Login ID '${result.loginId}'.`,
        });
      }

      case "SUSPEND": {
        const updated = await suspendStudentPortalAccess(id, user, reason);
        return NextResponse.json({
          success: true,
          message: `Portal access for ${updated.fullName} has been suspended. Academic records remain intact.`,
          student: updated,
        });
      }

      case "RESTORE": {
        const updated = await restoreStudentPortalAccess(id, user);
        return NextResponse.json({
          success: true,
          message: `Portal access for ${updated.fullName} has been restored to Active.`,
          student: updated,
        });
      }

      case "REVOKE": {
        const updated = await revokeStudentPortalAccess(id, user, reason);
        return NextResponse.json({
          success: true,
          message: `Portal access for ${updated.fullName} has been revoked.`,
          student: updated,
        });
      }

      case "RESET_PASSWORD": {
        const targetPassword = newPassword || password;
        if (!targetPassword) {
          return NextResponse.json(
            { error: "A new password is required to reset student credentials." },
            { status: 400 }
          );
        }
        const result = await resetStudentPassword(id, user, targetPassword);
        return NextResponse.json({
          ...result,
          message: "Student portal password updated successfully.",
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action '${action}'. Valid actions: ENABLE, SUSPEND, RESTORE, REVOKE, RESET_PASSWORD.` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("POST /api/students/[id]/access error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process portal access action." },
      { status: 500 }
    );
  }
}
