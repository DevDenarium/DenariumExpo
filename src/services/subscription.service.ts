import axios, { AxiosError } from 'axios';
import {
    SubscriptionPlanType,
    SubscriptionResponse,
    SubscriptionStatus
} from '../modules/subscriptions/SubscriptionsScreen.types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole } from '../modules/auth/user.types';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Service for handling subscription-related operations
 */
export const SubscriptionsService = {
    /**
     * Creates a default subscription based on user role
     * @param userId - The user ID
     * @param role - The user role (PERSONAL, CORPORATE, etc.)
     * @returns Promise<SubscriptionResponse>
     */
    createDefaultSubscription: async (userId: string, role: UserRole): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            // Determine default plan based on user role
            let defaultPlan: SubscriptionPlanType;
            switch(role) {
                case UserRole.CORPORATE:
                    defaultPlan = 'CORPORATE_FREE';
                    break;
                case UserRole.CORPORATE_EMPLOYEE:
                    defaultPlan = 'CORPORATE_FREE'; // Employees inherit corporate plan
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

    /**
     * Creates a new subscription
     * @param planType - The type of subscription plan
     * @returns Promise<SubscriptionResponse>
     */
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

    /**
     * Gets the current subscription status
     * @returns Promise<SubscriptionStatus>
     */
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

            // Enhance the response with calculated fields
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

    /**
     * Upgrades a subscription
     * @param planType - The new subscription plan type
     * @returns Promise<SubscriptionResponse>
     */
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

    /**
     * Creates a checkout session for payment
     * @param planType - The subscription plan type
     * @param price - The price of the subscription
     * @param userId - The user ID
     * @returns Promise<{ sessionId: string }>
     */
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

    /**
     * Activates a free subscription
     * @param planType - The free subscription plan type
     * @returns Promise<SubscriptionResponse>
     */
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

    /**
     * Simulates a premium payment (for development only)
     * @returns Promise<{ success: boolean }>
     */
    simulatePremiumPayment: async (): Promise<{ success: boolean }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 2000);
        });
    },

    /**
     * Upgrades to premium subscription
     * @param planType - Optional plan type (defaults to PERSONAL_PREMIUM)
     * @returns Promise<SubscriptionResponse>
     */
    upgradeToPremium: async (planType?: SubscriptionPlanType): Promise<SubscriptionResponse> => {
        try {
            const token = await getAuthToken();

            // In development, simulate the response
            if (__DEV__) {
                return {
                    success: true,
                    message: 'Subscription upgraded successfully (simulated)',
                    planType: planType || 'PERSONAL_PREMIUM'
                };
            }

            // In production, make the real call
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

/**
 * Helper function to get authentication token
 * @returns Promise<string>
 */
const getAuthToken = async (): Promise<string> => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró token de autenticación en AsyncStorage');
        }
        return token;
    } catch (error) {
        console.error('Error al obtener el token:', error);
        throw new Error(`Error de autenticación: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Calculates days remaining until subscription ends
 * @param endDate - The end date string
 * @returns number - Days remaining (Infinity if end date is '9999-12-31')
 */
const calculateDaysRemaining = (endDate: string): number => {
    if (endDate === '9999-12-31') return Infinity;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default SubscriptionsService;
