import { prisma } from "@/lib/prisma";
import { SessionUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type PortalAccessStatus =
  | "NOT_ENABLED"
  | "SETUP_PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "REVOKED";

const SAFE_ALPHANUM = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // excludes 0, 1, O, I

/**
 * Generates an immutable, collision-safe, institution-scoped student login ID.
 * Format: NX + 5 characters (e.g., NX7K42P)
 */
export async function generateStudentLoginId(tx: any = prisma): Promise<string> {
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "NX";
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
      code += SAFE_ALPHANUM[bytes[i] % SAFE_ALPHANUM.length];
    }

    const existing = await tx.student.findUnique({
      where: { loginId: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  // Fallback timestamp-based suffix if collisions occur
  const timestampSuffix = Date.now().toString(36).toUpperCase().slice(-5);
  return `NX${timestampSuffix}`;
}

/**
 * Validates whether the administrative user can manage student portal access.
 */
export function canManageStudentPortal(user: SessionUser): boolean {
  if (user.roleCode === "SUPER_ADMIN" || user.roleCode === "PRINCIPAL" || user.roleCode === "ADMIN") {
    return true;
  }
  return (
    hasPermission(user, PERMISSIONS.USERS_MANAGE) ||
    hasPermission(user, PERMISSIONS.STUDENTS_EDIT)
  );
}

/**
 * Retrieves the full portal access details for a specific student,
 * including authentication identity, linked parents, and audit history.
 */
export async function getStudentPortalAccess(
  studentId: string,
  currentUser: SessionUser
) {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      institutionId: currentUser.institutionId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          roleCode: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      currentClass: { select: { id: true, name: true, code: true } },
      currentSection: { select: { id: true, name: true } },
      academicYear: { select: { id: true, name: true } },
      guardians: {
        include: {
          guardian: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  isActive: true,
                  lastLoginAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student record not found in your institution.");
  }

  // Fetch recent portal audit logs for this student
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      institutionId: currentUser.institutionId,
      entity: "Student",
      entityId: studentId,
      action: {
        in: [
          "PORTAL_ACCESS_GRANTED",
          "PORTAL_ACCESS_SUSPENDED",
          "PORTAL_ACCESS_RESTORED",
          "PORTAL_ACCESS_REVOKED",
          "PORTAL_PASSWORD_RESET",
          "GUARDIAN_LINKED",
          "GUARDIAN_UNLINKED",
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      loginId: student.loginId,
      portalAccessStatus: (student.portalAccessStatus || "NOT_ENABLED") as PortalAccessStatus,
      portalAccessGrantedAt: student.portalAccessGrantedAt,
      portalAccessSuspendedAt: student.portalAccessSuspendedAt,
      email: student.email,
      phone: student.phone,
      className: student.currentClass?.name,
      sectionName: student.currentSection?.name,
      academicYearName: student.academicYear?.name,
    },
    userAccount: student.user,
    guardians: student.guardians.map((sg) => ({
      id: sg.guardian.id,
      fullName: sg.guardian.fullName,
      relation: sg.guardian.relation,
      phone: sg.guardian.phone,
      email: sg.guardian.email,
      isPrimary: sg.isPrimary,
      hasPortalAccess: !!sg.guardian.user,
      portalUser: sg.guardian.user,
    })),
    recentActivity: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      userName: log.userName || "System Administrator",
      details: log.details,
      createdAt: log.createdAt,
    })),
  };
}

/**
 * Provisions student portal access safely and idempotently.
 * Creates or updates authentication credentials without creating duplicate users.
 */
export async function provisionStudentPortalAccess(
  studentId: string,
  adminUser: SessionUser,
  options?: {
    password?: string;
    customLoginId?: string;
    status?: "SETUP_PENDING" | "ACTIVE";
  }
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to provision portal access.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
      include: {
        user: true,
        institution: true,
      },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    // Ensure login ID exists
    let loginId = student.loginId;
    if (!loginId) {
      if (options?.customLoginId && options.customLoginId.trim()) {
        const custom = options.customLoginId.trim().toUpperCase();
        const existing = await tx.student.findUnique({ where: { loginId: custom } });
        if (existing && existing.id !== student.id) {
          throw new Error(`Login ID '${custom}' is already assigned to another student.`);
        }
        loginId = custom;
      } else {
        loginId = await generateStudentLoginId(tx);
      }
    }

    const initialPassword = options?.password?.trim() || `${loginId}@2026`;
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const targetStatus = options?.status || "ACTIVE";

    let userAccount = student.user;

    if (userAccount) {
      // Idempotently update existing user
      userAccount = await tx.user.update({
        where: { id: userAccount.id },
        data: {
          roleCode: "STUDENT",
          isActive: true,
          passwordHash,
        },
      });
    } else {
      // Determine unique email
      let emailToUse = student.email?.trim().toLowerCase();

      // If student has no email or it is already in use by another User
      if (emailToUse) {
        const existingUser = await tx.user.findUnique({
          where: { email: emailToUse },
        });
        if (existingUser) {
          emailToUse = undefined; // Fall back to synthetic institutional email
        }
      }

      if (!emailToUse) {
        const instCode = (student.institution.code || "NX").toLowerCase().replace(/[^a-z0-9]/g, "");
        emailToUse = `${loginId.toLowerCase()}@${instCode}.nexora.internal`;
      }

      userAccount = await tx.user.create({
        data: {
          institutionId: adminUser.institutionId,
          email: emailToUse,
          fullName: student.fullName,
          passwordHash,
          roleCode: "STUDENT",
          phone: student.phone || null,
          isActive: true,
        },
      });
    }

    // Update student with loginId and portalAccessStatus
    const updatedStudent = await tx.student.update({
      where: { id: student.id },
      data: {
        loginId,
        userId: userAccount.id,
        portalAccessStatus: targetStatus,
        portalAccessGrantedAt: student.portalAccessGrantedAt || new Date(),
        portalAccessSuspendedAt: null,
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "PORTAL_ACCESS_GRANTED",
        entity: "Student",
        entityId: student.id,
        details: `Provisioned student portal access for '${student.fullName}' with Login ID '${loginId}' (Status: ${targetStatus}).`,
      },
    });

    return {
      success: true,
      student: updatedStudent,
      user: {
        id: userAccount.id,
        email: userAccount.email,
        roleCode: userAccount.roleCode,
        isActive: userAccount.isActive,
      },
      loginId,
      initialPassword,
      status: targetStatus,
    };
  });
}

