import React from "react";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { FeesClient } from "@/components/fees/fees-client";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let whereClause: any = {
    student: {
      institutionId: user.institutionId,
    },
  };

  if (user.roleCode === "PARENT" && user.guardianId) {
    whereClause.student.guardians = {
      some: { guardianId: user.guardianId },
    };
  } else if (user.roleCode === "STUDENT" && user.studentId) {
    whereClause.studentId = user.studentId;
  }

  const fees = await prisma.studentFee.findMany({
    where: whereClause,
    include: {
      student: {
        include: {
          currentClass: true,
          currentSection: true,
          guardians: { include: { guardian: true } },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
    orderBy: { dueDate: "asc" },
    take: 150,
  });

  const canCollect = hasPermission(user, PERMISSIONS.FEES_COLLECT);

  const formattedFees = fees.map((f) => ({
    id: f.id,
    studentId: f.student.id,
    studentName: f.student.fullName,
    admissionNumber: f.student.admissionNumber,
    className: f.student.currentClass.name,
    sectionName: f.student.currentSection.name,
    totalAmount: f.totalAmount,
    paidAmount: f.paidAmount,
    pendingAmount: f.pendingAmount,
    dueDate: f.dueDate,
    status: f.status as any,
    parentName: f.student.guardians[0]?.guardian?.fullName,
    parentPhone: f.student.guardians[0]?.guardian?.phone,
    payments: f.payments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      transactionRef: p.transactionRef,
    })),
  }));

  return <FeesClient fees={formattedFees} canCollect={canCollect} />;
}
