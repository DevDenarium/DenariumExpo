import { StackNavigationProp } from '@react-navigation/stack';

export type AppointmentStatus =
    'PENDING' |
    'CONFIRMED' |
    'CANCELLED' |
    'RESCHEDULED' |
    'REJECTED' |
    'COMPLETED';

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
};

export type Appointment = {
    id: string;
    title: string;
    description?: string;
    requestedDate: string;
    suggestedDate?: string;
    confirmedDate?: string;
    duration: number;
    status: AppointmentStatus;
    user?: User;
};

export type RootStackParamList = {
    Login: { message?: string };
    AppointmentManagement: undefined;
    // Agrega otras rutas aquí según sea necesario
};

export type AppointmentManagementProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentManagement'>;
};
