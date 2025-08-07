import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FinancialInsight } from '../FinanceAnalytics.types';
import { analyticsStyles } from '../FinanceAnalytics.styles';

interface InsightsSectionProps {
  insights: FinancialInsight[];
  getInsightIcon: (type: string) => any;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  insights,
  getInsightIcon,
}) => {
  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return analyticsStyles.insightWarning;
      case 'success':
        return analyticsStyles.insightSuccess;
      case 'info':
        return analyticsStyles.insightInfo;
      case 'tip':
        return analyticsStyles.insightTip;
      default:
        return analyticsStyles.insightInfo;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'info':
        return '#3B82F6';
      case 'tip':
        return '#8B5CF6';
      default:
        return '#3B82F6';
    }
  };

  return (
    <View style={analyticsStyles.chartCard}>
      <Text style={analyticsStyles.chartTitle}>💡 Insights Financieros</Text>
      
      {insights.map((insight, index) => (
        <View
          key={index}
          style={[analyticsStyles.insightCard, getInsightStyle(insight.type)]}
        >
          <View style={analyticsStyles.insightIcon}>
            <Ionicons
              name={getInsightIcon(insight.type)}
              size={20}
              color={getIconColor(insight.type)}
            />
          </View>
          
          <View style={analyticsStyles.insightContent}>
            <Text style={analyticsStyles.insightTitle}>{insight.title}</Text>
            <Text style={analyticsStyles.insightMessage}>{insight.message}</Text>
            
            {insight.actionable && insight.action && (
              <Text style={analyticsStyles.insightAction}>
                💡 Recomendación: {insight.action}
              </Text>
            )}
            
            {insight.value && (
              <Text style={analyticsStyles.insightAction}>
                Valor: {insight.value.toFixed(1)}%
              </Text>
            )}
          </View>
        </View>
      ))}
      
      {insights.length === 0 && (
        <View style={analyticsStyles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color="#ccc" />
          <Text style={analyticsStyles.emptyStateText}>
            No hay insights disponibles para este período
          </Text>
        </View>
      )}
    </View>
  );
};
