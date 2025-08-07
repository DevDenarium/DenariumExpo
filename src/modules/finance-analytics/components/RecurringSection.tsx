import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurringAnalysis } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface RecurringSectionProps {
  recurringAnalysis: {
    expenses: RecurringAnalysis[];
    income: RecurringAnalysis[];
  };
  formatCurrency: (amount: number) => string;
}

export const RecurringSection: React.FC<RecurringSectionProps> = ({
  recurringAnalysis,
  formatCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return 'Diario';
      case 'WEEKLY':
        return 'Semanal';
      case 'MONTHLY':
        return 'Mensual';
      case 'YEARLY':
        return 'Anual';
      default:
        return frequency;
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 80) return '#10B981';
    if (reliability >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getReliabilityLabel = (reliability: number) => {
    if (reliability >= 80) return 'Alta';
    if (reliability >= 60) return 'Media';
    return 'Baja';
  };

  const renderRecurringItem = (item: RecurringAnalysis, type: 'expenses' | 'income') => (
    <View key={item.id} style={analyticsStyles.recurringCard}>
      <View style={analyticsStyles.recurringHeader}>
        <Text style={analyticsStyles.recurringTitle}>{item.title}</Text>
        <Text
          style={[
            analyticsStyles.recurringAmount,
            { color: type === 'expenses' ? '#EF4444' : '#10B981' },
          ]}
        >
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={analyticsStyles.recurringDetails}>
        <View>
          <Text style={analyticsStyles.recurringFrequency}>
            {getFrequencyLabel(item.frequency)}
          </Text>
          {item.categoryName && (
            <Text style={analyticsStyles.recurringCategory}>
              📁 {item.categoryName}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={analyticsStyles.recurringEquivalent}>
            Mensual: {formatCurrency(item.monthlyEquivalent)}
          </Text>
          <Text style={analyticsStyles.recurringEquivalent}>
            Anual: {formatCurrency(item.annualEquivalent)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>
            {item.percentageOfTotal.toFixed(1)}% del total
          </Text>
          {item.nextExpectedDate && (
            <Text style={{ fontSize: 10, color: '#AAAAAA' }}>
              Próximo: {new Date(item.nextExpectedDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getReliabilityColor(item.reliability),
                marginRight: 4,
              }}
            />
            <Text style={{ fontSize: 10, color: '#AAAAAA' }}>
              Confiabilidad: {getReliabilityLabel(item.reliability)}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: '#AAAAAA' }}>
            {item.reliability.toFixed(0)}%
          </Text>
        </View>
      </View>
    </View>
  );

  const currentData = activeTab === 'expenses' ? recurringAnalysis.expenses : recurringAnalysis.income;
  const totalMonthly = currentData.reduce((sum, item) => sum + item.monthlyEquivalent, 0);

  return (
    <View style={analyticsStyles.chartCard}>
      <Text style={analyticsStyles.chartTitle}>Análisis de Movimientos Recurrentes</Text>
      
      <View style={analyticsStyles.tabContainer}>
        <TouchableOpacity
          style={[
            analyticsStyles.tabButton,
            activeTab === 'expenses' && analyticsStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text
            style={[
              analyticsStyles.tabButtonText,
              activeTab === 'expenses' && analyticsStyles.tabButtonTextActive,
            ]}
          >
            Gastos Fijos ({recurringAnalysis.expenses.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            analyticsStyles.tabButton,
            activeTab === 'income' && analyticsStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('income')}
        >
          <Text
            style={[
              analyticsStyles.tabButtonText,
              activeTab === 'income' && analyticsStyles.tabButtonTextActive,
            ]}
          >
            Ingresos Fijos ({recurringAnalysis.income.length})
          </Text>
        </TouchableOpacity>
      </View>

      
      <View
        style={{
          backgroundColor: activeTab === 'expenses' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>
          Total {activeTab === 'expenses' ? 'Gastos' : 'Ingresos'} Recurrentes (Mensual)
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: activeTab === 'expenses' ? '#EF4444' : '#10B981',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {formatCurrency(totalMonthly)}
        </Text>
      </View>

      {currentData.length > 0 ? (
        currentData
          .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)
          .map((item) => renderRecurringItem(item, activeTab))
      ) : (
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="repeat-outline" size={48} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay {activeTab === 'expenses' ? 'gastos' : 'ingresos'} recurrentes configurados
          </Text>
        </View>
      )}

      {currentData.length > 0 && (
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#555555', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA', textAlign: 'center' }}>
            💡 Los movimientos recurrentes te ayudan a planificar tu presupuesto a largo plazo
          </Text>
        </View>
      )}
    </View>
  );
};