/**
 * Suspends student portal access.
 * Prevents sign-in while fully preserving academic, financial, and attendance history.
 */
export async function suspendStudentPortalAccess(
  studentId: string,
  adminUser: SessionUser,
  reason?: string
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to suspend portal access.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    if (student.userId) {
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      });
    }

    const updated = await tx.student.update({
      where: { id: student.id },
      data: {
        portalAccessStatus: "SUSPENDED",
        portalAccessSuspendedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "PORTAL_ACCESS_SUSPENDED",
        entity: "Student",
        entityId: student.id,
        details: `Suspended portal access for student '${student.fullName}' (${student.loginId || student.admissionNumber}). Reason: ${reason || "Administrative suspension"}`,
      },
    });

    return updated;
  });
}

/**
 * Restores suspended or revoked portal access for a student.
 */
export async function restoreStudentPortalAccess(
  studentId: string,
  adminUser: SessionUser
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to restore portal access.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    if (!student.loginId || !student.userId) {
      throw new Error("Cannot restore access: Student does not have a provisioned portal account. Please enable access instead.");
    }

    await tx.user.update({
      where: { id: student.userId },
      data: { isActive: true },
    });

    const updated = await tx.student.update({
      where: { id: student.id },
      data: {
        portalAccessStatus: "ACTIVE",
        portalAccessSuspendedAt: null,
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "PORTAL_ACCESS_RESTORED",
        entity: "Student",
        entityId: student.id,
        details: `Restored active portal access for student '${student.fullName}' (${student.loginId}).`,
      },
    });

    return updated;
  });
}

