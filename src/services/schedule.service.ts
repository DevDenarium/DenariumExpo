import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { 
  ScheduleBlock, 
  CreateScheduleBlockDto,
  AvailabilityResponse,
  DayOfWeek 
} from '../types/schedule.types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.20.16:3000';
const API_URL = `${API_BASE_URL}/schedule-blocks`;

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 8000,
};

class ScheduleService {
  // Obtener token de autenticación
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('@Auth:token');
    return {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Crear un nuevo bloqueo de horario
  async createScheduleBlock(data: CreateScheduleBlockDto): Promise<ScheduleBlock> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(API_URL, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating schedule block:', error);
      throw error;
    }
  }

  // Obtener todos los bloqueos de horario
  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(API_URL, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule blocks:', error);
      throw error;
    }
  }

  // Obtener un bloqueo específico
  async getScheduleBlock(id: string): Promise<ScheduleBlock> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule block:', error);
      throw error;
    }
  }

  // Actualizar un bloqueo
  async updateScheduleBlock(id: string, data: Partial<CreateScheduleBlockDto>): Promise<ScheduleBlock> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.patch(`${API_URL}/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating schedule block:', error);
      throw error;
    }
  }

  // Eliminar (desactivar) un bloqueo
  async deleteScheduleBlock(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(`${API_URL}/${id}`, { headers });
    } catch (error) {
      console.error('Error deleting schedule block:', error);
      throw error;
    }
  }

  // Obtener disponibilidad de horarios para una fecha específica
  async getTimeAvailability(date: string): Promise<AvailabilityResponse[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/availability`, {
        headers,
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching time availability:', error);
      throw error;
    }
  }

  // Obtener fechas bloqueadas en un rango
  async getBlockedDates(startDate: string, endDate: string): Promise<string[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/blocked-dates`, {
        headers,
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
      throw error;
    }
  }

  // Generar slots de tiempo para el selector de horarios
  generateTimeSlots(): Array<{ value: string; label: string }> {
    const slots: Array<{ value: string; label: string }> = [];
    const startHour = 8;
    const endHour = 21;
    const interval = 30; // minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({
          value: timeString,
          label: displayTime
        });
      }
    }

    return slots;
  }

  // Validar que un horario esté en el rango permitido
  isValidTimeSlot(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60; // 8:00 AM
    const endMinutes = 21 * 60; // 9:00 PM

    return totalMinutes >= startMinutes && totalMinutes < endMinutes;
  }

  // Formatear tiempo para mostrar
  formatTimeForDisplay(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  // Validar que la hora de inicio sea menor que la de fin
  validateTimeRange(startTime: string, endTime: string): boolean {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return startMinutes < endMinutes;
  }
}

export const scheduleService = new ScheduleService();
