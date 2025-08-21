import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    CreateCategoryDto,
    CreateTagDto,
    FinanceCategory,
    FinanceEntry,
    FinanceTag
} from "../modules/finance/FinanceScreen.types";
import Constants from 'expo-constants';


const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.20.19:3000';

export const FinanceService = {
    async getToken(): Promise<string> {
        const token = await AsyncStorage.getItem('@Auth:token');
        if (!token) throw new Error('No authentication token found');
        return token;
    },


    async deleteCategory(id: string): Promise<boolean> {
        const token = await this.getToken();
        try {
            await axios.delete(`${API_BASE_URL}/finance/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    async updateCategory(id: string, updateData: any): Promise<FinanceCategory> {
        const token = await this.getToken();
        try {
            const response = await axios.put(`${API_BASE_URL}/finance/categories/${id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    async updateTag(id: string, updateData: any): Promise<FinanceTag> {
        const token = await this.getToken();
        try {
            const response = await axios.put(`${API_BASE_URL}/finance/tags/${id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating tag:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'No se pudo actualizar la etiqueta';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    async deleteTag(id: string): Promise<boolean> {
        const token = await this.getToken();
        try {
            await axios.delete(`${API_BASE_URL}/finance/tags/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return true;
        } catch (error) {
            console.error('Error deleting tag:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'No se pudo eliminar la etiqueta';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    async createEntry(entryData: any): Promise<any> {
        const token = await this.getToken();
        try {
            console.log('Datos enviados al crear entrada:', entryData);
            const response = await axios.post(`${API_BASE_URL}/finance`, {
                ...entryData,
                amount: Number(entryData.amount),
                date: entryData.date.toISOString(),
                tagIds: entryData.tagIds || []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating finance entry:', error);
            throw error;
        }
    },

        async getAllEntries(userId: string): Promise<FinanceEntry[]> {
            const token = await this.getToken();
            try {
                const response = await axios.get(`${API_BASE_URL}/finance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                return response.data.map((entry: FinanceEntry) => ({
                    ...entry,
                    tags: entry.tags || []
                }));
            } catch (error) {
                console.error('Error fetching finance entries:', error);
                throw error;
            }
        },

    async updateEntry(id: string, updateData: any): Promise<any> {
        const token = await this.getToken();
        try {
            console.log('Datos enviados al actualizar:', updateData); // Debug
            const response = await axios.put(`${API_BASE_URL}/finance/${id}`, {
                ...updateData,
                tagIds: updateData.tagIds || []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating entry:', error);
            throw error;
        }
    },

    async deleteEntry(id: string): Promise<boolean> {
        const token = await this.getToken();
        try {
            await axios.delete(`${API_BASE_URL}/finance/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            console.error('Error deleting finance entry:', error);
            throw error;
        }
    },

    async calculateBalance() {
        const token = await this.getToken();

        try {
            const response = await axios.get(`${API_BASE_URL}/finance/balance`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error detallado:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    config: error.config
                });
            }
            throw error;
        }
    },

    async getCategories() {
        const token = await this.getToken();

        try {
            const response = await axios.get(`${API_BASE_URL}/finance/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Full error fetching categories:', {
                    message: error.message,
                    stack: error.stack
                });
            }

            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', {
                    response: error.response?.data,
                    status: error.response?.status
                });
            }

            throw error;
        }
    },


    async getTags() {
        const token = await this.getToken();
        try {
            const response = await axios.get(`${API_BASE_URL}/finance/tags`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }
    },

    async createCategory(dto: CreateCategoryDto): Promise<FinanceCategory> {
        const token = await this.getToken();
        try {
            const response = await axios.post(`${API_BASE_URL}/finance/categories`, dto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    async createTag(dto: CreateTagDto): Promise<FinanceTag> {
        const token = await this.getToken();
        try {
            const response = await axios.post(`${API_BASE_URL}/finance/tags`, dto, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating tag:', error);
            if (axios.isAxiosError(error)) {
                console.error('Detalles del error:', error.response?.data);
            }
            throw error;
        }
    }
};
