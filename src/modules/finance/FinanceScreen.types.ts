export interface FinanceEntry {
    id: string;
    userId: string;
    title: string;
    description?: string;
    amount: number;
    type: FinanceEntryType;
    categoryId?: string;
    category?: FinanceCategory;
    date: string;
    createdAt: string;
    updatedAt: string;
    recurringId?: string;
    tags?: FinanceTag[];
}

export interface FinanceCategory {
    id: string;
    name: string;
    type: FinanceEntryType;
    color?: string;
    icon?: string;
    // Add any other properties that might be required
    description?: string;
    userId?: string;
    isDefault?: boolean;
}

export interface FinanceTag {
    id: string;
    name: string;
    userId: string;
    color?: string;
}

export interface RecurringEntry {
    id: string;
    userId: string;
    title: string;
    description?: string;
    amount: number;
    type: FinanceEntryType;
    categoryId?: string;
    startDate: string;
    endDate?: string;
    frequency: RecurringFrequency;
    active: boolean;
}

export enum RecurringFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}

export enum FinanceEntryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export interface MonthYear {
    month: number;
    year: number;
}

export interface CreateEntryDto {
    title: string;
    description?: string;
    amount: number;
    type: FinanceEntryType;
    categoryId?: string;
    date: Date;
    tagIds?: string[];
}

export interface UpdateEntryDto {
    title?: string;
    description?: string;
    amount?: number;
    type?: FinanceEntryType;
    categoryId?: string | null;
    date?: Date;
    tagIds?: string[];
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


// Añade esto junto con tus otras interfaces
export interface CreateCategoryDto {
    name: string;
    description?: string;
    type: FinanceEntryType;
    icon?: string;
    color?: string;
    // No necesitas userId aquí porque el backend lo obtendrá del token
}

export interface CreateTagDto {
    name: string;
    color?: string;
    // userId tampoco es necesario aquí por la misma razón
}

interface FinanceEntryFormProps {
    onEntryAdded: () => Promise<void>;
    categories: FinanceCategory[];
    tags: { id: string; name: string }[];
    setCategories: (categories: FinanceCategory[]) => void;
    // possibly other props...
}
