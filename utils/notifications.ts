// utils/notifications.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createNotification(message: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        message,
        createdAt: new Date(),
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}