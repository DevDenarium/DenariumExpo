import axios, { AxiosError } from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EducationalContent, ContentCategory } from '../modules/educational/EducationalScreen.types';


const API_BASE_URL = 'http://192.168.100.4:3000'; // Cambiar por tu URL de producción

export const EducationalService = {
    fetchCategories: async (): Promise<ContentCategory[]> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<ContentCategory[]>(
                `${API_BASE_URL}/educational/categories`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al cargar las categorías');
            throw error;
        }
    },

    fetchContents: async (params?: {
        type?: 'VIDEO' | 'STORY';
        categoryId?: string;
        isPremium?: boolean;
        isActive?: boolean;
        search?: string;
    }): Promise<EducationalContent[]> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<EducationalContent[]>(
                `${API_BASE_URL}/educational/content`,
                {
                    params,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error in fetchContents:', error);
            handleApiError(error, 'Error al cargar el contenido educativo');
            throw error;
        }
    },

    createContent: async (contentData: {
        title: string;
        description: string;
        type: 'VIDEO' | 'STORY';
        categoryId: string;
        videoUrl: string;
        duration: number;
        isPremium: boolean;
        freeViewDuration?: number;
        isActive?: boolean;
    }): Promise<EducationalContent> => {
        try {
            const token = await getAuthToken();
            
            const response = await axios.post<EducationalContent>(
                `${API_BASE_URL}/educational/content`,
                contentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al crear el contenido');
            throw error;
        }
    },

    updateContent: async (
        id: string,
        contentData: {
            title?: string;
            description?: string;
            categoryId?: string;
            videoUrl?: string;
            duration?: number;
            isPremium?: boolean;
            freeViewDuration?: number;
            isActive?: boolean;
        }
    ): Promise<EducationalContent> => {
        try {
            const token = await getAuthToken();
            const response = await axios.put<EducationalContent>(
                `${API_BASE_URL}/educational/content/${id}`,
                contentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al actualizar el contenido');
            throw error;
        }
    },

    checkContentAccess: async (contentId: string): Promise<boolean> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<{ hasAccess: boolean }>(
                `${API_BASE_URL}/educational/content/${contentId}/check-access`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.hasAccess;
        } catch (error) {
            handleApiError(error, 'Error al verificar el acceso al contenido');
            return false;
        }
    },

    createDefaultCategories: async (): Promise<{ message: string; created: number; total: number }> => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/educational/categories/default`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al crear categorías por defecto');
            throw error;
        }
    },

    deleteContent: async (id: string): Promise<void> => {
        try {
            const token = await getAuthToken();
            await axios.delete(
                `${API_BASE_URL}/educational/content/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            handleApiError(error, 'Error al eliminar el contenido');
            throw error;
        }
    },

    cleanupInactiveContent: async (): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
        errorCount: number;
        deletedItems: { id: string; title: string }[];
    }> => {
        try {
            const token = await getAuthToken();
            const response = await axios.delete(
                `${API_BASE_URL}/educational/cleanup/inactive`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al limpiar contenido inactivo');
            throw error;
        }
    },

    recordContentView: async (contentId: string): Promise<void> => {
        try {
            const token = await getAuthToken();
            await axios.post(
                `${API_BASE_URL}/educational/content/${contentId}/view`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            handleApiError(error, 'Error al registrar la visualización');
            throw error;
        }
    },

    getSignedUrl: async (key: string): Promise<string> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<{ url: string }>(
                `${API_BASE_URL}/educational/signed-url`,
                {
                    params: { key },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.url;
        } catch (error) {
            handleApiError(error, 'Error al obtener la URL del video');
            throw error;
        }
    }
};


export const getAuthToken = async (): Promise<string> => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }
        return token;
    } catch (error) {
        console.error('Error al obtener el token:', error);
        throw new Error(`Error de autenticación: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const handleApiError = (error: unknown, defaultMessage: string): void => {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error('Error en la llamada API:', axiosError);

    const errorMessage = axiosError.response?.data?.message ||
        axiosError.message ||
        defaultMessage;

    throw new Error(errorMessage);
};
