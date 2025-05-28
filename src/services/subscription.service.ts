import axios, { AxiosError } from 'axios';
import { SubscriptionResponse } from '../modules/subscriptions/SubscriptionsScreen.types'
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = 'http://localhost:3000';

export const createSubscription = async (planId: string): Promise<SubscriptionResponse> => {
    try {
        const token = await getAuthToken();

        const response = await axios.post<SubscriptionResponse>(
            `${API_BASE_URL}/subscriptions/create`,
            { planId },
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
};

export const getSubscriptionStatus = async (): Promise<{ isPremium: boolean }> => {
    try {
        const token = await getAuthToken();

        const response = await axios.get<{ isPremium: boolean }>(
            `${API_BASE_URL}/subscriptions/status`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching subscription status:', axiosError);
        return { isPremium: false };
    }
};

const getAuthToken = async (): Promise<string> => {
    try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token retrieved from storage:', token); // Debug

        if (!token) {
            throw new Error('No se encontró token de autenticación en AsyncStorage');
        }

        if (typeof token !== 'string' || token.split('.').length !== 3) {
            throw new Error('Token inválido encontrado en AsyncStorage');
        }

        return token;
    } catch (error) {
        console.error('Error al obtener el token:', error);
        throw new Error(`Error de autenticación: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const upgradeToPremium = async (): Promise<SubscriptionResponse> => {
    try {
        const token = await getAuthToken();

        const response = await axios.post<SubscriptionResponse>(
            `${API_BASE_URL}/subscriptions/upgrade`,
            { plan: 'Premium' },
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
};

export const simulatePremiumPayment = async (): Promise<SubscriptionResponse> => {
    try {
        const token = await getAuthToken();

        const response = await axios.post<SubscriptionResponse>(
            `${API_BASE_URL}/subscriptions/simulate`,
            { plan: 'Premium' },
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
        console.error('Error simulating payment:', axiosError);
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Error al simular el pago'
        );
    }
};
