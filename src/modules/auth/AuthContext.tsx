import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponse, AuthResponse } from './user.types';
import axios from "axios";

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
                `Bearer ${authData.access_token}`;          // <‑‑ NUEVO
            setUser(authData.user);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(authData.user));
            await AsyncStorage.setItem('@Auth:token', authData.access_token);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    };

    const signOut = React.useCallback(async () => {
        try {
            await AsyncStorage.removeItem('@Auth:user');
            await AsyncStorage.removeItem('@Auth:token');
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }, []); // Dependencias vacías para que no cambie entre renderizados

    const updateUser = async (userData: Partial<UserResponse>) => {
        if (!user) return;

        try {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };


    const refreshUser = async () => {
        try {
            const token = await AsyncStorage.getItem('@Auth:token');
            if (!token) throw new Error('Token no encontrado');

            const response = await axios.get<UserResponse>('http://192.168.100.4:3000/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            await AsyncStorage.setItem('@Auth:user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error actualizando el usuario desde el backend:', error);
        }
    };

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('@Auth:token');
            if (!token) return false;

            const response = await axios.get('http://192.168.100.4:3000/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            await AsyncStorage.setItem('@Auth:user', JSON.stringify(response.data));
            setUser(response.data);
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
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