/**
 * Revokes portal access for a student.
 * Disables the user login while retaining student and all academic records.
 */
export async function revokeStudentPortalAccess(
  studentId: string,
  adminUser: SessionUser,
  reason?: string
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to revoke portal access.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    if (student.userId) {
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      });
    }

    const updated = await tx.student.update({
      where: { id: student.id },
      data: {
        portalAccessStatus: "REVOKED",
        portalAccessSuspendedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "PORTAL_ACCESS_REVOKED",
        entity: "Student",
        entityId: student.id,
        details: `Revoked portal access for student '${student.fullName}' (${student.loginId || student.admissionNumber}). Reason: ${reason || "Access revoked by administrator"}`,
      },
    });

    return updated;
  });
}

/**
 * Resets student portal password securely.
 */
export async function resetStudentPassword(
  studentId: string,
  adminUser: SessionUser,
  newPassword: string
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to reset student passwords.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters in length.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
      include: { user: true },
    });

    if (!student || !student.user) {
      throw new Error("Student account not found or has no active portal login.");
    }

    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    await tx.user.update({
      where: { id: student.user.id },
      data: {
        passwordHash,
        isActive: student.portalAccessStatus === "ACTIVE" || student.portalAccessStatus === "SETUP_PENDING",
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "PORTAL_PASSWORD_RESET",
        entity: "Student",
        entityId: student.id,
        details: `Reset portal password for student '${student.fullName}' (${student.loginId}).`,
      },
    });

    return { success: true, message: "Password updated successfully." };
  });
}

/**
 * Links a verified parent/guardian to a student.
 * Supports linking an existing guardian or registering a verified new guardian.
 */
export async function linkStudentGuardian(
  studentId: string,
  guardianData: {
    guardianId?: string;
    fullName?: string;
    relation?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
    grantParentPortal?: boolean;
    parentPassword?: string;
  },
  adminUser: SessionUser
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to manage guardian links.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    let targetGuardianId = guardianData.guardianId;

    if (targetGuardianId) {
      const existing = await tx.guardian.findFirst({
        where: { id: targetGuardianId, institutionId: adminUser.institutionId },
      });
      if (!existing) {
        throw new Error("Selected guardian does not belong to your institution.");
      }
    } else {
      // Validate inputs for new guardian
      if (!guardianData.fullName?.trim() || !guardianData.phone?.trim()) {
        throw new Error("Guardian full name and phone number are required.");
      }

      // Check if a guardian with matching phone or email already exists in this institution
      const cleanPhone = guardianData.phone.trim();
      const cleanEmail = guardianData.email?.trim().toLowerCase();

      let guardian = await tx.guardian.findFirst({
        where: {
          institutionId: adminUser.institutionId,
          OR: [
            { phone: cleanPhone },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
      });

      if (!guardian) {
        guardian = await tx.guardian.create({
          data: {
            institutionId: adminUser.institutionId,
            fullName: guardianData.fullName.trim(),
            relation: guardianData.relation || "PARENT",
            phone: cleanPhone,
            email: cleanEmail || null,
          },
        });
      }

      targetGuardianId = guardian.id;

      // Optionally grant parent portal access
      if (guardianData.grantParentPortal && !guardian.userId && guardian.email) {
        const psw = guardianData.parentPassword?.trim() || "Parent@2026";
        const passwordHash = await bcrypt.hash(psw, 10);
        const parentUser = await tx.user.create({
          data: {
            institutionId: adminUser.institutionId,
            email: guardian.email.trim().toLowerCase(),
            fullName: guardian.fullName,
            passwordHash,
            roleCode: "PARENT",
            phone: guardian.phone,
            isActive: true,
          },
        });

        await tx.guardian.update({
          where: { id: guardian.id },
          data: { userId: parentUser.id },
        });
      }
    }

    // Upsert link
    await tx.studentGuardian.upsert({
      where: {
        studentId_guardianId: {
          studentId: student.id,
          guardianId: targetGuardianId,
        },
      },
      update: {
        isPrimary: guardianData.isPrimary ?? false,
      },
      create: {
        studentId: student.id,
        guardianId: targetGuardianId,
        isPrimary: guardianData.isPrimary ?? false,
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "GUARDIAN_LINKED",
        entity: "Student",
        entityId: student.id,
        details: `Linked guardian (${targetGuardianId}) to student '${student.fullName}'.`,
      },
    });

    return { success: true, guardianId: targetGuardianId };
  });
}

