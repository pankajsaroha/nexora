import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ExamDetailClient } from "@/components/exams/exam-detail-client";
import { getExamDetail } from "@/lib/exams/service";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch only examination details — fast, lean, and strictly scoped
  const exam = await getExamDetail(params.id, user.institutionId);
  if (!exam) {
    notFound();
  }

  return (
    <ExamDetailClient
      exam={exam as any}
      currentUser={{
        id: user.id,
        fullName: user.fullName,
        roleCode: user.roleCode || "TEACHER",
        teacherId: user.teacherId || undefined,
      }}
    />
  );
}
