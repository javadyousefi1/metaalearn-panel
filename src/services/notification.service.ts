import { httpService } from './http.service';
import { CreateNotificationPayload } from '@/types/notification.types';

/**
 * Notification Service
 *
 * Handles all API calls related to user notifications
 */
export const notificationService = {
  /**
   * Create and send a new notification
   * @param data - Notification creation data
   * @returns Promise<void>
   */
  create: async (data: CreateNotificationPayload): Promise<void> => {
    await httpService.post('/UserNotification/Create', data);
  },
};