/**
 * Unlinks a guardian from a student.
 */
export async function unlinkStudentGuardian(
  studentId: string,
  guardianId: string,
  adminUser: SessionUser
) {
  if (!canManageStudentPortal(adminUser)) {
    throw new Error("Forbidden: You do not have permission to manage guardian links.");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId: adminUser.institutionId },
    });

    if (!student) {
      throw new Error("Student not found in your institution.");
    }

    const existingLink = await tx.studentGuardian.findUnique({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId,
        },
      },
    });

    if (!existingLink) {
      throw new Error("This guardian is not linked to this student.");
    }

    await tx.studentGuardian.delete({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        institutionId: adminUser.institutionId,
        userId: adminUser.id,
        userName: adminUser.fullName,
        userEmail: adminUser.email,
        action: "GUARDIAN_UNLINKED",
        entity: "Student",
        entityId: student.id,
        details: `Unlinked guardian (${guardianId}) from student '${student.fullName}'.`,
      },
    });

    return { success: true };
  });
}

/**
 * Retrieves all children linked to a verified parent user.
 * Strictly verifies institutional tenant boundary and guardian relationship.
 */
export async function getParentLinkedChildren(
  parentUserId: string,
  institutionId: string
) {
  const guardian = await prisma.guardian.findFirst({
    where: {
      userId: parentUserId,
      institutionId,
    },
    include: {
      students: {
        include: {
          student: {
            include: {
              currentClass: true,
              currentSection: {
                include: { classTeacher: true },
              },
              academicYear: true,
              attendance: {
                orderBy: { date: "desc" },
                take: 60,
              },
              fees: {
                include: {
                  feeStructure: {
                    include: { feeCategory: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!guardian) {
    return [];
  }

  return guardian.students.map((sg) => {
    const child = sg.student;
    const totalDays = child.attendance.length;
    const presentCount = child.attendance.filter((a) => a.status === "PRESENT").length;
    const absentCount = child.attendance.filter((a) => a.status === "ABSENT").length;
    const attendancePct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

    const totalFees = child.fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const paidFees = child.fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const pendingFees = child.fees.reduce((sum, f) => sum + f.pendingAmount, 0);

    return {
      id: child.id,
      fullName: child.fullName,
      admissionNumber: child.admissionNumber,
      rollNumber: child.rollNumber || "—",
      loginId: child.loginId || null,
      portalAccessStatus: child.portalAccessStatus || "NOT_ENABLED",
      className: child.currentClass?.name || "Class",
      sectionName: child.currentSection?.name || "A",
      classTeacherName: child.currentSection?.classTeacher?.fullName || "Class Teacher",
      classTeacherPhone: child.currentSection?.classTeacher?.phone || null,
      academicYearName: child.academicYear?.name || "Current Year",
      isPrimaryGuardian: sg.isPrimary,
      attendance: {
        percentage: attendancePct,
        totalDays,
        presentCount,
        absentCount,
      },
      fees: {
        total: totalFees,
        paid: paidFees,
        pending: pendingFees,
        status: pendingFees === 0 ? "PAID" : "PENDING",
      },
    };
  });
}
