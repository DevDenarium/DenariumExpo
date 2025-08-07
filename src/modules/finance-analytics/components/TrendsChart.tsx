import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrendData } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface TrendsChartProps {
  trends: TrendData[];
  formatCurrency: (amount: number) => string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  trends,
  formatCurrency,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; 
  const chartHeight = 250; 

  if (!trends || trends.length === 0) {
    return (
      <View style={analyticsStyles.chartCard}>
        <Text style={analyticsStyles.chartTitle}>📈 Tendencias</Text>
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="trending-up-outline" size={48} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay datos de tendencias disponibles
          </Text>
        </View>
      </View>
    );
  }


  const allValues = trends.flatMap(t => [t.income, t.expenses]);
  const maxValue = Math.max(...allValues, 1);

  
  const renderBarChart = () => {
    const barWidth = Math.min(20, (chartWidth - 40) / (trends.length * 2.5)); 
    const spacing = barWidth * 0.3;
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ 
          height: chartHeight + 60, 
          paddingHorizontal: 20,
          paddingTop: 20,
        }}>
          
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            height: chartHeight,
            paddingBottom: 40
          }}>
            {trends.map((trend, index) => {
              const incomeHeight = (trend.income / maxValue) * (chartHeight - 40);
              const expenseHeight = (trend.expenses / maxValue) * (chartHeight - 40);
              const dayBalance = trend.income - trend.expenses;
              
              return (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-end',
                  marginRight: spacing * 2,
                  minHeight: chartHeight - 40
                }}>
                 
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: barWidth,
                      height: Math.max(incomeHeight, 2),
                      backgroundColor: '#22C55E',
                      borderRadius: 4,
                      marginRight: spacing / 2,
                      shadowColor: '#22C55E',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }} />
                    {trend.income > 0 && (
                      <Text style={{
                        fontSize: 8,
                        color: '#22C55E',
                        fontWeight: 'bold',
                        marginTop: 2,
                        transform: [{ rotate: '-45deg' }],
                        width: 30,
                        textAlign: 'center'
                      }}>
                        {formatCurrency(trend.income).replace('₡', '₡').slice(0, -3)}K
                      </Text>
                    )}
                  </View>
                  
              
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: barWidth,
                      height: Math.max(expenseHeight, 2),
                      backgroundColor: '#EF4444',
                      borderRadius: 4,
                      marginLeft: spacing / 2,
                      shadowColor: '#EF4444',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }} />
                    {trend.expenses > 0 && (
                      <Text style={{
                        fontSize: 8,
                        color: '#EF4444',
                        fontWeight: 'bold',
                        marginTop: 2,
                        transform: [{ rotate: '-45deg' }],
                        width: 30,
                        textAlign: 'center'
                      }}>
                        {formatCurrency(trend.expenses).replace('₡', '₡').slice(0, -3)}K
                      </Text>
                    )}
                  </View>
                  
                  
                  <View style={{ 
                    position: 'absolute', 
                    bottom: -35, 
                    width: barWidth * 2 + spacing,
                    alignItems: 'center' 
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#AAAAAA',
                      fontWeight: 'bold'
                    }}>
                      {new Date(trend.date).getDate()}
                    </Text>
                    
                    
                    <View style={{
                      marginTop: 2,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 8,
                      backgroundColor: dayBalance >= 0 ? '#22C55E20' : '#EF444420'
                    }}>
                      <Text style={{
                        fontSize: 8,
                        color: dayBalance >= 0 ? '#22C55E' : '#EF4444',
                        fontWeight: 'bold'
                      }}>
                        {dayBalance >= 0 ? '✓' : '⚠'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Calculate useful statistics for better understanding
  const totalIncome = trends.reduce((sum, t) => sum + t.income, 0);
  const totalExpenses = trends.reduce((sum, t) => sum + t.expenses, 0);
  const netBalance = totalIncome - totalExpenses;
  const daysWithPositiveBalance = trends.filter(t => (t.income - t.expenses) > 0).length;
  const daysWithNegativeBalance = trends.filter(t => (t.income - t.expenses) < 0).length;
  
  const latestTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];

  
  const getFinancialStatusText = () => {
    if (netBalance > 0) {
      return {
        text: `¡Excelente! En este período ahorraste ${formatCurrency(netBalance)}`,
        color: '#22C55E',
        icon: '🎉'
      };
    } else if (netBalance < 0) {
      return {
        text: `Cuidado: gastaste ${formatCurrency(Math.abs(netBalance))} más de lo que ingresó`,
        color: '#EF4444',
        icon: '⚠️'
      };
    } else {
      return {
        text: 'Tus ingresos y gastos están equilibrados',
        color: '#F59E0B',
        icon: '⚖️'
      };
    }
  };

  const financialStatus = getFinancialStatusText();

  return (
    <View style={analyticsStyles.chartCard}>
      <Text style={analyticsStyles.chartTitle}>� ¿Cómo van tus finanzas?</Text>
      
      
      <View style={{
        backgroundColor: financialStatus.color + '20',
        borderLeftWidth: 4,
        borderLeftColor: financialStatus.color,
        padding: 12,
        marginBottom: 16,
        borderRadius: 6
      }}>
        <Text style={{
          fontSize: 14,
          color: financialStatus.color,
          fontWeight: 'bold'
        }}>
          {financialStatus.icon} {financialStatus.text}
        </Text>
      </View>
      
     
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginBottom: 20,
        backgroundColor: '#333333',
        padding: 12,
        borderRadius: 8
      }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#22C55E',
                marginRight: 6,
                borderRadius: 2
              }}
            />
            <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' }}>Dinero que recibí</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#22C55E', fontWeight: 'bold' }}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#EF4444',
                marginRight: 6,
                borderRadius: 2
              }}
            />
            <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' }}>Dinero que gasté</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold' }}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
      </View>

      <Text style={{ 
        fontSize: 12, 
        color: '#AAAAAA', 
        textAlign: 'center', 
        marginBottom: 10 
      }}>
        Cada día se muestra con dos barras: verde (lo que recibí) y roja (lo que gasté)
      </Text>

      {renderBarChart()}

      
      <View style={{ 
        marginTop: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-around',
        backgroundColor: '#2A2A2A',
        padding: 16,
        borderRadius: 8
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 4 }}>Días positivos</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#22C55E', marginRight: 4 }}>
              {daysWithPositiveBalance}
            </Text>
            <Text style={{ fontSize: 12, color: '#22C55E' }}>✓</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#AAAAAA', textAlign: 'center' }}>
            Recibí más{'\n'}que gasté
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 4 }}>Días negativos</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginRight: 4 }}>
              {daysWithNegativeBalance}
            </Text>
            <Text style={{ fontSize: 12, color: '#EF4444' }}>⚠</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#AAAAAA', textAlign: 'center' }}>
            Gasté más{'\n'}que recibí
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 4 }}>Balance final</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: netBalance >= 0 ? '#22C55E' : '#EF4444',
            }}
          >
            {formatCurrency(netBalance)}
          </Text>
          <Text style={{ fontSize: 10, color: '#AAAAAA', textAlign: 'center' }}>
            {netBalance >= 0 ? 'Ahorré' : 'Déficit'}
          </Text>
        </View>
      </View>
    </View>
  );
};
