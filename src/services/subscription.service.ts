import axios, { AxiosError } from 'axios';
import {
    SubscriptionPlanType,
    SubscriptionResponse,
    SubscriptionStatus
} from '../modules/subscriptions/SubscriptionsScreen.types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole } from '../modules/auth/user.types';

const API_BASE_URL = 'http://192.168.20.16:3000';

export const SubscriptionsService = {

    createDefaultSubscription: async (userId: string, role: UserRole): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            let defaultPlan: SubscriptionPlanType;
            switch(role) {
                case UserRole.CORPORATE:
                    defaultPlan = 'CORPORATE_FREE';
                    break;
                case UserRole.CORPORATE_EMPLOYEE:
                    defaultPlan = 'CORPORATE_FREE';
                    break;
                case UserRole.PERSONAL:
                default:
                    defaultPlan = 'PERSONAL_FREE';
            }

            const response = await axios.post<SubscriptionResponse>(
                `${API_BASE_URL}/subscriptions/create-default`,
                { userId, planType: defaultPlan },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error creating default subscription:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al crear la suscripción por defecto'
            );
        }
    },

    createSubscription: async (planType: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            const response = await axios.post<SubscriptionResponse>(
                `${API_BASE_URL}/subscriptions`,
                { planType },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error creating subscription:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al crear la suscripción'
            );
        }
    },

    getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
        try {
            const token = await getAuthToken();

            const response = await axios.get<SubscriptionStatus>(
                `${API_BASE_URL}/subscriptions/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                ...response.data,
                daysRemaining: calculateDaysRemaining(response.data.endDate)
            };
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error fetching subscription status:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al obtener el estado de la suscripción'
            );
        }
    },

    upgradeSubscription: async (planType: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            const response = await axios.post<SubscriptionResponse>(
                `${API_BASE_URL}/subscriptions/upgrade`,
                { planType },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error upgrading subscription:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al actualizar la suscripción'
            );
        }
    },

    createCheckoutSession: async (
        planType: SubscriptionPlanType,
        price: number,
        userId: string
    ): Promise<{ sessionId: string }> => {
        try {
            const token = await getAuthToken();

            const response = await axios.post<{ sessionId: string }>(
                `${API_BASE_URL}/payments/create-checkout-session`,
                {
                    planType,
                    price,
                    userId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error creating checkout session:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al crear la sesión de pago'
            );
        }
    },

    activateFreeSubscription: async (planType: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            const response = await axios.post<SubscriptionResponse>(
                `${API_BASE_URL}/subscriptions/activate-free`,
                { planType },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error activating free subscription:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al activar la suscripción gratuita'
            );
        }
    },

    simulatePremiumPayment: async (): Promise<{ success: boolean }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 2000);
        });
    },

    upgradeToPremium: async (planType?: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            if (__DEV__) {
                return {
                    success: true,
                    message: 'Subscription upgraded successfully (simulated)',
                    planType: planType || 'PERSONAL_PREMIUM'
                };
            }

            const response = await axios.post<SubscriptionResponse>(
                `${API_BASE_URL}/subscriptions/upgrade`,
                { planType },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Error upgrading subscription:', axiosError);
            throw new Error(
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Error al actualizar la suscripción'
            );
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

const calculateDaysRemaining = (endDate: string): number => {
    if (endDate === '9999-12-31') return Infinity;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default SubscriptionsService;
