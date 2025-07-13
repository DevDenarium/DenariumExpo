import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.211:3000';

export const PaymentsService = {
    async createCheckoutSession(email: string, planId: string, token: string): Promise<string> {
        const response = await axios.post(`${API_BASE_URL}/payments/create-session`, {
            email,
            planId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.url;
    },

    async getSessionStatus(sessionId: string, token: string): Promise<any> {
        const response = await axios.get(`${API_BASE_URL}/payments/session-status`, {
            params: { sessionId },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async processPayment(paymentData: any, token: string): Promise<any> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Pago procesado con éxito'
                });
            }, 1500);
        });
    },

    async simulatePayment(sessionId: string): Promise<any> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    status: 'complete',
                    sessionId
                });
            }, 2000);
        });
    }
};

