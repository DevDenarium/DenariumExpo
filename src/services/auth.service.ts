import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AuthResponse, RegisterResponse } from '../modules/auth/user.types';
import { User } from '@react-native-google-signin/google-signin';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.20.14:3000';
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
            error.response?.data?.error ||
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
        } else {
            throw new Error('Invalid token received');
        }

        return response.data;
    } catch (error) {
        handleAuthError(error, 'Login failed');
        throw error;
    }
};

export const registerPersonal = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    province?: string;
    canton?: string;
    district?: string;
}): Promise<RegisterResponse> => {
    try {
        const location = {
            country: formData.country,
            ...(formData.country === 'Costa Rica' && {
                province: formData.province,
                canton: formData.canton,
                district: formData.district
            })
        };

        const payload = {
            userType: 'personal',
            personalData: {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                location: location
            }
        };

        const response = await axios.post<RegisterResponse>(
            `${API_URL}/register`,
            payload,
            axiosConfig
        );

        return {
            success: true,
            message: 'Verification email sent',
            user: response.data.user,
            requiresVerification: true
        };
    } catch (error) {
        handleAuthError(error, 'Registration failed');
        throw error;
    }
};

export const registerCorporate = async (formData: {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    contactName: string;
    contactPhone: string;
    country: string;
    province?: string;
    canton?: string;
    district?: string;
    employeeCount: number;
    companyDomain: string;
}): Promise<RegisterResponse> => {
    try {
        const location = {
            country: formData.country,
            ...(formData.country === 'Costa Rica' && {
                province: formData.province,
                canton: formData.canton,
                district: formData.district
            }),
        };

        const payload = {
            userType: 'corporate',
            corporateData: {
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName,
                phone: formData.phone,
                contactName: formData.contactName,
                contactPhone: formData.contactPhone,
                location: location,
                employeeCount: formData.employeeCount,
                companyDomain: formData.companyDomain
            }
        };

        const response = await axios.post<RegisterResponse>(
            `${API_URL}/register`,
            payload,
            axiosConfig
        );

        return {
            success: true,
            message: 'Verification email sent',
            user: response.data.user,
            requiresVerification: true
        };
    } catch (error) {
        handleAuthError(error, 'Corporate registration failed');
        throw error;
    }
};

export const getCorporates = async (): Promise<Array<{id: string, name: string, domain: string}>> => {
    try {
        const response = await axios.get(`${API_URL}/corporates`);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch corporates');
        throw error;
    }
};
export const registerCorporateEmployee = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    province?: string;
    canton?: string;
    district?: string;
    corporateId: string;
}): Promise<RegisterResponse> => {
    try {
        if (formData.country === 'Costa Rica') {
            if (!formData.province || !formData.canton || !formData.district) {
                throw new Error('Province, canton and district are required for Costa Rica');
            }

            await validateCostaRicaLocation(
                formData.province,
                formData.canton,
                formData.district
            );
        }

        const corporate = (await getCorporates()).find(c => c.id === formData.corporateId);
        if (corporate && !formData.email.endsWith(`@${corporate.domain}`)) {
            throw new Error(`Email must belong to company domain: @${corporate.domain}`);
        }

        const location = {
            country: formData.country,
            ...(formData.country === 'Costa Rica' && {
                province: formData.province,
                canton: formData.canton,
                district: formData.district
            })
        };

        const payload = {
            userType: 'corporate-employee',
            corporateEmployeeData: {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                location: location, // Objeto location anidado
                corporateId: formData.corporateId
            }
        };

        const response = await axios.post<RegisterResponse>(
            `${API_URL}/register`,
            payload,
            axiosConfig
        );

        return {
            success: true,
            message: 'Verification email sent',
            user: response.data.user,
            requiresVerification: true
        };
    } catch (error) {
        handleAuthError(error, 'Corporate employee registration failed');
        throw error;
    }
};


export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
    try {
        const platform = Platform.OS === 'ios' ? 'ios' :
            Platform.OS === 'android' ? 'android' : 'web';

        console.log('Sending Google token to:', `${API_URL}/google/${platform}`);

        const response = await axios.post<AuthResponse>(
            `${API_URL}/google/${platform}`,
            { token },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('Google login response:', response.data);

        if (!response.data.access_token) {
            throw new Error('No access token received');
        }

        await storeToken(response.data.access_token);
        return response.data;
    } catch (error) {
        console.error('Full Google login error:', error);

        let errorMessage = 'Google login failed';
        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message;
            console.error('Axios error details:', {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.post(
            `${API_URL}/verify-email`,
            { email, code },
            axiosConfig
        );

        if (response.data.access_token) {
            await storeToken(response.data.access_token);
        }

        return {
            success: true,
            message: response.data.message || 'Email verified successfully'
        };
    } catch (error) {
        handleAuthError(error, 'Email verification failed');
        throw error;
    }
};

export const resendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.post(
            `${API_URL}/resend-verification`,
            { email },
            axiosConfig
        );

        return {
            success: true,
            message: response.data.message || 'Verification code resent'
        };
    } catch (error) {
        handleAuthError(error, 'Failed to resend verification code');
        throw error;
    }
};

export const getCountries = async () => {
    try {
        const response = await axios.get(`${API_URL}/countries`);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch countries');
        throw error;
    }
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

export const sendPasswordResetCode = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to send reset code');
        throw error;
    }
};

export const verifyPasswordResetCode = async (email: string, code: string) => {
    try {
        const response = await axios.post(`${API_URL}/verify-reset-code`, { email, code });
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to verify reset code');
        throw error;
    }
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, {
            email,
            code,
            newPassword
        });
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to reset password');
        throw error;
    }
};

export const getProfile = async (): Promise<any> => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get(`${API_URL}/me`, {
            headers: {
                ...axiosConfig.headers,
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch profile');
        throw error;
    }
};

export const getProvinces = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/locations/provinces`);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch provinces');
        throw error;
    }
};

export const getCantons = async (provinceId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/locations/cantons?provinceId=${provinceId}`);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch cantons');
        throw error;
    }
};

export const getDistricts = async (cantonId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/locations/districts?cantonId=${cantonId}`);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch districts');
        throw error;
    }
};

export const getLocationDetails = async (provinceId: string, cantonId?: string, districtId?: string) => {
    try {
        let url = `${API_URL}/details?provinceId=${provinceId}`;
        if (cantonId) url += `&cantonId=${cantonId}`;
        if (districtId) url += `&districtId=${districtId}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to fetch location details');
        throw error;
    }
};

export const validateCostaRicaLocation = async (provinceName: string, cantonName: string, districtName: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/locations/validate-cr-location`, {
            provinceName,
            cantonName,
            districtName
        });
        return response.data;
    } catch (error) {
        handleAuthError(error, 'Failed to validate location');
        throw error;
    }
};

export const updateProfile = async (profileData: any): Promise<any> => {
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
        handleAuthError(error, 'Failed to update profile');
        throw error;
    }
};
