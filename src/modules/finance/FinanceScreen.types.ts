export interface FinanceEntry {
    id: string;
    title: string;
    description?: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: string;
}

export interface MonthYear {
    month: number;
    year: number;
}

export interface CreateEntryDto {
    title: string;
    description?: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: Date;
}

export interface BalanceSummary {
    balance: number;
    incomes: number;
    expenses: number;
}

export interface Currency {
    symbol: string;
    code: string;
    name: string;
    locale?: string;
}

export const CURRENCIES: Currency[] = [
    { symbol: '$', code: 'USD', name: 'Dólares', locale: 'es-CR' },
    { symbol: '₡', code: 'CRC', name: 'Colones', locale: 'en-US' },
];

export type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest' | 'type';
export type FilterOption = 'all' | 'income' | 'expense' | 'lastMonth' | 'last3Months' | 'specificMonth';

export interface MonthFilter {
    year: number;
    month: number;
}

export interface FinanceSettings {
    currency: Currency;
    sortBy: SortOption;
    filterBy: FilterOption;
    monthFilter?: MonthFilter;
}

export interface FinanceScreenProps {
    navigation: any;
    route: {
        params: {
            user: {
                id: string;
                email: string;
                firstName?: string;
                lastName?: string;
            };
        };
    };
}

export type CurrencyCode = 'USD' | 'CRC';
