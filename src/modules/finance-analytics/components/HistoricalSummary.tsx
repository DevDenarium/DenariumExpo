import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FinanceAnalyticsService } from '../../../services/finance-analytics.service';
import { MonthlyComparison } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface HistoricalSummaryProps {
  currentYear: number;
  formatCurrency: (amount: number) => string;
}

interface YearSummary {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthsWithData: number;
}

export const HistoricalSummary: React.FC<HistoricalSummaryProps> = ({
  currentYear,
  formatCurrency,
}) => {
  const [yearsSummary, setYearsSummary] = useState<YearSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      loadHistoricalData();
    }
  }, [expanded]);

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const yearsToLoad = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i - 1);
      
      const summariesPromises = yearsToLoad.map(async (year) => {
        try {
          const monthlyData = await FinanceAnalyticsService.getMonthlyComparisons(year);
          const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
          const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
          const monthsWithData = monthlyData.filter(month => month.income > 0 || month.expenses > 0).length;

          return {
            year,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            monthsWithData,
          };
        } catch (error) {
          console.log(`No data available for year ${year}`);
          return {
            year,
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            monthsWithData: 0,
          };
        }
      });

      const summaries = await Promise.all(summariesPromises);
      setYearsSummary(summaries.filter(summary => summary.monthsWithData > 0));
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? '#10B981' : '#EF4444';
  };

  const getBalanceIcon = (balance: number) => {
    return balance >= 0 ? 'trending-up' : 'trending-down';
  };

  if (!expanded) {
    return (
      <View style={[analyticsStyles.chartCard, { marginTop: 16 }]}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 4,
          }}
          onPress={() => setExpanded(true)}
        >
          <View>
            <Text style={[analyticsStyles.chartTitle, { fontSize: 16 }]}>
              📊 Historial de Años Anteriores
            </Text>
            <Text style={{ fontSize: 12, color: '#AAAAAA', marginTop: 4 }}>
              Toca para ver el resumen de años anteriores
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#D4AF37" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[analyticsStyles.chartCard, { marginTop: 16 }]}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
        onPress={() => setExpanded(false)}
      >
        <Text style={[analyticsStyles.chartTitle, { fontSize: 16 }]}>
          📊 Historial de Años Anteriores
        </Text>
        <Ionicons name="chevron-up" size={20} color="#D4AF37" />
      </TouchableOpacity>

      {loading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#D4AF37" />
          <Text style={{ color: '#AAAAAA', marginTop: 8 }}>Cargando datos históricos...</Text>
        </View>
      ) : yearsSummary.length > 0 ? (
        <View>
          <Text style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 12 }}>
            Solo se muestran años con datos registrados
          </Text>
          
          {yearsSummary.map((yearData) => (
            <View
              key={yearData.year}
              style={{
                backgroundColor: '#333333',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderLeftWidth: 3,
                borderLeftColor: getBalanceColor(yearData.balance),
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>
                    {yearData.year}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#AAAAAA' }}>
                    {yearData.monthsWithData} {yearData.monthsWithData === 1 ? 'mes' : 'meses'} con datos
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={getBalanceIcon(yearData.balance)}
                      size={16}
                      color={getBalanceColor(yearData.balance)}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: getBalanceColor(yearData.balance),
                      }}
                    >
                      {formatCurrency(yearData.balance)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <View>
                  <Text style={{ fontSize: 10, color: '#AAAAAA' }}>Ingresos</Text>
                  <Text style={{ fontSize: 12, color: '#10B981' }}>
                    {formatCurrency(yearData.totalIncome)}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: '#AAAAAA' }}>Gastos</Text>
                  <Text style={{ fontSize: 12, color: '#EF4444' }}>
                    {formatCurrency(yearData.totalExpenses)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          <View style={{ marginTop: 12, padding: 8, backgroundColor: '#444444', borderRadius: 6 }}>
            <Text style={{ fontSize: 11, color: '#AAAAAA', textAlign: 'center' }}>
              💡 Los datos se mantienen guardados automáticamente año tras año.
              {'\n'}No necesitas hacer nada especial para conservar tu historial.
            </Text>
          </View>
        </View>
      ) : (
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay datos históricos disponibles
          </Text>
          <Text style={{ fontSize: 12, color: '#AAAAAA', textAlign: 'center', marginTop: 8 }}>
            Los datos de años anteriores aparecerán aquí automáticamente
          </Text>
        </View>
      )}
    </View>
  );
};
