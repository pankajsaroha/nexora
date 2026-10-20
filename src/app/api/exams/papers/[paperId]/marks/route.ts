import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaperMarksRoster, savePaperMarks } from "@/lib/exams/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const saveMarksSchema = z.object({
  sectionId: z.string().optional(),
  finalize: z.boolean().optional(),
  marks: z.array(
    z.object({
      studentId: z.string().min(1),
      marksObtained: z.number().nullable().optional(),
      isAbsent: z.boolean().optional(),
      remarks: z.string().optional(),
    })
  ),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId") || undefined;

    const data = await getPaperMarksRoster({
      examSubjectId: params.paperId,
      sectionId,
      institutionId: user.institutionId,
      user,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/exams/papers/[paperId]/marks error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch student marks roster" },
      { status: 400 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveMarksSchema.parse(body);

    const result = await savePaperMarks({
      examSubjectId: params.paperId,
      marks: parsed.marks,
      finalize: parsed.finalize,
      user,
      institutionId: user.institutionId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/exams/papers/[paperId]/marks error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save marks" },
      { status: 400 }
    );
  }
}
