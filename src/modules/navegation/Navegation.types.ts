import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { UserRole } from "../auth/user.types";
import { SubscriptionPlan } from "../subscriptions/SubscriptionsScreen.types";
import { UserResponse } from "../auth/user.types";

export type AppointmentStatus =
    'PENDING_PAYMENT' |
    'PENDING_ADMIN_REVIEW' |
    'CONFIRMED' |
    'CANCELLED' |
    'RESCHEDULED' |
    'REJECTED' |
    'COMPLETED';
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
    advisorId?: string;
    isVirtual: boolean;
    meetingLink?: string;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: 'PERSONAL' | 'CORPORATE' | 'CORPORATE_EMPLOYEE';
    };
    admin?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    advisor?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

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
    } | undefined;
    RegisterType: undefined;
    RegisterPersonal: undefined;
    RegisterCorporate: undefined;
    RegisterCorporateEmployee: undefined;
    Verification: {
        email: string;
        userRole: UserRole;
    };
    ForgotPassword: undefined;
    Dashboard: {
        user: UserResponse;
    };
    EmployeeDashboard: undefined;
    CorporateDashboard: undefined;
    AdminDashboard: undefined;
    AdvisorDashboard: undefined;
    Subscriptions: undefined;
    PaymentsScreen: {
        plan: SubscriptionPlan;
        onSuccess: (paymentResult?: any) => Promise<void>;
        metadata?: {
            [key: string]: string;
        };
    };
    PaymentSuccess: {
        sessionId: string;
        planName?: string;
        amount?: number;
    };
    PaymentCanceled: undefined;
    Profile: undefined;
    Notifications: undefined;
    VideoLibrary: undefined;
    Appointments: undefined;
    AppointmentManagement: AppointmentManagementParams;
    AppointmentScreen: AppointmentScreenParams;
};

export type DrawerParamList = {
    MainDashboard: undefined;
    Transactions: undefined;
    Videos: undefined;
    Advisories: undefined;
    Subscriptions: undefined;
    Notifications: undefined;
    Finance: undefined;
    Profile: undefined;
    VideoLibrary: undefined;
    Appointments: undefined;
    AppointmentManagement: AppointmentManagementParams;
};

export type PaymentsStackParamList = {
    PaymentsScreen: {
        plan: SubscriptionPlan;
        onSuccess: (paymentResult?: any) => Promise<void>;
        metadata?: {
            [key: string]: string;
        };
    };
    PaymentSuccess: {
        sessionId: string;
        planName?: string;
        amount?: number;
    };
    PaymentCanceled: undefined;
};

export type AppointmentManagementScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentManagement'>;
    route: RouteProp<RootStackParamList, 'AppointmentManagement'>;
};

export type AppointmentScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentScreen'>;
    route: RouteProp<RootStackParamList, 'AppointmentScreen'>;
};

export type RegisterTypeScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterType'>;
};

export type RegisterPersonalScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterPersonal'>;
};

export type RegisterCorporateScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterCorporate'>;
};

export type RegisterCorporateEmployeeScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterCorporateEmployee'>;
};

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export type DashboardScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Dashboard'>;
    route: RouteProp<RootStackParamList, 'Dashboard'>;
};

export type SubscriptionsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Subscriptions'>;
    route: RouteProp<RootStackParamList, 'Subscriptions'>;
};
