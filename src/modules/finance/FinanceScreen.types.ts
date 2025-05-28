export interface FinanceEntry {
    id: string;
    title: string;
    description?: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: string;
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
}

export const CURRENCIES: Currency[] = [
    { symbol: '$', code: 'USD', name: 'Dólares' },
    { symbol: '₡', code: 'CRC', name: 'Colones' },
];

export type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest' | 'type';
export type FilterOption = 'all' | 'income' | 'expense' | 'lastMonth' | 'last3Months';

export interface FinanceSettings {
    currency: Currency;
    sortBy: SortOption;
    filterBy: FilterOption;
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
