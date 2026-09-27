import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassesClient } from "@/components/classes/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [classes, departments, academicYears, teachers] = await Promise.all([
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: {
        department: {
          include: {
            subjects: {
              include: {
                teacherAssignments: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        academicYear: true,
        sections: {
          include: {
            classTeacher: true,
            students: {
              select: {
                id: true,
                admissionNumber: true,
                rollNumber: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                gender: true,
                batch: true,
                semester: true,
                currentSectionId: true,
              },
              orderBy: { fullName: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
        students: {
          select: {
            id: true,
            admissionNumber: true,
            rollNumber: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
            gender: true,
            batch: true,
            semester: true,
            currentSectionId: true,
          },
          orderBy: { fullName: "asc" },
        },
        feeStructures: {
          include: {
            feeCategory: true,
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.department.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { startDate: "desc" },
    }),
    prisma.teacher.findMany({
      where: { institutionId: user.institutionId, employmentStatus: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        employeeId: true,
        designation: true,
      },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const formattedClasses = classes.map((c) => {
    const totalFee = c.feeStructures.reduce((acc, fs) => acc + fs.amount, 0);
    const sections = c.sections.map((s) => ({
      id: s.id,
      name: s.name,
      roomNumber: s.roomNumber,
      capacity: s.capacity,
      classTeacherId: s.classTeacherId,
      classTeacherName: s.classTeacher?.fullName,
      studentsCount: s.students.length,
      students: s.students.map((st) => ({
        id: st.id,
        admissionNumber: st.admissionNumber,
        rollNumber: st.rollNumber,
        fullName: st.fullName,
        email: st.email,
        phone: st.phone,
        status: st.status,
        gender: st.gender,
        batch: st.batch,
        semester: st.semester,
        sectionId: s.id,
        sectionName: s.name,
      })),
    }));

    const allStudents = c.students.map((st) => {
      const match = c.sections.find((s) => s.id === st.currentSectionId);
      return {
        id: st.id,
        admissionNumber: st.admissionNumber,
        rollNumber: st.rollNumber,
        fullName: st.fullName,
        email: st.email,
        phone: st.phone,
        status: st.status,
        gender: st.gender,
        batch: st.batch,
        semester: st.semester,
        sectionId: st.currentSectionId || undefined,
        sectionName: match?.name || undefined,
      };
    });

    const subjects = (c.department?.subjects || []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      type: sub.type,
      assignedTeacherName: sub.teacherAssignments[0]?.teacher?.fullName || null,
    }));

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      level: c.level,
      durationYears: c.durationYears,
      type: c.type,
      departmentName: c.department?.name,
      departmentId: c.departmentId,
      academicYearName: c.academicYear?.name,
      academicYearId: c.academicYearId || undefined,
      isActive: c.isActive,
      sections,
      subjects,
      allStudents,
      feeStructures: c.feeStructures.map((fs) => ({
        id: fs.id,
        categoryName: fs.feeCategory.name,
        amount: fs.amount,
        frequency: fs.frequency,
      })),
      totalFee,
    };
  });

  const formattedDepartments = departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));

  const formattedYears = academicYears.map((y) => ({
    id: y.id,
    name: y.name,
    isCurrent: y.isCurrent,
  }));

  return (
    <ClassesClient
      classes={formattedClasses}
      departments={formattedDepartments}
      academicYears={formattedYears}
      teachers={teachers}
    />
  );
}

