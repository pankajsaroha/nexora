import { prisma } from "./prisma";

export interface LogAuditOptions {
  institutionId: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export async function logAuditEvent(options: LogAuditOptions) {
  try {
    const detailsStr =
      typeof options.details === "object"
        ? JSON.stringify(options.details)
        : options.details || null;

    return await prisma.auditLog.create({
      data: {
        institutionId: options.institutionId,
        userId: options.userId || null,
        userEmail: options.userEmail || null,
        userName: options.userName || null,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId || null,
        details: detailsStr,
        ipAddress: options.ipAddress || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
