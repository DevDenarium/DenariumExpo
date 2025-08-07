import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FinanceAnalyticsService } from '../../services/finance-analytics.service';
import { analyticsStyles } from './FinanceAnalytics.styles';
import {
  AnalyticsDashboard,
  PeriodType,
  AnalyticsQueryParams,
  FinancialInsight,
  CategoryBreakdown,
  RecurringAnalysis,
} from './FinanceAnalytics.types';
import {
  CategoryChart,
  InsightsSection,
  RecurringSection,
  MonthlyComparisonChart,
} from './components';

interface FinanceAnalyticsScreenProps {
  navigation: any;
}

export const FinanceAnalyticsScreen: React.FC<FinanceAnalyticsScreenProps> = ({ navigation }) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(PeriodType.MONTH);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'recurring'>('overview');

  const periods = [
    { key: PeriodType.TODAY, label: 'Hoy' },
    { key: PeriodType.WEEK, label: 'Semana' },
    { key: PeriodType.MONTH, label: 'Mes' },
    { key: PeriodType.QUARTER, label: 'Trimestre' },
    { key: PeriodType.YEAR, label: 'Año' },
  ];

  useEffect(() => {
    loadDashboard();
  }, [selectedPeriod]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const params: AnalyticsQueryParams = {
        period: selectedPeriod,
      };

      console.log('FinanceAnalyticsScreen - Loading dashboard with params:', params);
      const data = await FinanceAnalyticsService.getDashboard(selectedPeriod);
      console.log('FinanceAnalyticsScreen - Dashboard data received:', {
        hasSummary: !!data.summary,
        summaryValues: data.summary,
        categoryExpenses: data.categoryBreakdown?.expenses?.length || 0,
        categoryIncome: data.categoryBreakdown?.income?.length || 0,
        trendsCount: data.trends?.length || 0,
        insightsCount: data.insights?.length || 0
      });
      
      setDashboard(data);
    } catch (error) {
      console.error('Error loading analytics dashboard:', error);
      
      
      let errorMessage = 'No se pudo cargar la información de analytics. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        }
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning-outline';
      case 'success':
        return 'checkmark-circle-outline';
      case 'info':
        return 'information-circle-outline';
      case 'tip':
        return 'bulb-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const renderPeriodSelector = () => (
    <View style={analyticsStyles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            analyticsStyles.periodButton,
            selectedPeriod === period.key && analyticsStyles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text
            style={[
              analyticsStyles.periodButtonText,
              selectedPeriod === period.key && analyticsStyles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabSelector = () => (
    <View style={analyticsStyles.tabContainer}>
      <TouchableOpacity
        style={[
          analyticsStyles.tabButton,
          activeTab === 'overview' && analyticsStyles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('overview')}
      >
        <Text
          style={[
            analyticsStyles.tabButtonText,
            activeTab === 'overview' && analyticsStyles.tabButtonTextActive,
          ]}
        >
          Resumen
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          analyticsStyles.tabButton,
          activeTab === 'trends' && analyticsStyles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('trends')}
      >
        <Text
          style={[
            analyticsStyles.tabButtonText,
            activeTab === 'trends' && analyticsStyles.tabButtonTextActive,
          ]}
        >
          Tendencias
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          analyticsStyles.tabButton,
          activeTab === 'categories' && analyticsStyles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('categories')}
      >
        <Text
          style={[
            analyticsStyles.tabButtonText,
            activeTab === 'categories' && analyticsStyles.tabButtonTextActive,
          ]}
        >
          Categorías
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          analyticsStyles.tabButton,
          activeTab === 'recurring' && analyticsStyles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('recurring')}
      >
        <Text
          style={[
            analyticsStyles.tabButtonText,
            activeTab === 'recurring' && analyticsStyles.tabButtonTextActive,
          ]}
        >
          Recurrentes
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <>
      {dashboard?.insights && dashboard.insights.length > 0 && (
        <InsightsSection
          insights={dashboard.insights}
          getInsightIcon={getInsightIcon}
        />
      )}

    
      {dashboard && (!dashboard.insights || dashboard.insights.length === 0) && (
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay insights financieros para mostrar en este período.{'\n'}
            Agrega algunos movimientos en la sección de Finanzas para generar análisis.
          </Text>
        </View>
      )}
    </>
  );

  const renderTrendsTab = () => (
    <>
      {dashboard?.monthlyComparisons && (
        <MonthlyComparisonChart
          comparisons={dashboard.monthlyComparisons}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );

  const renderCategoriesTab = () => (
    <>
      {dashboard?.categoryBreakdown && (
        <CategoryChart
          expenses={dashboard.categoryBreakdown.expenses}
          income={dashboard.categoryBreakdown.income}
          formatCurrency={formatCurrency}
          detailed={true}
        />
      )}
    </>
  );

  const renderRecurringTab = () => (
    <>
      {dashboard?.recurringAnalysis && (
        <RecurringSection
          recurringAnalysis={dashboard.recurringAnalysis}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'trends':
        return renderTrendsTab();
      case 'categories':
        return renderCategoriesTab();
      case 'recurring':
        return renderRecurringTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <View style={analyticsStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{ marginTop: 16, color: '#AAAAAA' }}>Cargando analytics...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={analyticsStyles.errorContainer}>
        <Ionicons name="analytics-outline" size={64} color="#ccc" />
        <Text style={analyticsStyles.errorText}>
          No se pudo cargar la información de analytics
        </Text>
        <TouchableOpacity style={analyticsStyles.retryButton} onPress={loadDashboard}>
          <Text style={analyticsStyles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={analyticsStyles.container}>
      <ScrollView
        style={analyticsStyles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={analyticsStyles.header}>
          <Text style={analyticsStyles.title}>Finanzas</Text>
          <Text style={analyticsStyles.subtitle}>
            Análisis detallado de tus finanzas
          </Text>
        </View>

        {renderPeriodSelector()}
        {renderTabSelector()}
        {renderContent()}
      </ScrollView>
    </View>
  );
};
