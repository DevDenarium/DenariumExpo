import axios, { AxiosError } from 'axios';
import {
    SubscriptionPlanType,
    SubscriptionResponse,
    SubscriptionStatus
} from '../modules/subscriptions/SubscriptionsScreen.types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole } from '../modules/auth/user.types';


const API_BASE_URL = 'http://192.168.20.19:3000';

export const SubscriptionsService = {
    getAvailablePlans: async (role: UserRole) => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return role === UserRole.CORPORATE ?
                response.data.corporate :
                response.data.personal;
        } catch (error) {
            console.error('Error getting available plans:', error);
            throw error;
        }
    },

    getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/subscriptions/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                ...response.data,
                planType: response.data.plan,
                daysRemaining: response.data.daysRemaining > 0 ? response.data.daysRemaining : 0
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);
            throw error;
        }
    },

    upgradeSubscription: async (plan: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/subscriptions/upgrade`,
                { plan },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                ...response.data,
                planType: response.data.subscription?.planType || plan
            };
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            throw error;
        }
    },

    simulatePremiumPayment: async (plan: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            // Debug: Verifica que el plan llegue correctamente
            console.log('Plan recibido:', plan);
            if (!plan) {
                throw new Error('El plan no está definido');
            }

            const response = await axios.post(
                `${API_BASE_URL}/subscriptions/upgrade`,
                { plan }, // Envía como objeto { plan: "PERSONAL_PREMIUM" }
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: 'Pago simulado exitosamente',
                subscription: response.data.subscription,
                planType: plan
            };
        } catch (error) {
            console.error('Detalles del error:', {
                error: error instanceof AxiosError ? {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    request: error.config?.data
                } : error
            });
            throw error;
        }
    },

    activateFreeSubscription: async (plan: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/subscriptions/upgrade`,
                { plan },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                ...response.data,
                planType: response.data.subscription?.planType || plan
            };
        } catch (error) {
            console.error('Error activating free subscription:', error);
            throw error;
        }
    }
};

const getAuthToken = async (): Promise<string> => {
    try {
        const token = await AsyncStorage.getItem('@Auth:token');
        if (!token) {
            throw new Error('No se encontró token de autenticación en AsyncStorage');
        }
        return token;
    } catch (error) {
        console.error('Error al obtener el token:', error);
        throw new Error(`Error de autenticación: ${error instanceof Error ? error.message : String(error)}`);
    }
};
