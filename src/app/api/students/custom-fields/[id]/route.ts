import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateCustomFieldSchema = z.object({
  name: z.string().optional(),
  fieldType: z.enum([
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "DATE",
    "DROPDOWN",
    "MULTI_SELECT",
    "BOOLEAN",
    "PHONE",
    "EMAIL",
  ]).optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  isRequired: z.boolean().optional(),
  isVisibleToAdmin: z.boolean().optional(),
  isVisibleToTeacher: z.boolean().optional(),
  isVisibleToParent: z.boolean().optional(),
  isVisibleToStudent: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.STUDENTS_FIELDS_MANAGE) && !hasPermission(user, PERMISSIONS.SETTINGS_MANAGE)) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 });
    }

    const { id } = params;
    const json = await req.json();
    const parsed = updateCustomFieldSchema.parse(json);

    const existing = await prisma.studentCustomField.findFirst({
      where: { id, institutionId: user.institutionId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Custom field not found." }, { status: 404 });
    }

    const updated = await prisma.studentCustomField.update({
      where: { id },
      data: {
        name: parsed.name !== undefined ? parsed.name.trim() : undefined,
        fieldType: parsed.fieldType !== undefined ? parsed.fieldType : undefined,
        options: parsed.options !== undefined ? JSON.stringify(parsed.options) : undefined,
        placeholder: parsed.placeholder !== undefined ? parsed.placeholder : undefined,
        helpText: parsed.helpText !== undefined ? parsed.helpText : undefined,
        isRequired: parsed.isRequired !== undefined ? parsed.isRequired : undefined,
        isVisibleToAdmin: parsed.isVisibleToAdmin !== undefined ? parsed.isVisibleToAdmin : undefined,
        isVisibleToTeacher: parsed.isVisibleToTeacher !== undefined ? parsed.isVisibleToTeacher : undefined,
        isVisibleToParent: parsed.isVisibleToParent !== undefined ? parsed.isVisibleToParent : undefined,
        isVisibleToStudent: parsed.isVisibleToStudent !== undefined ? parsed.isVisibleToStudent : undefined,
        orderIndex: parsed.orderIndex !== undefined ? parsed.orderIndex : undefined,
        isActive: parsed.isActive !== undefined ? parsed.isActive : undefined,
      },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "UPDATE",
      entity: "StudentCustomField",
      entityId: id,
      details: `Updated custom field '${updated.name}' (${updated.key})`,
    });

    return NextResponse.json({
      success: true,
      message: `Custom field '${updated.name}' updated successfully.`,
      customField: {
        ...updated,
        options: updated.options ? JSON.parse(updated.options) : [],
      },
    });
  } catch (error: any) {
    console.error("Update custom field error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update custom field." },
      { status: 400 }
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

    if (!hasPermission(user, PERMISSIONS.STUDENTS_FIELDS_MANAGE) && !hasPermission(user, PERMISSIONS.SETTINGS_MANAGE)) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.studentCustomField.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { _count: { select: { values: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Custom field not found." }, { status: 404 });
    }

    // If field has existing values from admitted students, soft deactivate it instead of destroying student history
    if (existing._count.values > 0) {
      await prisma.studentCustomField.update({
        where: { id },
        data: { isActive: false },
      });

      await logAuditEvent({
        institutionId: user.institutionId,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        action: "DEACTIVATE",
        entity: "StudentCustomField",
        entityId: id,
        details: `Deactivated custom field '${existing.name}' (${existing._count.values} student values preserved).`,
      });

      return NextResponse.json({
        success: true,
        message: `Field '${existing.name}' contains existing historical student records. It has been deactivated to preserve student history.`,
      });
    }

    // If no values exist, safe to delete definition
    await prisma.studentCustomField.delete({
      where: { id },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "DELETE",
      entity: "StudentCustomField",
      entityId: id,
      details: `Deleted unused custom field definition '${existing.name}'.`,
    });

    return NextResponse.json({
      success: true,
      message: `Custom field '${existing.name}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Delete custom field error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete custom field." },
      { status: 500 }
    );
  }
}
