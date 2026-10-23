import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamsClient } from "@/components/exams/exams-client";
import { StudentResultsView, StudentPublishedExam } from "@/components/exams/student-results-view";
import { getInstitutionExams } from "@/lib/exams/service";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams?: { childId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. STUDENT WORKSPACE EXAMS & PUBLISHED MARKS
  if (user.roleCode === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }, { id: user.studentId }],
        institutionId: user.institutionId,
      },
      include: {
        currentClass: true,
        currentSection: true,
      },
    });

    if (!student) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Student record not found.
        </div>
      );
    }

    // Strictly fetch only PUBLISHED examinations for the student's class
    const publishedExams = await prisma.exam.findMany({
      where: {
        institutionId: user.institutionId,
        status: "PUBLISHED",
        examSubjects: {
          some: { classId: student.currentClassId },
        },
      },
      include: {
        academicYear: true,
        term: true,
        examSubjects: {
          where: { classId: student.currentClassId },
          include: {
            subject: true,
            marks: {
              where: { studentId: student.id },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const formattedExams: StudentPublishedExam[] = publishedExams.map((e) => ({
      id: e.id,
      name: e.name,
      examType: e.examType,
      academicYearName: e.academicYear.name,
      termName: e.term?.name,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      subjects: e.examSubjects.map((es) => {
        const studentMark = es.marks[0];
        return {
          id: es.id,
          subjectName: es.subject.name,
          subjectCode: es.subject.code,
          examDate: es.examDate,
          maxMarks: es.maxMarks,
          passMarks: es.passMarks,
          marksObtained: studentMark ? studentMark.marksObtained : null,
          grade: studentMark?.grade || null,
          isAbsent: studentMark?.isAbsent || false,
          remarks: studentMark?.remarks,
        };
      }),
    }));

    return (
      <StudentResultsView
        studentName={student.fullName}
        className={student.currentClass.name}
        sectionName={student.currentSection.name}
        rollNumber={student.rollNumber}
        admissionNumber={student.admissionNumber}
        exams={formattedExams}
      />
    );
  }

  // 2. PARENT WORKSPACE EXAMS & PUBLISHED MARKS (Multi-child verified access)
  if (user.roleCode === "PARENT") {
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
        institutionId: user.institutionId,
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                currentClass: true,
                currentSection: true,
              },
            },
          },
        },
      },
    });

    const linkedStudents = guardian?.students?.map((sg) => sg.student) || [];

    if (linkedStudents.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          No linked children found for this verified parent account.
        </div>
      );
    }

    const targetChild =
      (searchParams?.childId
        ? linkedStudents.find((s) => s.id === searchParams.childId)
        : null) || linkedStudents[0];

    // Strictly fetch published exams for the child's class and child's own marks only
    const publishedExams = await prisma.exam.findMany({
      where: {
        institutionId: user.institutionId,
        status: "PUBLISHED",
        examSubjects: {
          some: { classId: targetChild.currentClassId },
        },
      },
      include: {
        academicYear: true,
        term: true,
        examSubjects: {
          where: { classId: targetChild.currentClassId },
          include: {
            subject: true,
            marks: {
              where: { studentId: targetChild.id },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const formattedExams: StudentPublishedExam[] = publishedExams.map((e) => ({
      id: e.id,
      name: e.name,
      examType: e.examType,
      academicYearName: e.academicYear.name,
      termName: e.term?.name,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      subjects: e.examSubjects.map((es) => {
        const mark = es.marks[0];
        return {
          id: es.id,
          subjectName: es.subject.name,
          subjectCode: es.subject.code,
          examDate: es.examDate,
          maxMarks: es.maxMarks,
          passMarks: es.passMarks,
          marksObtained: mark ? mark.marksObtained : null,
          grade: mark?.grade || null,
          isAbsent: mark?.isAbsent || false,
          remarks: mark?.remarks,
        };
      }),
    }));

    const childrenList = linkedStudents.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      className: s.currentClass.name,
    }));

    return (
      <StudentResultsView
        studentName={targetChild.fullName}
        className={targetChild.currentClass.name}
        sectionName={targetChild.currentSection.name}
        rollNumber={targetChild.rollNumber}
        admissionNumber={targetChild.admissionNumber}
        exams={formattedExams}
        isParentView
        childrenList={childrenList}
        selectedChildId={targetChild.id}
      />
    );
  }

  // 3. FACULTY / ADMIN WORKSPACE (Full Examination Board)
  const [{ exams, stats }, classes, subjects, academicYears, students] = await Promise.all([
    getInstitutionExams(user.institutionId, user),
    prisma.class.findMany({
      where: { institutionId: user.institutionId },
      include: {
        sections: {
          include: { classTeacher: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.subject.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { institutionId: user.institutionId },
      include: { terms: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.student.findMany({
      where: { institutionId: user.institutionId, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        admissionNumber: true,
        rollNumber: true,
        currentClassId: true,
        currentSectionId: true,
      },
      orderBy: [{ rollNumber: "asc" }, { fullName: "asc" }],
      take: 100,
    }),
  ]);

  const formattedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    sections: c.sections.map((s) => ({
      id: s.id,
      name: s.name,
      classTeacherName: s.classTeacher?.fullName || undefined,
    })),
  }));

  const formattedSubjects = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    type: s.type,
  }));

  const formattedAcademicYears = academicYears.map((ay) => ({
    id: ay.id,
    name: ay.name,
    isCurrent: ay.isCurrent,
    terms: ay.terms.map((t) => ({
      id: t.id,
      name: t.name,
      isCurrent: t.isCurrent,
    })),
  }));

  return (
    <ExamsClient
      exams={exams}
      stats={stats}
      classes={formattedClasses}
      subjects={formattedSubjects}
      academicYears={formattedAcademicYears}
      students={students}
      currentUser={{
        id: user.id,
        fullName: user.fullName,
        roleCode: user.roleCode || "TEACHER",
        teacherId: user.teacherId || undefined,
      }}
    />
  );
}
