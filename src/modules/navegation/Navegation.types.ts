import { User } from '../dashboard/DashboardScreen.types';

// Tipos principales para citas (alineados con el backend)
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

// Parámetros específicos para pantallas de citas
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

// Stack principal
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
    // Puedes añadir más rutas aquí
};

// Drawer navigation
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

// Stack de pagos
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

// Tipos para props de navegación
export type AppointmentManagementScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentManagement'>;
    route: RouteProp<RootStackParamList, 'AppointmentManagement'>;
};

export type AppointmentScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentScreen'>;
    route: RouteProp<RootStackParamList, 'AppointmentScreen'>;
};

// Tipos utilitarios
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

// No olvides importar estos tipos de React Navigation
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
