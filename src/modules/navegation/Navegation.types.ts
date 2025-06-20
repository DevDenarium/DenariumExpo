import { User } from '../dashboard/DashboardScreen.types';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'REJECTED' | 'COMPLETED';

export interface Appointment {
    id: string;
    title: string;
    description?: string;
    status: AppointmentStatus;
    requestedDate: string;
    suggestedDate?: string;
    confirmedDate?: string;
    duration: number;
    userId: string;
    adminId?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    admin?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
};

export type AppointmentManagementParams = {
    refresh?: boolean;
    appointmentId?: string;
    mode?: 'view' | 'edit' | 'create';
};

export type AppointmentScreenParams = {
    appointment?: Appointment;
    onSave?: (appointment: Appointment) => void;
    onDelete?: (appointmentId: string) => void;
};

export type RootStackParamList = {
    Login: {
        message?: string;
    };
    Register: undefined;
    Verification: {
        email: string;
    };
    ForgotPassword: undefined;
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
    Notifications: undefined;
    VideoLibrary: undefined;
    Appointments: undefined;
    AppointmentManagement: AppointmentManagementParams;
    AppointmentScreen: AppointmentScreenParams;
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
    VideoLibrary: undefined;
    Appointments: undefined;
    AppointmentManagement: AppointmentManagementParams;
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

export type AppointmentManagementScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentManagement'>;
    route: RouteProp<RootStackParamList, 'AppointmentManagement'>;
};

export type AppointmentScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentScreen'>;
    route: RouteProp<RootStackParamList, 'AppointmentScreen'>;
};

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
