import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { parseStaffMetadata, serializeStaffMetadata, StaffDocument } from "@/lib/staff";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user, PERMISSIONS.TEACHERS_EDIT)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to manage staff documents." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { type, title, fileUrl, fileName, fileSize, issueDate, expiryDate } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Document type and title are required." },
        { status: 400 }
      );
    }

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const meta = parseStaffMetadata(staff.qualification);
    const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newDoc: StaffDocument = {
      id: docId,
      type,
      title: title.trim(),
      fileUrl: fileUrl || undefined,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSize: fileSize || "1.2 MB",
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.fullName,
      status: "VERIFIED",
    };

    const documents = [...(meta.documents || []), newDoc];
    meta.documents = documents;

    await prisma.$transaction(async (tx) => {
      await tx.teacher.update({
        where: { id },
        data: { qualification: serializeStaffMetadata(meta) },
      });

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STAFF_DOCUMENT_UPLOADED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Uploaded document '${title}' (${type}) for ${staff.fullName}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Document '${title}' attached successfully.`,
      document: newDoc,
    });
  } catch (error: any) {
    console.error("POST /api/teachers/[id]/documents error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload document" },
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

    if (!hasPermission(user, PERMISSIONS.TEACHERS_EDIT)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete staff documents." },
        { status: 403 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const staff = await prisma.teacher.findFirst({
      where: { id, institutionId: user.institutionId },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const meta = parseStaffMetadata(staff.qualification);
    const filteredDocs = (meta.documents || []).filter((d) => d.id !== documentId);
    meta.documents = filteredDocs;

    await prisma.$transaction(async (tx) => {
      await tx.teacher.update({
        where: { id },
        data: { qualification: serializeStaffMetadata(meta) },
      });

      await tx.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          action: "STAFF_DOCUMENT_DELETED",
          entity: "Teacher",
          entityId: staff.id,
          details: `Deleted document ${documentId} for ${staff.fullName}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Document removed successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/teachers/[id]/documents error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove document" },
      { status: 500 }
    );
  }
}
