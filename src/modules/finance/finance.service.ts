import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

export const FinanceService = {
    async getToken(): Promise<string> {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        return token;
    },

    async createEntry(entryData: any): Promise<any> {
        const token = await this.getToken();
        try {
            const response = await axios.post(`${API_BASE_URL}/finance`, entryData, {
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

    async getAllEntries(): Promise<any[]> {
        const token = await this.getToken();
        try {
            const response = await axios.get(`${API_BASE_URL}/finance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching finance entries:', error);
            throw error;
        }
    },

    async updateEntry(id: string, updateData: any): Promise<any> {
        const token = await this.getToken();
        try {
            const response = await axios.patch(`${API_BASE_URL}/finance/${id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating finance entry:', error);
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

    async calculateBalance(): Promise<{ balance: number; incomes: number; expenses: number }> {
        const entries = await this.getAllEntries();
        let incomes = 0;
        let expenses = 0;

        entries.forEach(entry => {
            if (entry.type === 'income') {
                incomes += entry.amount;
            } else {
                expenses += entry.amount;
            }
        });

        return {
            balance: incomes - expenses,
            incomes,
            expenses
        };
    }
};
