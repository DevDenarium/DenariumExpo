import { User } from '../dashboard/DashboardScreen.types';

export type RootStackParamList = {
    Login: {
        message?: string;
    };
    Register: undefined;
    Verification: {
        email: string;
    };
    Dashboard: { user: User };
    Subscriptions: { user: User };
    Payments: {
        sessionId: string;
        planName?: string;
        amount?: number;
        user: User;
    };
    PaymentSuccess: {
        sessionId: string;
        planName?: string;
        amount?: number;
        user: User;
    };
    PaymentCanceled: {
        user?: User;
    };
    Profile: { user: User };
};

export type DrawerParamList = {
    MainDashboard: { user: User };
    Transactions: undefined;
    Videos: undefined;
    Advisories: undefined;
    Subscriptions: { user: User };
    Notifications: undefined;
    Finance: undefined;
    Profile: { user: User };
};

export type PaymentsStackParamList = {
    Payments: {
        sessionId: string;
        planName?: string;
        amount?: number;
        user: User;
    };
    PaymentSuccess: {
        sessionId: string;
        planName?: string;
        amount?: number;
        user: User;
    };
    PaymentCanceled: {
        user?: User;
    };
};


