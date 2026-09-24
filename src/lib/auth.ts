import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ROLE_DEFAULT_PERMISSIONS, PermissionCode } from "./permissions";

export interface SessionUser {
  id: string;
  institutionId: string;
  email: string;
  fullName: string;
  roleCode: string;
  avatarUrl?: string | null;
  phone?: string | null;
  institutionName: string;
  institutionCode: string;
  teacherId?: string;
  studentId?: string;
  guardianId?: string;
  permissions: string[];
}

const SESSION_COOKIE_NAME = "nexora_session_user_id";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    let user = null;

    if (sessionUserId) {
      user = await prisma.user.findUnique({
        where: { id: sessionUserId },
        include: {
          institution: true,
          teacher: true,
          student: true,
          guardian: true,
        },
      });
    }

    // Default fallback to Principal for smooth immediate development if no cookie set
    if (!user) {
      user = await prisma.user.findFirst({
        where: { roleCode: "PRINCIPAL" },
        include: {
          institution: true,
          teacher: true,
          student: true,
          guardian: true,
        },
      });
    }

    if (!user || !user.isActive) {
      return null;
    }

    // Combine role default permissions + any custom role permissions
    const permissions = Array.from(
      new Set(ROLE_DEFAULT_PERMISSIONS[user.roleCode] || [])
    );

    return {
      id: user.id,
      institutionId: user.institutionId,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.roleCode,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      institutionName: user.institution.name,
      institutionCode: user.institution.code,
      teacherId: user.teacher?.id,
      studentId: user.student?.id,
      guardianId: user.guardian?.id,
      permissions,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export function hasPermission(
  user: SessionUser | null,
  permission: PermissionCode | string
): boolean {
  if (!user) return false;
  if (user.roleCode === "SUPER_ADMIN") return true;
  return user.permissions.includes(permission);
}

export async function requireAuth(permission?: PermissionCode | string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  if (permission && !hasPermission(user, permission)) {
    throw new Error(`Forbidden: You do not have permission '${permission}'`);
  }
  return user;
}
