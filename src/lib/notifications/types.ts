export type NotificationType =
  | "ASSIGNMENT"
  | "ATTENDANCE"
  | "FEE"
  | "TASK"
  | "ANNOUNCEMENT"
  | "EXAM"
  | "LEAVE"
  | "PAYROLL"
  | "SYSTEM";

export type MessageStatus = "QUEUED" | "SENT" | "DELIVERED" | "FAILED";

export interface SendWhatsAppParams {
  institutionId: string;
  recipientPhone: string;
  recipientName: string;
  templateName: string;
  messageContent: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export interface WhatsAppProvider {
  sendMessage(params: SendWhatsAppParams): Promise<{
    success: boolean;
    messageId: string;
    status: MessageStatus;
    failureReason?: string;
  }>;
  sendBulk(messages: SendWhatsAppParams[]): Promise<{
    total: number;
    queued: number;
  }>;
}
