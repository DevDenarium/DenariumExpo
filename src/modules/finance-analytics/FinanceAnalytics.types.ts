export enum PeriodType {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  SEMESTER = 'semester',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
  color?: string;
  icon?: string;
}

export interface TrendData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  cumulativeBalance: number;
}

export interface MonthlyComparison {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  categories: CategoryBreakdown[];
}

export interface RecurringAnalysis {
  id: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  frequency: string;
  categoryName?: string;
  monthlyEquivalent: number;
  quarterlyEquivalent: number;
  semesterEquivalent: number;
  annualEquivalent: number;
  percentageOfTotal: number;
  nextExpectedDate?: string;
  reliability: number;
}

export interface ExpenseHeatmap {
  date: string;
  amount: number;
  intensity: number;
  dayOfWeek: number;
  weekOfMonth: number;
}

export interface FinancialInsight {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  actionable?: boolean;
  action?: string;
  value?: number;
  change?: number;
}

export interface AnalyticsDashboard {
  summary: FinancialSummary;
  trends: TrendData[];
  categoryBreakdown: {
    expenses: CategoryBreakdown[];
    income: CategoryBreakdown[];
  };
  monthlyComparisons: MonthlyComparison[];
  recurringAnalysis: {
    expenses: RecurringAnalysis[];
    income: RecurringAnalysis[];
  };
  expenseHeatmap: ExpenseHeatmap[];
  insights: FinancialInsight[];
}

export interface AnalyticsQueryParams {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  year?: number;
  month?: number;
}
