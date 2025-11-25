import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  constructor(private prisma: PrismaService) {}

  async registerToken(userId: string, pushToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }

  async sendPushNotification(userId: string, title: string, body: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) {
      throw new Error('User does not have a push token');
    }

    // Mock - En producción se usaría Expo Push Notifications API
    console.log(`Sending push notification to ${userId}:`, { title, body });

    // Crear notificación en la base de datos
    await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
      },
    });

    return {
      success: true,
      message: 'Push notification sent',
    };
  }

  async sendBulkNotifications(userIds: string[], title: string, body: string) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendPushNotification(userId, title, body))
    );

    return {
      total: userIds.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }
}
