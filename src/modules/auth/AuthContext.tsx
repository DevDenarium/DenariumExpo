import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponse, AuthResponse } from './user.types';
import axios from "axios";
import { API_BASE_URL } from '../../services/auth.service';

export interface AuthContextData {
    user: UserResponse | null;
    loading: boolean;
    signIn: (authData: AuthResponse) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (userData: Partial<UserResponse>) => Promise<void>;
    checkAuth: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

type AuthProviderProps = {
    children: ReactNode;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storedUser = await AsyncStorage.getItem('@Auth:user');
            const storedToken = await AsyncStorage.getItem('@Auth:token');

            if (storedUser && storedToken) {
                    axios.defaults.headers.common['Authorization'] =
                        `Bearer ${storedToken}`;                 // <‑‑ NUEVO
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        }
        loadStorageData();
    }, []);

    const signIn = async (authData: AuthResponse) => {
        try {
            axios.defaults.headers.common['Authorization'] =
                `Bearer ${authData.access_token}`;          
            
            // Extraer datos de ubicación del usuario
            const locationData = authData.user.personalUser?.location || 
                                 authData.user.corporateUser?.location || 
                                 authData.user.corporateEmployee?.location;

            // Crear usuario con datos de ubicación extraídos
            const userWithLocation = {
                ...authData.user,
                country: locationData?.country || authData.user.country,
                province: locationData?.province?.name,
                canton: locationData?.canton?.name,
                district: locationData?.district?.name
            };
            
            setUser(userWithLocation);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(userWithLocation));
            await AsyncStorage.setItem('@Auth:token', authData.access_token);
        } catch (error) {
            console.error('Error guardando datos de autenticación:', error);
            throw error;
        }
    };

    const signOut = React.useCallback(async () => {
        try {
            await AsyncStorage.removeItem('@Auth:user');
            await AsyncStorage.removeItem('@Auth:token');
            setUser(null);
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            throw error;
        }
    }, []); 

    const updateUser = async (userData: Partial<UserResponse>) => {
        if (!user) return;

        try {
            // Extraer datos de ubicación de la respuesta del backend
            const locationData = userData.personalUser?.location || 
                                 userData.corporateUser?.location || 
                                 userData.corporateEmployee?.location;

            // Crear el usuario actualizado manteniendo la estructura del contexto
            const updatedUser = { 
                ...user, 
                ...userData,
                // Actualizar campos específicos con los datos de ubicación
                country: locationData?.country || userData.country || user.country,
                province: locationData?.province?.name || user.province,
                canton: locationData?.canton?.name || user.canton,
                district: locationData?.district?.name || user.district
            };
            setUser(updatedUser);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw error;
        }
    };


    const refreshUser = async () => {
        try {
            const token = await AsyncStorage.getItem('@Auth:token');
            if (!token) throw new Error('Token no encontrado');

            const response = await axios.get<UserResponse>(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Extraer datos de ubicación de la respuesta
            const locationData = response.data.personalUser?.location || 
                                 response.data.corporateUser?.location || 
                                 response.data.corporateEmployee?.location;

            // Crear el usuario con datos de ubicación extraídos
            const userWithLocation = {
                ...response.data,
                country: locationData?.country || response.data.country,
                province: locationData?.province?.name,
                canton: locationData?.canton?.name,
                district: locationData?.district?.name
            };

            setUser(userWithLocation);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(userWithLocation));
        } catch (error) {
            console.error('Error actualizando el usuario desde el backend:', error);
        }
    };

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('@Auth:token');
            if (!token) return false;

            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Extraer datos de ubicación de la respuesta
            const locationData = response.data.personalUser?.location || 
                                 response.data.corporateUser?.location || 
                                 response.data.corporateEmployee?.location;

            // Crear el usuario con datos de ubicación extraídos
            const userWithLocation = {
                ...response.data,
                country: locationData?.country || response.data.country,
                province: locationData?.province?.name,
                canton: locationData?.canton?.name,
                district: locationData?.district?.name
            };

            await AsyncStorage.setItem('@Auth:user', JSON.stringify(userWithLocation));
            setUser(userWithLocation);
            return true;
        } catch (error) {
            await signOut();
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signOut,
            updateUser,
            checkAuth,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
