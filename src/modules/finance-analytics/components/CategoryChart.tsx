import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBreakdown } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';
import { PieChart } from './PieChart';

interface CategoryChartProps {
  expenses: CategoryBreakdown[];
  income: CategoryBreakdown[];
  formatCurrency: (amount: number) => string;
  detailed?: boolean;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  expenses,
  income,
  formatCurrency,
  detailed = false,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');


  const DEFAULT_COLORS = [
    '#FF6B6B', 
    '#4ECDC4', 
    '#45B7D1', 
    '#96CEB4', 
    '#FFEAA7', 
    '#DDA0DD', 
    '#98D8C8', 
    '#F7DC6F', 
    '#BB8FCE', 
    '#85C1E9', 
    '#F8C471', 
    '#82E0AA', 
  ];

  
  const expensesWithColors = expenses.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const incomeWithColors = income.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const renderCategoryItem = (category: CategoryBreakdown, type: 'expenses' | 'income') => (
    <View key={category.categoryId} style={analyticsStyles.categoryItem}>
      <View
        style={[
          analyticsStyles.categoryColor,
          {
            backgroundColor: category.color, 
          },
        ]}
      />
      
      <View style={analyticsStyles.categoryInfo}>
        <Text style={analyticsStyles.categoryName}>{category.categoryName}</Text>
        <Text style={analyticsStyles.categoryCount}>
          {category.transactionCount} transacciones
        </Text>
      </View>
      
      <View style={analyticsStyles.categoryAmount}>
        <Text
          style={[
            analyticsStyles.categoryValue,
            { color: type === 'expenses' ? '#EF4444' : '#10B981' },
          ]}
        >
          {formatCurrency(category.totalAmount)}
        </Text>
        <Text style={analyticsStyles.categoryPercentage}>
          {category.percentage.toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  const renderPieChart = (data: CategoryBreakdown[], type: 'expenses' | 'income') => {
    return (
      <View style={analyticsStyles.chartContainer}>
        <PieChart
          data={data}
          size={160}
          innerRadius={50}
          formatCurrency={formatCurrency}
          type={type}
        />
        
        <View style={{ marginTop: 20, width: '100%' }}>
          {data.slice(0, detailed ? data.length : 5).map((category) =>
            renderCategoryItem(category, type)
          )}
          
          {!detailed && data.length > 5 && (
            <Text style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 12, marginTop: 8 }}>
              Y {data.length - 5} categorías más...
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={analyticsStyles.chartCard}>
      <Text style={analyticsStyles.chartTitle}>Distribución por Categorías</Text>
      
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
            Gastos ({expenses.length})
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
            Ingresos ({income.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        expensesWithColors.length > 0 ? (
          renderPieChart(expensesWithColors, 'expenses')
        ) : (
          <View style={analyticsStyles.emptyState}>
            <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
            <Text style={analyticsStyles.emptyStateText}>
              No hay gastos registrados en este período
            </Text>
          </View>
        )
      ) : (
        incomeWithColors.length > 0 ? (
          renderPieChart(incomeWithColors, 'income')
        ) : (
          <View style={analyticsStyles.emptyState}>
            <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
            <Text style={analyticsStyles.emptyStateText}>
              No hay ingresos registrados en este período
            </Text>
          </View>
        )
      )}
    </View>
  );
};
