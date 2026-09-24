import { prisma } from "../prisma";
import { whatsAppService } from "./whatsapp";
import { NotificationType } from "./types";

export interface CreateInAppNotificationParams {
  userId: string;
  institutionId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export interface DispatchNotificationOptions {
  inApp?: CreateInAppNotificationParams[];
  whatsapp?: {
    institutionId: string;
    recipients: Array<{
      phone: string;
      name: string;
    }>;
    templateName: string;
    messageContent: string;
    relatedEntity?: string;
    relatedEntityId?: string;
  };
}

export class NotificationService {
  /**
   * Dispatch in-app notifications and queued mock WhatsApp messages
   */
  static async dispatch(options: DispatchNotificationOptions) {
    const results: {
      inAppCount: number;
      whatsAppCount: number;
    } = { inAppCount: 0, whatsAppCount: 0 };

    // 1. In-App Notifications
    if (options.inApp && options.inApp.length > 0) {
      try {
        await prisma.notification.createMany({
          data: options.inApp.map((n) => ({
            userId: n.userId,
            institutionId: n.institutionId,
            title: n.title,
            message: n.message,
            type: n.type,
            linkUrl: n.linkUrl || null,
            relatedEntity: n.relatedEntity || null,
            relatedEntityId: n.relatedEntityId || null,
            isRead: false,
          })),
        });
        results.inAppCount = options.inApp.length;
      } catch (err) {
        console.error("Failed to create in-app notifications:", err);
      }
    }

    // 2. WhatsApp Notifications (Mocked / PingStack)
    if (options.whatsapp && options.whatsapp.recipients.length > 0) {
      try {
        const messages = options.whatsapp.recipients.map((r) => ({
          institutionId: options.whatsapp!.institutionId,
          recipientPhone: r.phone,
          recipientName: r.name,
          templateName: options.whatsapp!.templateName,
          messageContent: options.whatsapp!.messageContent,
          relatedEntity: options.whatsapp!.relatedEntity,
          relatedEntityId: options.whatsapp!.relatedEntityId,
        }));

        await whatsAppService.sendBulk(messages);
        results.whatsAppCount = messages.length;
      } catch (err) {
        console.error("Failed to send WhatsApp messages:", err);
      }
    }

    return results;
  }
}
