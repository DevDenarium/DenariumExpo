import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AuthResponse } from '../modules/auth/LoginScreen.types';
import {RegisterFormData, RegisterResponse} from "../modules/auth/RegisterScreen.types";
import {User} from "@react-native-google-signin/google-signin";

export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/auth`;

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 8000,
    transformRequest: [(data: any) => JSON.stringify(data)],
};

const storeToken = async (token: string) => {
    await AsyncStorage.setItem('token', token);
};

const handleAuthError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ||
            error.message ||
            defaultMessage;
        throw new Error(message);
    }
    throw new Error(defaultMessage);
};

export const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/login`,
            credentials,
            axiosConfig
        );

        if (response.data.access_token) {
            await AsyncStorage.setItem('token', response.data.access_token);
            console.log('Token guardado exitosamente'); // Debug
        } else {
            throw new Error('El servidor no devolvió un token válido');
        }

        return response.data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const updateProfile = async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
}): Promise<User> => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.put(
            `${API_URL}/profile`,
            profileData,
            {
                headers: {
                    ...axiosConfig.headers,
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        handleAuthError(error, 'Error al actualizar el perfil');
        throw error;
    }
};
export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
    const platform = Platform.OS === 'ios' ? 'ios' :
        Platform.OS === 'android' ? 'android' : 'web';

    try {
        const { data } = await axios.post<AuthResponse>(
            `${API_URL}/google/${platform}`,
            { token },
            axiosConfig
        );

        await storeToken(data.access_token);
        return data;
    } catch (error) {
        handleAuthError(error, 'Error al iniciar sesión con Google');
        throw error;
    }
};

export const register = async (formData: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse> => {
    try {
        const response = await axios.post<RegisterResponse>(
            `${API_URL}/register`,
            {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                country: formData.country,
                isSocialAuth: false
            },
            axiosConfig
        );

        return {
            success: true,
            message: response.data.message || 'Registro exitoso',
            user: response.data.user
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Register error details:', error.response?.data);
            const message = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Error durante el registro';
            throw new Error(message);
        }
        throw new Error('Error desconocido durante el registro');
    }
};

export const getCountries = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/countries`);
        return response.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw new Error('Error al obtener la lista de países');
    }
};

const handleError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            defaultMessage;
        throw new Error(message);
    }
    throw new Error(defaultMessage);
};

export const logout = async () => {
    await AsyncStorage.removeItem('token');
};

export const isAuthenticated = async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
};

export const getValidToken = async (): Promise<string> => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');
    return token;
};
