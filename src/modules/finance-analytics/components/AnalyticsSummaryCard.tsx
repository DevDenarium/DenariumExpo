import React from 'react';
import { View, Text } from 'react-native';
import { FinancialSummary } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface AnalyticsSummaryCardProps {
  summary: FinancialSummary;
  formatCurrency: (amount: number) => string;
}

export const AnalyticsSummaryCard: React.FC<AnalyticsSummaryCardProps> = ({
  summary,
  formatCurrency,
}) => {
  const getBalanceStyle = (balance: number) => {
    if (balance > 0) return analyticsStyles.balancePositive;
    if (balance < 0) return analyticsStyles.balanceNegative;
    return analyticsStyles.balanceValue;
  };

  return (
    <View style={analyticsStyles.summaryCard}>
      <View style={analyticsStyles.summaryRow}>
        <Text style={analyticsStyles.summaryLabel}>Ingresos</Text>
        <Text style={[analyticsStyles.summaryValue, analyticsStyles.incomeValue]}>
          {formatCurrency(summary.totalIncome)}
        </Text>
      </View>

      <View style={analyticsStyles.summaryRow}>
        <Text style={analyticsStyles.summaryLabel}>Gastos</Text>
        <Text style={[analyticsStyles.summaryValue, analyticsStyles.expenseValue]}>
          {formatCurrency(summary.totalExpenses)}
        </Text>
      </View>

      <View style={[analyticsStyles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }]}>
        <Text style={[analyticsStyles.summaryLabel, { fontWeight: 'bold' }]}>Balance</Text>
        <Text style={[analyticsStyles.summaryValue, getBalanceStyle(summary.balance)]}>
          {formatCurrency(summary.balance)}
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' }}>
        Período: {summary.period}
      </Text>
    </View>
  );
};
