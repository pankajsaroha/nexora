import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createExamSchedule, getInstitutionExams } from "@/lib/exams/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createExamSchema = z.object({
  name: z.string().min(2, "Assessment name is required"),
  examType: z.string().min(1, "Assessment type is required"),
  academicYearId: z.string().optional(),
  termId: z.string().optional(),
  classId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  papers: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        classId: z.string().optional(),
        examDate: z.string().optional().nullable(),
        startTime: z.string().optional().nullable(),
        endTime: z.string().optional().nullable(),
        maxMarks: z.number().optional(),
        passMarks: z.number().optional(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getInstitutionExams(user.institutionId, user);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/exams error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch examinations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canCreate = [
      "SUPER_ADMIN",
      "ADMIN",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "HOD",
      "TEACHER",
    ].includes(user.roleCode || "");

    if (!canCreate) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to schedule examinations." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createExamSchema.parse(body);

    const created = await createExamSchedule({
      institutionId: user.institutionId,
      createdById: user.id,
      name: parsed.name,
      examType: parsed.examType,
      academicYearId: parsed.academicYearId,
      termId: parsed.termId,
      classId: parsed.classId,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      papers: parsed.papers?.map((p) => ({
        subjectId: p.subjectId,
        classId: p.classId,
        examDate: p.examDate || null,
        startTime: p.startTime || undefined,
        endTime: p.endTime || undefined,
        maxMarks: p.maxMarks,
        passMarks: p.passMarks,
      })),
      user,
    });

    return NextResponse.json({
      success: true,
      message: "Examination scheduled successfully.",
      exam: created,
    });
  } catch (error: any) {
    console.error("POST /api/exams error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to schedule examination" },
      { status: 400 }
    );
  }
}
