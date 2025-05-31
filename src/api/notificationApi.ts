import api from './config';
import { Notification, PaginatedResponse } from '@/types';

const NOTIFICATIONS_URL = '/notifications';

export const notificationApi = {
  // Get all notifications with pagination and filtering
  getAllNotifications: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    supplier?: string;
  }) => api.get<PaginatedResponse<Notification>>(NOTIFICATIONS_URL, { params }),

  // Get notification by ID
  getNotificationById: (id: string) => api.get<Notification>(`${NOTIFICATIONS_URL}/${id}`),
}; 