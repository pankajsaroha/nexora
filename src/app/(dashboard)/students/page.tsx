import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { StudentListClient } from "@/components/students/student-list-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; classId?: string; status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let whereClause: any = {
    institutionId: user.institutionId,
  };

  if (user.roleCode === "PARENT" && user.guardianId) {
    whereClause = {
      institutionId: user.institutionId,
      guardians: {
        some: { guardianId: user.guardianId },
      },
    };
  } else if (user.roleCode === "STUDENT" && user.studentId) {
    whereClause = {
      institutionId: user.institutionId,
      id: user.studentId,
    };
  }

  if (searchParams?.classId && searchParams.classId !== "ALL") {
    whereClause.currentClassId = searchParams.classId;
  }

  if (searchParams?.search) {
    whereClause.OR = [
      { fullName: { contains: searchParams.search, mode: "insensitive" } },
      { admissionNumber: { contains: searchParams.search, mode: "insensitive" } },
      { rollNumber: { contains: searchParams.search, mode: "insensitive" } },
      { email: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [students, classes, academicYears, customFields] = await Promise.all([
    prisma.student.findMany({
      where: whereClause,
      include: {
        currentClass: {
          include: { department: true },
        },
        currentSection: {
          include: { classTeacher: true },
        },
        academicYear: true,
        guardians: {
          include: { guardian: true },
        },
        fees: {
          include: {
            feeStructure: {
              include: { feeCategory: true },
            },
          },
        },
        customFieldValues: {
          include: { customField: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: {
        sections: true,
        department: true,
        feeStructures: {
          include: { feeCategory: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { startDate: "desc" },
    }),
    prisma.studentCustomField.findMany({
      where: { institutionId: user.institutionId, isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  const canCreate = hasPermission(user, PERMISSIONS.STUDENTS_CREATE);

  const formattedStudents = students.map((st) => {
    const primaryLink = st.guardians.find((g) => g.isPrimary) || st.guardians[0];
    const totalFee = st.fees.reduce((acc, f) => acc + f.totalAmount, 0);
    const paidFee = st.fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const pendingFee = st.fees.reduce((acc, f) => acc + f.pendingAmount, 0);

    return {
      id: st.id,
      admissionNumber: st.admissionNumber,
      rollNumber: st.rollNumber,
      universityRegNumber: st.universityRegNumber,
      firstName: st.firstName,
      middleName: st.middleName,
      lastName: st.lastName,
      fullName: st.fullName,
      email: st.email,
      phone: st.phone,
      gender: st.gender,
      dateOfBirth: st.dateOfBirth,
      bloodGroup: st.bloodGroup,
      nationality: st.nationality,
      category: st.category,
      aadhaarNumber: st.aadhaarNumber,
      address: st.address,
      city: st.city,
      state: st.state,
      pincode: st.pincode,
      country: st.country,
      admissionDate: st.admissionDate,
      admissionType: st.admissionType,
      className: st.currentClass.name,
      classCode: st.currentClass.code,
      classLevel: st.currentClass.level,
      departmentName: st.currentClass.department?.name,
      sectionName: st.currentSection.name,
      classTeacherName: st.currentSection.classTeacher?.fullName,
      academicYearName: st.academicYear.name,
      guardianName: primaryLink?.guardian?.fullName,
      guardianPhone: primaryLink?.guardian?.phone,
      guardianRelation: primaryLink?.guardian?.relation,
      guardianEmail: primaryLink?.guardian?.email,
      guardianOccupation: primaryLink?.guardian?.occupation,
      status: st.status,
      deactivatedAt: st.deactivatedAt,
      deactivationReason: st.deactivationReason,
      feesTotal: totalFee,
      feesPaid: paidFee,
      feesPending: pendingFee,
      feeBreakdown: st.fees.map((f) => ({
        id: f.id,
        category: f.feeStructure.feeCategory.name,
        amount: f.totalAmount,
        paid: f.paidAmount,
        pending: f.pendingAmount,
        status: f.status,
      })),
      customFieldValues: st.customFieldValues.map((cfv) => ({
        id: cfv.id,
        value: cfv.value,
        customField: {
          id: cfv.customField.id,
          name: cfv.customField.name,
          key: cfv.customField.key,
          fieldType: cfv.customField.fieldType,
        },
      })),
    };
  });

  const formattedPrograms = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    level: c.level,
    durationYears: c.durationYears,
    department: c.department ? { id: c.department.id, name: c.department.name, code: c.department.code } : null,
    sections: c.sections.map((s) => ({ id: s.id, name: s.name, capacity: s.capacity })),
    feeStructures: c.feeStructures.map((fs) => ({
      id: fs.id,
      amount: fs.amount,
      frequency: fs.frequency,
      dueDate: fs.dueDate,
      feeCategory: { id: fs.feeCategory.id, name: fs.feeCategory.name },
    })),
  }));

  const formattedAcademicYears = academicYears.map((ay) => ({
    id: ay.id,
    name: ay.name,
    isCurrent: ay.isCurrent,
  }));

  const formattedCustomFields = customFields.map((f) => ({
    id: f.id,
    name: f.name,
    key: f.key,
    fieldType: f.fieldType,
    options: f.options ? JSON.parse(f.options) : [],
    placeholder: f.placeholder,
    helpText: f.helpText,
    isRequired: f.isRequired,
    isVisibleToAdmin: f.isVisibleToAdmin,
    isVisibleToTeacher: f.isVisibleToTeacher,
    isVisibleToParent: f.isVisibleToParent,
    isVisibleToStudent: f.isVisibleToStudent,
  }));

  return (
    <StudentListClient
      students={formattedStudents}
      programs={formattedPrograms}
      academicYears={formattedAcademicYears}
      customFields={formattedCustomFields}
      canCreate={canCreate}
    />
  );
}
