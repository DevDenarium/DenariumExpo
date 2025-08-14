import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationsResponse, UnreadCountResponse } from './notifications.types';

const API_BASE_URL = 'http://192.168.20.13:3000';

export class NotificationsService {
  private static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('@Auth:token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getUserNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, { headers });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, { headers });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, { headers });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static getNotificationIcon(type: string): string {
    switch (type) {
      case 'APPOINTMENT_REQUEST':
        return 'calendar-plus';
      case 'APPOINTMENT_REQUEST_ACCEPTED':
        return 'calendar-check';
      case 'APPOINTMENT_RESCHEDULED_BY_USER':
        return 'calendar-edit';
      case 'APPOINTMENT_RESCHEDULED_BY_ADMIN':
        return 'calendar-clock';
      case 'APPOINTMENT_RESCHEDULE_ACCEPTED':
        return 'calendar-check';
      case 'APPOINTMENT_RESCHEDULE_COUNTER_PROPOSAL':
        return 'calendar-arrow-right';
      case 'APPOINTMENT_RESCHEDULE_COUNTER_CONFIRMED':
        return 'calendar-check-outline';
      case 'APPOINTMENT_RESCHEDULE_COUNTER_REJECTED':
        return 'calendar-remove-outline';
      case 'APPOINTMENT_RESCHEDULE_REJECTED':
        return 'calendar-remove';
      case 'APPOINTMENT_CANCELLED':
        return 'calendar-remove';
      case 'APPOINTMENT_CANCELLED_BY_ADMIN':
        return 'calendar-minus';
      case 'APPOINTMENT_PENDING_REVIEW':
        return 'calendar-search';
      case 'PENDING_APPOINTMENTS_REMINDER':
        return 'calendar-alert';
      case 'PROFILE_INCOMPLETE':
        return 'account-alert';
      case 'SYSTEM_NOTIFICATION':
        return 'information';
      default:
        return 'bell';
    }
  }

  static getNotificationColor(type: string): string {
    switch (type) {
      case 'APPOINTMENT_REQUEST':
        return '#4CAF50'; // Verde
      case 'APPOINTMENT_REQUEST_ACCEPTED':
        return '#8BC34A'; // Verde claro
      case 'APPOINTMENT_RESCHEDULED_BY_USER':
        return '#FF9800'; // Naranja
      case 'APPOINTMENT_RESCHEDULED_BY_ADMIN':
        return '#2196F3'; // Azul
      case 'APPOINTMENT_RESCHEDULE_ACCEPTED':
        return '#8BC34A'; // Verde claro
      case 'APPOINTMENT_RESCHEDULE_COUNTER_PROPOSAL':
        return '#FF5722'; // Naranja rojizo
      case 'APPOINTMENT_RESCHEDULE_COUNTER_CONFIRMED':
        return '#4CAF50'; // Verde
      case 'APPOINTMENT_RESCHEDULE_COUNTER_REJECTED':
        return '#F44336'; // Rojo
      case 'APPOINTMENT_RESCHEDULE_REJECTED':
        return '#E91E63'; // Rosa fuerte
      case 'APPOINTMENT_CANCELLED':
        return '#F44336'; // Rojo
      case 'APPOINTMENT_CANCELLED_BY_ADMIN':
        return '#D32F2F'; // Rojo oscuro
      case 'APPOINTMENT_PENDING_REVIEW':
        return '#9C27B0'; // Púrpura
      case 'PENDING_APPOINTMENTS_REMINDER':
        return '#FF5722'; // Naranja oscuro
      case 'PROFILE_INCOMPLETE':
        return '#F44336'; // Rojo
      case 'SYSTEM_NOTIFICATION':
        return '#607D8B'; // Gris azulado
      default:
        return '#D4AF37'; // Dorado por defecto
    }
  }
}
