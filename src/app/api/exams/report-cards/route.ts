import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getScopedReportCard } from "@/lib/exams/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "examId and studentId query parameters are required." },
        { status: 400 }
      );
    }

    const reportCard = await getScopedReportCard({
      examId,
      studentId,
      institutionId: user.institutionId,
    });

    return NextResponse.json(reportCard);
  } catch (error: any) {
    console.error("GET /api/exams/report-cards error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate report card" },
      { status: 400 }
    );
  }
}
