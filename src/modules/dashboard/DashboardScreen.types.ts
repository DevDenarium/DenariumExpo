import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: { user: User };
    Transactions: undefined;
    Videos: undefined;
    Advisories: undefined;
    Subscriptions: undefined;
    Notifications: undefined;
};

export type DrawerParamList = {
    MainDashboard: { user: User };
    Transactions: undefined;
    Videos: undefined;
    Advisories: undefined;
    Subscriptions: undefined;
    Notifications: undefined;
};

export type DashboardScreenProps = {
    route: RouteProp<DrawerParamList, 'MainDashboard'>;
    navigation: DrawerNavigationProp<DrawerParamList, 'MainDashboard'>;
};

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
}

export interface FinancialData {
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    investments: number;
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense' | 'investment';
    category: string;
    date: string;
    description: string;
}
