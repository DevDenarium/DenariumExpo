import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '../modules/navegation/Navegation.types';

const API_BASE_URL = 'http://localhost:3000';

interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface AppointmentCreationResponse {
    appointment: Appointment;
    paymentRequired: boolean;
    amount: number;
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

    async createAppointment(dto: {
        title: string;
        description?: string;
        requestedDate: string;
        duration?: number;
        isVirtual?: boolean;
    }): Promise<ApiResponse<AppointmentCreationResponse>> {
        const headers = await this.getHeaders();
        try {
            const response = await axios.post(`${API_BASE_URL}/appointments`, dto, { headers });

            const appointmentData = response.data?.data?.appointment;

            if (!appointmentData?.id) {
                throw new Error('La respuesta del servidor no incluye un ID de cita válido');
            }

            return {
                data: response.data.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            throw new Error(error.response?.data?.message || 'Error al crear la cita');
        }
    }


    async confirmPayment(appointmentId: string): Promise<ApiResponse<Appointment>> {
        if (!appointmentId) {
            throw new Error('Se requiere un ID de cita válido para confirmar el pago');
        }

        const headers = await this.getHeaders();
        try {
            const response = await axios.post(
                `${API_BASE_URL}/appointments/${appointmentId}/confirm-payment`,
                {},
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error confirming payment:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw new Error(error.response?.data?.message || 'Error al confirmar el pago');
        }
    }

    async getUserAppointments(): Promise<ApiResponse<Appointment[]>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments`, {
                headers,
                params: { filter: 'mine' }
            });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error fetching user appointments:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener las citas');
        }
    }

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
            console.error('Error canceling appointment:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            throw new Error(
                error.response?.data?.message ||
                'No se pudo cancelar la cita. Verifica que tengas permisos o que la cita esté en un estado cancelable'
            );
        }
    }

    async updateAppointment(
        id: string,
        dto: {
            title: string;
            description?: string;
            requestedDate: string;
            duration?: number;
        }
    ): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const currentAppointment = await axios.get(`${API_BASE_URL}/appointments/${id}`, { headers });

            if (currentAppointment.data.status === 'CONFIRMED') {
                throw new Error('No se puede editar una cita confirmada');
            }

            const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, dto, { headers });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error updating appointment:', error);
            throw new Error(error.response?.data?.message || 'No se pudo actualizar la cita');
        }
    }

    async proposeReschedule(id: string, suggestedDate: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/reschedule`,
                { date: suggestedDate },
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error proposing reschedule:', error);
            throw new Error(error.response?.data?.message || 'Error al proponer reagendamiento');
        }
    }

    async confirmAppointment(id: string, confirmedDate: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/confirm`,
                { date: confirmedDate },
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error confirming appointment:', error);
            throw new Error(error.response?.data?.message || 'Error al confirmar la cita');
        }
    }
    async processRefund(appointmentId: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${API_BASE_URL}/appointments/${appointmentId}/refund`,
                {},
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error processing refund:', error);
            throw new Error(error.response?.data?.message || 'Error al procesar el reembolso');
        }
    }

    async acceptReschedule(id: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/accept-reschedule`,
                {},
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error accepting reschedule:', error);
            throw new Error(error.response?.data?.message || 'Error al aceptar el reagendamiento');
        }
    }

    async getPendingAppointments(): Promise<ApiResponse<Appointment[]>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments/pending`, {
                headers
            });
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error fetching pending appointments:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener las citas pendientes');
        }
    }

    async rejectReschedule(id: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/reject-reschedule`,
                {},
                { headers }
            );
            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error rejecting reschedule:', error);
            throw new Error(error.response?.data?.message || 'Error al rechazar el reagendamiento');
        }
    }
}




export const appointmentService = new AppointmentService();
