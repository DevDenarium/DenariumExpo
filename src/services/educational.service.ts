import axios, { AxiosError } from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EducationalContent, ContentCategory } from '../modules/educational/EducationalScreen.types';


const API_BASE_URL = 'http://192.168.20.13:3000'; // Cambiar por tu URL de producción

export const EducationalService = {
    fetchCategories: async (activeOnly: boolean = true): Promise<ContentCategory[]> => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<ContentCategory[]>(
                `${API_BASE_URL}/educational/categories`,
                {
                    params: { activeOnly },
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
    },

    // Funciones para gestión de categorías
    createCategory: async (categoryData: {
        name: string;
        description?: string;
        icon: string;
        color: string;
    }): Promise<ContentCategory> => {
        try {
            const token = await getAuthToken();
            console.log('📡 Enviando petición de creación de categoría:', {
                url: `${API_BASE_URL}/educational/categories`,
                data: categoryData,
                headers: {
                    'Authorization': `Bearer ${token ? 'Token presente' : 'No token'}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const response = await axios.post<ContentCategory>(
                `${API_BASE_URL}/educational/categories`,
                categoryData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Respuesta exitosa del servidor:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error en createCategory:', error);
            
            // Log más detallado del error
            if (axios.isAxiosError(error)) {
                console.error('Detalles del error Axios:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url,
                    method: error.config?.method
                });
            }
            
            handleApiError(error, 'Error al crear la categoría');
            throw error;
        }
    },

    updateCategory: async (
        id: string,
        categoryData: {
            name?: string;
            description?: string;
            icon?: string;
            color?: string;
            isActive?: boolean;
        }
    ): Promise<ContentCategory> => {
        try {
            const token = await getAuthToken();
            const response = await axios.put<ContentCategory>(
                `${API_BASE_URL}/educational/categories/${id}`,
                categoryData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Error al actualizar la categoría');
            throw error;
        }
    },

    deleteCategory: async (id: string): Promise<void> => {
        try {
            const token = await getAuthToken();
            await axios.delete(
                `${API_BASE_URL}/educational/categories/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            handleApiError(error, 'Error al eliminar la categoría');
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
