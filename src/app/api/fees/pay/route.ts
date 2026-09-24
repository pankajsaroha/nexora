import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { NotificationService } from "@/lib/notifications/service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.FEES_COLLECT)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to collect fee payments" },
        { status: 403 }
      );
    }

    const { studentFeeId, studentId, amount, paymentMethod, notes, transactionRef } =
      await req.json();

    const payAmount = Number(amount);
    if (!studentFeeId || !studentId || isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json(
        { error: "Valid Student Fee ID and positive payment amount are required" },
        { status: 400 }
      );
    }

    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: {
        student: {
          include: {
            guardians: {
              include: { guardian: true },
            },
          },
        },
      },
    });

    if (!studentFee) {
      return NextResponse.json(
        { error: "Student Fee record not found" },
        { status: 404 }
      );
    }

    if (payAmount > studentFee.pendingAmount) {
      return NextResponse.json(
        {
          error: `Payment amount (${formatCurrency(payAmount)}) exceeds total pending balance (${formatCurrency(studentFee.pendingAmount)})`,
        },
        { status: 400 }
      );
    }

    const newPaidAmount = studentFee.paidAmount + payAmount;
    const newPendingAmount = studentFee.totalAmount - studentFee.discountAmount - newPaidAmount;
    const newStatus = newPendingAmount <= 0 ? "PAID" : "PARTIAL";

    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const [payment] = await prisma.$transaction([
      prisma.feePayment.create({
        data: {
          studentFeeId,
          studentId,
          receiptNumber,
          amount: payAmount,
          paymentDate: new Date(),
          paymentMethod: paymentMethod || "ONLINE",
          transactionRef: transactionRef || `TXN_${Date.now()}`,
          notes: notes || "Fee installment received",
          collectedByUserId: user.id,
        },
      }),
      prisma.studentFee.update({
        where: { id: studentFeeId },
        data: {
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          status: newStatus,
        },
      }),
    ]);

    await logAuditEvent({
      institutionId: user.institutionId,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      action: "FEE_PAYMENT_COLLECTED",
      entity: "FeePayment",
      entityId: payment.id,
      details: {
        receiptNumber,
        amount: payAmount,
        studentName: studentFee.student.fullName,
        remainingBalance: newPendingAmount,
      },
    });

    // Dispatch WhatsApp Receipt confirmation to parent
    const primaryGuardian = studentFee.student.guardians?.[0]?.guardian;
    if (primaryGuardian?.phone) {
      await NotificationService.dispatch({
        whatsapp: {
          institutionId: user.institutionId,
          recipients: [
            {
              phone: primaryGuardian.phone,
              name: primaryGuardian.fullName,
            },
          ],
          templateName: "fee_payment_receipt",
          messageContent: `Payment of ${formatCurrency(payAmount)} received for ${studentFee.student.fullName}. Receipt #${receiptNumber}. Remaining balance: ${formatCurrency(newPendingAmount)}. Thank you!`,
          relatedEntity: "FeePayment",
          relatedEntityId: payment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${formatCurrency(payAmount)} payment recorded for ${studentFee.student.fullName}. Receipt #${receiptNumber}`,
      payment,
      receiptNumber,
      remainingBalance: newPendingAmount,
    });
  } catch (error: any) {
    console.error("Fee payment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record fee payment" },
      { status: 500 }
    );
  }
}
