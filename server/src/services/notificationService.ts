import { prisma } from '../prisma';

export interface CreateNotificationParams {
  recipientId: string;
  title: string;
  message: string;
  type: 'MISSED_MEDICINE' | 'CHECK_IN' | 'HELP_REQUEST' | 'EMERGENCY' | 'APPOINTMENT' | 'SYSTEM' | 'FAMILY_TASK';
  entityId?: string;
}

export class NotificationService {
  /**
   * Dispatch a notification to a specific user
   */
  static async notifyUser(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          recipientId: params.recipientId,
          title: params.title,
          message: params.message,
          type: params.type,
          entityId: params.entityId,
          isRead: false,
        },
      });
      console.log(`[Notification Dispatched] To ${params.recipientId}: "${params.title}"`);
      return notification;
    } catch (err) {
      console.error('[Notification Failed]:', err);
      return null;
    }
  }

  /**
   * Notify all approved caregivers of a senior
   */
  static async notifyCaregiversOfSenior(
    seniorProfileId: string,
    params: Omit<CreateNotificationParams, 'recipientId'>
  ) {
    try {
      const connections = await prisma.caregiverConnection.findMany({
        where: {
          seniorId: seniorProfileId,
          status: 'APPROVED',
        },
        include: {
          caregiver: {
            include: {
              user: true,
            },
          },
        },
      });

      const results = [];
      for (const conn of connections) {
        const notif = await this.notifyUser({
          recipientId: conn.caregiver.user.id,
          title: params.title,
          message: params.message,
          type: params.type,
          entityId: params.entityId,
        });
        results.push(notif);
      }
      return results;
    } catch (err) {
      console.error('[Caregiver Notification Failed]:', err);
      return [];
    }
  }
}
