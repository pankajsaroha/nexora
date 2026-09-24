import { prisma } from "../prisma";
import { SendWhatsAppParams, WhatsAppProvider, MessageStatus } from "./types";

/**
 * MockWhatsAppProvider simulates WhatsApp message delivery (Queued -> Sent -> Delivered)
 * and writes to WhatsAppMessageLog in the database.
 * PingStack or Meta Cloud API integration will cleanly swap in here.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(params: SendWhatsAppParams) {
    const isSuccess = !params.recipientPhone.startsWith("9990000"); // simulate rare failure for test numbers
    const status: MessageStatus = isSuccess ? "DELIVERED" : "FAILED";
    const failureReason = isSuccess ? undefined : "Simulated network timeout or invalid recipient";
    const externalMessageId = `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await prisma.whatsAppMessageLog.create({
        data: {
          institutionId: params.institutionId,
          recipientPhone: params.recipientPhone,
          recipientName: params.recipientName,
          templateName: params.templateName,
          messageContent: params.messageContent,
          status: status,
          provider: "MOCK",
          externalMessageId,
          failureReason,
          relatedEntity: params.relatedEntity,
          relatedEntityId: params.relatedEntityId,
          sentAt: new Date(),
        },
      });

      return {
        success: isSuccess,
        messageId: externalMessageId,
        status,
        failureReason,
      };
    } catch (err: any) {
      console.error("Mock WhatsApp delivery error:", err);
      return {
        success: false,
        messageId: externalMessageId,
        status: "FAILED" as MessageStatus,
        failureReason: err?.message || "Unknown error",
      };
    }
  }

  async sendBulk(messages: SendWhatsAppParams[]) {
    let queued = 0;
    for (const msg of messages) {
      await this.sendMessage(msg);
      queued++;
    }
    return {
      total: messages.length,
      queued,
    };
  }
}

/**
 * PingStackWhatsAppProvider skeleton for production integration.
 */
export class PingStackWhatsAppProvider implements WhatsAppProvider {
  private apiKey: string;
  private phoneNumberId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PINGSTACK_API_KEY || "";
    this.phoneNumberId = process.env.PINGSTACK_PHONE_NUMBER_ID || "";
    this.baseUrl = process.env.PINGSTACK_BASE_URL || "https://api.pingstack.io/v1";
  }

  async sendMessage(params: SendWhatsAppParams) {
    if (!this.apiKey) {
      // Fallback to mock if API key not configured yet
      const fallback = new MockWhatsAppProvider();
      return fallback.sendMessage(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          phoneNumberId: this.phoneNumberId,
          to: params.recipientPhone,
          type: "template",
          template: {
            name: params.templateName,
            body: params.messageContent,
          },
        }),
      });

      const resData = await response.json();
      const messageId = resData.id || `ps_${Date.now()}`;

      await prisma.whatsAppMessageLog.create({
        data: {
          institutionId: params.institutionId,
          recipientPhone: params.recipientPhone,
          recipientName: params.recipientName,
          templateName: params.templateName,
          messageContent: params.messageContent,
          status: response.ok ? "SENT" : "FAILED",
          provider: "PINGSTACK",
          externalMessageId: messageId,
          failureReason: response.ok ? undefined : resData?.error?.message,
          relatedEntity: params.relatedEntity,
          relatedEntityId: params.relatedEntityId,
          sentAt: new Date(),
        },
      });

      return {
        success: response.ok,
        messageId,
        status: (response.ok ? "SENT" : "FAILED") as MessageStatus,
        failureReason: response.ok ? undefined : resData?.error?.message,
      };
    } catch (err: any) {
      return {
        success: false,
        messageId: "err",
        status: "FAILED" as MessageStatus,
        failureReason: err?.message,
      };
    }
  }

  async sendBulk(messages: SendWhatsAppParams[]) {
    let queued = 0;
    for (const msg of messages) {
      await this.sendMessage(msg);
      queued++;
    }
    return {
      total: messages.length,
      queued,
    };
  }
}

export const whatsAppService: WhatsAppProvider =
  process.env.WHATSAPP_PROVIDER === "pingstack"
    ? new PingStackWhatsAppProvider()
    : new MockWhatsAppProvider();
