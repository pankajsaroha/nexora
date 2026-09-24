import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.STUDENTS_IMPORT)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to import institution data" },
        { status: 403 }
      );
    }

    const { entityType, rows } = await req.json();

    if (!entityType || !rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Entity type and non-empty rows array are required" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let importedCount = 0;

    if (entityType === "STUDENTS") {
      // Find academic year & default section
      const academicYear = await prisma.academicYear.findFirst({
        where: { institutionId: user.institutionId, isCurrent: true },
      });
      const sections = await prisma.section.findMany({
        include: { class: true },
      });

      if (!academicYear) {
        return NextResponse.json(
          { error: "No active academic year found for institution" },
          { status: 400 }
        );
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 1;

        if (!row.firstName || !row.lastName) {
          errors.push(`Row ${rowNum}: First name and Last name are required.`);
          continue;
        }

        const className = (row.class || "").trim().toLowerCase();
        const sectionName = (row.section || "A").trim().toUpperCase();

        const matchedSection = sections.find(
          (s) =>
            s.class.name.toLowerCase().includes(className) &&
            s.name.toUpperCase() === sectionName
        ) || sections[0];

        if (!matchedSection) {
          errors.push(`Row ${rowNum}: Class '${row.class}' Section '${row.section}' not found.`);
          continue;
        }

        const admNumber =
          row.admissionNumber ||
          `ADM-IMP-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

        try {
          await prisma.student.create({
            data: {
              institutionId: user.institutionId,
              admissionNumber: admNumber,
              rollNumber: row.rollNumber || String(importedCount + 1).padStart(2, "0"),
              firstName: row.firstName,
              lastName: row.lastName,
              fullName: `${row.firstName} ${row.lastName}`,
              email: row.email || null,
              phone: row.phone || null,
              gender: (row.gender || "MALE").toUpperCase(),
              dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : new Date(2012, 0, 1),
              currentClassId: matchedSection.classId,
              currentSectionId: matchedSection.id,
              academicYearId: academicYear.id,
              status: "ACTIVE",
              emergencyContactName: row.parentName || null,
              emergencyContactPhone: row.parentPhone || null,
            },
          });
          importedCount++;
        } catch (dbErr: any) {
          errors.push(`Row ${rowNum}: Database error (${dbErr?.message || "duplicate admission number"}).`);
        }
      }
    } else if (entityType === "TEACHERS") {
      const depts = await prisma.department.findMany({
        where: { institutionId: user.institutionId },
      });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 1;

        if (!row.firstName || !row.lastName || !row.email) {
          errors.push(`Row ${rowNum}: First name, Last name, and Email are required.`);
          continue;
        }

        const empId =
          row.employeeId ||
          `EMP-IMP-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

        const dept = depts.find(
          (d) =>
            d.name.toLowerCase().includes((row.department || "").toLowerCase()) ||
            d.code.toLowerCase() === (row.department || "").toLowerCase()
        ) || depts[0];

        try {
          await prisma.teacher.create({
            data: {
              institutionId: user.institutionId,
              employeeId: empId,
              firstName: row.firstName,
              lastName: row.lastName,
              fullName: `${row.firstName} ${row.lastName}`,
              email: row.email,
              phone: row.phone || "+91 98000 00000",
              designation: row.designation || "Faculty Member",
              departmentId: dept?.id || null,
              basicSalary: Number(row.salary) || 50000,
            },
          });
          importedCount++;
        } catch (dbErr: any) {
          errors.push(`Row ${rowNum}: Database error (${dbErr?.message || "duplicate email or employee ID"}).`);
        }
      }
    }

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "DATA_IMPORT",
      entity: entityType,
      details: {
        importedCount,
        errorsCount: errors.length,
        errorsPreview: errors.slice(0, 3),
      },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      totalRows: rows.length,
      errors,
      message:
        errors.length === 0
          ? `Successfully imported ${importedCount} records.`
          : `Imported ${importedCount} of ${rows.length} rows. ${errors.length} rows had validation errors.`,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process data import" },
      { status: 500 }
    );
  }
}
