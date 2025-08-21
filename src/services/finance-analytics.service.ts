import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnalyticsDashboard,
  AnalyticsQueryParams,
  FinancialSummary,
  TrendData,
  CategoryBreakdown,
  MonthlyComparison,
  RecurringAnalysis,
  ExpenseHeatmap
} from '../modules/finance-analytics/FinanceAnalytics.types';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.20.19:3000';

export const FinanceAnalyticsService = {
  async getToken(): Promise<string> {
    const token = await AsyncStorage.getItem('@Auth:token');
    if (!token) throw new Error('No authentication token found');
    return token;
  },

  async getDashboard(period: string = 'monthly'): Promise<AnalyticsDashboard> {
    const token = await this.getToken();
    const params = { period };
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('FinanceAnalyticsService - Error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('FinanceAnalyticsService - Axios error response:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  async getFinancialSummary(params?: AnalyticsQueryParams): Promise<FinancialSummary> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  async getTrends(params?: AnalyticsQueryParams): Promise<TrendData[]> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/trends`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  },

  async getCategoryBreakdown(params?: AnalyticsQueryParams): Promise<{
    expenses: CategoryBreakdown[];
    income: CategoryBreakdown[];
  }> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  },

  async getMonthlyComparisons(year?: number): Promise<MonthlyComparison[]> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/monthly-comparison`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly comparisons:', error);
      throw error;
    }
  },

  async getRecurringAnalysis(): Promise<{
    expenses: RecurringAnalysis[];
    income: RecurringAnalysis[];
  }> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/recurring`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring analysis:', error);
      throw error;
    }
  },

  async getExpenseHeatmap(params?: AnalyticsQueryParams): Promise<ExpenseHeatmap[]> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/heatmap`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expense heatmap:', error);
      throw error;
    }
  },

  async getComparison(params: AnalyticsQueryParams & {
    comparePeriod?: string;
    compareStartDate?: string;
    compareEndDate?: string;
  }): Promise<{
    current: FinancialSummary;
    comparison: FinancialSummary;
    change: {
      income: number;
      expenses: number;
      balance: number;
    };
  }> {
    const token = await this.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}/finance-analytics/comparison`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comparison:', error);
      throw error;
    }
  }
};
