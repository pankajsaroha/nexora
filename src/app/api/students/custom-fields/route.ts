import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const createCustomFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  key: z.string().min(1, "Field key is required").regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, and underscores"),
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
  ]),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  isRequired: z.boolean().default(false),
  isVisibleToAdmin: z.boolean().default(true),
  isVisibleToTeacher: z.boolean().default(true),
  isVisibleToParent: z.boolean().default(false),
  isVisibleToStudent: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customFields = await prisma.studentCustomField.findMany({
      where: { institutionId: user.institutionId },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    });

    const parsedFields = customFields.map((f) => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : [],
    }));

    return NextResponse.json({ customFields: parsedFields });
  } catch (error: any) {
    console.error("Fetch custom fields error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch custom fields" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.STUDENTS_FIELDS_MANAGE) && !hasPermission(user, PERMISSIONS.SETTINGS_MANAGE)) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions to manage student custom fields." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = createCustomFieldSchema.parse(json);

    // Check duplicate key in institution
    const existing = await prisma.studentCustomField.findUnique({
      where: {
        institutionId_key: {
          institutionId: user.institutionId,
          key: parsed.key.trim().toLowerCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A field with key '${parsed.key}' already exists for your institution.` },
        { status: 400 }
      );
    }

    const count = await prisma.studentCustomField.count({
      where: { institutionId: user.institutionId },
    });

    const customField = await prisma.studentCustomField.create({
      data: {
        institutionId: user.institutionId,
        name: parsed.name.trim(),
        key: parsed.key.trim().toLowerCase(),
        fieldType: parsed.fieldType,
        options: parsed.options && parsed.options.length > 0 ? JSON.stringify(parsed.options) : null,
        placeholder: parsed.placeholder?.trim() || null,
        helpText: parsed.helpText?.trim() || null,
        isRequired: parsed.isRequired,
        isVisibleToAdmin: parsed.isVisibleToAdmin,
        isVisibleToTeacher: parsed.isVisibleToTeacher,
        isVisibleToParent: parsed.isVisibleToParent,
        isVisibleToStudent: parsed.isVisibleToStudent,
        orderIndex: parsed.orderIndex || count,
        isActive: true,
      },
    });

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      action: "CREATE",
      entity: "StudentCustomField",
      entityId: customField.id,
      details: `Created student custom field '${customField.name}' (${customField.key}, type: ${customField.fieldType}, required: ${customField.isRequired})`,
    });

    return NextResponse.json({
      success: true,
      message: `Custom field '${customField.name}' created successfully.`,
      customField: {
        ...customField,
        options: customField.options ? JSON.parse(customField.options) : [],
      },
    });
  } catch (error: any) {
    console.error("Create custom field error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create custom field." },
      { status: 400 }
    );
  }
}
