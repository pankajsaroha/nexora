import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamsClient } from "@/components/exams/exams-client";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const exams = await prisma.exam.findMany({
    where: { institutionId: user.institutionId },
    include: {
      examSubjects: {
        include: { subject: true, class: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const formattedExams = exams.map((e) => ({
    id: e.id,
    name: e.name,
    examType: e.examType,
    startDate: e.startDate,
    endDate: e.endDate,
    status: e.status,
    subjects: e.examSubjects.map((s) => ({
      id: s.id,
      subjectName: s.subject.name,
      className: s.class.name,
      examDate: s.examDate,
      maxMarks: s.maxMarks,
      passMarks: s.passMarks,
    })),
  }));

  const sampleReportCard = {
    id: "sample-1",
    fullName: "Aarav Sharma",
    admissionNumber: "ADM-2026-0001",
    className: "Grade 8",
    sectionName: "A",
    rollNumber: "14",
    classTeacherName: "Mrs. Sunita Sharma",
    attendancePct: 94.2,
    marks: [
      { subjectName: "Mathematics", marksObtained: 94, maxMarks: 100, grade: "A+" },
      { subjectName: "Physics & Science", marksObtained: 89, maxMarks: 100, grade: "A" },
      { subjectName: "English Literature", marksObtained: 91, maxMarks: 100, grade: "A+" },
      { subjectName: "Social Science", marksObtained: 86, maxMarks: 100, grade: "A" },
      { subjectName: "Computer Science & AI", marksObtained: 98, maxMarks: 100, grade: "A+" },
    ],
  };

  return (
    <ExamsClient
      exams={
        formattedExams.length > 0
          ? formattedExams
          : [
              {
                id: "exam-1",
                name: "Term 1 Mid-Term Assessments 2026",
                examType: "MID_TERM",
                startDate: new Date("2026-09-15"),
                endDate: new Date("2026-09-24"),
                status: "COMPLETED",
                subjects: [
                  { id: "es-1", subjectName: "Mathematics", className: "Grade 8", examDate: new Date("2026-09-15"), maxMarks: 100, passMarks: 40 },
                  { id: "es-2", subjectName: "Physics & Chemistry", className: "Grade 8", examDate: new Date("2026-09-17"), maxMarks: 100, passMarks: 40 },
                  { id: "es-3", subjectName: "English Literature", className: "Grade 8", examDate: new Date("2026-09-19"), maxMarks: 100, passMarks: 40 },
                ],
              },
            ]
      }
      sampleReportCard={sampleReportCard}
    />
  );
}
