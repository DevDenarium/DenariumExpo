import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MonthlyComparison } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface MonthlyComparisonChartProps {
  comparisons: MonthlyComparison[];
  formatCurrency: (amount: number) => string;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  comparisons,
  formatCurrency,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const barWidth = 60;
  const barSpacing = 20;

  if (!comparisons || comparisons.length === 0) {
    return (
      <View style={analyticsStyles.chartCard}>
        <Text style={analyticsStyles.chartTitle}>Comparación Mensual</Text>
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay datos de comparación mensual disponibles
          </Text>
        </View>
      </View>
    );
  }

  // Calculate max values for scaling
  const maxIncome = Math.max(...comparisons.map(c => c.income), 1);
  const maxExpense = Math.max(...comparisons.map(c => c.expenses), 1);
  const maxValue = Math.max(maxIncome, maxExpense);

  const chartHeight = 200;

  const renderBarChart = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 20 }}
      >
        <View style={{ flexDirection: 'row', height: chartHeight + 60, paddingHorizontal: 20 }}>
          {comparisons.map((comparison, index) => {
            const incomeHeight = (comparison.income / maxValue) * chartHeight;
            const expenseHeight = (comparison.expenses / maxValue) * chartHeight;
            
            return (
              <View
                key={index}
                style={{
                  marginRight: barSpacing,
                  alignItems: 'center',
                  width: barWidth,
                }}
              >
                {/* Month label */}
                <Text
                  style={{
                    fontSize: 10,
                    color: '#AAAAAA',
                    marginBottom: 8,
                    transform: [{ rotate: '-45deg' }],
                    width: 40,
                    textAlign: 'center',
                  }}
                >
                  {comparison.month.slice(0, 3)}
                </Text>

                {/* Bars container */}
                <View
                  style={{
                    height: chartHeight,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  {/* Income bar */}
                  <View
                    style={{
                      width: barWidth / 2 - 2,
                      height: incomeHeight,
                      backgroundColor: '#10B981',
                      marginRight: 4,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}
                  />
                  
                  {/* Expense bar */}
                  <View
                    style={{
                      width: barWidth / 2 - 2,
                      height: expenseHeight,
                      backgroundColor: '#EF4444',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}
                  />
                </View>

                {/* Balance indicator */}
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: comparison.balance >= 0 ? '#10B981' : '#EF4444',
                    }}
                  >
                    {comparison.balance >= 0 ? '+' : ''}
                    {formatCurrency(comparison.balance).replace('₡', '₡')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Calculate some summary stats
  const totalIncome = comparisons.reduce((sum, c) => sum + c.income, 0);
  const totalExpenses = comparisons.reduce((sum, c) => sum + c.expenses, 0);
  const avgMonthlyIncome = totalIncome / comparisons.length;
  const avgMonthlyExpenses = totalExpenses / comparisons.length;
  const bestMonth = comparisons.reduce((best, current) => 
    current.balance > best.balance ? current : best
  );
  const worstMonth = comparisons.reduce((worst, current) => 
    current.balance < worst.balance ? current : worst
  );

  return (
    <View style={analyticsStyles.chartCard}>
      <Text style={analyticsStyles.chartTitle}>Comparación Mensual {comparisons[0]?.year}</Text>
      
      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
          <View
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#10B981',
              marginRight: 4,
              borderRadius: 2,
            }}
          />
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Ingresos</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#EF4444',
              marginRight: 4,
              borderRadius: 2,
            }}
          />
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Gastos</Text>
        </View>
      </View>

      {renderBarChart()}

      {/* Summary statistics */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#D4AF37' }}>
          Resumen del Año
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Promedio Ingresos:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>
            {formatCurrency(avgMonthlyIncome)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Promedio Gastos:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EF4444' }}>
            {formatCurrency(avgMonthlyExpenses)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Mejor Mes:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>
            {bestMonth.month} ({formatCurrency(bestMonth.balance)})
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA' }}>Mes Difícil:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EF4444' }}>
            {worstMonth.month} ({formatCurrency(worstMonth.balance)})
          </Text>
        </View>
      </View>
    </View>
  );
};
