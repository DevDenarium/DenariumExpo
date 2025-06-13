import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '../modules/navegation/Navegation.types';

const API_BASE_URL = 'http://localhost:3000'; // Asegúrate de que esta URL sea correcta para tu entorno

interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

class AppointmentService {
    private async getAuthToken(): Promise<string> {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return token;
    }

    private async getHeaders() {
        const token = await this.getAuthToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    // Crear una nueva cita
    async createAppointment(dto: {
        title: string;
        description?: string;
        requestedDate: string;
        duration?: number;
    }): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${API_BASE_URL}/appointments`, dto, { headers });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            throw new Error(error.response?.data?.message || 'Error al crear la cita');
        }
    }

    // Obtener citas del usuario actual
    async getUserAppointments(): Promise<ApiResponse<Appointment[]>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments/user`, { headers });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error fetching user appointments:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener las citas');
        }
    }

    // Obtener disponibilidad
    async getAvailability(date: Date): Promise<ApiResponse<Array<{ start: Date; end: Date }>>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments/availability`, {
                headers,
                params: { date: date.toISOString() }
            });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error fetching availability:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener la disponibilidad');
        }
    }

    // Cancelar una cita
    async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/cancel`,
                {},
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error canceling appointment:', error);
            throw new Error(error.response?.data?.message || 'Error al cancelar la cita');
        }
    }
}

export const appointmentService = new AppointmentService();
