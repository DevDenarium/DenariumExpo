import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, AppointmentStatus } from '../modules/navegation/Navegation.types';

const API_BASE_URL = 'http://192.168.100.4:3000';

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
                params: { filter: 'mine' },
                validateStatus: (status) => status < 500 // Don't throw for 4xx errors
            });

            if (response.status === 404) {
                throw new Error('Endpoint not found. Please check the API URL.');
            }

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Detailed error:', {
                message: error.message,
                url: `${API_BASE_URL}/appointments`,
                requestConfig: error.config,
                responseData: error.response?.data,
                responseStatus: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Failed to fetch user appointments');
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

    async getAdminAppointments(): Promise<ApiResponse<Appointment[]>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments/admin`, {
                headers,
                validateStatus: (status) => status < 500
            });

            // Manejo específico de 404
            if (response.status === 404) {
                console.warn('Endpoint /admin no encontrado, intentando con /all');
                const fallbackResponse = await axios.get(`${API_BASE_URL}/appointments`, {
                    headers,
                    params: { filter: 'all' }
                });
                return {
                    data: fallbackResponse.data,
                    status: fallbackResponse.status
                };
            }

            if (!response.data) {
                throw new Error('Respuesta vacía del servidor');
            }

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error en getAdminAppointments:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error(error.response?.data?.message || 'Error al cargar citas de administrador');
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
            isVirtual?: boolean;
        }
    ): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();

            // Verificar si la cita existe y puede ser editada
            const currentAppointment = await this.getAppointmentDetails(id);

            if (currentAppointment.data.status !== 'PENDING_ADMIN_REVIEW' &&
                currentAppointment.data.status !== 'RESCHEDULED') {
                throw new Error('Solo citas pendientes o reagendadas pueden ser editadas');
            }

            const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, dto, { headers });

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error updating appointment:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw new Error(error.response?.data?.message || 'No se pudo actualizar la cita');
        }
    }

    async updatePendingAppointment(
        id: string,
        dto: {
            title: string;
            description?: string;
            requestedDate: string;
            duration?: number;
            isVirtual?: boolean;
        }
    ): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();

            const response = await axios.put(`${API_BASE_URL}/appointments/${id}/edit-pending`, dto, { headers });

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error updating pending appointment:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw new Error(error.response?.data?.message || 'No se pudo actualizar la cita pendiente');
        }
    }

    private async getAppointmentDetails(id: string): Promise<ApiResponse<Appointment>> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${API_BASE_URL}/appointments/${id}`, { headers });
        return {
            data: response.data,
            status: response.status
        };
    }

    async proposeReschedule(id: string, suggestedDate: string): Promise<ApiResponse<Appointment>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/appointments/${id}/reschedule`,
                { newDate: suggestedDate },
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

            // Asegurarse de que la respuesta incluye todos los datos necesarios
            if (!response.data?.id) {
                throw new Error('Respuesta inválida del servidor');
            }

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            console.error('Error confirming appointment:', error);
            throw new Error(error.response?.data?.message || 'Error al confirmar la cita');
        }
    }
    
    // TODO: Implementar endpoint de reembolso en el backend
    // async processRefund(appointmentId: string): Promise<ApiResponse<Appointment>> {
    //     try {
    //         const headers = await this.getHeaders();
    //         const response = await axios.post(
    //             `${API_BASE_URL}/appointments/${appointmentId}/refund`,
    //             {},
    //             { headers }
    //         );
    //         return {
    //             data: response.data,
    //             status: response.status
    //         };
    //     } catch (error: any) {
    //         console.error('Error processing refund:', error);
    //         throw new Error(error.response?.data?.message || 'Error al procesar el reembolso');
    //     }
    // }

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
                data: response.data || [],
                status: response.status
            };
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
            throw error;
        }
    }

    async getUpcomingAppointments(): Promise<ApiResponse<Appointment[]>> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${API_BASE_URL}/appointments/upcoming`, {
                headers
            });

            return {
                data: response.data || [],
                status: response.status
            };
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            throw error;
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
